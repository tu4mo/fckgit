import { Box, Text } from "ink";
import { useEffect, useRef, useState } from "react";

import { notificationEmitter } from "../hooks/useNotification.js";

type Props = {
  duration?: number;
};

export function Notification({ duration = 1500 }: Props) {
  const [text, setText] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (message: string) => {
      setText(message);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setText(null), duration);
    };

    notificationEmitter.on("notification", handler);

    return () => {
      notificationEmitter.off("notification", handler);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration]);

  if (!text) {
    return null;
  }

  return (
    <Box position="absolute" right={1}>
      <Text color="gray">{text}</Text>
    </Box>
  );
}
