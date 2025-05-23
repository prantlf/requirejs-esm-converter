# RequireJS ESM Converter

Converts source [RequireJS] modules from [AMD] to [ESM] format.

If you enabled usage of [ESM] modules in your [RequireJS] project (using [requirejs-babel7], [requirejs-esm] or [requirejs-esm-preprocessor], for example), you might want to convert all your code base to the [ESM] format to follow the same consistent coding standard and use the same set of tools to build, test and analyse your sources.

## Synopsis

Convert all JavaScript sources in the project's subdirectories:

    ❯ requirejs-to-esm '*/**/*.js' '!node_modules'

    lib/impl/analyse.js: converted
    lib/impl/convert.js: converted
    lib/index.js: multiple statements
    test/index.js: converted

The file `lib/index.js` wasn't an AMD module. (It didn't contain a single `define` or `require` statement.) It will need an inspection and manual conversion.

## Installation

This module can be installed globally using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 14 or newer.

```sh
npm i -g requirejs-esm-converter
pnpm i -g requirejs-esm-converter
yarn add --global requirejs-esm-converter
```

## Command Line

    requirejs-to-esm [option...] [<pattern> ...]

You can use BASH patterns for including and excluding files (only files).
Patterns are case-sensitive and have to use slashes as directory separators.
A pattern to exclude from processing starts with "!".

Files will overwritten with the converted output, if they are recognised
as AMD modules and if the dry-run mode is not enabled.

If named modules are detected, an import map will be printed on the console,
if no file name for the import map was specified.

### Options

    -d|--[no-]dry-run       only log results, no writing to files
    -p|--[no-]print         write to stdout instead of overwriting files
    -m|--import-map <file>  write the import map with named modules
    -V|--version            print version number
    -h|--help               print usage instructions

### Examples

    requirejs-to-esm '**/*.js' '!node_modules'
    requirejs-to-esm -d "lib/*.js"
    echo "define({})" | requirejs-to-esm"

## API

    convert(source: string): { code: string, warnings: string[], name?: string }

The function `convert` converts the `source` in AMD to `code` in ESM, optionally returning `warnings`. If the AMD module is named, the name will be returned as `name`. If the conversion is impossible because the input is not an [AMD] module, it will throw `ConvertError`. If the source file cannot be parsed, it will throw `SyntaxError`.

```js
import { convert } from 'requirejs-to-esm'

const input =`define(["test"], function (test) {
  "use strict";
  console.log('imported:', test);
  return 42; // ultimate answer
});`
const { code } = convert(input)
console.log(code)

// Result:
//
// import test from "test";
//
// console.log('imported:', test);
// export default 42; // ultimate answer
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2022-2025 Ferdinand Prantl

Licensed under the MIT license.

[RequireJS]: http://requirejs.org
[AMD]: https://github.com/amdjs/amdjs-api/blob/master/AMD.md#amd
[ESM]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[requirejs-babel7]: https://www.npmjs.com/package/requirejs-babel7
[requirejs-esm]: https://www.npmjs.com/package/requirejs-esm
[requirejs-esm-preprocessor]: https://www.npmjs.com/package/requirejs-esm-preprocessor
[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
