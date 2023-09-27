const { nextui } = require('@nextui-org/react');

module.exports = {
  darkMode: 'class',
  content: [
    './dist/**/*.{js,ts,jsx,tsx,html}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('tailwindcss-animate'),
    // nextui(),
    nextui({
      addCommonColors: true
    })
  ]
};
