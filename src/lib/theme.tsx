"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "cyberpunk" | "matrix" | "ocean";

const THEMES: { id: Theme; label: string; icon: string; desc: string }[] = [
  { id: "light", label: "Light", icon: "☀️", desc: "Clean professional" },
  { id: "dark", label: "Dark", icon: "🌙", desc: "Easy on eyes" },
  { id: "cyberpunk", label: "Cyberpunk", icon: "⚡", desc: "Neon purple" },
  { id: "matrix", label: "Matrix", icon: "💚", desc: "Green terminal" },
  { id: "ocean", label: "Ocean", icon: "🌊", desc: "Deep sea blue" },
];

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: typeof THEMES;
}>({ theme: "dark", setTheme: () => {}, themes: THEMES });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("sdlc-theme") as Theme | null;
    if (saved && THEMES.find((t) => t.id === saved)) {
      applyTheme(saved);
      setThemeState(saved);
    }
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("sdlc-theme", t);
  }

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { THEMES };
