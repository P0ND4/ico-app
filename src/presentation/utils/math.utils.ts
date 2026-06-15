const SYMBOLS: [RegExp, string][] = [
  // Greek lowercase
  [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'], [/\\delta/g, 'δ'],
  [/\\epsilon/g, 'ε'], [/\\varepsilon/g, 'ε'], [/\\zeta/g, 'ζ'], [/\\eta/g, 'η'],
  [/\\theta/g, 'θ'], [/\\vartheta/g, 'θ'], [/\\iota/g, 'ι'], [/\\kappa/g, 'κ'],
  [/\\lambda/g, 'λ'], [/\\mu/g, 'μ'], [/\\nu/g, 'ν'], [/\\xi/g, 'ξ'],
  [/\\pi/g, 'π'], [/\\varpi/g, 'π'], [/\\rho/g, 'ρ'], [/\\sigma/g, 'σ'],
  [/\\tau/g, 'τ'], [/\\upsilon/g, 'υ'], [/\\phi/g, 'φ'], [/\\varphi/g, 'φ'],
  [/\\chi/g, 'χ'], [/\\psi/g, 'ψ'], [/\\omega/g, 'ω'],
  // Greek uppercase
  [/\\Gamma/g, 'Γ'], [/\\Delta/g, 'Δ'], [/\\Theta/g, 'Θ'], [/\\Lambda/g, 'Λ'],
  [/\\Xi/g, 'Ξ'], [/\\Pi/g, 'Π'], [/\\Sigma/g, 'Σ'], [/\\Upsilon/g, 'Υ'],
  [/\\Phi/g, 'Φ'], [/\\Psi/g, 'Ψ'], [/\\Omega/g, 'Ω'],
  // Calculus — longest match first
  [/\\iiiint/g, '⨌'], [/\\oiiint/g, '∰'], [/\\oiint/g, '∯'], [/\\idotsint/g, '∫⋯∫'],
  [/\\iiint/g, '∭'], [/\\iint/g, '∬'], [/\\oint/g, '∮'], [/\\int/g, '∫'],
  [/\\partial/g, '∂'], [/\\nabla/g, '∇'], [/\\infty/g, '∞'],
  [/\\sum/g, '∑'], [/\\prod/g, '∏'], [/\\lim/g, 'lim'],
  [/\\ln/g, 'ln'], [/\\log/g, 'log'], [/\\exp/g, 'exp'],
  [/\\sin/g, 'sin'], [/\\cos/g, 'cos'], [/\\tan/g, 'tan'],
  [/\\arcsin/g, 'arcsin'], [/\\arccos/g, 'arccos'], [/\\arctan/g, 'arctan'],
  // Arithmetic / relations
  [/\\pm/g, '±'], [/\\mp/g, '∓'], [/\\times/g, '×'], [/\\div/g, '÷'],
  [/\\cdot/g, '·'], [/\\circ/g, '∘'],
  [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\neq/g, '≠'], [/\\approx/g, '≈'],
  [/\\equiv/g, '≡'], [/\\sim/g, '∼'], [/\\propto/g, '∝'],
  [/\\ll/g, '≪'], [/\\gg/g, '≫'],
  // Sets / logic
  [/\\in\b/g, '∈'], [/\\notin/g, '∉'],
  [/\\subset/g, '⊂'], [/\\supset/g, '⊃'],
  [/\\subseteq/g, '⊆'], [/\\supseteq/g, '⊇'],
  [/\\cup/g, '∪'], [/\\cap/g, '∩'],
  [/\\emptyset/g, '∅'], [/\\varnothing/g, '∅'],
  [/\\forall/g, '∀'], [/\\exists/g, '∃'], [/\\neg/g, '¬'],
  [/\\land/g, '∧'], [/\\lor/g, '∨'],
  // Arrows
  [/\\rightarrow/g, '→'], [/\\leftarrow/g, '←'],
  [/\\Rightarrow/g, '⇒'], [/\\Leftarrow/g, '⇐'],
  [/\\leftrightarrow/g, '↔'], [/\\Leftrightarrow/g, '⇔'],
  [/\\to\b/g, '→'], [/\\mapsto/g, '↦'],
  // Misc
  [/\\ldots/g, '…'], [/\\cdots/g, '⋯'], [/\\vdots/g, '⋮'], [/\\ddots/g, '⋱'],
  [/\\hbar/g, 'ℏ'], [/\\ell/g, 'ℓ'],
  [/\\Re\b/g, 'ℜ'], [/\\Im\b/g, 'ℑ'],
];

const LATEX_MATRIX_ENV_RE =
  /\\begin\{(pmatrix|bmatrix|vmatrix|Vmatrix|matrix|array|cases)\}(?:\{[^{}]*\})?\s*([\s\S]*?)\\end\{\1\}/g;

function matrixToMarkdownTable(rows: string[][]): string {
  if (rows.length === 0) return '';
  const colCount = Math.max(...rows.map((r) => r.length));
  const normalized = rows.map((row) => {
    const padded = [...row];
    while (padded.length < colCount) padded.push('');
    return padded;
  });
  const lines = normalized.map((row) => '| ' + row.join(' | ') + ' |');
  const sep = '| ' + Array(colCount).fill(':---:').join(' | ') + ' |';
  if (lines.length === 1) {
    return `\n\n${lines[0]}\n${sep}\n\n`;
  }
  return `\n\n${lines[0]}\n${sep}\n${lines.slice(1).join('\n')}\n\n`;
}

function parseMatrixRows(body: string): string[][] {
  return body
    .split(/(?:\\\\|\n)+/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split('&').map((cell) => cell.trim()));
}

function convertLatexMatrixEnvironments(text: string, preserveLineBreaks: boolean): string {
  return text.replace(LATEX_MATRIX_ENV_RE, (_match, _env, body) => {
    const rows = parseMatrixRows(body).map((row) =>
      row.map((cell) => preprocessMathLight(cell, { preserveLineBreaks, skipMatrices: true })),
    );
    return matrixToMarkdownTable(rows);
  });
}

function normalizeIntegralNotation(text: string): string {
  return text
    .replace(/\\(?:mathrm|operatorname|text)\{d\}([a-zA-Z])/g, ' d$1')
    .replace(/\\,?\\?mathrm\{d\}([a-zA-Z])/g, ' d$1')
    .replace(/\\,?d([a-zA-Z])\b/g, ' d$1');
}

// Commands that are pure spacing/formatting — strip entirely (including trailing space)
const STRIP_COMMANDS = new Set([
  'quad','qquad','hspace','vspace','noindent','indent',
  'small','large','Large','huge','Huge','tiny','normalsize',
  'centering','displaystyle','textstyle','scriptstyle',
  'limits','nolimits','nonumber','label','tag','notag',
  'linebreak','newline','newpage','clearpage',
  'hfill','vfill','medskip','bigskip','smallskip',
  'boldsymbol','pmb','overline','underline',
  'hat','bar','vec','tilde','dot','ddot',
  'Big','bigg','Bigg','big',
]);

const SUPERSCRIPTS: Record<string, string> = {
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  'n':'ⁿ','i':'ⁱ','a':'ᵃ','b':'ᵇ','x':'ˣ','k':'ᵏ','+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
};
const SUBSCRIPTS: Record<string, string> = {
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
  'n':'ₙ','i':'ᵢ','j':'ⱼ','a':'ₐ','e':'ₑ','x':'ₓ','k':'ₖ','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎',
};

function toSup(s: string): string { return [...s].map(c => SUPERSCRIPTS[c] ?? c).join(''); }
function toSub(s: string): string { return [...s].map(c => SUBSCRIPTS[c] ?? c).join(''); }

function applySuperscripts(text: string): string {
  return text
    .replace(/\^\{([^{}]+)\}/g, (_, s) => toSup(s))
    .replace(/\^([0-9a-zA-Z+-=()])/g, (_, c) => toSup(c));
}

function applySubscripts(text: string): string {
  return text
    .replace(/_\{([^{}]+)\}/g, (_, s) => toSub(s))
    .replace(/_([0-9a-zA-Z])/g, (_, c) => toSub(c));
}

function readBraceGroup(text: string, openBraceIndex: number): { content: string; end: number } | null {
  if (text[openBraceIndex] !== '{') return null;
  let depth = 0;
  for (let i = openBraceIndex; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: text.slice(openBraceIndex + 1, i), end: i + 1 };
      }
    }
  }
  return null;
}

