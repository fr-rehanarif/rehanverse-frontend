import { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      bg: '#0f172a',
      card: '#1e293b',
      nav: '#1e293b',
      text: '#f1f5f9',
      subtext: '#94a3b8',
      border: '#334155',
      primary: '#818cf8',
      btnText: 'white',
    } : {
      bg: '#f8fafc',
      card: '#ffffff',
      nav: '#ffffff',
      text: '#1e293b',
      subtext: '#64748b',
      border: '#e2e8f0',
      primary: '#4f46e5',
      btnText: 'white',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}