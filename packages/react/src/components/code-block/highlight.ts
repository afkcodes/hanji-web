/**
 * A small, dependency-free syntax highlighter for the languages hanji's docs and AI replies show
 * most: TS/TSX/JS/JSX (JSX-aware), CSS, JSON, shell and HTML. It returns tokens; CodeBlock paints
 * them from the theme. For full grammars, pass your own highlighter through `highlight`.
 *
 * Linear time, one pass, no regex backtracking over the whole input.
 */

export type TokenKind =
  | 'comment'
  | 'string'
  | 'keyword'
  | 'number'
  | 'constant'
  | 'function'
  | 'type'
  | 'tag'
  | 'attr'
  | 'property'
  | 'variable'
  | 'punct';

export interface Token {
  kind: TokenKind | null;
  text: string;
}

const KEYWORDS = new Set(
  'abstract as async await break case catch class const continue debugger declare default delete do else enum export extends finally for from function get if implements import in infer instanceof interface is keyof let namespace new of private protected public readonly return satisfies set static super switch this throw try type typeof unique var void while with yield'.split(
    ' ',
  ),
);
const CONSTANTS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
/** After these, `<` opens JSX rather than comparing or opening a generic. */
const JSX_AFTER = new Set([
  '(',
  ',',
  '=',
  '?',
  ':',
  '{',
  '[',
  '!',
  '&&',
  '||',
  '??',
  ';',
  '=>',
  '}',
  '>',
  'return',
  'default',
  'yield',
  'await',
  'case',
  'else',
  'do',
  '',
]);

/** After these, `/` starts a regular expression rather than dividing. */
const REGEX_AFTER = new Set([
  '(',
  ',',
  '=',
  ':',
  '[',
  '!',
  '&&',
  '||',
  '??',
  '?',
  '{',
  '}',
  ';',
  '=>',
  'return',
  'typeof',
  'case',
  '',
]);

class Out {
  readonly tokens: Token[] = [];
  push(kind: TokenKind | null, text: string): void {
    if (!text) return;
    const last = this.tokens.at(-1);
    if (last && last.kind === kind) last.text += text;
    else this.tokens.push({ kind, text });
  }
}

const isIdStart = (c: string | undefined): boolean => c !== undefined && /[A-Za-z_$]/.test(c);
const isId = (c: string | undefined): boolean => c !== undefined && /[\w$]/.test(c);
const isSpace = (c: string | undefined): boolean => c !== undefined && /\s/.test(c);

function endOfString(src: string, i: number): number {
  const q = src[i];
  let j = i + 1;
  while (j < src.length && src[j] !== q && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
  return Math.min(src.length, j + 1);
}

/** End of a regex literal starting at `i`, or `i` when it isn't one (it runs past the line). */
function endOfRegex(src: string, i: number): number {
  let j = i + 1;
  let inClass = false;
  while (j < src.length) {
    const c = src[j];
    if (c === '\n') return i;
    if (c === '\\') j += 2;
    else {
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) break;
      j++;
    }
  }
  if (j >= src.length) return i;
  j++;
  while (j < src.length && /[a-z]/.test(src[j] ?? '')) j++;
  return j;
}

function endOfTemplate(src: string, i: number): number {
  let j = i + 1;
  let depth = 0;
  while (j < src.length) {
    const c = src[j];
    if (c === '\\') j += 2;
    else if (c === '$' && src[j + 1] === '{') {
      depth++;
      j += 2;
    } else if (c === '}' && depth > 0) {
      depth--;
      j++;
    } else if (c === '`' && depth === 0) return j + 1;
    else j++;
  }
  return j;
}

