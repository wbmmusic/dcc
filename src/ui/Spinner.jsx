import React from 'react'
import { useTheme } from './ThemeProvider'

export default function Spinner({ size = 'md' }) {
  const theme = useTheme()
  
  const sizes = {
    sm: '16px',
    md: '32px',
    lg: '48px'
  }

  return (
    <div style={{
      width: sizes[size],
      height: sizes[size],
      border: `3px solid ${theme.colors.border}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )
}
