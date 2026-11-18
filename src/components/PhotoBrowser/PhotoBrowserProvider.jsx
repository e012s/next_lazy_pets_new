"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PhotoBrowser } from "./PhotoBrowser";

const PhotoBrowserContext = createContext(null);

export function PhotoBrowserProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    index: 0,
    sources: [],
  });

  const close = useCallback(() => {
    setState((current) => ({ ...current, open: false }));
  }, []);

  const open = useCallback((sources, index = 0) => {
    const list = sources.filter(Boolean);
    if (list.length === 0) return;
    const safeIndex = Math.min(Math.max(index, 0), list.length - 1);
    setState({ open: true, index: safeIndex, sources: list });
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <PhotoBrowserContext.Provider value={value}>
      {children}
      <PhotoBrowser
        open={state.open}
        index={state.index}
        sources={state.sources}
        onClose={close}
      />
    </PhotoBrowserContext.Provider>
  );
}

export function usePhotoBrowser() {
  const context = useContext(PhotoBrowserContext);
  if (!context) {
    throw new Error("usePhotoBrowser must be used within PhotoBrowserProvider");
  }
  return context;
}
