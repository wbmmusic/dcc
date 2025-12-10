import React from 'react'
import { useTheme } from './ThemeProvider'

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  onMouseDown,
  onMouseUp,
  onDoubleClick,
  style,
  children,
  type = 'button',
}) => {
  const theme = useTheme()

  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        color: '#fff',
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
        color: '#fff',
      },
      success: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
        color: '#fff',
      },
      danger: {
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
        color: '#fff',
      },
      warning: {
        backgroundColor: theme.colors.warning,
        borderColor: theme.colors.warning,
        color: '#000',
      },
      info: {
        backgroundColor: theme.colors.info,
        borderColor: theme.colors.info,
        color: '#000',
      },
      light: {
        backgroundColor: theme.colors.light,
        borderColor: theme.colors.light,
        color: '#000',
      },
      dark: {
        backgroundColor: theme.colors.dark,
        borderColor: theme.colors.dark,
        color: '#fff',
      },
      'outline-secondary': {
        backgroundColor: 'transparent',
        borderColor: theme.colors.secondary,
        color: theme.colors.secondary,
      },
    }
    return variants[variant]
  }

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        padding: '0.25rem 0.5rem',
        fontSize: theme.fontSize.sm,
        borderRadius: theme.borderRadius.sm,
      },
      md: {
        padding: '0.375rem 0.75rem',
        fontSize: theme.fontSize.md,
        borderRadius: theme.borderRadius.md,
      },
      lg: {
        padding: '0.5rem 1rem',
        fontSize: theme.fontSize.lg,
        borderRadius: theme.borderRadius.md,
      },
    }
    return sizes[size]
  }

  const buttonStyle = {
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 400,
    textAlign: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
    opacity: disabled ? 0.65 : 1,
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  }

  return (
    <button
      type={type}
      style={buttonStyle}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </button>
  )
}
