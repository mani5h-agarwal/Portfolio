/**
 * A tiny syntax highlighter for the Quick Look previews: enough to colour short snippets the way
 * Xcode's dark theme does (keywords, strings, numbers, comments, types, calls, tags…). One regex
 * per language, tried left to right; anything it doesn't recognise stays plain.
 */
export type Lang =
  'c' | 'cpp' | 'swift' | 'js' | 'ts' | 'python' | 'sql' | 'html' | 'css' | 'kotlin' | 'json' | 'sh'

export type Token = { text: string; kind?: string }

const KEYWORDS: Record<Lang, string[]> = {
  c: ['int', 'return', 'void', 'char', 'include', 'const', 'if', 'else', 'for', 'while'],
  cpp: ['int', 'return', 'void', 'include', 'using', 'namespace', 'std', 'auto', 'const'],
  swift: ['import', 'struct', 'var', 'let', 'func', 'some', 'return', 'body', 'class', 'private'],
  js: [
    'const',
    'let',
    'function',
    'return',
    'import',
    'from',
    'export',
    'default',
    'await',
    'async',
    'new',
  ],
  ts: [
    'const',
    'let',
    'function',
    'return',
    'import',
    'from',
    'export',
    'default',
    'await',
    'async',
    'new',
  ],
  python: [
    'import',
    'from',
    'as',
    'def',
    'return',
    'print',
    'async',
    'await',
    'for',
    'in',
    'with',
    'class',
    'None',
    'True',
    'False',
  ],
  sql: [
    'SELECT',
    'FROM',
    'WHERE',
    'AS',
    'CREATE',
    'TABLE',
    'INSERT',
    'INTO',
    'VALUES',
    'ORDER',
    'BY',
    'LIMIT',
  ],
  html: [],
  css: ['important'],
  kotlin: ['import', 'class', 'fun', 'override', 'val', 'var', 'package', 'super', 'return'],
  json: ['true', 'false', 'null'],
  sh: ['cd', 'npx', 'git', 'curl', 'echo'],
}

const COMMENT: Record<Lang, string> = {
  c: String.raw`\/\/.*|\/\*[\s\S]*?\*\/|#\w+`,
  cpp: String.raw`\/\/.*|\/\*[\s\S]*?\*\/|#\w+`,
  swift: String.raw`\/\/.*`,
  js: String.raw`\/\/.*`,
  ts: String.raw`\/\/.*`,
  kotlin: String.raw`\/\/.*`,
  python: String.raw`#.*`,
  sh: String.raw`#.*`,
  sql: String.raw`--.*`,
  html: String.raw`<!--[\s\S]*?-->`,
  css: String.raw`\/\*[\s\S]*?\*\/`,
  json: String.raw`(?!)`,
}

const cache = new Map<Lang, RegExp>()
function pattern(lang: Lang) {
  let re = cache.get(lang)
  if (re) return re
  const kw = KEYWORDS[lang]
  const parts = [
    `(?<comment>${COMMENT[lang]})`,
    // in JSON, a string followed by a colon is a key
    lang === 'json' ? String.raw`(?<prop>"(?:\\.|[^"\\])*"(?=\s*:))` : '',
    String.raw`(?<string>"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\x60(?:\\.|[^\x60\\])*\x60)`,
    // markup tags, also JSX in js/ts
    ['html', 'js', 'ts'].includes(lang) ? String.raw`(?<tag><\/?[A-Za-z][\w.]*|\/?>)` : '',
    lang === 'css' ? String.raw`(?<prop>[a-z-]+(?=\s*:))|(?<tag>[.#]?[a-z][\w-]*(?=[^{}]*\{))` : '',
    String.raw`(?<deco>@[A-Za-z_][\w.]*)`,
    String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    kw.length ? `(?<keyword>\\b(?:${kw.join('|')})\\b)` : '',
    String.raw`(?<func>\b[A-Za-z_]\w*(?=\())`,
    ['swift', 'kotlin', 'ts', 'js', 'cpp'].includes(lang) ? String.raw`(?<type>\b[A-Z]\w*\b)` : '',
  ].filter(Boolean)
  re = new RegExp(parts.join('|'), 'g')
  cache.set(lang, re)
  return re
}

/** The snippet as lines of coloured tokens */
export function highlight(code: string, lang: Lang): Token[][] {
  const re = pattern(lang)
  const tokens: Token[] = []
  let at = 0
  for (const m of code.matchAll(re)) {
    if (m.index > at) tokens.push({ text: code.slice(at, m.index) })
    const kind = Object.entries(m.groups ?? {}).find(([, v]) => v !== undefined)?.[0]
    tokens.push({ text: m[0], kind })
    at = m.index + m[0].length
  }
  if (at < code.length) tokens.push({ text: code.slice(at) })

  // split into lines (a token can span several, e.g. a block comment)
  const lines: Token[][] = [[]]
  for (const t of tokens) {
    t.text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ text: part, kind: t.kind })
    })
  }
  return lines
}
