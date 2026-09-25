/* ==================================================================
   BOLLADINHO — comportamento da camada de realce (enhance.css)
   Carregado DEPOIS de script.js. Não toca no hero.
   - ilha de navegação: esconde ao descer, volta ao subir, scrollspy
     com indicador deslizante
   - barra de progresso de leitura
   - holofote que segue o ponteiro + luz nos botões/cards
   - tilt 3D interpolado (substitui o tilt instantâneo antigo)
   - checkout: ícones nos campos, validação ao vivo, erros inline,
     progresso das 3 etapas
   ================================================================== */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(() => {
        initNav();
        initProgress();
        initPointerLight();
        initTilt();
        initCartBump();
        initFooter();
        initCheckout();
    });

    /* ---------------- Navegação ---------------- */
    function initNav() {
        const navbar = $('#navbar');
        const links = $('.nav-links');
        if (!navbar || !links) return;

        // indicador deslizante (pílula verde atrás do link ativo/hover)
        const indicator = document.createElement('span');
        indicator.className = 'nav-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        links.prepend(indicator);

        const anchors = $$('a', links);
        let active = null;

        function moveIndicator(a) {
            if (!a || !navbar.classList.contains('scrolled') || window.innerWidth < 1024) {
                indicator.classList.remove('on');
                return;
            }
            const lr = links.getBoundingClientRect();
            const r = a.getBoundingClientRect();
            indicator.style.width = r.width + 'px';
            indicator.style.transform = `translateX(${r.left - lr.left}px)`;
            indicator.classList.add('on');
        }

        anchors.forEach(a => {
            a.addEventListener('mouseenter', () => moveIndicator(a));
            a.addEventListener('focus', () => moveIndicator(a));
        });
        links.addEventListener('mouseleave', () => moveIndicator(active));

        // scrollspy: seções da própria página que têm link no menu
        const spy = anchors
            .map(a => {
                const href = a.getAttribute('href') || '';
                const hash = href.includes('#') ? href.slice(href.indexOf('#')) : '';
                const samePage = href.startsWith('#') || (hash && href.split('#')[0] === location.pathname.split('/').pop());
                const el = hash.length > 1 && samePage ? document.querySelector(hash) : null;
                return el && !el.closest('.hero') ? { a, el } : null;
            })
            .filter(Boolean);

        function setActive(a) {
            if (a === active) return;
            anchors.forEach(x => x.classList.toggle('is-active', x === a));
            active = a;
            moveIndicator(a);
        }

        let lastY = window.scrollY;
        let ticking = false;
        function onScroll() {
            const y = window.scrollY;
            const past = navbar.classList.contains('scrolled');
            const menuOpen = links.classList.contains('open');

            // esconde ao descer rápido, mostra ao subir (nunca com o menu aberto)
            if (past && !menuOpen && y > lastY + 6 && y > window.innerHeight * 1.4) navbar.classList.add('nav-hidden');
            else if (y < lastY - 6 || !past || menuOpen) navbar.classList.remove('nav-hidden');
            lastY = y;

            // seção ativa: a última cujo topo passou de 40% da tela
            let current = null;
            const line = window.innerHeight * 0.4;
            spy.forEach(({ a, el }) => { if (el.getBoundingClientRect().top <= line) current = a; });
            setActive(current);
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
        }, { passive: true });

        // no desktop a ilha mostra os links inline: fecha o painel se estava aberto
        new MutationObserver(() => {
            if (navbar.classList.contains('scrolled') && window.innerWidth >= 1024 && links.classList.contains('open')) {
                links.classList.remove('open');
                const icon = $('#menu-toggle i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
            requestAnimationFrame(() => moveIndicator(active));
        }).observe(navbar, { attributes: true, attributeFilter: ['class'] });

        window.addEventListener('resize', () => moveIndicator(active));
        onScroll();
    }

    /* ---------------- Progresso de leitura ---------------- */
    function initProgress() {
        const bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);
        let ticking = false;
        const upd = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            bar.style.transform = `scaleX(${p.toFixed(4)})`;
            bar.classList.toggle('on', window.scrollY > window.innerHeight * 0.9);
            ticking = false;
        };
        window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
        upd();
    }

    /* ---------------- Luz que segue o ponteiro ---------------- */
    function initPointerLight() {
        if (!finePointer) return;

        // holofote ambiente (interpolado para ficar "líquido")
        if (!reduceMotion) {
            const glow = document.createElement('div');
            glow.className = 'cursor-glow';
            glow.setAttribute('aria-hidden', 'true');
            document.body.appendChild(glow);
            let tx = -999, ty = -999, x = -999, y = -999, raf = 0;
            const loop = () => {
                x += (tx - x) * 0.12; y += (ty - y) * 0.12;
                glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
                raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) ? requestAnimationFrame(loop) : 0;
            };
            window.addEventListener('pointermove', e => {
                if (e.pointerType !== 'mouse') return;
                if (x < -900) { x = e.clientX; y = e.clientY; }
                tx = e.clientX; ty = e.clientY;
                // some sobre o hero (o hero tem a própria luz)
                const overHero = e.target.closest && e.target.closest('.hero');
                glow.classList.toggle('on', !overHero && window.scrollY > window.innerHeight * 0.6);
                if (!raf) raf = requestAnimationFrame(loop);
            }, { passive: true });
            document.addEventListener('pointerleave', () => glow.classList.remove('on'));
        }

        // --mx/--my para o holofote interno de botões e cards
        const sel = '.btn, .pricing-card, .testimonial-card, section:not(.hero) .glass';
        document.addEventListener('pointermove', e => {
            const el = e.target.closest && e.target.closest(sel);
            if (!el || el.closest('.hero')) return;
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            el.style.setProperty('--my', (e.clientY - r.top) + 'px');
            if (el.classList.contains('glass')) el.classList.add('lit');
        }, { passive: true });
    }

    /* ---------------- Tilt 3D interpolado ---------------- */
    function initTilt() {
        if (!finePointer || reduceMotion) return;
        const MAX = 5; // graus
        function bind(card) {
            if (card._tilt2 || card.closest('.hero')) return;
            card._tilt2 = true;
            let tx = 0, ty = 0, x = 0, y = 0, lift = 0, tl = 0, raf = 0;
            const tick = () => {
                x += (tx - x) * 0.1; y += (ty - y) * 0.1; lift += (tl - lift) * 0.1;
                card.style.transform = `perspective(1000px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg) translate3d(0, ${(-lift).toFixed(2)}px, 0)`;
                if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tl - lift) > 0.02) raf = requestAnimationFrame(tick);
                else { raf = 0; if (!tl) card.style.transform = ''; }
            };
            const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
            card.addEventListener('pointermove', e => {
                if (e.pointerType !== 'mouse') return;
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                tx = px * MAX * 2; ty = -py * MAX * 2; tl = 8;
                go();
            });
            card.addEventListener('pointerleave', () => { tx = 0; ty = 0; tl = 0; go(); });
        }
        const scan = () => $$('.pricing-card, .testimonial-card').forEach(bind);
        scan();
        const tg = $('#testimonials-grid');
        if (tg) new MutationObserver(scan).observe(tg, { childList: true });
    }

    /* ---------------- Contador do carrinho pulsa ao mudar ---------------- */
    function initCartBump() {
        const c = $('#cart-count');
        if (!c) return;
        let last = c.textContent;
        new MutationObserver(() => {
            if (c.textContent === last) return;
            last = c.textContent;
            c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
        }).observe(c, { childList: true, characterData: true, subtree: true });
    }

    /* ---------------- Rodapé ---------------- */
    function initFooter() {
        const top = $('#back-to-top');
        if (!top) return;
        top.addEventListener('click', () => {
            if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
            else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------------- Checkout ---------------- */
    function initCheckout() {
        const overlay = $('#checkout-overlay');
        if (!overlay) return;

        const ICONS = {
            'cust-nome': 'fa-user', 'cust-cpf': 'fa-id-card', 'cust-email': 'fa-envelope',
            'cust-whatsapp': 'fa-phone', 'cust-cep': 'fa-location-dot', 'cust-rua': 'fa-road',
            'cust-numero': 'fa-hashtag', 'cust-complemento': 'fa-building', 'cust-bairro': 'fa-map',
            'cc-number': 'fa-credit-card', 'cc-name': 'fa-signature', 'cc-exp': 'fa-calendar', 'cc-csc': 'fa-lock'
        };

        // envolve cada campo: [ícone][input][marca ✓/!] + mensagem de erro
        Object.keys(ICONS).forEach(id => {
            const input = document.getElementById(id);
            if (!input || input.parentElement.classList.contains('field')) return;
            const wrap = document.createElement('span');
            wrap.className = 'field';
            input.parentNode.insertBefore(wrap, input);
            const i = document.createElement('i');
            i.className = 'fa-solid ' + ICONS[id];
            i.setAttribute('aria-hidden', 'true');
            wrap.append(i, input);
            const group = input.closest('.form-group');
            if (group && !group.querySelector('.field-error')) {
                const err = document.createElement('small');
                err.className = 'field-error';
                err.id = id + '-err';
                err.setAttribute('role', 'alert');
                group.appendChild(err);
                input.setAttribute('aria-describedby', err.id);
            }
        });

        const digits = v => (v || '').replace(/\D/g, '');
        function cpfOk(v) {
            const c = digits(v);
            if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
            for (const len of [9, 10]) {
                let s = 0;
                for (let i = 0; i < len; i++) s += +c[i] * (len + 1 - i);
                if (((s * 10) % 11) % 10 !== +c[len]) return false;
            }
            return true;
        }
        function luhn(v) {
            const n = digits(v);
            if (n.length < 13) return false;
            let sum = 0, alt = false;
            for (let i = n.length - 1; i >= 0; i--) {
                let d = +n[i];
                if (alt) { d *= 2; if (d > 9) d -= 9; }
                sum += d; alt = !alt;
            }
            return sum % 10 === 0;
        }
        function expOk(v) {
            const m = /^(\d{2})\/(\d{2})$/.exec(v || '');
            if (!m) return false;
            const mm = +m[1], yy = 2000 + +m[2], now = new Date();
            return mm >= 1 && mm <= 12 && (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1));
        }

        // regra, mensagem
        const RULES = {
            'cust-nome': [v => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 5, 'Informe nome e sobrenome.'],
            'cust-cpf': [cpfOk, 'CPF inválido — confira os dígitos.'],
            'cust-email': [v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'E-mail inválido.'],
            'cust-whatsapp': [v => digits(v).length >= 10, 'Informe o telefone com DDD.'],
            'cust-cep': [v => digits(v).length === 8, 'CEP deve ter 8 dígitos.'],
            'cust-rua': [v => v.trim().length >= 3, 'Informe o endereço.'],
            'cust-numero': [v => v.trim().length >= 1, 'Informe o número.'],
            'cust-bairro': [v => v.trim().length >= 2, 'Informe o bairro.'],
            'cust-cidade': [v => v.trim().length >= 2, 'Informe a cidade.'],
            'cc-number': [luhn, 'Número do cartão incorreto.'],
            'cc-name': [v => v.trim().length >= 2, 'Nome como impresso no cartão.'],
            'cc-exp': [expOk, 'Validade inválida ou vencida.'],
            'cc-csc': [v => digits(v).length >= 3, 'CVV incompleto.']
        };

        function setState(input, state, msg) {
            const g = input.closest('.form-group');
            if (!g) return;
            g.classList.toggle('is-valid', state === 'ok');
            g.classList.toggle('is-invalid', state === 'bad');
            input.setAttribute('aria-invalid', state === 'bad' ? 'true' : 'false');
            const err = g.querySelector('.field-error');
            if (err) err.textContent = state === 'bad' ? (msg || '') : '';
        }

        function check(input, strict) {
            const rule = RULES[input.id];
            if (!rule) return true;
            const v = input.value;
            if (!v && !strict) { setState(input, null); return false; }
            const ok = rule[0](v);
            setState(input, ok ? 'ok' : 'bad', rule[1]);
            return ok;
        }

        Object.keys(RULES).forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('blur', () => { check(input, false); updateSteps(); });
            input.addEventListener('input', () => {
                const g = input.closest('.form-group');
                // depois do primeiro erro, revalida enquanto digita (feedback imediato de conserto)
                if (g && (g.classList.contains('is-invalid') || g.classList.contains('is-valid'))) check(input, false);
                updateSteps();
            });
        });

        // CEP: o script.js decide se o CEP existe; aqui só espelhamos o resultado
        const cepStatus = $('#cep-status');
        const cepInput = $('#cust-cep');
        if (cepStatus && cepInput) {
            new MutationObserver(() => {
                if (cepStatus.classList.contains('cep-ok')) {
                    setState(cepInput, 'ok');
                    ['cust-rua', 'cust-bairro', 'cust-cidade'].forEach(id => { const el = document.getElementById(id); if (el && el.value) check(el, false); });
                } else if (cepStatus.classList.contains('cep-error')) setState(cepInput, 'bad', cepStatus.textContent.replace(/^✗\s*/, ''));
                updateSteps();
            }).observe(cepStatus, { attributes: true, childList: true, characterData: true, subtree: true });
        }

        /* Progresso das etapas no cabeçalho */
        const header = $('.checkout-header', overlay);
        let steps = null;
        if (header) {
            steps = document.createElement('ol');
            steps.className = 'co-steps';
            steps.setAttribute('aria-label', 'Progresso do pagamento');
            steps.innerHTML = [
                ['Seus dados', 'data'], ['Entrega', 'ship'], ['Pagamento', 'pay']
            ].map(([t, k], i) => `<li data-step="${k}"><span class="n">${i + 1}</span>${t}</li>`).join('');
            header.appendChild(steps);
        }

        const PERSONAL = ['cust-nome', 'cust-cpf', 'cust-email', 'cust-whatsapp'];
        const ADDRESS = ['cust-cep', 'cust-rua', 'cust-numero', 'cust-bairro', 'cust-cidade'];
        const CARD = ['cc-number', 'cc-name', 'cc-exp', 'cc-csc'];
        const silentOk = id => { const el = document.getElementById(id); return !!el && !!RULES[id] && RULES[id][0](el.value); };
        const frac = ids => ids.filter(silentOk).length / ids.length;

        function updateSteps() {
            if (!steps) return;
            const pData = frac(PERSONAL);
            const shipChosen = !!$('.ship-card.selected', overlay);
            const cepOk = cepStatus && cepStatus.classList.contains('cep-ok');
            const pShip = (frac(ADDRESS) * 0.7) + (shipChosen && cepOk ? 0.3 : 0);
            const cardMode = $('#credit-card-form') && !$('#credit-card-form').hidden;
            // PIX não pede nada além da escolha; só "fecha" a etapa quando as anteriores fecharam
            const prevDone = pData >= 0.999 && pShip >= 0.999;
            const pPay = cardMode ? frac(CARD) : ($('.pay-method.selected', overlay) ? (prevDone ? 1 : 0.5) : 0);
            [[pData, 'data'], [pShip, 'ship'], [pPay, 'pay']].forEach(([p, k]) => {
                const li = steps.querySelector(`[data-step="${k}"]`);
                li.style.setProperty('--p', p.toFixed(3));
                li.classList.toggle('done', p >= 0.999);
            });
        }

        overlay.addEventListener('click', e => {
            if (e.target.closest('.ship-card, .pay-method')) setTimeout(updateSteps, 30);
        });
        new MutationObserver(() => { if (overlay.classList.contains('active')) updateSteps(); })
            .observe(overlay, { attributes: true, attributeFilter: ['class'] });

        /* Mensagem geral acima/abaixo do botão (para erros sem campo) */
        const payBtn = $('#pay-mp');
        let msgBox = null;
        if (payBtn) {
            msgBox = document.createElement('div');
            msgBox.className = 'co-message';
            msgBox.setAttribute('role', 'alert');
            payBtn.insertAdjacentElement('afterend', msgBox);
        }
        let msgTimer = 0;
        function showMessage(msg) {
            if (!msgBox) return alert(msg);
            msgBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span></span>`;
            msgBox.querySelector('span').textContent = msg;
            msgBox.classList.add('show');
            clearTimeout(msgTimer);
            msgTimer = setTimeout(() => msgBox.classList.remove('show'), 6000);
        }

        // Total pisca quando muda (frete escolhido, etc.)
        const summary = $('#order-summary');
        if (summary) {
            let lastTotal = '';
            new MutationObserver(() => {
                const t = $('.summary-total', summary);
                if (!t) return;
                const txt = t.textContent;
                if (lastTotal && txt !== lastTotal) { t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); }
                lastTotal = txt;
            }).observe(summary, { childList: true, subtree: true });
        }

        /* API usada pelo script.js no lugar do alert() */
        window.BollaForm = {
            error(msg, el) {
                if (el && el.closest && el.closest('.form-group')) {
                    setState(el, 'bad', msg);
                    const g = el.closest('.form-group');
                    g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
                    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
                    setTimeout(() => el.focus({ preventScroll: true }), reduceMotion ? 0 : 350);
                } else {
                    showMessage(msg);
                    if (el && el.focus) el.focus();
                }
                updateSteps();
            }
        };
    }
})();
