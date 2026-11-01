/* =========================================================
   PROJETO 30 DIAS — INTERAÇÕES DA PÁGINA
   (o link do checkout e os contatos ficam em config.js)
   ========================================================= */
(function () {
  'use strict';
  var C = window.P30_CONFIG || {};

  /* ---------- Checkout: todos os botões .js-checkout usam CONFIG.CHECKOUT_URL ---------- */
  var configured = typeof C.CHECKOUT_URL === 'string' && /^https?:\/\//.test(C.CHECKOUT_URL) && C.CHECKOUT_URL.indexOf('SEU-LINK') === -1;

  function checkoutUrl() {
    var url = C.CHECKOUT_URL;
    var params = window.location.search;               // repassa UTMs, fbclid, ttclid, gclid
    if (params && params.length > 1) url += (url.indexOf('?') === -1 ? '?' : '&') + params.slice(1);
    return url;
  }

  function track(cta) {
    var value = C.PRICE || 29.99, currency = C.CURRENCY || 'BRL';
    try {
      if (typeof window.gtag === 'function') window.gtag('event', 'begin_checkout', { value: value, currency: currency, items: [{ item_name: 'Projeto 30 Dias', price: value }], cta: cta });
      if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout', { value: value, currency: currency });
      if (window.ttq && typeof window.ttq.track === 'function') window.ttq.track('InitiateCheckout', { value: value, currency: currency, content_name: 'Projeto 30 Dias' });
    } catch (e) { /* rastreamento nunca deve impedir a compra */ }
  }

  document.querySelectorAll('.js-checkout').forEach(function (btn) {
    if (configured) {
      btn.href = checkoutUrl();
      btn.setAttribute('rel', 'noopener');
    } else {
      btn.href = '#oferta';                              // sem link real: leva até a oferta
    }
    btn.addEventListener('click', function () { if (configured) track(btn.getAttribute('data-cta')); });
  });

  /* ---------- Contato (config.js) ---------- */
  if (C.SUPPORT_EMAIL) {
    document.querySelectorAll('[data-email-link]').forEach(function (a) { a.href = 'mailto:' + C.SUPPORT_EMAIL; });
    document.querySelectorAll('[data-email-text]').forEach(function (el) { el.textContent = C.SUPPORT_EMAIL; });
  }
  if (C.WHATSAPP && /^\d{10,15}$/.test(C.WHATSAPP)) {
    document.querySelectorAll('[data-whatsapp-link]').forEach(function (a) {
      a.href = 'https://wa.me/' + C.WHATSAPP + '?text=' + encodeURIComponent('Olá! Tenho uma dúvida sobre o Projeto 30 Dias.');
      a.hidden = false;
    });
  }
  if (C.SUPPORT_HOURS) document.querySelectorAll('[data-hours-text]').forEach(function (el) { el.textContent = C.SUPPORT_HOURS; });
  if (C.COMPANY_NAME) document.querySelectorAll('[data-company]').forEach(function (el) { el.textContent = C.COMPANY_NAME; });
  if (C.COMPANY_DOC) document.querySelectorAll('[data-doc]').forEach(function (el) { el.textContent = C.COMPANY_DOC; });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- FAQ: abre um por vez ---------- */
  var items = document.querySelectorAll('.faq__item');
  items.forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      items.forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Abas da prévia ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  /* ---------- Animação ao rolar ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Barra fixa de compra no celular ---------- */
  var mbar = document.getElementById('mbar');
  var hero = document.getElementById('topo');
  var oferta = document.getElementById('oferta');
  var finalCta = document.querySelector('.final');
  if (mbar && hero && 'IntersectionObserver' in window) {
    document.body.classList.add('has-mbar');
    var state = { hero: true, oferta: false, final: false };
    var update = function () {
      var show = !state.hero && !state.oferta && !state.final;
      mbar.classList.toggle('show', show);
      if ('inert' in mbar) mbar.inert = !show;
      mbar.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    var watch = function (el, key) {
      if (!el) return;
      new IntersectionObserver(function (e) { state[key] = e[0].isIntersecting; update(); }).observe(el);
    };
    watch(hero, 'hero'); watch(oferta, 'oferta'); watch(finalCta, 'final');
    update();
  }

  /* ---------- Questionário / Quiz Interativo (Personalização) ---------- */
  function initQuiz() {
    if (window.__p30_quiz_ready) return;
    var quizCard = document.getElementById('quiz-card') || document.getElementById('questionario') || document.querySelector('.quiz-card');
    if (!quizCard) return;
    window.__p30_quiz_ready = true;

    var steps = quizCard.querySelectorAll('.quiz-step[data-step]');
    var progressFill = document.getElementById('quiz-progress-fill');
    var progressStepNum = document.getElementById('quiz-step-num');
    var progressPercent = document.getElementById('quiz-progress-percent');
    var loader = document.getElementById('quiz-loader');
    var resultView = document.getElementById('quiz-result-view');
    var currentStep = 0;
    var totalSteps = steps.length;
    var isTransitioning = false;
    var safetyTimer = null;

    var answers = {
      age: '30 a 39 anos',
      time: '15 a 20 minutos',
      goal: 'Secar a barriga e eliminar inchaço',
      commit: '100% decidido(a)',
      imagine: 'Autoestima no topo e roupas vestindo perfeitamente'
    };

    function unlock() {
      isTransitioning = false;
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    }

    function updateProgress(stepIdx) {
      if (!totalSteps) return;
      var pct = Math.round(((stepIdx + 1) / totalSteps) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressStepNum) progressStepNum.textContent = (stepIdx + 1);
      if (progressPercent) progressPercent.textContent = pct + '%';
    }

    function showStep(idx) {
      steps.forEach(function (s, i) {
        if (i === idx) {
          s.classList.add('active');
          s.style.display = 'block';
        } else {
          s.classList.remove('active');
          s.style.display = 'none';
        }
      });
      currentStep = idx;
      updateProgress(idx);
      unlock();
    }

    function finishQuiz() {
      steps.forEach(function (s) {
        s.classList.remove('active');
        s.style.display = 'none';
      });
      var progressWrap = quizCard.querySelector('.quiz-progress-wrap');
      if (progressWrap) progressWrap.style.display = 'none';

      if (loader) loader.style.display = 'block';

      setTimeout(function () {
        if (loader) loader.style.display = 'none';
        if (resultView) {
          resultView.style.display = 'block';
          var tagAge = document.getElementById('res-tag-age');
          var tagTime = document.getElementById('res-tag-time');
          var tagGoal = document.getElementById('res-tag-goal');
          if (tagAge) tagAge.textContent = 'Idade: ' + answers.age;
          if (tagTime) tagTime.textContent = 'Tempo diário: ' + answers.time;
          if (tagGoal) tagGoal.textContent = 'Foco: ' + answers.goal;

          var resDesc = document.getElementById('res-custom-desc');
          if (resDesc) {
            resDesc.innerHTML = 'Com base no seu perfil (<strong>' + answers.age + '</strong>, disponibilidade de <strong>' + answers.time + '</strong>), o Projeto 30 Dias foi desenhado para você que busca <strong>' + answers.goal.toLowerCase() + '</strong> sem sofrimento e no conforto da sua casa.';
          }

          try {
            quizCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } catch (err) {}
        }
        unlock();
      }, 1200);
    }

    steps.forEach(function (step, stepIdx) {
      var options = step.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.preventDefault();
          if (isTransitioning) return;
          isTransitioning = true;
          clearTimeout(safetyTimer);
          safetyTimer = setTimeout(unlock, 500);

          options.forEach(function (o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
          var key = opt.getAttribute('data-key');
          var val = opt.getAttribute('data-val') || opt.textContent.trim();
          if (key) answers[key] = val;

          setTimeout(function () {
            if (stepIdx < totalSteps - 1) {
              showStep(stepIdx + 1);
            } else {
              finishQuiz();
            }
          }, 200);
        });
      });

      var prevBtn = step.querySelector('.quiz-btn-prev');
      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (stepIdx > 0 && !isTransitioning) {
            showStep(stepIdx - 1);
          }
        });
      }
    });

    var restartBtn = document.getElementById('quiz-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (resultView) resultView.style.display = 'none';
        var progressWrap = quizCard.querySelector('.quiz-progress-wrap');
        if (progressWrap) progressWrap.style.display = 'block';
        showStep(0);
      });
    }

    // Inicializa no passo 0
    showStep(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
  } else {
    initQuiz();
  }

  /* ---------- Prova Social em Tempo Real (Toasts) ---------- */
  var buyers = [
    { name: 'Mariana S.', city: 'São Paulo, SP', time: 'há 3 minutos', action: 'acabou de garantir o Projeto 30 Dias' },
    { name: 'Lucas F.', city: 'Curitiba, PR', time: 'há 6 minutos', action: 'garantiu os 4 bônus exclusivos' },
    { name: 'Patrícia M.', city: 'Belo Horizonte, MG', time: 'há 9 minutos', action: 'iniciou sua transformação hoje' },
    { name: 'Carlos E.', city: 'Rio de Janeiro, RJ', time: 'há 12 minutos', action: 'acabou de garantir o Projeto 30 Dias' },
    { name: 'Fernanda A.', city: 'Salvador, BA', time: 'há 15 minutos', action: 'garantiu a vaga promocional de R$ 29,99' },
    { name: 'Rodrigo B.', city: 'Porto Alegre, RS', time: 'há 18 minutos', action: 'acabou de entrar no Projeto 30 Dias' }
  ];

  var toast = document.getElementById('toast-notify');
  var toastName = document.getElementById('toast-name');
  var toastAction = document.getElementById('toast-action');
  var toastTime = document.getElementById('toast-time');
  var toastClose = document.getElementById('toast-close');
  var buyerIdx = 0;

  if (toast && toastName && toastAction) {
    function showNextToast() {
      var b = buyers[buyerIdx % buyers.length];
      toastName.textContent = b.name + ' (' + b.city + ')';
      toastAction.textContent = b.action;
      if (toastTime) toastTime.textContent = b.time;
      toast.classList.add('show');
      buyerIdx++;

      setTimeout(function () {
        toast.classList.remove('show');
      }, 5500);
    }

    if (toastClose) {
      toastClose.addEventListener('click', function () {
        toast.classList.remove('show');
      });
    }

    // Primeiro toast após 6s, depois a cada 18s
    setTimeout(function () {
      showNextToast();
      setInterval(showNextToast, 18000);
    }, 6000);
  }

  /* ---------- Botão Flutuante de WhatsApp ---------- */
  var floatWa = document.getElementById('floating-wa');
  if (floatWa) {
    if (C.WHATSAPP && /^\d{10,15}$/.test(C.WHATSAPP)) {
      floatWa.href = 'https://wa.me/' + C.WHATSAPP + '?text=' + encodeURIComponent('Olá! Tenho uma dúvida sobre o Projeto 30 Dias.');
      floatWa.setAttribute('target', '_blank');
      floatWa.setAttribute('rel', 'noopener');
    } else {
      floatWa.href = '#contato';
    }
  }
})();

