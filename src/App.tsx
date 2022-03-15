import "./App.css";

import { Autocomplete } from "./components/Autocomplete";

export function App() {
  return (
    <div className="App">
      <Autocomplete
        dataFetcher={(q) => new Promise((r) => r([{ id: 1, value: "test" }]))}
      />
    </div>
  );
}
