import * as path from 'path';
import Mocha from 'mocha';
import fs from 'fs';

function getTestFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const filePath = path.join(dir, item);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files.push(...getTestFiles(filePath)); // Recursively add files from subdirectories
    } else if (item.endsWith('.test.js')) {
      files.push(filePath);
    }
  }
  return files;
}

export function run(): Promise<void> {
  const testsRoot = path.resolve(__dirname, '..');
  const testFiles = getTestFiles(testsRoot);
  const requirePath = path.join(testsRoot, '../../../node_modules/aiprovider');
  console.log(requirePath);
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    require: [requirePath]
  });

  testFiles.forEach(file => {
    mocha.addFile(file);
  });

  return new Promise((resolve, reject) => {
    try {
      // Run the mocha test
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
