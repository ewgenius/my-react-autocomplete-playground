import "./App.css";

import { Autocomplete } from "./components/Autocomplete";
import { Item } from "./components/Autocomplete/Autocomplete";

function fetcher(q: string): Promise<Item[]> {
  return fetch("https://api.publicapis.org/entries")
    .then((r) => r.json())
    .then(({ entries }) =>
      (entries as any[])
        .map((e) => ({
          value: e.API,
        }))
        .filter((item) => item.value.includes(q))
    );
  // return new Promise((r) => r(items.filter((item) => item.value.includes(q))));
}

export function App() {
  return (
    <div className="App">
      <Autocomplete dataFetcher={fetcher} />

      <Autocomplete dataFetcher={fetcher} />

      <Autocomplete dataFetcher={fetcher} />
    </div>
  );
}
