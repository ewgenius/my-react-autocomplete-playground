import classes from "./App.module.css";

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
  .map((_, i) => ({ value: `item-${i}` }));

function mockFetcher(q: string) {
  return new Promise<Item[]>((r) =>
    r(items.filter((item) => item.value.includes(q)))
  );
}

export function App() {
  return (
    <div className={classes.App}>
      <div className={classes.Row}>
        <b>Simple mocked api example:</b>
        <Autocomplete dataFetcher={mockFetcher} />
      </div>

      <div className={classes.Row}>
        <b>Real api example:</b>
        <Autocomplete dataFetcher={publicApifetcher} />
      </div>

      <form
        className={classes.Row}
        onSubmit={(e) => {
          e.preventDefault();
          console.log((e.target as any).elements);
        }}
      >
        <b>Real api example, inside form:</b>
        <Autocomplete name="item" dataFetcher={publicApifetcher} />

        <button className={classes.Button} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
