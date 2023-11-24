const { nextui } = require('@nextui-org/react');
const { vscodeDark, rosePineDawn, rosePineMoon } = require('./themes');

module.exports = {
  darkMode: 'class',
  content: [
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './src/**/*.tsx',
    './components/**/*.tsx',
    './globals/**/*.css',
    './public/**/*.{js,ts,jsx,tsx,html,html.tmpl}',
  ],
  themes: {
    extend: {}
  },
  plugins: [
    require('tailwindcss-animate'),
    nextui({
      addCommonColors: true,
      themes: {
        light: rosePineDawn,
        dark: rosePineMoon
        // dark: vscodeDark
      }
    })
  ]
};
