var postcss = require('postcss');
var fs = require('fs');

var extractedStyle;

const webpackCompileExtractedStyle = function () {
  return {
    apply: compiler => {
      compiler.hooks.emit.tapAsync(
        'ExtractedStylesPlugin',
        (compilation, callback) => {
          compilation.assets['webpack.themestyles.css'] = {
            source: () => extractedStyle.toResult().css,
            size: () => extractedStyle.length
          };
          callback();
        }
      );
    }
  };
};

module.exports = {
  postcssExtractToFile,
  webpackCompileExtractedStyle
};

function postcssExtractToFile(options) {
  return function (css) {
    options = options || {};

    var extractedRoot = postcss.root();
    var remainingRoot = postcss.root();

    css.walkRules(function (rule) {
      // We check each rule against the possible overrides.
      // If it matches an override it gets moved to the extracted file
      if (checkOverrides(options.extractors, rule.selector)) {
        extractedRoot.append(rule.clone());
      }
      // Otherwise it gets written to the 'remaining' file
      else {
        remainingRoot.append(rule.clone());
      }
    });

    extractedStyle = extractedRoot;
    css.removeAll();
    css.append(remainingRoot);
  };

  function writeExtractedToFile(root) {
    return new Promise(function (resolve, reject) {
      const cssString = root.toResult().css;
      fs.writeFile(options.extracted, cssString, function (err) {
        if (err) {
          reject(err);
          return;
        }
        // Let's create a message we can log and write to file
        const message = createMessage(options.extracted);
        fs.appendFile(options.extracted, message, function (err) {
          if (err) {
            reject(err);
            return;
          }
          console.log('Saved the extracted rules.' + message);
          resolve();
        });
      });
    });
  }

  function writeRemainingToFile(root) {
    return new Promise(function (resolve, reject) {
      const cssString = root.toResult().css;
      fs.writeFile(options.remaining, cssString, function (err) {
        if (err) {
          reject(err);
          return;
        }
        // Let's create a message we can log and write to file
        const message = createMessage(options.remaining);
        fs.appendFile(options.remaining, message, function (err) {
          if (err) {
            reject(err);
            return;
          }
          console.log('Saved the remaining rules.' + message);
          resolve();
        });
      });
    });
  }

  // Utility function to create a message with file sizes
  function createMessage(filename) {
    const message = `\n/* ${filename} — size ${
      fs.statSync(filename).size
    } gzipped, generated on ${fs.statSync(filename).mtime} */ \n`;
    return message;
  }

  // List is our array of possible overrides to check against
  function checkOverrides(list, selector) {
    if (!list) {
      console.log('You have not supplied any selectors to extract against');
    }
    for (var i = 0, len = list.length; i < len; i++) {
      let item = list[i];
      if (selector.indexOf(item) > -1) {
        return true;
      }
    }
    return false;
  }
}
