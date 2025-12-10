import React, { CSSProperties, MouseEvent } from 'react'
import { theme, ButtonVariant, ButtonSize } from './theme'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void
  onDoubleClick?: (e: MouseEvent<HTMLButtonElement>) => void
  style?: CSSProperties
  children?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}

const getVariantStyles = (variant: ButtonVariant, disabled: boolean): CSSProperties => {
  const baseStyles: CSSProperties = {
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 400,
    textAlign: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
    opacity: disabled ? 0.65 : 1,
  }

  const variants: Record<ButtonVariant, CSSProperties> = {
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

  return { ...baseStyles, ...variants[variant] }
}

const getSizeStyles = (size: ButtonSize): CSSProperties => {
  const sizes: Record<ButtonSize, CSSProperties> = {
    sm: {
      padding: '0.25rem 0.5rem',
      fontSize: '0.875rem',
      borderRadius: theme.borderRadius.sm,
    },
    md: {
      padding: '0.375rem 0.75rem',
      fontSize: '1rem',
      borderRadius: theme.borderRadius.md,
    },
    lg: {
      padding: '0.5rem 1rem',
      fontSize: '1.25rem',
      borderRadius: theme.borderRadius.md,
    },
  }

  return sizes[size]
}

export const Button: React.FC<ButtonProps> = ({
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
  const variantStyles = getVariantStyles(variant, disabled)
  const sizeStyles = getSizeStyles(size)

  const buttonStyle: CSSProperties = {
    ...variantStyles,
    ...sizeStyles,
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
