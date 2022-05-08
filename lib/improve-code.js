function ensureLineBreak (output, input) {
  if (input.endsWith('\n') && !output.endsWith('\n')) {
    output += '\n'
  }
  return output
}

export default function improveCode(output, input, warnings = []) {
  const lines = output.split(/\r?\n/)
  let imported, separated, emptied
  for (let i = 0, l = lines.length; i < l; ++i) {
    const line = lines[i]
    if (!emptied && line === ';') {
      emptied = true
      lines.splice(i--, 1)
      --l;
      warnings.push('"use strict" removed')
    } else if (!separated) {
      if (line.startsWith('import')) {
        imported = true
      } else if (imported) {
        separated = true
        if (line.length) {
          lines.splice(i++, 0, '')
          ++l;
          warnings.push('imports separated')
        }
      }
    }
  }
  const code = ensureLineBreak(lines.join('\n'), input)
  return { code, warnings }
}
