import {
  ChangeEventHandler,
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

import iconLoader from "../../../assets/loader.svg";
import iconCheck from "../../../assets/check.svg";
import iconCevronUp from "../../../assets/chevron-up.svg";
import iconCevronDown from "../../../assets/chevron-down.svg";

export interface Item {
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
  const [error, setError] = useState<string | null>();

  const autocompleteRef = useRef<HTMLDivElement>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => setQuery(value);

  const onSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
  };

  const queryItems = useCallback(() => {
    setError(null);
    setQuering(true);
    dataFetcher(query || "")
      .then((results) => {
        setHighlightQuery(query);
        setHighlightRegexp(new RegExp(`(${query})`, "gi"));
        setItems(results);
        setQuering(false);
      })
      .catch(() => {
        setError("Something went wrong");
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

  const toggleDropdown = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
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
      if (e.target && autocompleteRef.current) {
        if (e.target === autocompleteRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }

        // click outside
        if (
          e.target !== autocompleteRef.current &&
          !autocompleteRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
    }

    if (open) {
      document.addEventListener("click", clickHandler);
    } else {
      document.removeEventListener("click", clickHandler);
    }

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [open]);

  return (
    <div
      ref={autocompleteRef}
      className={classnames(
        classes.Autocomplete,
        open && classes.AutocompleteOpened
      )}
    >
      {!open && selected ? (
        <div onClick={openDropdown} className={classes.Selected}>
          {selected}
        </div>
      ) : (
        <input
          onClick={openDropdown}
          className={classes.Input}
          value={query}
          placeholder={selected || ""}
          type="text"
          onChange={onChange}
        />
      )}

      <div className={classes.Icon} onClick={toggleDropdown}>
        {quering ? (
          <img className={classes.IconLoading} src={iconLoader} />
        ) : (
          <img src={open ? iconCevronUp : iconCevronDown} />
        )}
      </div>

      {open && (
        <div className={classes.Dropdown}>
          {items && items.length > 0 ? (
            items.map((item, i) => (
              <AutocompleteItem
                key={`${item.value}_${i}`}
                item={item}
                selected={item.value === selected}
                onSelect={onSelect}
                query={highlightQuery}
                highlight={highlightRegexp}
              />
            ))
          ) : (
            <div className={classes.Placeholder}>
              {quering ? "loading..." : "nothing found..."}
            </div>
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
            key={i}
            className={classnames(
              part.toLowerCase() === query?.toLowerCase() && classes.Highlight
            )}
          >
            {part}
          </span>
        ))}
        {selected && (
          <div className={classes.Icon}>
            <img src={iconCheck} />
          </div>
        )}
      </div>
    );
  }
);
