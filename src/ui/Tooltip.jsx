import React, { useState } from 'react'
import { useTheme } from './ThemeProvider'

export default function Tooltip({ children, text }) {
  const theme = useTheme()
  const [show, setShow] = useState(false)

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: theme.spacing.xs,
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          backgroundColor: theme.colors.dark,
          color: theme.colors.light,
          fontSize: theme.fontSize.sm,
          borderRadius: theme.borderRadius.md,
          whiteSpace: 'nowrap',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          {text}
        </div>
      )}
    </div>
  )
}
