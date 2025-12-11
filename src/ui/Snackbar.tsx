import React, { CSSProperties, useEffect, useState } from 'react'
import { theme } from './theme'

interface SnackbarProps {
  open: boolean
  message: string
  autoHideDuration?: number
  onClose?: (event?: unknown, reason?: string) => void
  action?: React.ReactNode
  anchorOrigin?: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  autoHideDuration = 6000,
  onClose,
  action,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) => {
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    setVisible(open)
  }, [open])

  useEffect(() => {
    if (visible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [visible, autoHideDuration, onClose])

  if (!visible) return null

  const getPositionStyles = (): CSSProperties => {
    const { vertical, horizontal } = anchorOrigin
    
    const styles: CSSProperties = {
      position: 'fixed',
      zIndex: 1400,
    }

    if (vertical === 'top') styles.top = '24px'
    if (vertical === 'bottom') styles.bottom = '24px'
    
    if (horizontal === 'left') styles.left = '24px'
    if (horizontal === 'center') {
      styles.left = '50%'
      styles.transform = 'translateX(-50%)'
    }
    if (horizontal === 'right') styles.right = '24px'

    return styles
  }

  const snackbarStyle: CSSProperties = {
    ...getPositionStyles(),
    backgroundColor: theme.colors.gray[800],
    color: theme.colors.light,
    padding: '12px 16px',
    borderRadius: theme.borderRadius.md,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: `1px solid ${theme.colors.gray[600]}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: '300px',
    maxWidth: '500px',
    fontSize: theme.fontSize.sm,
    animation: 'slideIn 0.3s ease-out'
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(${anchorOrigin.vertical === 'bottom' ? '100%' : '-100%'});
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={snackbarStyle}>
        <span style={{ flex: 1 }}>{message}</span>
        {action && <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>{action}</div>}
      </div>
    </>
  )
}