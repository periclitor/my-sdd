import fallbackAgenda from "./data/agenda.json";
import AgendaPlanner from "./components/AgendaPlanner";
import type { AgendaData } from "./types";

const agendaData = fallbackAgenda as AgendaData;

export default function App() {
  return <AgendaPlanner agendaData={agendaData} />;
}
