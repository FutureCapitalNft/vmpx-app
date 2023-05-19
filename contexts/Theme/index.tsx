import {createContext, useEffect, useState} from "react";
import {defaultTheme, overrides} from "@/styles/theme";
import {createTheme, ThemeOptions, ThemeProvider} from "@mui/material";
import {responsiveFontSizes} from "@mui/material/styles";

type TThemeContext = {
  mode: string;
  setMode: (m: string) => void;
  isLarge: boolean;
  isExtraLarge: boolean;
}

const initialValue: TThemeContext = {
  mode: 'dark',
  setMode: (_: string) => {},
  isLarge: true,
  isExtraLarge: false
}

export const ThemeContext = createContext<TThemeContext>(initialValue);

export const FlexibleThemeProvider = ({ children }: any) => {
  const [mode, setMode] = useState( 'dark');
  const themeOptions = { ...defaultTheme, ...overrides('dark') } as ThemeOptions
  const [theme, setTheme] = useState(createTheme(themeOptions));
  const [isLarge, setLarge] = useState(false);
  const [isExtraLarge, setExtraLarge] = useState(false);

  const onScreenChange = (mql: any, mxql: any) => {
    // console.log('screen large', mql.matches)
    return () => {
      setLarge(mql.matches)
      setExtraLarge(mxql.matches)
    }
  }

  const large = '(min-width: 768px) and (orientation: landscape)'
  const extraLarge = '(min-width: 1280px) and (orientation: landscape)'

  const onDarkPrefChange = (query: any) => {
    return () => {
      setMode(query.matches ? 'dark' : 'light')
    }
  }

  const flexibleTheme = {
    ...theme,
    palette: {
      ...theme.palette,
      mode
    }
  }

  useEffect(() => {
    const userTheme = window.localStorage.getItem('theme');
    if (!userTheme) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.onchange = onDarkPrefChange(mq)
      onDarkPrefChange(mq)()
    } else {
      setMode(userTheme)
    }
    const mql = window.matchMedia(large);
    const mxql = window.matchMedia(extraLarge);
    onScreenChange(mql, mxql)();
    mql.onchange = onScreenChange(mql, mxql);
  }, []);

  useEffect(() => {
    let newOptions = {
      ...defaultTheme,
      palette: {
        ...defaultTheme.palette,
        mode,
      },
      ...overrides(mode)
    }
    if (mode === 'light') {
      newOptions = {
        ...newOptions,
        palette: {
          ...newOptions.palette,
          background: {
            default: mode === 'light' ? '#ededed' : '#121212'
          }
        }
      }
    }
    const newTheme = createTheme(newOptions as ThemeOptions)
    setTheme(responsiveFontSizes(newTheme))
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, setMode, isLarge, isExtraLarge }}>
      <ThemeProvider theme={flexibleTheme} >
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
