import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";
export const THEME_SYSTEM = "system";

const STORAGE_KEY = "vdt-theme-preference";

const getSystemPrefersDark = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const resolveEffectiveTheme = (preference) => {
  if (preference === THEME_DARK) return THEME_DARK;
  if (preference === THEME_LIGHT) return THEME_LIGHT;
  return getSystemPrefersDark() ? THEME_DARK : THEME_LIGHT;
};

const applyTheme = (effectiveTheme) => {
  const root = document.documentElement;
  if (effectiveTheme === THEME_DARK) {
    root.setAttribute("data-theme", "dark");
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.setAttribute("data-theme", "light");
    root.classList.add("light");
    root.classList.remove("dark");
  }
};

export function ThemeInitScript() {
  const script = `(function(){var p=localStorage.getItem("vdt-theme-preference")||"system";var d=p==="dark"||(p==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.classList.add(d?"dark":"light");})();`;
  return React.createElement("script", { dangerouslySetInnerHTML: { __html: script } });
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || THEME_SYSTEM; } catch { return THEME_SYSTEM; }
  });

  const [effectiveTheme, setEffectiveTheme] = useState(() =>
    resolveEffectiveTheme(localStorage.getItem(STORAGE_KEY) || THEME_SYSTEM)
  );

  const applyAndPersist = useCallback((pref) => {
    const resolved = resolveEffectiveTheme(pref);
    applyTheme(resolved);
    setEffectiveTheme(resolved);
    try { localStorage.setItem(STORAGE_KEY, pref); } catch {}
  }, []);

  useEffect(() => {
    applyAndPersist(preference);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (preference === THEME_SYSTEM) {
        const resolved = resolveEffectiveTheme(THEME_SYSTEM);
        applyTheme(resolved);
        setEffectiveTheme(resolved);
      }
    };
    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, [preference, applyAndPersist]);

  const setTheme = useCallback((newPreference) => {
    setPreference(newPreference);
    applyAndPersist(newPreference);
  }, [applyAndPersist]);

  const toggleTheme = useCallback(() => {
    const next = effectiveTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(next);
  }, [effectiveTheme, setTheme]);

  return React.createElement(
    ThemeContext.Provider,
    { value: { preference, effectiveTheme, setTheme, toggleTheme } },
    children
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
