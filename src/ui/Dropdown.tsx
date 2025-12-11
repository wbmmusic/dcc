import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { ButtonVariant, ButtonSize } from './theme'

interface DropdownItem {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Dropdown({ label, items, variant = 'primary', size = 'md' }: DropdownProps): React.JSX.Element {
  const theme = useTheme()
  const [show, setShow] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && e.target && !dropdownRef.current.contains(e.target as Node)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getVariantStyles = () => {
    const variants = {
      primary: { backgroundColor: theme.colors.primary, color: '#fff' },
      secondary: { backgroundColor: theme.colors.secondary, color: '#fff' },
      success: { backgroundColor: theme.colors.success, color: '#fff' },
      danger: { backgroundColor: theme.colors.danger, color: '#fff' },
      warning: { backgroundColor: theme.colors.warning, color: '#000' },
      info: { backgroundColor: theme.colors.info, color: '#000' },
      light: { backgroundColor: theme.colors.light, color: '#000' },
      dark: { backgroundColor: theme.colors.dark, color: '#fff' },
      'outline-secondary': { backgroundColor: 'transparent', color: theme.colors.secondary, border: `1px solid ${theme.colors.secondary}` }
    }
    return variants[variant] || variants.primary
  }

  const getSizeStyles = () => {
    const sizes = {
      sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem', borderRadius: theme.borderRadius.sm },
      md: { padding: '0.375rem 0.75rem', fontSize: '1rem', borderRadius: theme.borderRadius.md },
      lg: { padding: '0.5rem 1rem', fontSize: '1.25rem', borderRadius: theme.borderRadius.md }
    }
    return sizes[size]
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          ...getVariantStyles(),
          ...getSizeStyles(),
          border: variant === 'outline-secondary' ? `1px solid ${theme.colors.secondary}` : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 400,
          textAlign: 'center',
          verticalAlign: 'middle',
          userSelect: 'none',
          boxSizing: 'border-box',
          display: 'inline-block',
          lineHeight: 1.5,
          height: 'auto',
          minHeight: '31px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
          e.currentTarget.style.filter = 'brightness(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.filter = 'brightness(1)'
        }}
      >
        {label}
      </button>
      {show && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: theme.spacing.xs,
          backgroundColor: theme.colors.gray[800],
          border: `1px solid ${theme.colors.gray[600]}`,
          borderRadius: theme.borderRadius.md,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          minWidth: '150px',
          zIndex: 1000,
          color: theme.colors.light
        }}>
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                item.onClick()
                setShow(false)
              }}
              style={{
                padding: getSizeStyles().padding,
                cursor: 'pointer',
                fontSize: getSizeStyles().fontSize,
                borderBottom: i < items.length - 1 ? `1px solid ${theme.colors.gray[600]}` : 'none'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = theme.colors.gray[700]}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