/** `<…>(` at `k`: a call with type arguments, e.g. `useState<string>(`. */
function isGenericCall(src: string, k: number): boolean {
  if (src[k] !== '<') return false;
  let depth = 0;
  for (let j = k; j < Math.min(src.length, k + 120); j++) {
    const c = src[j] as string;
    if (c === '<') depth++;
    else if (c === '>') {
      depth--;
      if (depth === 0) return src[j + 1] === '(';
    } else if (!/[\w\s,.|&[\]'"?:{}]/.test(c)) return false;
  }
  return false;
}

interface Frame {
  mode: 'code' | 'tag' | 'text';
  /** Brace depth inside a `{…}` expression frame. */
  depth: number;
  /** The frame is a `{…}` expression nested in a tag or JSX text. */
  expr?: boolean;
  /** The tag frame is a closing tag (`</x>`). */
  closing?: boolean;
}

function scriptTokens(src: string, startInText: boolean): Token[] {
  const out = new Out();
  const stack: Frame[] = [{ mode: startInText ? 'text' : 'code', depth: 0 }];
  let prev = '';
  let i = 0;
  const n = src.length;

  const openTag = (): void => {
    out.push('punct', '<');
    i++;
    let closing = false;
    if (src[i] === '/') {
      out.push('punct', '/');
      i++;
      closing = true;
    }
    if (src[i] === '>') {
      // fragment <> or </>
      out.push('punct', '>');
      i++;
      if (closing) {
        if (stack.at(-1)?.mode === 'text') stack.pop();
      } else stack.push({ mode: 'text', depth: 0 });
      return;
    }
    let j = i;
    while (j < n && /[\w$.:-]/.test(src[j] ?? '')) j++;
    const name = src.slice(i, j);
    out.push(/^[A-Z]/.test(name) || name.includes('.') ? 'type' : 'tag', name);
    i = j;
    stack.push({ mode: 'tag', depth: 0, closing });
  };

  while (i < n) {
    const top = stack.at(-1) as Frame;
    const c = src[i] as string;
    const next = src[i + 1];

    if (top.mode === 'text') {
      if (c === '{') {
        out.push('punct', '{');
        stack.push({ mode: 'code', depth: 0, expr: true });
        prev = '{';
        i++;
      } else if (src.startsWith('<!--', i)) {
        const end = src.indexOf('-->', i + 4);
        const j = end < 0 ? n : end + 3;
        out.push('comment', src.slice(i, j));
        i = j;
      } else if (c === '<' && (isIdStart(next) || next === '/' || next === '>')) openTag();
      else {
        let j = i + 1;
        while (j < n && src[j] !== '<' && src[j] !== '{') j++;
        out.push(null, src.slice(i, j));
        i = j;
      }
      continue;
    }

    if (top.mode === 'tag') {
      if (isSpace(c)) {
        let j = i + 1;
        while (j < n && isSpace(src[j])) j++;
        out.push(null, src.slice(i, j));
        i = j;
      } else if (c === '/' && next === '>') {
        out.push('punct', '/>');
        stack.pop();
        i += 2;
        prev = '>';
      } else if (c === '>') {
        out.push('punct', '>');
        const f = stack.pop() as Frame;
        if (f.closing) {
          if (stack.at(-1)?.mode === 'text') stack.pop();
        } else stack.push({ mode: 'text', depth: 0 });
        i++;
        prev = '>';
      } else if (c === '{') {
        out.push('punct', '{');
        stack.push({ mode: 'code', depth: 0, expr: true });
        prev = '{';
        i++;
      } else if (c === '"' || c === "'") {
        const j = endOfString(src, i);
        out.push('string', src.slice(i, j));
        i = j;
      } else if (isIdStart(c)) {
        let j = i + 1;
        while (j < n && /[\w$:-]/.test(src[j] ?? '')) j++;
        out.push('attr', src.slice(i, j));
        i = j;
      } else {
        out.push('punct', c);
        i++;
      }
      continue;
    }

    // ---- code ----
    if (isSpace(c)) {
      let j = i + 1;
      while (j < n && isSpace(src[j])) j++;
      out.push(null, src.slice(i, j));
      i = j;
    } else if (c === '/' && next === '/') {
      let j = i + 2;
      while (j < n && src[j] !== '\n') j++;
      out.push('comment', src.slice(i, j));
      i = j;
    } else if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end < 0 ? n : end + 2;
      out.push('comment', src.slice(i, j));
      i = j;
    } else if (c === '/' && REGEX_AFTER.has(prev)) {
      const j = endOfRegex(src, i);
      out.push(j > i ? 'string' : 'punct', src.slice(i, j > i ? j : i + 1));
      i = j > i ? j : i + 1;
      prev = 'str';
    } else if (c === '"' || c === "'") {
      const j = endOfString(src, i);
      out.push('string', src.slice(i, j));
      i = j;
      prev = 'str';
    } else if (c === '`') {
      const j = endOfTemplate(src, i);
      out.push('string', src.slice(i, j));
      i = j;
      prev = 'str';
    } else if (/\d/.test(c) || (c === '.' && /\d/.test(next ?? ''))) {
      const m = /^(?:0[xob][\da-f_]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?|\.\d+)/i.exec(
        src.slice(i, i + 40),
      );
      const text = m ? m[0] : c;
      out.push('number', text);
      i += text.length;
      prev = '1';
    } else if (isIdStart(c)) {
      let j = i + 1;
      while (j < n && isId(src[j])) j++;
      const word = src.slice(i, j);
      let k = j;
      while (k < n && src[k] === ' ') k++;
      const afterDot = out.tokens.at(-1)?.text.endsWith('.') ?? false;
      let kind: TokenKind | null = null;
      if (!afterDot && CONSTANTS.has(word)) kind = 'constant';
      else if (!afterDot && KEYWORDS.has(word)) kind = 'keyword';
      else if (src[k] === '(' || isGenericCall(src, k)) kind = 'function';
      else if (/^[A-Z]/.test(word)) kind = 'type';
      out.push(kind, word);
      i = j;
      prev = kind === 'keyword' ? word : 'id';
    } else if (c === '<' && (isIdStart(next) || next === '>') && JSX_AFTER.has(prev)) {
      openTag();
    } else if (c === '{') {
      if (top.expr) top.depth++;
      out.push('punct', '{');
      prev = '{';
      i++;
    } else if (c === '}') {
      out.push('punct', '}');
      i++;
      if (top.expr && top.depth === 0) stack.pop();
      else if (top.expr) top.depth--;
      prev = '}';
    } else if (/[()[\];,.]/.test(c)) {
      out.push('punct', c);
      prev = c === ')' || c === ']' ? 'id' : c;
      i++;
    } else {
      let j = i + 1;
      while (j < n && /[=+\-*/%&|^!<>?:~]/.test(src[j] ?? '') && j - i < 3) j++;
      const op = src.slice(i, j);
      out.push('punct', op);
      prev = op;
      i = j;
    }
  }
  return out.tokens;
}

function cssTokens(src: string): Token[] {
  const out = new Out();
  let depth = 0;
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i] as string;
    const rest = src.slice(i, i + 64);
    let m: RegExpExecArray | null;
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end < 0 ? n : end + 2;
      out.push('comment', src.slice(i, j));
      i = j;
    } else if (c === '"' || c === "'") {
      const j = endOfString(src, i);
      out.push('string', src.slice(i, j));
      i = j;
    } else if ((m = /^@[\w-]+/.exec(rest))) {
      out.push('keyword', m[0]);
      i += m[0].length;
    } else if ((m = /^#[\da-f]{3,8}\b/i.exec(rest)) && depth > 0) {
      out.push('constant', m[0]);
      i += m[0].length;
    } else if ((m = /^-?(?:\d*\.\d+|\d+)(?:[a-z%]+)?/i.exec(rest))) {
      out.push('number', m[0]);
      i += m[0].length;
    } else if ((m = /^--[\w-]+/.exec(rest))) {
      out.push('variable', m[0]);
      i += m[0].length;
    } else if ((m = /^!important\b/.exec(rest))) {
      out.push('keyword', m[0]);
      i += m[0].length;
    } else if ((m = /^[a-z_-][\w-]*/i.exec(rest))) {
      const word = m[0];
      const after = src.slice(i + word.length).match(/^\s*(.)/)?.[1];
      let kind: TokenKind | null;
      if (after === '(') kind = 'function';
      else if (depth > 0 && after === ':' && !/[\w-]/.test(src[i - 1] ?? '')) kind = 'property';
      else if (depth === 0 || after === '{' || after === ',')
        kind = src[i - 1] === '.' || src[i - 1] === '#' ? 'type' : 'tag';
      else kind = null;
      out.push(kind, word);
      i += word.length;
    } else {
      if (c === '{') depth++;
      if (c === '}') depth = Math.max(0, depth - 1);
      out.push(/[{}():;,.>+~&*[\]=]/.test(c) ? 'punct' : null, c);
      i++;
    }
  }
  return out.tokens;
}

