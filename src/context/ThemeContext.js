import { createContext, useState, useContext, useEffect } from 'react';
import { themes, defaultTheme, themeOptions } from '../theme/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 🔥 CURRENT THEME (LOCAL STORAGE SE LOAD)
  const [themeName, setThemeName] = useState(() => {
    const savedTheme = localStorage.getItem('theme');

    // ✅ Agar saved theme exist karti hai themes.js me, wahi use karo
    // warna default theme use karo
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }

    return defaultTheme;
  });

  // 🔄 UPDATE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  // 🎯 CURRENT THEME OBJECT
  const currentTheme = themes[themeName] || themes[defaultTheme];

  // 🔁 SWITCH THEME (DIRECT SELECT)
  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    } else {
      console.warn(`Theme "${name}" not found`);
    }
  };

  // ⚡ QUICK TOGGLE — Liquid Glass Light/Dark
  const toggleTheme = () => {
    const isDark = currentTheme.mode === 'dark';

    if (isDark) {
      setTheme('liquidGlassLight');
    } else {
      setTheme('liquidGlassDark');
    }
  };

  // 🌌 Direct premium theme shortcuts
  const setLiquidGlassLight = () => setTheme('liquidGlassLight');
  const setLiquidGlassDark = () => setTheme('liquidGlassDark');
  const setCosmicDark = () => setTheme('cosmicDark');
  const setCosmicGlass = () => setTheme('cosmicGlass');
  const setCleanGlass = () => setTheme('cleanGlass');
  const setSoftPremium = () => setTheme('softPremium');
  const setMidnightMinimal = () => setTheme('midnightMinimal');

  // 🎨 FINAL THEME OBJECT (GLOBAL USE)
  const theme = {
    ...currentTheme,

    // current theme info
    themeName,
    currentTheme,
    themeOptions,

    // actions
    setTheme,
    toggleTheme,

    // shortcuts
    setLiquidGlassLight,
    setLiquidGlassDark,
    setCosmicDark,
    setCosmicGlass,
    setCleanGlass,
    setSoftPremium,
    setMidnightMinimal,

    // helpers
    isDark: currentTheme.mode === 'dark',
    isLight: currentTheme.mode === 'light',
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// 🔥 CUSTOM HOOK
export function useTheme() {
  return useContext(ThemeContext);
}