function replaceLatexFracs(text: string, processInner: (value: string) => string): string {
  const marker = '\\frac{';
  let result = '';
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf(marker, i);
    if (start === -1) {
      result += text.slice(i);
      break;
    }
    result += text.slice(i, start);
    const numerator = readBraceGroup(text, start + marker.length - 1);
    if (!numerator || text[numerator.end] !== '{') {
      result += text[start];
      i = start + 1;
      continue;
    }
    const denominator = readBraceGroup(text, numerator.end);
    if (!denominator) {
      result += text[start];
      i = start + 1;
      continue;
    }
    result += `((${processInner(numerator.content)}) / (${processInner(denominator.content)}))`;
    i = denominator.end;
  }
  return result;
}

function replaceLatexRoots(text: string, processInner: (value: string) => string): string {
  const marker = '\\sqrt';
  let result = '';
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf(marker, i);
    if (start === -1) {
      result += text.slice(i);
      break;
    }
    result += text.slice(i, start);
    let cursor = start + marker.length;
    if (text[cursor] === '[') {
      const closeBracket = text.indexOf(']', cursor);
      if (closeBracket === -1) {
        result += text[start];
        i = start + 1;
        continue;
      }
      cursor = closeBracket + 1;
    }
    if (text[cursor] !== '{') {
      result += text[start];
      i = start + 1;
      continue;
    }
    const root = readBraceGroup(text, cursor);
    if (!root) {
      result += text[start];
      i = start + 1;
      continue;
    }
    result += `√(${processInner(root.content)})`;
    i = root.end;
  }
  return result;
}

