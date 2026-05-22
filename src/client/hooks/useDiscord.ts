import { useEffect, useState } from "react";
import initDiscord, { waitForSDK } from "@/client/appClient";

export function useDiscord({ eager = true } = {}) {
  const [sdkState, setSdkState] = useState<{ sdk: Discord | null; loading: boolean; error: Error | null }>({
    sdk: null,
    loading: eager,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    if (!eager) {
      setSdkState((s) => ({ ...s, loading: false }));
      return;
    }
    (async () => {
      try {
        // start init (initDiscord sets internal sdk)
        await initDiscord();
        // wait for final readiness (optional short timeout)
        const client = await waitForSDK(10000, 300);
        if (!mounted) return;
        if (!client) throw new Error("Discord SDK failed to initialize in time");
        setSdkState({ sdk: client, loading: false, error: null });
      } catch (err: any) {
        if (!mounted) return;
        setSdkState({ sdk: null, loading: false, error: err });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eager]);

  return sdkState;
}
