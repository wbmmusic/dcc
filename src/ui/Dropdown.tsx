import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

interface DropdownItem {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  variant?: 'primary' | 'secondary';
}

export default function Dropdown({ label, items, variant = 'primary' }: DropdownProps): React.JSX.Element {
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

  const colors = {
    primary: { bg: theme.colors.primary, text: theme.colors.light },
    secondary: { bg: theme.colors.secondary, text: theme.colors.light }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: colors[variant].bg,
          color: colors[variant].text,
          border: 'none',
          borderRadius: theme.borderRadius.md,
          cursor: 'pointer',
          fontSize: theme.fontSize.md
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
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                cursor: 'pointer',
                fontSize: theme.fontSize.md,
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
