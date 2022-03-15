import { ReactNode, useEffect, useRef, useState } from "react";
import { useDebouncedEffect } from "../../hooks/useDebouncedEffect";
import { classnames } from "../../utils/classnames";
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
  const [quering, setQuering] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openDropdown = () => setOpen(true);

  useDebouncedEffect(
    () => {
      setQuering(true);
      dataFetcher(query).then((results) => {
        setItems(results);
        setQuering(false);
      });
    },
    300,
    [query]
  );

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
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
      className={classnames(
        classes.Autocomplete,
        open && classes.AutocompleteOpened
      )}
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
          {items.map((item) => (
            <div key={item.id} className={classes.Item}>
              {item.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
