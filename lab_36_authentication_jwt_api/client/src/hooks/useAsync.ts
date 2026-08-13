import { useCallback, useState } from "react";

interface AsyncState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export function useAsync() {
  const [state, setState] = useState<AsyncState>({ loading: false, error: null, successMessage: null });

  const run = useCallback(async <T,>(fn: () => Promise<T>, successMessage?: string): Promise<T | undefined> => {
    setState({ loading: true, error: null, successMessage: null });
    try {
      const result = await fn();
      setState({ loading: false, error: null, successMessage: successMessage ?? null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState({ loading: false, error: message, successMessage: null });
      return undefined;
    }
  }, []);

  const reset = useCallback(() => setState({ loading: false, error: null, successMessage: null }), []);

  return { ...state, run, reset };
}
