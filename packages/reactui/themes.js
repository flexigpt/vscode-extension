const rosePineMoon = {
  extend: 'dark',

  background: {
    DEFAULT: '#232136'
  },
  foreground: {
    DEFAULT: '#e0def4'
  },
  divider: {
    DEFAULT: '#44415a' // Using Highlight Med
  },
  focus: {
    DEFAULT: '#eb6f92' // Love color
  },
  overlay: {
    DEFAULT: '#393552'
  },
  content1: {
    DEFAULT: '#2a273f',
    foreground: '#e0def4'
  },
  content2: {
    DEFAULT: '#6e6a86', // Muted
    foreground: '#908caa' // Subtle
  },
  content3: {
    DEFAULT: '#44415a', // Highlight Med
    foreground: '#56526e' // Highlight High
  },
  content4: {
    DEFAULT: '#2a283e', // Highlight Low
    foreground: '#908caa' // Subtle
  }
};

const rosePineDawn = {
  extend: 'light',
  background: {
    DEFAULT: '#faf4ed'
  },
  foreground: {
    DEFAULT: '#575279'
  },
  divider: {
    DEFAULT: '#cecacd' // Highlight High
  },
  focus: {
    DEFAULT: '#56949f' // Foam color
  },
  overlay: {
    DEFAULT: '#f2e9e1'
  },
  content1: {
    DEFAULT: '#fffaf3', // Surface
    foreground: '#575279'
  },
  content2: {
    DEFAULT: '#9893a5', // Muted
    foreground: '#797593' // Subtle
  },
  content3: {
    DEFAULT: '#dfdad9', // Highlight Med
    foreground: '#907aa9' // Iris
  },
  content4: {
    DEFAULT: '#f4ede8', // Highlight Low
    foreground: '#575279'
  }
};

const vscodeDark = {
  extend: 'dark',
  background: {
    DEFAULT: '#272822' // using editor.background
  },
  foreground: {
    50: '#FCFCFC', // Lightened versions of editor.foreground
    100: '#FAFAFA',
    200: '#F5F5F5',
    300: '#F0F0F0',
    400: '#E8E8E8',
    500: '#E0E0E0',
    600: '#D8D8D8',
    700: '#D0D0D0',
    800: '#C8C8C8',
    900: '#C0C0C0',
    DEFAULT: '#F8F8F2' // using editor.foreground
  },
  focus: {
    DEFAULT: '#99947c' // using focusBorder
  },
  overlay: {
    DEFAULT: '#414339' // using dropdown.background
  },
  divider: {
    DEFAULT: 'rgba(255, 255, 255, 0.15)' // This is a placeholder; adjust as needed
  },
  content1: {
    DEFAULT: '#272822', // using editor.background
    foreground: '#f8f8f2' // using editor.foreground
  },
  content2: {
    DEFAULT: '#1e1f1c', // using sideBar.background
    foreground: '#cccccc' // using menu.foreground
  },
  content3: {
    DEFAULT: '#414339', // using statusBar.background
    foreground: '#f8f8f2' // using statusBar.debuggingForeground (as an example)
  },
  content4: {
    DEFAULT: '#1e1f1c', // using panelTitle.activeForeground (or another similar color)
    foreground: '#f8f8f2' // using panelTitle.activeForeground
  },

  primary: {
    50: '#EBEBE4', // Lightened versions of button.background
    100: '#DADAC9',
    200: '#C9C9AF',
    300: '#B8B894',
    400: '#A7A779',
    500: '#96965F',
    600: '#858544',
    700: '#75715E', // using button.background for DEFAULT
    800: '#646449',
    900: '#53532F',
    DEFAULT: '#75715E', // using button.background
    foreground: '#F8F8F2' // Using editor.foreground (you should replace this with a readable color on #75715E)
  },

  secondary: {
    50: '#F7E9ED', // Lightened versions of inputValidation.errorBackground
    100: '#EFD2DA',
    200: '#E8BBC7',
    300: '#E0A3B5',
    400: '#D98CA2',
    500: '#D27590',
    600: '#CA5D7D',
    700: '#C3456A',
    800: '#BB2D57',
    900: '#B41545',
    DEFAULT: '#90274A', // using inputValidation.errorBackground
    foreground: '#F8F8F2' // (you should replace this with a readable color on #90274A)
  },

  success: {
    50: '#E4E9CB', // Lightened versions of terminal.ansiGreen
    100: '#CAD3B7',
    200: '#B0BCA2',
    300: '#96A68E',
    400: '#7C907A',
    500: '#628966',
    600: '#487252',
    700: '#2E5B3D',
    800: '#144429',
    900: '#003014',
    DEFAULT: '#86B42B', // using terminal.ansiGreen
    foreground: '#F8F8F2' // (you should replace this with a readable color on #86B42B)
  },

  warning: {
    50: '#EDEDCB', // Lightened versions of terminal.ansiYellow
    100: '#DBDBB7',
    200: '#C9C9A2',
    300: '#B8B88E',
    400: '#A6A679',
    500: '#95955F',
    600: '#848444',
    700: '#73733E',
    800: '#626238',
    900: '#515131',
    DEFAULT: '#B3B42B', // using terminal.ansiYellow
    foreground: '#F8F8F2' // (you should replace this with a readable color on #B3B42B)
  }
};

module.exports = {
  rosePineDawn,
  rosePineMoon,
  vscodeDark
};
