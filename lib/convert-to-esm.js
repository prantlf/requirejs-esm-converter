import { types } from 'recast'

const { namedTypes, builders } = types
const { ReturnStatement, ExpressionStatement, Literal } = namedTypes
const {
  importDeclaration, importDefaultSpecifier, identifier, literal,
  exportDefaultDeclaration
} = builders

function cloneString(source) {
  const { value } = source
  const clone = literal(value)
  clone.extra = { raw: source.raw, rawValue: value }
  return clone
}

export default function convertToEsm(program, { statement, deps, factory, object, callback }) {
  const { params = [] } = factory || {}
  const imps = deps.elements.map((dep, index) => {
    const param = params[index]
    const spec = param ? [importDefaultSpecifier(identifier(param.name))] : []
    const imp = importDeclaration(spec, cloneString(dep))
    imp.comments = dep.comments
    return imp
  })

  let stats = []
  let exps = []
  if (factory) {
    stats = factory.body.body.filter(stat => {
      if (ExpressionStatement.check(stat) && Literal.check(stat.expression) && stat.expression.value === 'use strict') {
        return false
      }
      if (!ReturnStatement.check(stat)) return true
      const exp = exportDefaultDeclaration(stat.argument)
      exp.comments = stat.comments
      exps = [exp]
    })
  } else if (object) {
    const exp = exportDefaultDeclaration(object)
    exp.comments = object.comments
    exps = [exp]
  } else {
    stats = callback.body.body
  }

  const { comments } = statement
  if (comments) program.comments = [...(program.comments || []), ...comments]
  program.body = [...imps, ...stats, ...exps]
}
