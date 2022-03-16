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
  name?: string;
  dataFetcher: (query: string) => Promise<Item[]>;
}

export const Autocomplete: FC<AutocompleteProps> = ({ name, dataFetcher }) => {
  const [open, setOpen] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState<string>();
  const [highlightRegexp, setHighlightRegexp] = useState<RegExp>();
  const [quering, setQuering] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>();
  const [error, setError] = useState<string | null>();

  const autocompleteRef = useRef<HTMLDivElement>(null);

  const onSelect = (value: string) => {
    setSelected(value);
    setQuering(false);
    setOpen(false);
  };

  const queryItems = (query: string) => {
    setError(null);
    setQuering(true);
    setItems([]);
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
  };

  const onQueryStart = () => setQuering(true);
  const onQueryFinish = (q: string) => queryItems(q);

  // open dropdown and fire query request
  const openDropdown = useCallback(() => {
    setOpen(true);
    if (!open) {
      queryItems("");
    }
  }, [open]);

  const toggleDropdown = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
      queryItems("");
    }
  }, [open]);

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
          setQuering(false);
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
      <input name={name} type="hidden" value={selected || ""} />
      <AutocompleteInput
        selected={selected}
        editable={open}
        onClick={openDropdown}
        onQueryStart={onQueryStart}
        onQueryFinish={onQueryFinish}
      />

      <div className={classes.Icon} onClick={toggleDropdown}>
        {quering ? (
          <img className={classes.IconLoading} src={iconLoader} />
        ) : (
          <img src={open ? iconCevronUp : iconCevronDown} />
        )}
      </div>

      {open && (
        <div className={classes.Dropdown}>
          {error ? (
            <div className={classes.Error}>{error}</div>
          ) : items && items.length > 0 ? (
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
};

interface AutocompleteInputProps {
  selected?: string | null;
  editable?: boolean;
  onClick: React.MouseEventHandler<HTMLInputElement>;
  onQueryStart: () => void;
  onQueryFinish: (query: string) => void;
}

const AutocompleteInput: FC<AutocompleteInputProps> = ({
  onClick,
  selected,
  editable,
  onQueryStart,
  onQueryFinish,
}) => {
  const [query, setQuery] = useState<string>();
  const onChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => setQuery(value);

  useEffect(() => {
    if (selected || !editable) {
      setQuery(undefined);
    }
  }, [selected, editable]);

  useDebouncedEffect(
    // mark as quering right after typing started
    () => {
      if (query !== undefined) {
        onQueryStart();
      }
    },
    // fire query request if query is a string, with 300ms debounce timeout
    () => {
      if (query !== undefined) {
        onQueryFinish(query);
      }
    },
    300,
    [query]
  );

  return (
    <input
      onClick={onClick}
      className={classes.Input}
      value={editable ? query || "" : selected || ""}
      placeholder={selected || ""}
      type="text"
      onChange={onChange}
    />
  );
};

interface AutocompleteItemProps {
  item: Item;
  onSelect: (value: string) => void;
  selected?: boolean;
  query?: string;
  highlight?: RegExp;
}

const AutocompleteItem: FC<AutocompleteItemProps> = memo(
  ({ item, onSelect, selected, query, highlight }) => {
    // TODO: this part might be too slow
    const parts = highlight ? item.value.split(highlight) : [item.value];
    const onClick = useCallback(() => {
      onSelect(item.value);
    }, [item.value, onSelect]);
    return (
      <div
        className={classnames(classes.Item, selected && classes.Selected)}
        onClick={onClick}
      >
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
