const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const { replaceSelector, postcssReplaceHsl } = require('./extractstyle');
const { vscodeVariableStr } = require('./themes');

console.log('Building for vscode only:', process.env.vscode);

const basePlugins = ['postcss-preset-env', tailwindcss, autoprefixer];

const vscodePlugins =
  process.env.vscode === 'true'
    ? [
        // replaceSelector({
        //   targetSelector: ':root,.light,[data-theme="light"]',
        //   replacementString: vscodeVariableStr
        // }),
        // replaceSelector({
        //   targetSelector: '.dark,[data-theme="dark"]',
        //   replacementString: ''
        // }),
        // postcssReplaceHsl()
      ]
    : [];

module.exports = {
  plugins: [...basePlugins, ...vscodePlugins]
};
