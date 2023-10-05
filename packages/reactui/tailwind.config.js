const { nextui } = require('@nextui-org/react');
const { vscodeDark, rosePineDawn, rosePineMoon } = require('./themes');

module.exports = {
  darkMode: 'class',
  content: [
    './dist/**/*.{js,ts,jsx,tsx,html}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
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
