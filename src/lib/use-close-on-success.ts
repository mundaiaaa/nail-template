import { useEffect, useRef } from "react";

// Closes a Dialog automatically once a useActionState-backed form action
// finishes without an error — avoids leaving a stale "saved" form open.
export function useCloseOnSuccess(
  pending: boolean,
  error: string | undefined,
  close: () => void
) {
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !error) {
      close();
    }
    wasPending.current = pending;
  }, [pending, error, close]);
}
