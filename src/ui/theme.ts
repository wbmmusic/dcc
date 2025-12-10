export const theme = {
  colors: {
    primary: '#d32f2f',
    secondary: '#455a64',
    success: '#2e7d32',
    danger: '#d32f2f',
    warning: '#f9a825',
    info: '#455a64',
    light: '#e8e8e8',
    dark: '#1a1a1a',
    
    // Grays
    gray: {
      100: '#e8e8e8',
      200: '#c0c0c0',
      300: '#9e9e9e',
      400: '#757575',
      500: '#616161',
      600: '#424242',
      700: '#303030',
      800: '#212121',
      900: '#1a1a1a',
    },
    
    // Custom app colors
    background: {
      light: '#2c2c2c',
      medium: '#242424',
      dark: '#1a1a1a',
    },
    
    // State colors
    active: '#2e7d32',
    selected: '#455a64',
    hidden: '#bf360c',
    trackActive: '#2e7d32',
    trackInactive: '#757575',
    border: '#f9a825',
    hover: '#303030',
    safetyStripe: '#f9a825',
  },
  
  spacing: {
    xs: '3px',
    sm: '5px',
    md: '10px',
    lg: '20px',
  },
  
  borderRadius: {
    sm: '3px',
    md: '5px',
    lg: '8px',
  },
  
  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '20px',
    xl: '30px',
  },
}

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-secondary'
export type ButtonSize = 'sm' | 'md' | 'lg'
