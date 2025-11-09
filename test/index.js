import { strictEqual, deepStrictEqual } from 'node:assert'
import { fileURLToPath } from 'node:url'
import tehanu from 'tehanu'
import { convert } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))

const cases = [
  {
    title: 'converts module with no dependency exporting object',
    input: 'define({})',
    output: 'export default {};',
  },
  {
    title: 'converts module with no dependency and no export',
    input: 'define(function () {})',
    output: ''
  },
  {
    title: 'converts module with no dependency and one export',
    input: 'define(function () { return 42 })',
    output: 'export default 42;',
  },
  {
    title: 'converts module with one dependency exporting object',
    input: 'define(["test"], {})',
    output: `import "test";

export default {};`
  },
  {
    title: 'converts module with one dependency and no import',
    input: 'define([\'test\'], function () {})',
    output: 'import \'test\';',
  },
  {
    title: 'converts module with one dependency and no export',
    input: 'define(["test"], function (test) {})',
    output: 'import test from "test";',
  },
  {
    title: 'converts module with one dependency, statement and export',
    input: `define(["test"], function (test) {
  "use strict";
  console.log(test)
  return 42
})`,
    output: `import test from "test";

console.log(test)
export default 42;`
  },
  {
    title: 'removes empty statement from "use strict"',
    input: `define(['a'], function () {
  "use strict";
  console.log();
})
`,
    output: `import 'a';

console.log();
`
  },
  {
    title: 'retains comments',
    input: `// prolog
define([
  'test' // dependency
], function (test) {

  // start
  console.log(test);

  /* ultimate */ return 42; // answer
  // end
});
`,
    output: `// prolog
import test from 'test'; // dependency

// start
console.log(test);

/* ultimate */ export default 42; // answer
// end
`
  }
]

for (const { title, input, output } of cases) {
  test(title, () => strictEqual(convert(input).code, output))
}

test('warns about ignored error handler', () => {
  const { warnings } = convert('require(["test"], function () {}, function () {})')
  deepStrictEqual(warnings, ['error handler ignored'])
})

test('extract module name', () => {
  let name
  ({ name } = convert('define("name", ["test"], function () {})'))
  strictEqual(name, 'name');
  ({ name } = convert('define("name", function () {})'))
  strictEqual(name, 'name')
})
