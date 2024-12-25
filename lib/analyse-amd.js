import { types } from 'recast'

const { namedTypes, builders } = types
const {
  ArrayExpression, CallExpression, ExpressionStatement, FunctionExpression,
  Identifier, Literal, ObjectExpression
} = namedTypes
const { arrayExpression } = builders

class ConvertError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConvertError'
  }
}

function checkDeps(deps) {
  for (const dep of deps.elements) {
    if (!Literal.check(dep)) throw new ConvertError('dependency not a literal')
    if (typeof dep.value !== 'string') throw new ConvertError('dependency not a string')
  }
}

function checkParams(func) {
  for (const param of func.params) {
    if (!Identifier.check(param)) throw new ConvertError('argument not an identifier')
  }
}

function analyseStatement(statement) {
  if (!ExpressionStatement.check(statement)) throw new ConvertError('no expression statement')
  const { expression } = statement
  if (!CallExpression.check(expression)) throw new ConvertError('no call expression')

  const { arguments: args } = expression
  const { length } = args
  if (length === 0) throw new ConvertError('no call arguments')

  const { callee } = expression
  if (!Identifier.check(callee)) throw new ConvertError('callee not an identifier')

  // define('name', [deps], factory)
  if (callee.name === 'define') {
    let deps = args[0]
    let factory
    let name
    if (ArrayExpression.check(deps)) {
      if (length === 1) throw new ConvertError('too few arguments')
      if (length > 2) throw new ConvertError('too many arguments')
      checkDeps(deps)
      factory = args[1]
    } else if (Literal.check(deps)) {
      if (length === 1) throw new ConvertError('too few arguments')
      if (length > 3) throw new ConvertError('too many arguments')
      name = deps.value
      deps = args[1]
      if (ArrayExpression.check(deps)) {
        if (length === 2) throw new ConvertError('too few arguments')
        checkDeps(deps)
        factory = args[2]
      } else {
        if (length > 2) throw new ConvertError('too many arguments')
        factory = deps
        deps = arrayExpression([])
      }
    } else {
      if (length > 1) throw new ConvertError('too many arguments')
      factory = deps
      deps = arrayExpression([])
    }

    if (ObjectExpression.check(factory)) return { statement, deps, object: factory, name }

    if (!FunctionExpression.check(factory)) throw new ConvertError('factory neither function nor object')

    checkParams(factory)
    return { statement, deps, factory, name }
  }

  // require([deps], success, error)
  if (callee.name === 'require') {
    const [deps, callback, failure] = args
    if (!ArrayExpression.check(deps)) throw new ConvertError('missing dependencies')
    if (length === 1) throw new ConvertError('missing callback')
    if (!FunctionExpression.check(callback)) throw new ConvertError('callback not a function')
    if (length > 3) throw new ConvertError('too many arguments')
    let warnings
    if (length === 3) {
      if (!FunctionExpression.check(failure)) throw new ConvertError('error handler not a function')
      warnings = ['error handler ignored']
    }

    checkDeps(deps)
    checkParams(callback)

    return { statement, deps, callback, warnings }
  }
}

// define with factory: { statement, deps, factory }
// define with object: { statement, deps, object }
// require: { statement, deps, callback, warnings }
export default function analyseAmd(program) {
  const { body } = program
  const { length } = body
  if (length === 0) throw new ConvertError('no statement')
  if (length !== 1) throw new ConvertError('multiple statements')

  return analyseStatement(body[0])
}
