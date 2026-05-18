import fs from "node:fs/promises";
import { chromium } from "playwright";

const agendaSourceUrl = "https://sddconf.com/agenda";
const outputPath = new URL("../src/data/agenda.json", import.meta.url);
const debugOutputPath = new URL("../tmp/agenda-debug.html", import.meta.url);

const dayMap = {
  "Monday 11 May 2026": "2026-05-11",
  "Tuesday 12 May 2026": "2026-05-12",
  "Wednesday 13 May 2026": "2026-05-13",
  "Thursday 14 May 2026": "2026-05-14",
  "Friday 15 May 2026": "2026-05-15",
};

function findMatchingDivEnd(source, startIndex) {
  const tokenRe = /<div\b|<\/div>/g;
  tokenRe.lastIndex = startIndex;

  let depth = 0;
  let started = false;
  let match;

  while ((match = tokenRe.exec(source))) {
    if (match[0] === "<div") {
      depth += 1;
      started = true;
    } else {
      depth -= 1;

      if (started && depth === 0) {
        return tokenRe.lastIndex;
      }
    }
  }

  return -1;
}

function decode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function trackIdFromTheme(theme) {
  if (!theme) {
    return "shared";
  }

  const trackMatch = theme.match(/^Track (\d)$/);

  if (trackMatch) {
    return `track-${trackMatch[1]}`;
  }

  if (theme === "Keynote Presentation") {
    return "keynote";
  }

  if (theme === "Pre-Conference Workshop") {
    return "pre-workshop";
  }

  if (theme === "Post-Conference Workshop") {
    return "post-workshop";
  }

  throw new Error(`Unknown agenda theme: ${theme}`);
}

function parseAgendaHtml(html, sourceUrl = agendaSourceUrl) {
  const headingRe =
    /<h3(?:\s+class="(?:stuck)?")?\s*><span>([^<]+)<\/span><\/h3>/g;
  const headings = [...html.matchAll(headingRe)].map((match) => ({
    label: match[1],
    index: match.index ?? 0,
  }));
  const sessions = [];

  for (let i = 0; i < headings.length; i += 1) {
    const { label, index } = headings[i];
    const date = dayMap[label];

    if (!date) {
      continue;
    }

    const sectionEnd =
      i + 1 < headings.length ? headings[i + 1].index : html.length;
    const section = html.slice(index, sectionEnd);
    const boxRe = /<div id="([^"]+)" class="box">/g;
    let boxMatch;

    while ((boxMatch = boxRe.exec(section))) {
      const start = boxMatch.index;
      const end = findMatchingDivEnd(section, start);
      const box = section.slice(start, end);
      const timeMatch = box.match(/<p>\s*(\d{2}:\d{2})–(\d{2}:\d{2})\s*<\/p>/);
      const titleMatch = box.match(
        /<h2>\s*(?:<a[^>]*>)?([\s\S]*?)(?:<\/a>)?\s*<\/h2>/,
      );

      if (!timeMatch || !titleMatch) {
        continue;
      }

      const theme =
        box.match(/<p class="theme">([^<]+)<\/p>/)?.[1]?.trim() ?? null;
      const speaker = box
        .match(/class="speaker-name"\s*>\s*([^<]+)\s*</)?.[1]
        ?.trim();
      const room =
        box.match(/<p class="room">\s*<span>\s*([^<]+)\s*<\/span>\s*<\/p>/)?.[
          1
        ]?.trim() ?? null;
      const codeLevel = box.match(
        /<div class="level-badge code-level">\s*Coding Level\s*<span>(\d)<\/span>\s*<\/div>/,
      )?.[1];
      const advancedLevel = box.match(
        /<div class="level-badge adv-level">\s*Advanced Level\s*<span>(\d)<\/span>\s*<\/div>/,
      )?.[1];
      const descBlock = box.match(
        /<div\s+id="desc[^"]*"\s+class="description"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*$/,
      )?.[1];
      const summary = descBlock
        ? decode(descBlock).replace(
            /^Coding Level\s+\d+\s+Advanced Level\s+\d+\s+/,
            "",
          )
        : undefined;
      const title = decode(titleMatch[1]);

      sessions.push({
        id: `${date}-${timeMatch[1]}-${slug(title)}`,
        date,
        start: timeMatch[1],
        end: timeMatch[2],
        track: trackIdFromTheme(theme),
        type: theme ? "talk" : "break",
        title,
        ...(speaker ? { speaker: decode(speaker) } : {}),
        ...(room ? { room: decode(room) } : { room: null }),
        ...(summary ? { summary } : {}),
        ...(codeLevel ? { codeLevel: Number(codeLevel) } : {}),
        ...(advancedLevel ? { advancedLevel: Number(advancedLevel) } : {}),
      });
    }
  }

  if (sessions.length === 0) {
    throw new Error("No agenda sessions were parsed from the rendered HTML.");
  }

  return {
    sourceUrl,
    extractedAt: new Date().toISOString(),
    sessions,
  };
}

let browser;

try {
  browser = await chromium.launch({
    headless: true,
  });
} catch (error) {
  throw new Error(
    `Failed to launch Chromium. Run "npx playwright install chromium" and try again.\n${error instanceof Error ? error.message : String(error)}`,
  );
}

try {
  const page = await browser.newPage();

  await page.goto(agendaSourceUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForSelector(".page-agenda", {
    timeout: 60000,
  });

  await page.waitForFunction(
    () =>
      document.querySelectorAll(".page-agenda .agenda-item-holder .box")
        .length > 0 ||
      document.querySelectorAll(".page-agenda .agenda-item-holder").length > 0,
    {
      timeout: 60000,
    },
  );

  await page.waitForTimeout(3000);

  const html = await page.evaluate(
    () => document.querySelector(".page-agenda")?.outerHTML ?? null,
  );

  if (!html) {
    throw new Error(
      "The rendered page did not contain a .page-agenda element.",
    );
  }

  const agendaData = parseAgendaHtml(html, agendaSourceUrl);

  await fs.writeFile(outputPath, `${JSON.stringify(agendaData, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        output: outputPath.pathname,
        sourceUrl: agendaData.sourceUrl,
        extractedAt: agendaData.extractedAt,
        sessionCount: agendaData.sessions.length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (browser) {
    const pages = browser.contexts().flatMap((context) => context.pages());
    const activePage = pages.at(0);

    if (activePage) {
      const html =
        (await activePage.evaluate(
          () =>
            document.querySelector(".page-agenda")?.outerHTML ??
            document.documentElement.outerHTML,
        )) ?? "";
      await fs.mkdir(new URL("../tmp/", import.meta.url), { recursive: true });
      await fs.writeFile(debugOutputPath, html);
    }
  }

  throw new Error(
    `${error instanceof Error ? error.message : String(error)}\nSaved debug HTML to ${debugOutputPath.pathname.replace(/^\//, "")}`,
  );
} finally {
  await browser.close();
}
