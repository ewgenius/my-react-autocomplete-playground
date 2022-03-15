import { FC } from "react";
import classes from "./Autocomplete.module.css";

export interface AutocompleteProps {}

export const Autocomplete: FC<AutocompleteProps> = () => {
  return <div className={classes.Autocomplete}>autocomplete</div>;
};
