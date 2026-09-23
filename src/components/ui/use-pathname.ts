import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}

function getSnapshot() {
  return window.location.pathname;
}

function getServerSnapshot() {
  return "/";
}

/** Devuelve el pathname actual del navegador. */
export function usePathname() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