function jsonTokens(src: string): Token[] {
  const out = new Out();
  let i = 0;
  while (i < src.length) {
    const c = src[i] as string;
    let m: RegExpExecArray | null;
    if (c === '"') {
      const j = endOfString(src, i);
      const isKey = /^\s*:/.test(src.slice(j, j + 8));
      out.push(isKey ? 'property' : 'string', src.slice(i, j));
      i = j;
    } else if ((m = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i.exec(src.slice(i, i + 40)))) {
      out.push('number', m[0]);
      i += m[0].length;
    } else if ((m = /^(?:true|false|null)\b/.exec(src.slice(i, i + 6)))) {
      out.push('constant', m[0]);
      i += m[0].length;
    } else if (c === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < src.length && src[j] !== '\n') j++;
      out.push('comment', src.slice(i, j));
      i = j;
    } else {
      out.push(/[{}[\]:,]/.test(c) ? 'punct' : null, c);
      i++;
    }
  }
  return out.tokens;
}

function shellTokens(src: string): Token[] {
  const out = new Out();
  let i = 0;
  let commandPos = true;
  while (i < src.length) {
    const c = src[i] as string;
    const rest = src.slice(i, i + 80);
    let m: RegExpExecArray | null;
    if (c === '\n') {
      out.push(null, c);
      commandPos = true;
      i++;
    } else if (c === '#' && (i === 0 || isSpace(src[i - 1]))) {
      let j = i;
      while (j < src.length && src[j] !== '\n') j++;
      out.push('comment', src.slice(i, j));
      i = j;
    } else if (c === '"' || c === "'") {
      const j = endOfString(src, i);
      out.push('string', src.slice(i, j));
      i = j;
      commandPos = false;
    } else if ((m = /^\$(?:\{[^}]*\}|\w+)/.exec(rest))) {
      out.push('variable', m[0]);
      i += m[0].length;
    } else if (commandPos && (m = /^\$ /.exec(rest)) && (i === 0 || src[i - 1] === '\n')) {
      out.push('punct', m[0]);
      i += m[0].length;
    } else if ((m = /^(?:&&|\|\||[|;])/.exec(rest))) {
      out.push('punct', m[0]);
      i += m[0].length;
      commandPos = true;
    } else if (isSpace(c)) {
      let j = i + 1;
      while (j < src.length && src[j] !== '\n' && isSpace(src[j])) j++;
      out.push(null, src.slice(i, j));
      i = j;
    } else {
      let j = i + 1;
      while (j < src.length && !isSpace(src[j]) && !/[|;"']/.test(src[j] ?? '')) j++;
      const word = src.slice(i, j);
      out.push(commandPos ? 'function' : word.startsWith('-') ? 'attr' : null, word);
      commandPos = false;
      i = j;
    }
  }
  return out.tokens;
}

const FAMILY: Record<string, (src: string) => Token[]> = {
  tsx: (s) => scriptTokens(s, false),
  ts: (s) => scriptTokens(s, false),
  typescript: (s) => scriptTokens(s, false),
  jsx: (s) => scriptTokens(s, false),
  js: (s) => scriptTokens(s, false),
  javascript: (s) => scriptTokens(s, false),
  mjs: (s) => scriptTokens(s, false),
  html: (s) => scriptTokens(s, true),
  xml: (s) => scriptTokens(s, true),
  svg: (s) => scriptTokens(s, true),
  css: cssTokens,
  scss: cssTokens,
  json: jsonTokens,
  jsonc: jsonTokens,
  sh: shellTokens,
  bash: shellTokens,
  zsh: shellTokens,
  shell: shellTokens,
  console: shellTokens,
};

/** Languages the built-in highlighter understands. Anything else renders as plain text. */
export const highlightLanguages: readonly string[] = Object.keys(FAMILY);

/** Tokenise `code` for `language`. Unknown languages come back as one plain token. */
export function tokenize(code: string, language: string | undefined): Token[] {
  const fn = language ? FAMILY[language.toLowerCase()] : undefined;
  return fn ? fn(code) : [{ kind: null, text: code }];
}
