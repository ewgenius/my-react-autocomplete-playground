import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [query, setQuery] = useState<string>();
  const [highlightQuery, setHighlightQuery] = useState<string>();
  const [highlightRegexp, setHighlightRegexp] = useState<RegExp>();
  const [quering, setQuering] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>();

  const autocompleteRef = useRef<HTMLDivElement>(null);

  const onSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
  };

  const queryItems = useCallback(() => {
    setQuering(true);
    dataFetcher(query || "").then((results) => {
      setHighlightQuery(query);
      setHighlightRegexp(new RegExp(`(${query})`, "gi"));
      setItems(results);
      setQuering(false);
    });
  }, [query]);

  // open dropdown and fire query request
  const openDropdown = useCallback(() => {
    setOpen(true);
    if (!open) {
      queryItems();
    }
  }, [open]);

  // debounced refetch while typing
  useDebouncedEffect(
    // mark as quering right after typing started
    () => {
      if (query !== undefined) {
        setQuering(true);
      }
    },
    // fire query request if query is a string, with 300ms debounce timeout
    () => {
      if (query !== undefined) {
        queryItems();
      }
    },
    300,
    [query]
  );

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      // handle clicks
      if (
        e.target &&
        autocompleteRef.current &&
        e.target !== autocompleteRef.current &&
        // if click target is inside autocomplete root node we shouldn't close it
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
      {!open && selected ? (
        <div className={classes.Selected}>{selected}</div>
      ) : (
        <input
          className={classes.Input}
          value={query}
          type="text"
          onChange={({ target: { value } }) => setQuery(value)}
        />
      )}

      <div className={classes.Icon}>
        {quering ? (
          <img className={classes.IconLoading} src="/assets/loader.svg" />
        ) : (
          <img src={`/assets/chevron-${open ? "up" : "down"}.svg`} />
        )}
      </div>

      {open && (
        <div className={classes.Dropdown}>
          {items && items.length > 0 ? (
            items.map((item) => (
              <AutocompleteItem
                key={item.id}
                item={item}
                selected={item.value === selected}
                onSelect={onSelect}
                query={highlightQuery}
                highlight={highlightRegexp}
              />
            ))
          ) : (
            <div className={classes.Placeholder}>nothing found...</div>
          )}
        </div>
      )}
    </div>
  );
}

interface AutocompleteItemProps {
  item: Item;
  onSelect: (value: string) => void;
  selected?: boolean;
  query?: string;
  highlight?: RegExp;
}

const AutocompleteItem: FC<AutocompleteItemProps> = memo(
  ({ item, onSelect, selected, query, highlight }) => {
    const parts = highlight ? item.value.split(highlight) : [item.value];
    const onClick = useCallback(() => {
      onSelect(item.value);
    }, [item.value, onSelect]);
    return (
      <div className={classes.Item} onClick={onClick}>
        {parts.map((part, i) => (
          <span
            className={classnames(
              part.toLowerCase() === query?.toLowerCase() && classes.Highlight
            )}
          >
            {part}
          </span>
        ))}
        {selected && (
          <div className={classes.Icon}>
            <img src="/assets/check.svg" />
          </div>
        )}
      </div>
    );
  }
);
