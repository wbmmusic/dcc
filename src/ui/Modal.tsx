import React, { ReactNode } from 'react'
import { useTheme } from './ThemeProvider'

interface ModalProps {
  show: boolean;
  onHide: () => void;
  children: ReactNode;
}

export const Modal = ({ show, onHide, children }: ModalProps): React.JSX.Element | null => {
  const theme = useTheme()
  
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
      }}
      onClick={onHide}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: theme.borderRadius.md,
          minWidth: '400px',
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

Modal.Header = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const theme = useTheme()
  
  return (
    <div
      style={{
        padding: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.gray[300]}`,
        fontWeight: 'bold',
        fontSize: theme.fontSize.lg,
      }}
    >
      {children}
    </div>
  )
}

Modal.Body = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const theme = useTheme()
  
  return (
    <div style={{ padding: theme.spacing.md }}>
      {children}
    </div>
  )
}

Modal.Footer = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const theme = useTheme()
  
  return (
    <div
      style={{
        padding: theme.spacing.md,
        borderTop: `1px solid ${theme.colors.gray[300]}`,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
      }}
    >
      {children}
    </div>
  )
}