function unwrapMathDelimiters(text: string): string {
  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, '\n\n$1\n\n')
    .replace(/\\\(([\s\S]+?)\\\)/g, '$1')
    .replace(/\$\$([\s\S]+?)\$\$/g, '\n\n$1\n\n')
    .replace(/\$([^$\n]+)\$/g, '$1');
}

/** LaTeX → unicode for prose; no $…$ → backtick conversion (safe for chat/summary). */
export function preprocessMathLight(
  text: string,
  options?: { preserveLineBreaks?: boolean; skipMatrices?: boolean },
): string {
  const preserveLineBreaks = options?.preserveLineBreaks ?? false;
  const innerOptions = { preserveLineBreaks, skipMatrices: true };

  if (!options?.skipMatrices) {
    text = convertLatexMatrixEnvironments(text, preserveLineBreaks);
  }

  text = unwrapMathDelimiters(text);

  text = replaceLatexFracs(text, (inner) => preprocessMathLight(inner, innerOptions));
  text = replaceLatexRoots(text, (inner) => preprocessMathLight(inner, innerOptions));

  text = text.replace(/\\[,;:! ]/g, ' ');

  text = text.replace(/\\left\s*([([{|\\.])/g, (_, b) => (b === '.' ? '' : b));
  text = text.replace(/\\right\s*([)\]}|\\.])/g, (_, b) => (b === '.' ? '' : b));
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|mathcal|mathbb|mathsf|operatorname)\{([^{}]*)\}/g, '$1');

  if (!preserveLineBreaks) {
    text = text.replace(/\\\\/g, '\n');
  }
  text = text.replace(/\\[.'`"^~=|<>]/g, '');

  for (const [pattern, replacement] of SYMBOLS) {
    text = text.replace(pattern, replacement);
  }

  text = normalizeIntegralNotation(text);
  text = applySuperscripts(text);
  text = applySubscripts(text);

  text = text.replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1');
  text = text.replace(/\\([a-zA-Z]+)\s*/g, (_, cmd) => (STRIP_COMMANDS.has(cmd) ? '' : cmd));
  text = text.replace(/[{}]/g, '');

  return text;
}

/** Mejora x², π, fracciones, etc. en markdown sin romper bloques ``` */
export function preprocessMarkdownMathDisplay(markdown: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((segment) => {
      if (!segment.startsWith('```')) {
        return preprocessMathLight(segment);
      }
      const match = segment.match(/^```([^\n]*)\n?([\s\S]*?)```$/);
      if (!match) return segment;
      const [, lang, body] = match;
      const header = lang ? `\`\`\`${lang}\n` : '```\n';
      const processedBody = preprocessMathLight(body.replace(/\n$/, ''), { preserveLineBreaks: true });
      return `${header}${processedBody}\n\`\`\``;
    })
    .join('');
}

export function preprocessMath(text: string): string {
  // 0. Single-char non-letter LaTeX commands (spacing, punctuation)
  //    \, \; \: \! \  → space (thin/medium/thick space)
  //    \\ → newline (LaTeX line break)
  //    Others → strip
  text = text.replace(/\\[,;:! ]/g, ' ');
  text = text.replace(/\\\\/g, '\n');
  text = text.replace(/\\[.'`"^~=|<>]/g, '');

  // 1. Wrappers with content: \frac, \sqrt, font variants
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1/$2)');
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
  text = text.replace(/\\left\s*([([{|\\.])/g, (_, b) => b === '.' ? '' : b);
  text = text.replace(/\\right\s*([)\]}|\\.])/g, (_, b) => b === '.' ? '' : b);
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|mathcal|mathbb|mathsf|operatorname)\{([^{}]*)\}/g, '$1');

  // 2. Replace known symbols
  for (const [pattern, replacement] of SYMBOLS) {
    text = text.replace(pattern, replacement);
  }

  // 3. Super/subscripts
  text = applySuperscripts(text);
  text = applySubscripts(text);

  // 4. Strip remaining \command{content} → content (unknown wrappers)
  text = text.replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1');

  // 5. Handle remaining \commands:
  //    - Known spacing/style commands → strip entirely
  //    - Unknown → keep the letters (e.g. \C → C, \K → K)
  text = text.replace(/\\([a-zA-Z]+)\s*/g, (_, cmd) => {
    return STRIP_COMMANDS.has(cmd) ? '' : cmd;
  });

  // 6. Strip stray braces
  text = text.replace(/[{}]/g, '');

  // 7. Math blocks: \[...\] and $$...$$ → fenced code block
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, inner) => `\n\`\`\`\n${inner.trim()}\n\`\`\`\n`);
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => `\n\`\`\`\n${inner.trim()}\n\`\`\`\n`);

  // 8. Inline math: \(...\) and $...$ → backtick
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, inner) => `\`${inner.trim()}\``);
  text = text.replace(/\$([^$\n]+)\$/g, (_, inner) => `\`${inner.trim()}\``);

  return text;
}
