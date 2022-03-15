import "./App.css";

import { Autocomplete } from "./components/Autocomplete";
import { Item } from "./components/Autocomplete/Autocomplete";

const items: Item[] = new Array(100).fill(null).map((_, id) => ({
  id,
  value: `item ${id}`,
}));

function fetcher(q: string): Promise<Item[]> {
  return fetch("https://api.publicapis.org/entries")
    .then((r) => r.json())
    .then(({ entries }) =>
      (entries as any[])
        .map((e, id) => ({
          id,
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
