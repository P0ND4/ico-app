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
  // Calculus
  [/\\int/g, '∫'], [/\\iint/g, '∬'], [/\\iiint/g, '∭'], [/\\oint/g, '∮'],
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
  [/\\infty/g, '∞'],
];

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
  text = text.replace(/\^\{([^{}]+)\}/g, (_, s) => toSup(s));
  text = text.replace(/\^([0-9a-zA-Z])/g, (_, c) => toSup(c));
  text = text.replace(/_\{([^{}]+)\}/g, (_, s) => toSub(s));
  text = text.replace(/_([0-9a-zA-Z])/g, (_, c) => toSub(c));

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
