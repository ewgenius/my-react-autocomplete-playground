import { DependencyList, EffectCallback, useEffect } from "react";

export function useDebouncedEffect(
  callback: EffectCallback,
  timeout: number = 300,
  dependencies: DependencyList = []
) {
  useEffect(() => {
    const timer = setTimeout(callback, timeout);
    return () => clearTimeout(timer);
  }, [...dependencies, timeout]);
}
