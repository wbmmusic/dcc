import React, { CSSProperties, MouseEvent } from 'react'
import { theme } from './theme'

interface IconButtonProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  color?: 'inherit' | 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  style?: CSSProperties
  title?: string
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  size = 'medium',
  color = 'inherit',
  disabled = false,
  style,
  title
}) => {
  const getSizeStyles = (): CSSProperties => {
    const sizes = {
      small: { padding: '4px', fontSize: '16px' },
      medium: { padding: '8px', fontSize: '20px' },
      large: { padding: '12px', fontSize: '24px' }
    }
    return sizes[size]
  }

  const getColorStyles = (): CSSProperties => {
    const colors = {
      inherit: { color: 'inherit' },
      primary: { color: theme.colors.primary },
      secondary: { color: theme.colors.secondary },
      danger: { color: theme.colors.danger }
    }
    return colors[color]
  }

  const buttonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: theme.borderRadius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    ...getSizeStyles(),
    ...getColorStyles(),
    ...style
  }

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      {children}
    </button>
  )
}