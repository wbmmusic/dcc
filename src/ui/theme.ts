/**
 * Application Theme Configuration
 * 
 * Defines the visual design system for Big D's Railroad DCC control application.
 * This theme provides consistent colors, spacing, typography, and visual elements
 * throughout the interface, optimized for model railroad control operations.
 * 
 * Design Philosophy:
 * - Dark theme for reduced eye strain during long operating sessions
 * - High contrast for clear visibility of controls and status indicators
 * - Railroad-inspired color scheme with safety orange accents
 * - Compact spacing for efficient use of screen real estate
 */
export const theme = {
  colors: {
    // Primary brand colors
    primary: '#d32f2f',      // Railroad red for primary actions
    secondary: '#455a64',    // Steel blue-gray for secondary elements
    success: '#2e7d32',      // Green for positive states (connected, running)
    danger: '#d32f2f',       // Red for warnings and emergency stops
    warning: '#f9a825',      // Safety orange for attention-getting elements
    info: '#455a64',         // Blue-gray for informational elements
    light: '#e8e8e8',        // Light gray for text on dark backgrounds
    dark: '#1a1a1a',         // Very dark gray for primary backgrounds
    
    // Grayscale palette for UI elements
    gray: {
      100: '#e8e8e8',        // Lightest - for primary text
      200: '#c0c0c0',        // Light - for secondary text
      300: '#9e9e9e',        // Medium-light - for disabled text
      400: '#757575',        // Medium - for inactive elements
      500: '#616161',        // Medium-dark - for borders
      600: '#424242',        // Dark - for component backgrounds
      700: '#303030',        // Darker - for hover states
      800: '#212121',        // Very dark - for input backgrounds
      900: '#1a1a1a',        // Darkest - for main backgrounds
    },
    
    // Application-specific background colors
    background: {
      light: '#2c2c2c',       // Light panels and cards
      medium: '#242424',      // Medium panels and sections
      dark: '#1a1a1a',        // Main application background
    },
    
    // State and interaction colors
    active: '#2e7d32',        // Green for active/running states
    selected: '#455a64',      // Blue-gray for selected items
    hidden: '#bf360c',        // Dark red for hidden/disabled items
    trackActive: '#2e7d32',   // Green for active track sections
    trackInactive: '#757575', // Gray for inactive track sections
    border: '#f9a825',        // Safety orange for important borders
    hover: '#303030',         // Dark gray for hover states
    safetyStripe: '#f9a825',  // Safety orange for emergency/attention elements
  },
  
  // Consistent spacing scale for layout and components
  spacing: {
    xs: '3px',    // Extra small - for tight spacing
    sm: '5px',    // Small - for component padding
    md: '10px',   // Medium - for section spacing
    lg: '20px',   // Large - for major layout spacing
  },
  
  // Border radius scale for consistent rounded corners
  borderRadius: {
    sm: '3px',    // Small - for buttons and inputs
    md: '5px',    // Medium - for cards and panels
    lg: '8px',    // Large - for major containers
  },
  
  // Typography scale optimized for control interfaces
  fontSize: {
    xs: '10px',   // Extra small - for labels and captions
    sm: '12px',   // Small - for secondary text
    md: '14px',   // Medium - for body text
    lg: '20px',   // Large - for headings
    xl: '30px',   // Extra large - for locomotive numbers and speeds
  },
}

/**
 * Available button style variants
 * Maps to Bootstrap-style button classes with railroad-appropriate colors
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-secondary'

/**
 * Available button sizes for different interface contexts
 * - sm: Compact buttons for toolbars and tight spaces
 * - md: Standard buttons for most interactions
 * - lg: Large buttons for primary actions and touch interfaces
 */
export type ButtonSize = 'sm' | 'md' | 'lg'