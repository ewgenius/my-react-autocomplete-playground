import { DependencyList, EffectCallback, useEffect } from "react";

export function useDebouncedEffect(
  callback: EffectCallback,
  debouncedCallback: EffectCallback,
  timeout: number = 300,
  dependencies: DependencyList = []
) {
  useEffect(() => {
    callback();
    const timer = setTimeout(debouncedCallback, timeout);
    return () => clearTimeout(timer);
  }, [...dependencies, timeout]);
}
