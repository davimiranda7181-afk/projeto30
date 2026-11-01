/* Preenche e-mail, nome e documento nas páginas legais a partir de config.js */
(function () {
  var C = window.P30_CONFIG || {};
  function fill(sel, val) { if (val) document.querySelectorAll(sel).forEach(function (el) { el.textContent = val; }); }
  fill('[data-company]', C.COMPANY_NAME);
  fill('[data-doc]', C.COMPANY_DOC);
  fill('[data-email-text]', C.SUPPORT_EMAIL);
  if (C.SUPPORT_EMAIL) document.querySelectorAll('[data-email-link]').forEach(function (a) { a.href = 'mailto:' + C.SUPPORT_EMAIL; });
})();
