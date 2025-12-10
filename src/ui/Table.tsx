import React, { ReactNode, CSSProperties } from 'react'
import { useTheme } from './ThemeProvider'

interface TableProps {
  children: ReactNode;
  striped?: boolean;
  bordered?: boolean;
  borderless?: boolean;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

const Table = ({ 
  children, 
  striped = false, 
  bordered = true,
  borderless = false,
  size = 'md',
  style
}: TableProps): React.JSX.Element => {
  const theme = useTheme()
  
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: size === 'sm' ? theme.fontSize.sm : theme.fontSize.md,
    ...style,
  }

  const className = [
    'custom-table',
    striped ? 'table-striped' : '',
    borderless ? 'table-borderless' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <style>{`
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          color: ${theme.colors.light};
          ${!borderless && bordered ? `border: 1px solid ${theme.colors.gray[600]};` : ''}
        }
        .custom-table th,
        .custom-table td {
          padding: ${size === 'sm' ? theme.spacing.xs : theme.spacing.sm};
          text-align: left;
          vertical-align: middle;
          ${!borderless && bordered ? `border: 1px solid ${theme.colors.gray[600]};` : ''}
        }
        .custom-table thead th {
          vertical-align: bottom;
          border-bottom: 2px solid ${theme.colors.gray[600]};
          font-weight: bold;
          background-color: ${theme.colors.gray[800]};
        }
        .table-striped tbody tr:nth-of-type(odd) {
          background-color: ${theme.colors.gray[800]};
        }
        .table-borderless th,
        .table-borderless td {
          border: none !important;
        }
      `}</style>
      <table className={className} style={tableStyle}>
        {children}
      </table>
    </>
  )
}

export default Table
