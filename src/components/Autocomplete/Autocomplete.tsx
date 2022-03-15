import { FC, ReactNode, useEffect, useRef, useState } from "react";
import classes from "./Autocomplete.module.css";

export interface Item {
  id: number;
  value: string;
}

export interface AutocompleteProps {
  dataFetcher: (query: string) => Promise<Item[]>;
  itemRender?: (item: Item) => ReactNode;
}

export function Autocomplete({ dataFetcher }: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openDropdown = () => setOpen(true);

  useEffect(() => {
    dataFetcher(query).then((results) => {
      console.log(query, results);
    });
  }, [query]);

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      console.log(e.target, inputRef.current);
      if (
        e.target &&
        autocompleteRef.current &&
        e.target !== inputRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }

      e.preventDefault();
      e.stopPropagation();
    }

    document.addEventListener("click", clickHandler);

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  return (
    <div
      ref={autocompleteRef}
      className={classes.Autocomplete}
      onClick={openDropdown}
    >
      <input
        ref={inputRef}
        className={classes.Input}
        value={query}
        type="text"
        onChange={({ target: { value } }) => setQuery(value)}
      />

      {open && (
        <div className={classes.Dropdown}>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
          <div className={classes.Item}>item</div>
        </div>
      )}
    </div>
  );
}
