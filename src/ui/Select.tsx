import React, { useState, useRef, useEffect, CSSProperties } from 'react'
import { useTheme } from './ThemeProvider'

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  options?: SelectOption[];
  value?: SelectOption;
  onChange: (option: SelectOption) => void;
  placeholder?: string;
  isDisabled?: boolean;
  style?: CSSProperties;
}

const Select = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...',
  isDisabled = false,
  style,
}: SelectProps): React.JSX.Element => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: SelectOption) => {
    onChange(option)
    setIsOpen(false)
  }

  const displayValue = value ? value.label : placeholder

  return (
    <div ref={selectRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: theme.fontSize.sm,
          border: `1px solid ${theme.colors.gray[600]}`,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: isDisabled ? theme.colors.gray[700] : theme.colors.gray[800],
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '31px',
          color: theme.colors.light
        }}
      >
        <span style={{ color: value ? theme.colors.light : theme.colors.gray[400] }}>{displayValue}</span>
        <span style={{ marginLeft: theme.spacing.sm }}>▼</span>
      </div>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: theme.colors.gray[800],
            border: `1px solid ${theme.colors.gray[600]}`,
            borderRadius: theme.borderRadius.sm,
            marginTop: '2px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            color: theme.colors.light
          }}
        >
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(option)}
              style={{
                padding: theme.spacing.sm,
                fontSize: theme.fontSize.sm,
                cursor: 'pointer',
                backgroundColor: value?.value === option.value ? theme.colors.gray[700] : theme.colors.gray[800],
                borderBottom: idx < options.length - 1 ? `1px solid ${theme.colors.gray[600]}` : 'none',
              }}
              onMouseEnter={(e) => {
                if (value?.value !== option.value) {
                  e.target.style.backgroundColor = theme.colors.gray[700]
                }
              }}
              onMouseLeave={(e) => {
                if (value?.value !== option.value) {
                  e.target.style.backgroundColor = theme.colors.gray[800]
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Select
