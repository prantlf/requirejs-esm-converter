import { parse as parseScript } from 'meriyah'
import { parse, print } from 'recast'
import analyseAmd from './analyse-amd.js'
import convertToEsm from './convert-to-esm.js'
import improveCode from './improve-code.js'

const convertComment = comment => {
  let { type } = comment
  type = type[0] === 'S' ? 'Line' : 'Block'
  return { ...comment, type }
}

const parser = {
  parse(source) {
    const comments = []
    const tokens = []
    const ast = parseScript(source, {
      module: true, next: true, raw: true, loc: true,
      onComment: comments, onToken: tokens
    })
    ast.comments = comments.map(convertComment)
    ast.tokens = tokens
    return ast
  }
}

export function convert(source) {
  const ast = parse(source, { parser })
  const { program } = ast

  const analysis = analyseAmd(program)
  const { warnings = [] } = analysis

  convertToEsm(program, analysis)
  let { code } = print(ast);
  ({ code } = improveCode(code, source, warnings))
  return { code, warnings, name: analysis.name }
}
