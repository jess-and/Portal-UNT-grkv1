import { createContext, useContext, useEffect, useState } from "react";
import { useUnt } from "@/lib/unt";

const HydrationContext = createContext(false);

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const finish = () => setReady(true);
    if (useUnt.persist.hasHydrated()) {
      finish();
      return;
    }
    return useUnt.persist.onFinishHydration(finish);
  }, []);
  return <HydrationContext.Provider value={ready}>{children}</HydrationContext.Provider>;
}

export function useHydrated(): boolean {
  return useContext(HydrationContext);
}
