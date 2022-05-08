import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'lib/index.js',
  output: { file: 'lib/index.cjs', format: 'cjs', sourcemap: true },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true })],
  external: ['meriyah', 'recast']
}
