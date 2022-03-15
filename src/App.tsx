import "./App.css";

import { Autocomplete } from "./components/Autocomplete";
import { Item } from "./components/Autocomplete/Autocomplete";

const items: Item[] = new Array(100).fill(null).map((_, id) => ({
  id,
  value: `item ${id}`,
}));

function fetcher(q: string): Promise<Item[]> {
  return new Promise((r) => r(items.filter((item) => item.value.includes(q))));
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
