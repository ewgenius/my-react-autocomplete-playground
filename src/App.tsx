import "./App.css";

import { Autocomplete } from "./components/Autocomplete";
import { Item } from "./components/Autocomplete/Autocomplete";

function publicApifetcher(q: string): Promise<Item[]> {
  return fetch("https://api.publicapis.org/entries")
    .then((r) => r.json())
    .then(({ entries }) =>
      (entries as any[])
        .map((e) => ({
          value: e.API,
        }))
        .filter((item) => item.value.includes(q))
    );
}

const items: Item[] = new Array(100)
  .fill(null)
  .map((_, i) => ({ value: `item ${i}` }));

function mockFetcher(q: string) {
  return new Promise<Item[]>((r) =>
    r(items.filter((item) => item.value.includes(q)))
  );
}

export function App() {
  return (
    <div className="App">
      <Autocomplete dataFetcher={mockFetcher} />
      <Autocomplete dataFetcher={publicApifetcher} />
    </div>
  );
}
