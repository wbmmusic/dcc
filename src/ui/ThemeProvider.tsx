import React, { createContext, useContext, ReactNode } from 'react'
import { theme as defaultTheme } from './theme'

const ThemeContext = createContext(defaultTheme)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode;
  theme?: typeof defaultTheme;
}

export const ThemeProvider = ({ children, theme = defaultTheme }: ThemeProviderProps): React.JSX.Element => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
