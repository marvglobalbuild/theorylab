import { useSyncExternalStore } from "react";

import { musicStore } from "./backgroundMusic";

export function useMusic() {
  return useSyncExternalStore(musicStore.subscribe, musicStore.get, musicStore.server);
}
