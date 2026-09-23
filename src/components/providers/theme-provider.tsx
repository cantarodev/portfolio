import { useCallback, useMemo, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "cantaro:theme";

const listeners = new Set<() => void>();
let cached: Theme | null = null;

function detectTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getSnapshot(): Theme {
  if (cached === null) cached = detectTheme();
  return cached;
}

function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

function writeTheme(theme: Theme) {
  cached = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* almacenamiento no disponible */
  }
  applyTheme(theme);
  listeners.forEach((listener) => listener());
}

/**
 * Estado de tema sin Context (para islas de Astro): store externo leído con
 * `useSyncExternalStore`. El script inline del Layout aplica la clase inicial.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheme = useCallback((next: Theme) => writeTheme(next), []);
  const toggle = useCallback(
    () => writeTheme(getSnapshot() === "dark" ? "light" : "dark"),
    [],
  );

  return useMemo(
    () => ({ theme, isDark: theme === "dark", toggle, setTheme }),
    [theme, toggle, setTheme],
  );
}
