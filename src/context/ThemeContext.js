import { createContext, useState, useContext, useEffect } from 'react';
import { themes, defaultTheme } from '../theme/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  // 🔥 CURRENT THEME (LOCAL STORAGE SE LOAD)
  const [themeName, setThemeName] = useState(
    localStorage.getItem("theme") || defaultTheme
  );

  // 🔄 UPDATE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("theme", themeName);
  }, [themeName]);

  // 🎯 CURRENT THEME OBJECT
  const currentTheme = themes[themeName];

  // 🔁 SWITCH THEME (DIRECT SELECT)
  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };

  // ⚡ QUICK TOGGLE (OPTIONAL - DARK/LIGHT SWITCH)
  const toggleTheme = () => {
    const isDark = currentTheme.mode === "dark";

    if (isDark) {
      setTheme("cleanGlass"); // default light
    } else {
      setTheme("cosmicDark"); // default dark
    }
  };

  // 🎨 FINAL THEME OBJECT (GLOBAL USE)
  const theme = {
    ...currentTheme,
    themeName,
    setTheme,
    toggleTheme,
    isDark: currentTheme.mode === "dark",
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// 🔥 CUSTOM HOOK
export function useTheme() {
  return useContext(ThemeContext);
}