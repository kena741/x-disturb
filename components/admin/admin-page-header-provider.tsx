"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AdminPageHeaderContextValue {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const AdminPageHeaderContext = createContext<AdminPageHeaderContextValue | null>(
  null
);

export function AdminPageHeaderProvider({ children }: { children: ReactNode }) {
  const [actions, setActionsState] = useState<ReactNode>(null);
  const setActions = useCallback((next: ReactNode) => {
    setActionsState(next);
  }, []);

  const value = useMemo(
    () => ({ actions, setActions }),
    [actions, setActions]
  );

  return (
    <AdminPageHeaderContext.Provider value={value}>
      {children}
    </AdminPageHeaderContext.Provider>
  );
}

function useAdminPageHeaderContext() {
  const context = useContext(AdminPageHeaderContext);
  if (!context) {
    throw new Error(
      "AdminPageHeaderActions must be used within AdminPageHeaderProvider"
    );
  }
  return context;
}

export function AdminPageHeaderActions({ children }: { children: ReactNode }) {
  const { setActions } = useAdminPageHeaderContext();

  useLayoutEffect(() => {
    setActions(children);
    return () => setActions(null);
  }, [children, setActions]);

  return null;
}

export function useAdminPageHeaderActionsFromProvider(): ReactNode {
  const context = useContext(AdminPageHeaderContext);
  return context?.actions ?? null;
}
