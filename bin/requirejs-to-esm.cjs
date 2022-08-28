#!/usr/bin/env node

function usage () {
  console.log(`Converts source RequireJS modules from AMD to ESM format.

Usage: requirejs-to-esm [option...] [<pattern> ...]

Options:
  -d|--[no-]dry-run  only log results, no writing to files
  -p|--[no-]print    write to stdout instead of overwriting files
  -V|--version       print version number
  -h|--help          print usage instructions

You can use BASH patterns for including and excluding files (only files).
Patterns are case-sensitive and have to use slashes as directory separators.
A pattern to exclude from processing starts with "!".

Files will overwritten with the converted output, if they are recognised
as AMD modules and if the dry-run mode is not enabled.

Examples:
  requirejs-to-esm '**/*.js' '!node_modules'
  requirejs-to-esm -d "lib/*.js"
  echo "define({})" | requirejs-to-esm"`)
}

const { argv } = process
const patterns = []
let dryRun = false
let print = false

for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  const match = /^(?:-|--)(no-)?([a-zA-Z][-a-z]*)$/.exec(arg)
  if (match) {
    const flag = match[1] !== 'no-'
    switch (match[2]) {
      case 'd': case 'dry-run':
        dryRun = flag
        continue
      case 'D':
        dryRun = false
        continue
      case 'p': case 'print':
        print = flag
        continue
      case 'P':
        print = false
        continue
      case 'V': case 'version':
        console.log(require('../package.json').version)
        process.exit(0)
        break
      case 'h': case 'help':
        usage()
        process.exit(0)
    }
    console.error(`Unknown argument: "${arg}"`)
    process.exit(1)
  }
  patterns.push(arg)
}

const { convert } = require('../lib/index.cjs')

if (patterns.length) {
  convertPatterns()
} else {
  convertStdin()
}

async function convertFile(file) {
  const { readFile, writeFile } = require('fs/promises')
  const input = await readFile(file, 'utf8')
  const { code, warnings } = convert(input)
  const message = formatMessage(file, { message: 'converted' }, warnings)
  if (print) {
    console.log(`// ${message}
${code}`)
  } else {
    if (!dryRun) {
      await writeFile(file, code)
    }
    console.log(message)
  }
}

async function convertPatterns() {
  const glob = require('fast-glob')
  const files = await glob(patterns, { onlyFiles: true })
  if (!files.length) {
    console.error('no files found')
    process.exit(1)
  }
  for (const file of files) {
    try {
      await convertFile(file)
    } catch (err) {
      console.warn(formatMessage(file, err))
    }
  }
}

function convertStdin() {
  const file = '<stdin>'
  let source = ''
  const stdin = process.openStdin()
  stdin.setEncoding('utf8')
  stdin.on('data', chunk => {
    source += chunk.toString('utf8')
  })
  stdin.on('end', () => {
    try {
      const { code, warnings } = convert(source)
      const message = formatMessage(file, { message: 'converted' }, warnings)
      console.log(`// ${message}
${code}`)
    } catch (err) {
      console.warn(formatMessage(file, err))
    }
  })
}

function formatMessage(file, { message }, warnings = []) {
  if (!message.startsWith('[')) {
    message = `: ${message}`
  }
  if (warnings.length) {
    message += ` (${warnings.join(', ')})`
  }
  return `${file}${message}`
}
