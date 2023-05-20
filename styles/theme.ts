import {ThemeOptions} from "@mui/material";

export const defaultTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    common: {
      // white: '#373737'
    },
    success: {
      main: '#C44A00'
    },
    warning: {
      main: '#EA7000'
    },
    background: {
      default: '#080808',
      paper: '#080808',
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1300
    }
  },
  typography: {
    fontFamily: [
      // 'Italiana',
      'Play',
      'Arial',
      'sans-serif'
    ].join(','),
    fontWeightRegular: 500,
    fontSize: 16,
  },
}

export const overrides = (mode: string) =>
  mode === 'light'
    ? ({
      mode: 'light',
      palette: {
        background: {
          default: '#373737',
          paper: '#373737',
        }
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              // backgroundColor: "#ededed"
            }
          }
        },
        MuiAppBar: {
          styleOverrides: {
            colorPrimary: {
              backgroundColor: '#ededed'
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            fontFamily: ["Courier"]
          },
        }
      }
    })
    : ({
      components: {
        MuiDataGrid: {
          styleOverrides: {
            root: {
              border: 'none'
            }
          }
        }
      }
    })

export const theme = defaultTheme;
