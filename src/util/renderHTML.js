const escapeHTML = require('./escapeHTML');

const CSSReset = `*,*::before,*::after{box-sizing:border-box;}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0;}ul[role='list'],ol[role='list']{list-style:none;}html:focus-within{scroll-behavior:smooth;}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5;}a:not([class]){text-decoration-skip-ink:auto;}img,picture{max-width:100%;display:block;}input,button,textarea,select{font:inherit;}@media (prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto;} *, *::before, *::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;scroll-behavior:auto !important;}}`;

module.exports = function renderHTML(contents) {
  const {
    body = '',
    css = '',
    includeSocketIO = false,
    js = '',
    link = '',
    title = '',
  } = contents;
  const htmlTitle = `<title>${escapeHTML(title)}</title>`;
  const htmlJS = `<script type="text/javascript">${js}</script>`;
  const htmlCSS = `<style>${CSSReset}${css}</style>`;
  const socketIO = includeSocketIO ? '<script src="/socket.io/socket.io.js"></script>' : '';
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">${htmlTitle}${link}${htmlCSS}${socketIO}${htmlJS}</head><body>${body}</body></html>`;
}