// client/src/styles/theme.js
export const theme = {
    colors: {
      primary: '#e31a16', // Monopoly red
      secondary: '#ffffff', // White
      tertiary: '#010101', // Black
      background: '#f5f5f7', // Light gray (Apple-inspired)
      card: '#ffffff',
      text: '#333333',
      textLight: '#777777',
      border: '#e1e1e1',
      success: '#34c759', // Apple green
      danger: '#ff3b30', // Apple red
      bank: '#ffcc00' // Gold for bank
    },
    shadows: {
      small: '0 2px 8px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
      large: '0 8px 24px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '20px',
      circular: '50%'
    },
    typography: {
      fontSizes: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem',
        xlarge: '1.5rem',
        xxlarge: '2rem'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        semiBold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    breakpoints: {
      mobile: '576px',
      tablet: '768px',
      desktop: '992px',
      largeDesktop: '1200px'
    },
    transitions: {
      default: '0.3s ease'
    }
  };