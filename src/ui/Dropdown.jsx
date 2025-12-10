import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

export default function Dropdown({ label, items, variant = 'primary' }) {
  const theme = useTheme()
  const [show, setShow] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.gray[700]}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
