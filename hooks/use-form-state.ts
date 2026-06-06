"use client";

import * as React from "react";

/**
 * Tiny `useActionState` polyfill. Wraps a server action so the client
 * component can render the latest state, pending state, and field errors.
 *
 * Server actions in Next 15 expose `useActionState` from React already;
 * this helper exists for the rare case where the page is rendered outside
 * of a React server-component context.
 */
export function useFormState<TState, TPayload extends unknown[]>(
  action: (...args: [TState | undefined, ...TPayload]) => Promise<TState>,
  initial: TState
): [TState, (payload: ...TPayload) => void, boolean] {
  const [state, setState] = React.useState<TState>(initial);
  const [pending, setPending] = React.useState(false);

  const handler = React.useCallback(
    async (...payload: TPayload) => {
      setPending(true);
      try {
        const next = await action(undefined, ...payload);
        setState(next);
      } finally {
        setPending(false);
      }
    },
    [action]
  );

  return [state, handler, pending];
}
