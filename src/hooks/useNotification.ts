import { EventEmitter } from "events";

import { useCallback } from "react";

export const notificationEmitter = new EventEmitter();

export function useNotification() {
  const addNotification = useCallback((text: string) => {
    notificationEmitter.emit("notification", text);
  }, []);

  return { addNotification };
}
