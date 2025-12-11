/**
 * Custom Button Component
 * 
 * A flexible button component that provides consistent styling across the DCC
 * control application. Supports multiple variants, sizes, and interaction states
 * optimized for railroad control operations.
 */

import React, { CSSProperties, MouseEvent } from 'react'
import { theme, ButtonVariant, ButtonSize } from './theme'

/**
 * Props interface for the Button component
 * 
 * @interface ButtonProps
 * @property {ButtonVariant} [variant='primary'] - Visual style variant
 * @property {ButtonSize} [size='md'] - Button size
 * @property {boolean} [disabled=false] - Whether the button is disabled
 * @property {Function} [onClick] - Click event handler
 * @property {Function} [onMouseDown] - Mouse down event handler (for momentary functions)
 * @property {Function} [onMouseUp] - Mouse up event handler (for momentary functions)
 * @property {Function} [onDoubleClick] - Double click event handler
 * @property {CSSProperties} [style] - Additional CSS styles
 * @property {React.ReactNode} [children] - Button content (text, icons, etc.)
 * @property {string} [type='button'] - HTML button type
 */
interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void
  onDoubleClick?: (e: MouseEvent<HTMLButtonElement>) => void
  style?: CSSProperties
  children?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Generates CSS styles for different button variants
 * 
 * Each variant corresponds to a specific use case in the DCC interface:
 * - primary: Main actions (Start, Save, etc.)
 * - secondary: Secondary actions (Cancel, etc.)
 * - success: Positive actions (Connect, Enable, etc.)
 * - danger: Destructive actions (Delete, Emergency Stop, etc.)
 * - warning: Attention-getting actions (Caution states)
 * - info: Informational actions
 * - light/dark: Contrast variations
 * - outline-secondary: Subtle secondary actions
 * 
 * @param {ButtonVariant} variant - The button style variant
 * @param {boolean} disabled - Whether the button is disabled
 * @returns {CSSProperties} CSS styles for the variant
 */
const getVariantStyles = (variant: ButtonVariant, disabled: boolean): CSSProperties => {
  const baseStyles: CSSProperties = {
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 400,
    textAlign: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    transition: 'all 0.2s ease-in-out',
    opacity: disabled ? 0.65 : 1,
    transform: 'translateY(0)',
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

/**
 * Generates CSS styles for different button sizes
 * 
 * Size guidelines:
 * - sm: Compact buttons for toolbars, function buttons, and space-constrained areas
 * - md: Standard buttons for most interface interactions
 * - lg: Large buttons for primary actions and touch-friendly interfaces
 * 
 * @param {ButtonSize} size - The button size
 * @returns {CSSProperties} CSS styles for the size
 */
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

/**
 * Button Component
 * 
 * A versatile button component designed for DCC railroad control interfaces.
 * Provides consistent styling, multiple interaction modes, and accessibility features.
 * 
 * Usage Examples:
 * ```tsx
 * // Primary action button
 * <Button variant="primary" onClick={handleSave}>Save</Button>
 * 
 * // Emergency stop button
 * <Button variant="danger" size="lg" onClick={handleEmergencyStop}>E-STOP</Button>
 * 
 * // Momentary function button (horn, bell, etc.)
 * <Button 
 *   variant="secondary" 
 *   onMouseDown={handleHornStart}
 *   onMouseUp={handleHornStop}
 * >
 *   Horn
 * </Button>
 * 
 * // Compact toolbar button
 * <Button variant="outline-secondary" size="sm">Settings</Button>
 * ```
 * 
 * @param {ButtonProps} props - Component props
 * @returns {React.JSX.Element} Rendered button element
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
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
    position: 'relative',
  }

  const isDisabled = disabled || loading

  const LoadingSpinner = () => (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '16px',
        height: '16px',
        border: '2px solid transparent',
        borderTop: '2px solid currentColor',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  )

  return (
    <button
      type={type}
      style={buttonStyle}
      disabled={isDisabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
          e.currentTarget.style.filter = 'brightness(1.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.filter = 'brightness(1)'
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(1px)'
          e.currentTarget.style.filter = 'brightness(0.9)'
        }
        onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.filter = 'brightness(1.1)'
        }
        onMouseUp?.(e)
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
      <span style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.2s ease' }}>
        {children}
      </span>
      {loading && <LoadingSpinner />}
    </button>
  )
}
