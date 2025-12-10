import React, { createContext, useContext } from 'react'
import { theme as defaultTheme } from './theme'

const ThemeContext = createContext(defaultTheme)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children, theme = defaultTheme }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
