/* ============================================================
   BOLLADINHO — Front-end
   Pedidos, estoque e comentários vêm da API do servidor (server.js).
   Pagamento: Mercado Pago Checkout Pro (PIX, cartão, boleto).
   ============================================================ */

/* Base da API: vazio = mesmo servidor. No GitHub Pages o config.js pode apontar
   para o servidor no Render (window.BOLLA_API); sem isso a loja roda em modo
   vitrine: o checkout funciona igual, mas o pedido é concluído pelo WhatsApp. */
const API = String(window.BOLLA_API || '').replace(/\/+$/, '');
const STATIC_HOST = /\.github\.io$/.test(location.hostname);
const OFFLINE = STATIC_HOST && !API;
const WHATSAPP = '5561995636229';

document.addEventListener('DOMContentLoaded', () => {

    const formatBRL = v => `R$ ${v.toFixed(2).replace('.', ',')}`;

    /* ---------------- Navbar ---------------- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.9);
    }, { passive: true });

    // Menu mobile (hamburger)
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = navLinks.classList.contains('open')
                ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        }));
    }

    /* ---------------- Scroll reveal ---------------- */
    const revealFunction = () => {
        const windowHeight = window.innerHeight;
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealFunction, { passive: true });
    revealFunction();

    /* ---------------- Parallax ---------------- */
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        parallaxBgs.forEach(bg => {
            bg.style.transform = `translate3d(0, ${scrolled * 0.4}px, 0)`;
        });
    }, { passive: true });

    /* ---------------- Folhas de bambu caindo ---------------- */
    const particleContainer = document.getElementById('particles-container');
    if (particleContainer) {
        const prefersReduced = false; // animações sempre ativas, mesmo com "reduzir movimento" do SO
        const isMobile = window.innerWidth < 768;
        const leafCount = prefersReduced ? 0 : (isMobile ? 8 : 16);
        const leafColors = ['#4A7A5B', '#6B9C58', '#8FBC6F', '#D4C3A3'];

        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            const size = Math.random() * 14 + 10;
            const color = leafColors[Math.floor(Math.random() * leafColors.length)];
            leaf.innerHTML = `
                <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 21 C3 13 8 5 22 2 C20 12 13 19 2 21 Z" fill="${color}" fill-opacity="0.55"/>
                    <path d="M4 19 C9 15 15 9 20 4" stroke="${color}" stroke-opacity="0.7" stroke-width="0.6"/>
                </svg>`;
            leaf.style.left = `${Math.random() * 100}vw`;
            leaf.style.animationDuration = `${Math.random() * 12 + 10}s`;
            leaf.style.animationDelay = `-${Math.random() * 20}s`;
            leaf.style.setProperty('--sway-duration', `${Math.random() * 2 + 2.5}s`);
            leaf.style.setProperty('--drift', `${Math.random() * 200 - 100}px`);
            particleContainer.appendChild(leaf);
        }

        const sporeCount = prefersReduced ? 0 : (isMobile ? 6 : 12);
        for (let i = 0; i < sporeCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const s = Math.random() * 3 + 2;
            p.style.width = `${s}px`;
            p.style.height = `${s}px`;
            p.style.left = `${Math.random() * 100}vw`;
            p.style.animationDuration = `${Math.random() * 20 + 15}s`;
            p.style.animationDelay = `-${Math.random() * 20}s`;
            particleContainer.appendChild(p);
        }

        /* As folhas só aparecem do hero para baixo: fade conforme o scroll passa do hero */
        const heroSection = document.querySelector('.hero');
        const updateParticlesVisibility = () => {
            const threshold = (heroSection ? heroSection.offsetHeight : window.innerHeight) * 0.55;
            particleContainer.classList.toggle('particles-visible', window.scrollY > threshold);
        };
        window.addEventListener('scroll', updateParticlesVisibility, { passive: true });
        updateParticlesVisibility();
    }

    /* ---------------- Produtos (preço e estoque do servidor) ---------------- */
    let productsCache = [];
    const pricingGrid = document.querySelector('.pricing-grid');
    if (pricingGrid) {
        fetch(API + '/api/products')
            .then(r => r.json())
            .then(products => {
                productsCache = products;
                products.forEach(p => {
                    const card = pricingGrid.querySelector(`[data-product-id="${p.id}"]`);
                    if (!card) return;
                    const priceEl = card.querySelector('.price-amount');
                    const reais = Math.floor(p.price);
                    const cents = Math.round((p.price - reais) * 100).toString().padStart(2, '0');
                    priceEl.innerHTML = `<span class="currency">R$</span>${reais}<span class="cents">,${cents}</span>`;
                    const btn = card.querySelector('.add-to-cart-btn');
                    const stockNote = card.querySelector('.stock-note');
                    if (p.stock <= 0) {
                        btn.classList.add('btn-disabled');
                        btn.innerHTML = 'Esgotado';
                        if (stockNote) {
                            /* "sem estoque" e "restam poucas" são mensagens opostas
                               e dividiam a mesma cor; a classe separa as duas */
                            stockNote.classList.add('is-out');
                            stockNote.textContent = 'Sem estoque no momento';
                        }
                    } else if (p.stock <= 10 && stockNote) {
                        stockNote.classList.remove('is-out');
                        stockNote.textContent = `Restam apenas ${p.stock} unidades!`;
                    }
                });
            })
            .catch(() => { /* servidor offline: mantém preços estáticos do HTML */ });
    }

    /* ---------------- Carrinho (com persistência) ---------------- */
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartIconBtn = document.getElementById('cart-icon-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCountBadge = document.getElementById('cart-count');

    let cart = [];
    try {
        const stored = JSON.parse(localStorage.getItem('bolla_cart'));
        if (Array.isArray(stored)) {
            cart = stored.filter(i => i && i.id && typeof i.price === 'number' && Number.isInteger(i.qty) && i.qty > 0);
        }
    } catch (e) { cart = []; }

    const saveCart = () => localStorage.setItem('bolla_cart', JSON.stringify(cart));
    const cartTotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    function openCart() { if (cartOverlay) cartOverlay.classList.add('active'); }
    function closeCart() { if (cartOverlay) cartOverlay.classList.remove('active'); }

    if (cartIconBtn) cartIconBtn.addEventListener('click', e => { e.preventDefault(); openCart(); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) closeCart(); });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            if (btn.classList.contains('btn-disabled')) return;
            const card = btn.closest('[data-product-id]');
            const id = card ? card.dataset.productId : btn.dataset.id;
            const name = btn.getAttribute('data-name');
            const serverProduct = productsCache.find(p => p.id === id);
            const price = serverProduct ? serverProduct.price : parseFloat(btn.getAttribute('data-price'));
            const existing = cart.find(i => i.id === id);
            if (existing) existing.qty++;
            else cart.push({ id, name, price, qty: 1 });
            saveCart();
            updateCartUI();
            openCart();
        });
    });

    function updateCartUI() {
        if (cartCountBadge) {
            const count = cart.reduce((s, i) => s + i.qty, 0);
            cartCountBadge.textContent = count;
            cartCountBadge.style.display = count > 0 ? 'flex' : 'none';
        }
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <span class="cart-empty-ico"><i class="fa-solid fa-leaf"></i></span>
                    <p class="cart-empty-msg">Seu carrinho está vazio.</p>
                    <a href="#comprar" class="btn btn-outline btn-sm cart-shop-link">Escolher minha caixa</a>
                </div>`;
        } else {
            cart.forEach(item => {
                const el = document.createElement('div');
                el.classList.add('cart-item');
                el.innerHTML = `
                    <span class="cart-item-ico" aria-hidden="true"><i class="fa-solid fa-leaf"></i></span>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatBRL(item.price)}${item.qty > 1 ? ` <small>· ${formatBRL(item.price * item.qty)}</small>` : ''}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Diminuir"><i class="fa-solid fa-minus"></i></button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar"><i class="fa-solid fa-plus"></i></button>
                    </div>`;
                cartItemsContainer.appendChild(el);
            });
        }
        if (cartTotalPrice) cartTotalPrice.textContent = formatBRL(cartTotal());
    }

    // Delegação de eventos: um único listener resolve os botões +/- de forma confiável
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', e => {
            if (e.target.closest('.cart-shop-link')) {
                e.preventDefault(); closeCart();
                const t = document.getElementById('comprar');
                if (t) setTimeout(() => window.__lenis ? (window.__lenis.start(), window.__lenis.scrollTo(t, { offset: -110 })) : t.scrollIntoView({ behavior: 'smooth' }), 80);
                return;
            }
            const btn = e.target.closest('.qty-btn');
            if (!btn) return;
            e.preventDefault();
            const item = cart.find(i => i.id === btn.dataset.id);
            if (!item) return;
            if (btn.dataset.action === 'increase') {
                const sp = productsCache.find(p => p.id === item.id);
                if (sp && item.qty >= sp.stock) {
                    btn.title = 'Estoque máximo atingido';
                    return;
                }
                item.qty++;
            } else {
                item.qty--;
                if (item.qty <= 0) cart = cart.filter(i => i.id !== item.id);
            }
            saveCart();
            updateCartUI();
        });
    }

    /* ---------------- Checkout (formulário completo) ---------------- */
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cepValidated = false;
    let shipSel = null; // forma de entrega escolhida (objeto vindo de /api/frete)

    function openCheckout() {
        if (!checkoutOverlay) return;
        closeCart();
        renderOrderSummary();
        checkoutOverlay.classList.add('active');
    }
    function closeCheckout() { if (checkoutOverlay) checkoutOverlay.classList.remove('active'); }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) { alert('Seu carrinho está vazio!'); return; }
            openCheckout();
        });
    }

    function renderOrderSummary() {
        const box = document.getElementById('order-summary');
        if (!box) return;
        let html = '';
        cart.forEach(i => {
            html += `
                <div class="summary-item">
                    <div class="summary-item-icon"><i class="fa-solid fa-leaf"></i></div>
                    <div class="summary-item-info">
                        <strong>${i.name}</strong>
                        <small>Qtd: ${i.qty}</small>
                    </div>
                    <span class="summary-item-price">${formatBRL(i.price * i.qty)}</span>
                </div>`;
        });
        const freteCost = shipSel && typeof shipSel.price === 'number' ? shipSel.price : 0;
        const freteLabel = !shipSel ? 'A calcular'
            : (shipSel.priceLabel || (shipSel.price > 0 ? formatBRL(shipSel.price) : 'Grátis'));
        html += `<div class="summary-row summary-shipping"><span>Subtotal</span><span>${formatBRL(cartTotal())}</span></div>`;
        html += `<div class="summary-row summary-shipping"><span><i class="fa-solid fa-truck-fast"></i> Frete${shipSel ? ' · ' + shipSel.name : ''}</span><span>${freteLabel}</span></div>`;
        html += `<div class="summary-row summary-total"><span>Total</span><span>${formatBRL(cartTotal() + freteCost)}</span></div>`;
        box.innerHTML = html;
    }

    /* CPF: validação real com dígitos verificadores */
    function isValidCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        for (const len of [9, 10]) {
            let sum = 0;
            for (let i = 0; i < len; i++) sum += parseInt(cpf[i]) * (len + 1 - i);
            if (((sum * 10) % 11) % 10 !== parseInt(cpf[len])) return false;
        }
        return true;
    }

    if (checkoutOverlay) {
        document.getElementById('close-checkout').addEventListener('click', closeCheckout);
        checkoutOverlay.addEventListener('click', e => { if (e.target === checkoutOverlay) closeCheckout(); });

        /* Máscaras de CPF e telefone */
        const cpfInput = document.getElementById('cust-cpf');
        cpfInput.addEventListener('input', () => {
            const v = cpfInput.value.replace(/\D/g, '').slice(0, 11);
            cpfInput.value = v
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        });

        const phoneInput = document.getElementById('cust-whatsapp');
        phoneInput.addEventListener('input', () => {
            const v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 10) phoneInput.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
            else if (v.length > 6) phoneInput.value = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
            else if (v.length > 2) phoneInput.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
            else phoneInput.value = v;
        });

        /* Forma de entrega: calculada na SuperFrete quando o CEP é validado */
        const shippingHint = document.getElementById('shipping-hint');
        const shippingOptions = document.getElementById('shipping-options');
        const shippingLoading = document.getElementById('shipping-loading');
        function setShippingAvailable(ok) {
            if (shippingHint) shippingHint.hidden = ok;
            if (shippingOptions) shippingOptions.hidden = !ok;
            if (!ok) {
                shipSel = null;
                if (shippingLoading) shippingLoading.hidden = true;
                if (shippingOptions) shippingOptions.innerHTML = '';
            }
        }

        // Ícone, cor e selo por transportadora (visual estilo imagem de referência)
        const SHIP_STYLE = {
            // Tons da mata: cada transportadora ganha um verde próprio (musgo → menta)
            1:  { icon: 'fa-truck',         color: '#74c08e', badge: 'Econômico' },
            2:  { icon: 'fa-truck-fast',    color: '#4aa168', badge: 'Expresso' },
            3:  { icon: 'fa-boxes-stacked', color: '#8fbf6a', badge: 'Transportadora' },
            17: { icon: 'fa-box',           color: '#5fb3a0', badge: 'Compacto' },
            31: { icon: 'fa-paper-plane',   color: '#a9dcb7', badge: 'Ágil' },
            motoboy: { icon: 'fa-motorcycle', color: '#33844f', badge: 'Imediato' },
            retirar: { icon: 'fa-store',      color: '#fec81d', badge: 'Retirada' },
            combinar: { icon: 'fa-comments', color: '#74c08e', badge: 'Via WhatsApp' },
        };
        const shipDeadline = o => o.note ? o.note
            : (!o.days ? 'Prazo sob consulta' : `em até ${o.days} ${o.days === 1 ? 'dia útil' : 'dias úteis'}`);
        function shipPriceHtml(o) {
            if (o.priceLabel) return `<span class="ship-price ${o.price === 0 ? 'free' : 'tbd'}">${o.priceLabel}</span>`;
            if (o.price === 0) return `<span class="ship-price free">Grátis</span>`;
            return `<span class="ship-price">${formatBRL(o.price)}</span>`;
        }
        function renderShipOptions(options) {
            shippingOptions.innerHTML = options.map(o => {
                const st = SHIP_STYLE[o.id] || { icon: 'fa-truck', color: 'var(--color-secondary)', badge: o.company || '' };
                return `
                <label class="ship-card" data-id="${o.id}" style="--c:${st.color}">
                    <input type="radio" name="shipping" value="${o.id}">
                    <span class="ship-radio"></span>
                    <span class="ship-ico"><i class="fa-solid ${st.icon}"></i></span>
                    <span class="ship-info">
                        <span class="ship-name">${o.name}${st.badge ? `<span class="ship-badge">${st.badge}</span>` : ''}</span>
                        <span class="ship-sub"><i class="fa-regular fa-clock"></i> ${shipDeadline(o)}</span>
                    </span>
                    ${shipPriceHtml(o)}
                </label>`;
            }).join('');
            shippingOptions.querySelectorAll('.ship-card').forEach(card => {
                card.addEventListener('click', () => {
                    shipSel = options.find(o => String(o.id) === card.dataset.id) || null;
                    shippingOptions.querySelectorAll('.ship-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    const radio = card.querySelector('input'); if (radio) radio.checked = true;
                    renderOrderSummary();
                    refreshInstallments(); // parcelas recalculam sobre o total com frete
                });
            });
        }
        async function loadShipping(cep) {
            shipSel = null;
            if (shippingHint) shippingHint.hidden = true;
            if (shippingOptions) { shippingOptions.hidden = true; shippingOptions.innerHTML = ''; }
            if (shippingLoading) shippingLoading.hidden = false;
            if (OFFLINE) {
                // sem servidor não há cotação: o valor do frete é combinado no WhatsApp
                renderShipOptions([{ id: 'combinar', name: 'Envio para todo o Brasil', priceLabel: 'A combinar', price: 0, note: 'Correios ou transportadora — valor enviado no WhatsApp' }]);
                if (shippingLoading) shippingLoading.hidden = true;
                if (shippingOptions) shippingOptions.hidden = false;
                const first = shippingOptions.querySelector('.ship-card');
                if (first) first.click();
                return;
            }
            try {
                const res = await fetch(API + '/api/frete', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cep })
                });
                const data = await res.json();
                if (!res.ok || data.erro || !Array.isArray(data.options) || !data.options.length) throw new Error();
                renderShipOptions(data.options);
                if (shippingLoading) shippingLoading.hidden = true;
                if (shippingOptions) shippingOptions.hidden = false;
                renderOrderSummary();
            } catch (e) {
                if (shippingLoading) shippingLoading.hidden = true;
                if (shippingHint) shippingHint.hidden = false;
            }
        }

        /* CEP: busca automática ao digitar 8 dígitos, obrigatório e verificado no ViaCEP */
        const cepInput = document.getElementById('cust-cep');
        const cepStatus = document.getElementById('cep-status');
        let cepTimer = null;

        async function lookupCep() {
            const cep = cepInput.value.replace(/\D/g, '');
            cepValidated = false;
            setShippingAvailable(false);
            if (cep.length !== 8) {
                cepStatus.textContent = 'Preencha para liberar as formas de entrega.';
                cepStatus.className = 'cep-status';
                return;
            }
            cepStatus.textContent = 'Buscando endereço...';
            cepStatus.className = 'cep-status';
            try {
                let data;
                if (OFFLINE) {
                    const v = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
                    data = v.erro ? { erro: true } : { rua: v.logradouro, bairro: v.bairro, cidade: v.localidade, uf: v.uf };
                } else {
                    const res = await fetch(API + `/api/cep?cep=${cep}`);
                    data = await res.json();
                }
                if (data.erro) {
                    cepStatus.textContent = '✗ ' + (data.msg || 'CEP não encontrado. Verifique o número digitado.');
                    cepStatus.className = 'cep-status cep-error';
                    return;
                }
                document.getElementById('cust-rua').value = data.rua || '';
                document.getElementById('cust-bairro').value = data.bairro || '';
                document.getElementById('cust-cidade').value = data.cidade || '';
                document.getElementById('cust-uf').value = data.uf || '';
                cepValidated = true;
                loadShipping(cep);
                cepStatus.textContent = `✓ CEP válido — ${data.cidade}/${data.uf}`;
                cepStatus.className = 'cep-status cep-ok';
                document.getElementById('cust-numero').focus();
            } catch (e) {
                cepStatus.textContent = '✗ Falha ao consultar o CEP. Verifique sua conexão.';
                cepStatus.className = 'cep-status cep-error';
            }
        }

        cepInput.addEventListener('input', () => {
            // Máscara 00000-000
            let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
            cepInput.value = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
            clearTimeout(cepTimer);
            cepTimer = setTimeout(lookupCep, 350);
        });
        cepInput.addEventListener('blur', lookupCep);

        if (OFFLINE) {
            const note = document.querySelector('#pay-method-note p');
            if (note) note.textContent = 'Ao finalizar, seu pedido vai direto para o nosso WhatsApp e enviamos na hora a chave PIX / QR Code para pagamento.';
            const cf = document.getElementById('credit-card-form');
            if (cf && !cf.querySelector('.offline-card-note')) cf.insertAdjacentHTML('afterbegin', '<p class="offline-card-note"><i class="fa-solid fa-shield-halved"></i> Os dados do cartão não saem do seu aparelho. Ao finalizar, enviamos pelo WhatsApp um link de pagamento seguro do Mercado Pago.</p>');
        }

        /* Forma de pagamento: PIX (redireciona) ou Cartão (preenchido aqui mesmo) */
        const payNoteBox = document.getElementById('pay-method-note');
        const cardForm = document.getElementById('credit-card-form');
        let payMethod = 'pix';

        function selectPaymentMethod(method) {
            payMethod = method;
            checkoutOverlay.querySelectorAll('.pay-method').forEach(c => {
                const on = c.dataset.method === method;
                c.classList.toggle('selected', on);
                const radio = c.querySelector('input');
                if (radio) radio.checked = on;
            });
            const isCard = method === 'cartao';
            if (payNoteBox) payNoteBox.hidden = isCard;
            if (cardForm) cardForm.hidden = !isCard;
            if (isCard) refreshInstallments();
        }
        checkoutOverlay.querySelectorAll('.pay-method').forEach(card => {
            card.addEventListener('click', () => selectPaymentMethod(card.dataset.method));
        });

        /* --- Cartão animado + máscaras + bandeira --- */
        const ccNum = document.getElementById('cc-number');
        const ccName = document.getElementById('cc-name');
        const ccExp = document.getElementById('cc-exp');
        const ccCsc = document.getElementById('cc-csc');
        const animatedCard = document.getElementById('animatedCreditCard');
        const cardNumDisplay = document.getElementById('cardNumDisplay');
        const cardNameDisplay = document.getElementById('cardNameDisplay');
        const cardExpDisplay = document.getElementById('cardExpDisplay');
        const cardCscDisplay = document.getElementById('cardCscDisplay');
        const cardBrandLogo = document.getElementById('cardBrandLogo');
        const installmentsSelect = document.getElementById('installmentsSelect');

        /* Chave pública do Mercado Pago (para tokenizar o cartão no navegador) */
        let mpPublicKey = '';
        fetch(API + '/api/config').then(r => r.json()).then(c => { mpPublicKey = c.publicKey || ''; }).catch(() => {});

        // Algoritmo de Luhn: pega número digitado errado antes de enviar ao banco
        function luhnCheck(num) {
            const d = String(num).replace(/\D/g, '');
            if (d.length < 13 || d.length > 19) return false;
            let sum = 0, dbl = false;
            for (let i = d.length - 1; i >= 0; i--) {
                let n = +d[i];
                if (dbl) { n *= 2; if (n > 9) n -= 9; }
                sum += n; dbl = !dbl;
            }
            return sum % 10 === 0;
        }

        const cardIssuer = document.getElementById('cardIssuer');

        // Gradiente por bandeira (aplicado assim que a bandeira é identificada)
        const BRAND_GRAD = {
            visa: 'linear-gradient(135deg, #1a1f71, #2e5bd8)',
            master: 'linear-gradient(135deg, #232526, #414345)',
            elo: 'linear-gradient(135deg, #101010, #363636)',
            amex: 'linear-gradient(135deg, #2e77bb, #153e63)',
            hiper: 'linear-gradient(135deg, #8b1f24, #4a0d10)',
            diners: 'linear-gradient(135deg, #2e6da4, #14324d)'
        };
        // Emissores por BIN (6 dígitos) — melhor esforço; cor + nome do banco
        const CARD_ISSUERS = [
            { name: 'Nubank', grad: 'linear-gradient(135deg, #a020f0, #5b0e8b 55%, #2d0745)', bins: ['516292', '519252', '527571', '529970', '531681', '536968', '544731', '552245', '555835', '438935', '498441'] },
            { name: 'Inter', grad: 'linear-gradient(135deg, #ff8a00, #e64a00)', bins: ['636117', '627780'] },
            { name: 'C6 Bank', grad: 'linear-gradient(135deg, #3a3a3a, #000000)', bins: ['549116', '552168'] },
            { name: 'Itaú', grad: 'linear-gradient(135deg, #ff8c1a, #003399)', bins: ['514868', '552138'] },
            { name: 'Bradesco', grad: 'linear-gradient(135deg, #e11931, #7a0018)', bins: ['523498', '548129'] },
            { name: 'Santander', grad: 'linear-gradient(135deg, #ec0000, #8b0000)', bins: ['549663', '540510'] },
            { name: 'Banco do Brasil', grad: 'linear-gradient(135deg, #0038a8, #f8d117)', bins: ['550209', '422051'] },
            { name: 'Caixa', grad: 'linear-gradient(135deg, #0070c0, #f39200)', bins: ['506699'] },
            { name: 'Mercado Pago', grad: 'linear-gradient(135deg, #00b1ea, #0068c9)', bins: ['501105'] },
            { name: 'PicPay', grad: 'linear-gradient(135deg, #11c76f, #0a8f4f)', bins: ['507860'] }
        ];

        // Cor + nome por EMISSOR real (nome vem do Mercado Pago = confiável, cobre qualquer banco).
        // Fonte da verdade; o CARD_ISSUERS acima é só o palpite instantâneo enquanto o MP não responde.
        const ISSUER_COLORS = [
            { re: /nu.?bank|nubank/i,   grad: 'linear-gradient(135deg, #a020f0, #6a0dad 55%, #3a0764)', label: 'Nubank' },
            { re: /picpay/i,            grad: 'linear-gradient(135deg, #21c25e, #0a8f4f)',              label: 'PicPay' },
            { re: /\bc6\b|c6 ?bank/i,   grad: 'linear-gradient(135deg, #3a3a3a, #0a0a0a)',              label: 'C6 Bank' },
            { re: /inter/i,             grad: 'linear-gradient(135deg, #ff7a00, #e64a00)',              label: 'Inter' },
            { re: /ita[uú]/i,           grad: 'linear-gradient(135deg, #ec7000, #003399)',              label: 'Itaú' },
            { re: /bradesco/i,          grad: 'linear-gradient(135deg, #e11931, #7a0018)',              label: 'Bradesco' },
            { re: /santander/i,         grad: 'linear-gradient(135deg, #ec0000, #8b0000)',              label: 'Santander' },
            { re: /brasil|\bbb\b/i,     grad: 'linear-gradient(135deg, #0038a8, #f8d117)',              label: 'Banco do Brasil' },
            { re: /caixa/i,             grad: 'linear-gradient(135deg, #0070c0, #f39200)',              label: 'Caixa' },
            { re: /mercado ?pago|mp/i,  grad: 'linear-gradient(135deg, #00b1ea, #0068c9)',              label: 'Mercado Pago' },
            { re: /neon/i,              grad: 'linear-gradient(135deg, #00e0d0, #0075e0)',              label: 'Neon' },
            { re: /next/i,              grad: 'linear-gradient(135deg, #00ff5f, #009a3e)',              label: 'Next' },
            { re: /\bpan\b/i,           grad: 'linear-gradient(135deg, #00a0df, #004b8d)',              label: 'Banco Pan' },
            { re: /original/i,          grad: 'linear-gradient(135deg, #00a859, #005c30)',              label: 'Original' },
            { re: /btg/i,               grad: 'linear-gradient(135deg, #1b3a5c, #0a1a2c)',              label: 'BTG' },
            { re: /digio/i,             grad: 'linear-gradient(135deg, #0a3cff, #0026a8)',              label: 'Digio' },
            { re: /will/i,              grad: 'linear-gradient(135deg, #ffd400, #e0a800)',              label: 'Will Bank' },
        ];
        const issuerColorByName = name => (name ? ISSUER_COLORS.find(x => x.re.test(name)) : null) || null;

        function detectBrand(number) {
            const c = number.replace(/\D/g, '');
            const mc = '<span class="mc"><span></span><span></span></span>';
            let brand;
            if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|6504|6505|6516|6550)/.test(c))
                brand = { id: 'elo', logo: '<span class="elo">elo</span>' };
            else if (/^(606282|3841)/.test(c)) brand = { id: 'hiper', logo: '<span class="hiper">Hipercard</span>' };
            else if (/^4/.test(c)) brand = { id: 'visa', logo: '<span class="visa">VISA</span>' };
            else if (/^5[1-5]/.test(c) || /^2[2-7]/.test(c)) brand = { id: 'master', logo: mc };
            else if (/^3[47]/.test(c)) brand = { id: 'amex', logo: '<span class="amex">AMEX</span>' };
            else if (/^(30[0-5]|36|38|39)/.test(c)) brand = { id: 'diners', logo: '<span class="diners">Diners</span>' };
            else brand = { id: 'visa', logo: '<i class="fa-solid fa-credit-card"></i>' };

            let issuer = '', grad = c.length >= 1 ? (BRAND_GRAD[brand.id] || '') : '';
            if (c.length >= 6) {
                const bin6 = c.slice(0, 6);
                const found = CARD_ISSUERS.find(is => is.bins.includes(bin6));
                if (found) { issuer = found.name; grad = found.grad; }
            }
            return { id: brand.id, logo: brand.logo, issuer, grad };
        }

        if (ccNum) {
            ccNum.addEventListener('input', () => {
                let v = ccNum.value.replace(/\D/g, '').slice(0, 16);
                ccNum.value = v.replace(/(\d{4})/g, '$1 ').trim();
                cardNumDisplay.textContent = ccNum.value || '•••• •••• •••• ••••';
                const info = detectBrand(v);
                cardBrandLogo.innerHTML = info.logo;
                // Cor do cartão conforme banco/bandeira
                if (info.grad) animatedCard.style.setProperty('--card-bg', info.grad);
                else animatedCard.style.removeProperty('--card-bg');
                // Nome do emissor
                if (cardIssuer) {
                    cardIssuer.textContent = info.issuer || '';
                    cardIssuer.classList.toggle('show', !!info.issuer);
                }
                // Pulso na bandeira ao mudar
                cardBrandLogo.classList.remove('brand-pop');
                void cardBrandLogo.offsetWidth;
                cardBrandLogo.classList.add('brand-pop');
                // Brilho+glow varrendo o cartão uma vez quando a bandeira é RECONHECIDA (muda)
                if (v.length >= 4 && info.id !== ccNum._brand) {
                    ccNum._brand = info.id;
                    animatedCard.classList.remove('recognized');
                    void animatedCard.offsetWidth;
                    animatedCard.classList.add('recognized');
                } else if (v.length < 4) {
                    ccNum._brand = '';
                }
                clearTimeout(ccNum._t);
                ccNum._t = setTimeout(refreshInstallments, 500);
            });
        }
        if (ccName) {
            ccName.addEventListener('input', () => {
                ccName.value = ccName.value.toUpperCase().replace(/[^A-ZÀ-Ú\s]/g, '').slice(0, 26);
                cardNameDisplay.textContent = ccName.value || 'NOME IMPRESSO';
            });
        }
        if (ccExp) {
            ccExp.addEventListener('input', () => {
                let v = ccExp.value.replace(/\D/g, '').slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                ccExp.value = v;
                cardExpDisplay.textContent = v || 'MM/AA';
            });
        }
        if (ccCsc) {
            ccCsc.addEventListener('input', () => {
                ccCsc.value = ccCsc.value.replace(/\D/g, '').slice(0, 4);
                cardCscDisplay.textContent = ccCsc.value || '•••';
            });
            ccCsc.addEventListener('focus', () => animatedCard && animatedCard.classList.add('flipped'));
            ccCsc.addEventListener('blur', () => animatedCard && animatedCard.classList.remove('flipped'));
        }

        /* Parcelas reais do emissor (o que aparece é o que o banco cobra) */
        let lastInstallmentsKey = '';
        let cardPaymentMethodId = '';
        async function refreshInstallments() {
            if (!installmentsSelect) return;
            const amount = cartTotal() + (shipSel && typeof shipSel.price === 'number' ? shipSel.price : 0);
            const bin = ccNum ? ccNum.value.replace(/\D/g, '').slice(0, 6) : '';
            if (!amount) return;
            if (bin.length < 6) {
                installmentsSelect.innerHTML = `<option value="1">1x de ${formatBRL(amount)} à vista</option>`;
                return;
            }
            if (OFFLINE) return; // parcelas reais vêm do Mercado Pago, via servidor
            const key = bin + '|' + amount.toFixed(2);
            if (key === lastInstallmentsKey) return;
            lastInstallmentsKey = key;
            try {
                const r = await fetch(API + `/api/checkout/installments?bin=${bin}&amount=${amount}`);
                const d = await r.json();
                if (d && d.ok) {
                    cardPaymentMethodId = d.paymentMethodId || '';
                    if (Array.isArray(d.installments) && d.installments.length) {
                        installmentsSelect.innerHTML = d.installments
                            .map(o => `<option value="${o.installments}">${o.message}</option>`).join('');
                    }
                    // Emissor real do MP → cor + nome autoritativos (cobre bancos fora da lista local)
                    const ic = issuerColorByName(d.issuer);
                    if (ic && animatedCard) {
                        animatedCard.style.setProperty('--card-bg', ic.grad);
                        if (cardIssuer) { cardIssuer.textContent = ic.label; cardIssuer.classList.add('show'); }
                    }
                }
            } catch (e) { lastInstallmentsKey = ''; }
        }

        /* Finalizar Compra: valida dados; PIX redireciona, Cartão paga aqui mesmo */
        const payBtn = document.getElementById('pay-mp');
        // Erro inline (enhance.js) em vez de alert(); alert só se a camada não carregou
        const invalid = (msg, el) => {
            if (window.BollaForm) return window.BollaForm.error(msg, el);
            alert(msg); if (el) el.focus();
        };

        function collectCustomer() {
            const nome = document.getElementById('cust-nome').value.trim();
            const cpf = cpfInput.value.replace(/\D/g, '');
            const email = document.getElementById('cust-email').value.trim();
            const zap = phoneInput.value.trim();
            const cep = cepInput.value.replace(/\D/g, '');
            const numero = document.getElementById('cust-numero').value.trim();

            if (nome.length < 3) { invalid('Por favor, informe seu nome completo.', document.getElementById('cust-nome')); return null; }
            if (!isValidCPF(cpf)) { invalid('Informe um CPF válido.', cpfInput); return null; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { invalid('Informe um e-mail válido.', document.getElementById('cust-email')); return null; }
            if (zap.replace(/\D/g, '').length < 10) { invalid('Informe um telefone/WhatsApp válido com DDD.', phoneInput); return null; }
            if (cep.length !== 8) { invalid('O CEP é obrigatório (8 dígitos).', cepInput); return null; }
            if (!cepValidated) { invalid('Aguarde a validação do CEP ou corrija o número — o CEP precisa existir de verdade.', cepInput); return null; }
            if (!numero) { invalid('Informe o número do endereço.', document.getElementById('cust-numero')); return null; }

            return {
                nome, cpf, email, whatsapp: zap, cep, numero,
                rua: document.getElementById('cust-rua').value.trim(),
                complemento: document.getElementById('cust-complemento').value.trim(),
                bairro: document.getElementById('cust-bairro').value.trim(),
                cidade: document.getElementById('cust-cidade').value.trim(),
                uf: document.getElementById('cust-uf').value.trim()
            };
        }

        const items = () => cart.map(i => ({ id: i.id, qty: i.qty }));

        async function payWithPix(customer, restore) {
            const res = await fetch(API + '/api/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer, items: items(), shipping: { id: shipSel.id } })
            });
            const data = await res.json();
            if (!res.ok || data.erro) throw new Error(data.msg || 'Falha ao criar o pedido.');
            localStorage.setItem('bolla_last_order', data.orderId);
            cart = []; saveCart(); updateCartUI();
            window.location.href = data.initPoint;
        }

        async function payWithCard(customer, restore) {
            const rawNum = ccNum.value.replace(/\s/g, '');
            const name = ccName.value.trim();
            const exp = ccExp.value;
            const csc = ccCsc.value;

            if (!luhnCheck(rawNum)) { restore(); return invalid('O número do cartão parece incorreto. Confira os dígitos.', ccNum); }
            if (name.length < 2) { restore(); return invalid('Informe o nome impresso no cartão.', ccName); }
            const [mm, yy] = exp.split('/');
            const month = parseInt(mm, 10), year = parseInt('20' + (yy || ''), 10);
            const now = new Date();
            if (!(month >= 1 && month <= 12) || isNaN(year)) { restore(); return invalid('Validade inválida. Use MM/AA.', ccExp); }
            if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) { restore(); return invalid('Este cartão está vencido.', ccExp); }
            const isAmex = /^3[47]/.test(rawNum);
            if (isAmex ? csc.length !== 4 : csc.length !== 3) { restore(); return invalid(isAmex ? 'O CVV Amex tem 4 dígitos.' : 'O CVV tem 3 dígitos.', ccCsc); }
            if (!mpPublicKey) { restore(); return invalid('Pagamento indisponível no momento. Tente novamente ou use PIX.'); }

            // 1) Tokeniza o cartão direto no Mercado Pago (dados sensíveis não passam pelo nosso servidor)
            const tokenRes = await fetch(`https://api.mercadopago.com/v1/card_tokens?public_key=${mpPublicKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    card_number: rawNum,
                    expiration_month: month,
                    expiration_year: year,
                    security_code: csc,
                    cardholder: { name, identification: { type: 'CPF', number: customer.cpf } }
                })
            });
            const tokenData = await tokenRes.json().catch(() => ({}));
            if (!tokenRes.ok || !tokenData.id)
                throw new Error('Não foi possível validar o cartão. Confira número, validade e CVV, ou use outro cartão.');

            // 2) Envia o token ao servidor para concluir o pagamento
            const payRes = await fetch(API + '/api/checkout/pay-card', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer, items: items(),
                    shipping: { id: shipSel.id },
                    token: tokenData.id,
                    paymentMethodId: cardPaymentMethodId || detectBrand(rawNum).id,
                    installments: parseInt(installmentsSelect.value, 10) || 1
                })
            });
            const payData = await payRes.json().catch(() => ({}));
            if (!payRes.ok || payData.erro) throw new Error(payData.msg || 'Pagamento recusado. Tente outro cartão ou use PIX.');

            localStorage.setItem('bolla_last_order', payData.orderId);
            cart = []; saveCart(); updateCartUI();
            const kind = payData.status === 'aguardando_pagamento' ? 'pendente' : 'sucesso';
            window.location.href = `./?pagamento=${kind}&pedido=${payData.orderId}`;
        }

        // Modo vitrine: o pedido completo (dados + endereço + forma de pagamento) segue
        // para o WhatsApp da loja. Dados do cartão NUNCA entram na mensagem.
        function finishViaWhatsApp(customer) {
            const lines = cart.map(i => `• ${i.qty}x ${i.name} — ${formatBRL(i.price * i.qty)}`);
            const end = `${customer.rua}, ${customer.numero}${customer.complemento ? ' — ' + customer.complemento : ''}, ${customer.bairro}, ${customer.cidade}/${customer.uf} — CEP ${customer.cep}`;
            const pay = payMethod === 'cartao'
                ? `Cartão de crédito${installmentsSelect && installmentsSelect.value !== '1' ? ` (${installmentsSelect.value}x)` : ''} — aguardo o link seguro de pagamento`
                : 'PIX — aguardo a chave/QR Code';
            const msg = `Olá! Quero finalizar meu pedido Bolladinho 🌿\n\n${lines.join('\n')}\nSubtotal: ${formatBRL(cartTotal())}\nFrete: a combinar\n\n*Pagamento:* ${pay}\n\n*Nome:* ${customer.nome}\n*CPF:* ${customer.cpf}\n*E-mail:* ${customer.email}\n*WhatsApp:* ${customer.whatsapp}\n*Endereço:* ${end}`;
            [ccNum, ccName, ccExp, ccCsc].forEach(el => { if (el) el.value = ''; });
            window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
        }

        if (OFFLINE) payBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Finalizar pedido';

        payBtn.addEventListener('click', async () => {
            const customer = collectCustomer();
            if (!customer) return;
            if (!shipSel) { invalid('Escolha uma forma de entrega para continuar.'); return; }
            if (OFFLINE) return finishViaWhatsApp(customer);

            const original = payBtn.innerHTML;
            const restore = () => { payBtn.disabled = false; payBtn.innerHTML = original; };
            payBtn.disabled = true;
            payBtn.innerHTML = payMethod === 'cartao'
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Processando pagamento...'
                : '<i class="fa-solid fa-spinner fa-spin"></i> Gerando pagamento seguro...';
            try {
                if (payMethod === 'cartao') await payWithCard(customer, restore);
                else await payWithPix(customer, restore);
            } catch (e) {
                alert(e.message || 'Não foi possível concluir o pagamento. Tente novamente.');
                restore();
            }
        });
    }

    /* ---------------- Retorno do pagamento (Mercado Pago) ---------------- */
    const params = new URLSearchParams(window.location.search);
    if (params.has('pagamento')) {
        const banner = document.createElement('div');
        banner.className = 'payment-banner';
        document.body.appendChild(banner);
        const kind = params.get('pagamento');
        const orderId = params.get('pedido') || localStorage.getItem('bolla_last_order');
        const paymentId = params.get('payment_id') || params.get('collection_id');

        const render = (icon, cls, title, msg) => {
            banner.innerHTML = `
                <div class="payment-banner-inner ${cls}">
                    <i class="${icon}"></i>
                    <div><strong>${title}</strong><br><span>${msg}</span></div>
                    <button aria-label="Fechar" onclick="this.closest('.payment-banner').remove()"><i class="fa-solid fa-xmark"></i></button>
                </div>`;
        };

        if (kind === 'sucesso') {
            render('fa-solid fa-spinner fa-spin', 'pb-wait', 'Confirmando pagamento...', 'Aguarde um instante.');
        } else if (kind === 'pendente') {
            render('fa-solid fa-clock', 'pb-wait', 'Pagamento em processamento', 'Assim que for aprovado, seu pedido entra na fila de envio.');
        } else {
            render('fa-solid fa-circle-xmark', 'pb-fail', 'Pagamento não concluído', 'Nenhum valor foi cobrado. Você pode tentar novamente quando quiser.');
        }

        if (orderId && (kind === 'sucesso' || kind === 'pendente')) {
            fetch(API + '/api/orders/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, paymentId })
            })
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'pago') {
                        render('fa-solid fa-circle-check', 'pb-ok', 'Pagamento aprovado! 🎋',
                            `Pedido confirmado (${formatBRL(data.total)}). Entraremos em contato pelo WhatsApp sobre o envio.`);
                        localStorage.removeItem('bolla_last_order');
                    } else if (kind === 'sucesso') {
                        render('fa-solid fa-clock', 'pb-wait', 'Pagamento em processamento',
                            'Estamos aguardando a confirmação do banco. Você não precisa fazer nada.');
                    }
                })
                .catch(() => {});
        }
        // Limpa os parâmetros da URL sem recarregar
        window.history.replaceState({}, '', window.location.pathname);
    }

    /* ---------------- Avaliações de clientes ---------------- */
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (testimonialsGrid) {
        const starsHTML = n => Array.from({ length: 5 }, (_, i) =>
            `<i class="fa-${i < n ? 'solid' : 'regular'} fa-star"></i>`).join('');

        const renderComments = comments => {
            testimonialsGrid.innerHTML = '';
            comments.slice(-6).reverse().forEach((c, idx) => {
                const card = document.createElement('div');
                card.className = `testimonial-card glass reveal${idx % 3 === 1 ? ' delay-1' : idx % 3 === 2 ? ' delay-2' : ''}`;
                card.innerHTML = `
                    <div class="stars">${starsHTML(c.rating)}</div>
                    <p class="quote"></p>
                    <div class="author">
                        <span class="author-initial" aria-hidden="true"></span>
                        <span class="author-meta">
                            <span class="author-name"></span>
                            <span class="author-city"></span>
                        </span>
                    </div>`;
                card.querySelector('.quote').textContent = c.text;
                /* nome e cidade em elementos separados: antes vinham num texto
                   só ("Nome — Cidade"), sem hierarquia possível no CSS */
                card.querySelector('.author-name').textContent = c.name;
                card.querySelector('.author-city').textContent = c.city || '';
                card.querySelector('.author-initial').textContent = (c.name || '?').trim().charAt(0).toUpperCase();
                testimonialsGrid.appendChild(card);
            });
            revealFunction();
        };

        /* Se a API estiver fora do ar, mostra avaliações reais já aprovadas em vez de uma mensagem de erro */
        const fallbackComments = [
            { name: 'Lucas M.', city: 'Brasília - DF', rating: 5, text: 'O acabamento é impecável e o toque do bambu é muito melhor que qualquer piteira de vidro que já usei. Virou item fixo do meu ritual.' },
            { name: 'Ana P.', city: 'Goiânia - GO', rating: 5, text: 'Além de linda, é sustentável. A fumaça fica mais fresca e não altera o sabor em nada. Recomendo demais a caixa média.' },
            { name: 'Rafael S.', city: 'São Paulo - SP', rating: 5, text: 'Chegou super rápido e bem embalado. Cada peça realmente é única, a minha tem um tom de madeira lindo. Compra que valeu cada centavo.' }
        ];

        fetch(API + '/api/comments')
            .then(r => r.json())
            .then(comments => {
                if (comments.length) renderComments(comments);
                else testimonialsGrid.innerHTML = '<p class="no-comments">Seja o primeiro a avaliar a Bolladinho!</p>';
            })
            .catch(() => renderComments(fallbackComments));

        // Formulário de nova avaliação
        const reviewForm = document.getElementById('review-form');
        const reviewToggle = document.getElementById('review-toggle');
        if (reviewToggle && reviewForm) {
            reviewToggle.addEventListener('click', () => {
                reviewForm.classList.toggle('open');
                reviewToggle.style.display = reviewForm.classList.contains('open') ? 'none' : 'inline-flex';
            });

            // Seleção de estrelas
            let selectedRating = 5;
            const starPicker = document.getElementById('star-picker');
            const paintStars = n => {
                starPicker.querySelectorAll('i').forEach((s, i) => {
                    s.className = `fa-${i < n ? 'solid' : 'regular'} fa-star`;
                });
            };
            starPicker.querySelectorAll('i').forEach((star, i) => {
                star.addEventListener('click', () => { selectedRating = i + 1; paintStars(selectedRating); });
                star.addEventListener('mouseenter', () => paintStars(i + 1));
            });
            starPicker.addEventListener('mouseleave', () => paintStars(selectedRating));

            document.getElementById('review-submit').addEventListener('click', async () => {
                const name = document.getElementById('review-name').value.trim();
                const city = document.getElementById('review-city').value.trim();
                const text = document.getElementById('review-text').value.trim();
                const feedback = document.getElementById('review-feedback');
                if (name.length < 2 || text.length < 10) {
                    feedback.textContent = 'Preencha seu nome e um comentário com pelo menos 10 caracteres.';
                    feedback.className = 'review-feedback err';
                    return;
                }
                try {
                    const res = await fetch(API + '/api/comments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, city, text, rating: selectedRating })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.msg);
                    feedback.textContent = '✓ ' + data.msg;
                    feedback.className = 'review-feedback ok';
                    document.getElementById('review-name').value = '';
                    document.getElementById('review-city').value = '';
                    document.getElementById('review-text').value = '';
                } catch (e) {
                    feedback.textContent = e.message || 'Erro ao enviar. Tente novamente.';
                    feedback.className = 'review-feedback err';
                }
            });
        }
    }

    /* ---------------- Prova social: vendas reais ---------------- */
    if (window.innerWidth >= 480) {
        fetch(API + '/api/social')
            .then(r => r.json())
            .then(purchases => {
                if (!purchases.length) return;
                const toast = document.createElement('div');
                toast.className = 'purchase-toast';
                document.body.appendChild(toast);
                let pIndex = 0;
                const showToast = () => {
                    const p = purchases[pIndex % purchases.length];
                    toast.innerHTML = `
                        <div class="toast-icon"><i class="fa-solid fa-bag-shopping"></i></div>
                        <div class="toast-text">
                            <strong>${p.name}</strong> de ${p.city}<br>
                            comprou <strong>${p.product}</strong>
                            <span class="toast-time">compra verificada ✓</span>
                        </div>`;
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 6000);
                    pIndex++;
                };
                setTimeout(showToast, 8000);
                setInterval(showToast, 32000);
            })
            .catch(() => {});
    }

    updateCartUI();
});

/* ---------------- Smooth scroll (Lenis) + parallax de camadas (estilo Ironhill) ---------------- */
(function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Rolagem suave, sincronizada com o ScrollTrigger
    const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
    });

    window.__lenis = lenis; // usado por enhance.js (voltar ao topo, etc.)
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Pausa o smooth scroll quando um modal ou o menu mobile está aberto
    const lockTargets = [
        document.getElementById('cart-overlay'),
        document.getElementById('checkout-overlay'),
        document.querySelector('.nav-links'),
    ].filter(Boolean);
    if (lockTargets.length) {
        const isAnyOpen = () => lockTargets.some(el =>
            el.classList.contains('active') || el.classList.contains('open'));
        const observer = new MutationObserver(() => {
            if (isAnyOpen()) lenis.stop();
            else lenis.start();
        });
        lockTargets.forEach(el =>
            observer.observe(el, { attributes: true, attributeFilter: ['class'] }));
    }

    // Âncoras internas (#secao) com rolagem suave
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            // #beneficios vive dentro do hero e só surge (opacidade) após ~60% do scroll do hero;
            // rolar para ~72% do hero garante que os cards apareçam, em vez do topo do elemento.
            // O menu mobile aberto pausa o Lenis (lenis.stop). Ao clicar num link, o menu fecha
            // e o Lenis é reativado só no próximo tick (via MutationObserver) — tarde demais para
            // o scrollTo. Reativamos aqui na hora para a rolagem acontecer de fato.
            lenis.start();
            if (id === '#beneficios' && target.classList.contains('hero__content')) {
                const hero = document.querySelector('.hero');
                if (hero) return lenis.scrollTo((hero.offsetHeight - window.innerHeight) * 0.72, { offset: 0, force: true });
            }
            lenis.scrollTo(target, { offset: -110, force: true });
        });
    });

    // Parallax: bambus decorativos (fundo fixo) sobem devagar, em velocidades diferentes
    const bambooLeft = document.querySelector('.bamboo-left');
    const bambooRight = document.querySelector('.bamboo-right');
    const pageScrub = { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true };
    if (bambooLeft) gsap.to(bambooLeft, { yPercent: -16, ease: 'none', scrollTrigger: pageScrub });
    if (bambooRight) gsap.to(bambooRight, { yPercent: -28, ease: 'none', scrollTrigger: pageScrub });

    // Parallax: a moldura da imagem de detalhe flutua ao cruzar a viewport
    const frame = document.querySelector('.visual-demo .image-frame');
    if (frame) {
        gsap.fromTo(frame,
            { y: 45 },
            {
                y: -45,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.visual-demo',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            }
        );
    }

    ScrollTrigger.refresh();

    // Deep-link (#secao ao chegar de outra página, ex.: revendedor → index.html#beneficios):
    // o pulo nativo do navegador ignora a navbar fixa e o reveal do hero. Reposiciona certo
    // DEPOIS do load (fontes/imagens mudam a altura) e vencendo o pulo nativo.
    if (location.hash && location.hash.length > 1) {
        const goToHash = () => {
            const target = document.querySelector(location.hash);
            if (!target) return;
            if (location.hash === '#beneficios' && target.classList.contains('hero__content')) {
                const hero = document.querySelector('.hero');
                if (hero) return lenis.scrollTo((hero.offsetHeight - window.innerHeight) * 0.72, { offset: 0, immediate: true, force: true });
            }
            lenis.scrollTo(target, { offset: -110, immediate: true, force: true });
        };
        const run = () => setTimeout(goToHash, 300);
        if (document.readyState === 'complete') run();
        else window.addEventListener('load', run, { once: true });
    }
})();

/* ---------------- Hero Ironhill: dissolve (Three.js) + reveal de texto + parallax dos galhos ---------------- */
(function () {
    const canvas = document.querySelector('.hero-canvas');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return;
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uProgress;
        uniform vec2 uResolution;
        uniform vec3 uColor;
        uniform float uSpread;
        varying vec2 vUv;

        float Hash(vec2 p) {
            vec3 p2 = vec3(p.xy, 1.0);
            return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
        }

        float noise(in vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f *= f * (3.0 - 2.0 * f);
            return mix(
                mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
                mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
                f.y
            );
        }

        float fbm(vec2 p) {
            float v = 0.0;
            v += noise(p * 1.0) * 0.5;
            v += noise(p * 2.0) * 0.25;
            v += noise(p * 4.0) * 0.125;
            return v;
        }

        void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / uResolution.y;
            vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

            float dissolveEdge = uv.y - uProgress * 1.2;
            float noiseValue = fbm(centeredUv * 15.0);
            float d = dissolveEdge + noiseValue * uSpread;

            float pixelSize = 1.0 / uResolution.y;
            float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

            gl_FragColor = vec4(uColor, alpha);
        }
    `;

    const CONFIG = { color: '#ebf5df', spread: 0.5, speed: 1 };

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
            : { r: 0.89, g: 0.89, b: 0.89 };
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

    function resize() {
        renderer.setSize(hero.offsetWidth, hero.offsetHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        material.uniforms.uResolution.value.set(hero.offsetWidth, hero.offsetHeight);
    }

    const rgb = hexToRgb(CONFIG.color);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uProgress: { value: 0 },
            uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
            uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
            uSpread: { value: CONFIG.spread },
        },
        transparent: true,
    });
    scene.add(new THREE.Mesh(geometry, material));

    resize();
    window.addEventListener('resize', resize);

    // Dissolve controlado pelo scroll (usa window.scrollY — funciona com ou sem Lenis)
    function animate() {
        const maxScroll = hero.offsetHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min((window.scrollY / maxScroll) * CONFIG.speed, 1.1) : 0;
        material.uniforms.uProgress.value = progress;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Reveal palavra por palavra do texto de baixo (apenas onde é uma frase — classe reveal-words)
    const heroH2 = document.querySelector('.hero__content h2.reveal-words');
    if (heroH2 && typeof SplitText !== 'undefined') {
        const split = new SplitText(heroH2, { type: 'words' });
        const words = split.words;
        gsap.set(words, { opacity: 0 });

        ScrollTrigger.create({
            trigger: '.hero__content',
            start: 'top 25%',
            end: 'bottom 100%',
            onUpdate: self => {
                const progress = self.progress;
                const totalWords = words.length;
                words.forEach((word, index) => {
                    const wordProgress = index / totalWords;
                    const nextWordProgress = (index + 1) / totalWords;
                    let opacity = 0.1;
                    if (progress >= nextWordProgress) {
                        opacity = 1;
                    } else if (progress >= wordProgress) {
                        opacity = (progress - wordProgress) / (nextWordProgress - wordProgress);
                    }
                    gsap.to(word, { opacity: opacity, duration: 0.1, overwrite: true });
                });
            },
        });
    }

    // Parallax dos galhos (sobem em velocidades diferentes ao rolar)
    gsap.to('.hero__twig--left', {
        y: -2000, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__twig--right', {
        y: -3500, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Efeito de balanço 3D imersivo ao mover o mouse (Mouse Sway & Tilt) — sempre ativo
    if (true) {
        const layers = [...hero.querySelectorAll('[data-sway], [data-tilt]')];
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

        hero.addEventListener('pointermove', e => {
            const r = hero.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width - 0.5);   // -0.5 .. 0.5
            ty = ((e.clientY - r.top) / r.height - 0.5);
            if (!raf) raf = requestAnimationFrame(loopSway);
        });

        hero.addEventListener('pointerleave', () => {
            tx = 0; ty = 0;
            if (!raf) raf = requestAnimationFrame(loopSway);
        });

        function loopSway() {
            cx += (tx - cx) * 0.035;
            cy += (ty - cy) * 0.035;
            layers.forEach(l => {
                const d = parseFloat(l.dataset.sway) || 0;
                if (d) {
                    l.style.translate = (cx * d).toFixed(2) + 'px ' + (cy * d).toFixed(2) + 'px';
                }
                if (l.hasAttribute('data-tilt')) {
                    l.style.transform = 'perspective(1200px) rotateY(' + (cx * 10).toFixed(2) + 'deg) rotateX(' + (-cy * 8).toFixed(2) + 'deg)';
                }
            });
            raf = (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) ? requestAnimationFrame(loopSway) : null;
        }
    }

    ScrollTrigger.refresh();
})();

/* ---------------- Precificação: entrada "zoom in" a partir do centro + botão magnético ---------------- */
(function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = document.querySelectorAll('.pricing-card');
    if (!cards.length) return;

    // Entrada dos cards fica só com o reveal por CSS (classe .reveal no HTML).
    // Antes havia TAMBÉM um gsap.from(zoom-in): o revealFunction deixava o card visível
    // e, logo depois, o gsap.from o escondia para reanimar — causando o "flash" ao carregar.

    // Botão magnético — só com ponteiro fino (desktop) e sem reduced-motion
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReduced || !finePointer) return;

    // Interpolado a cada quadro (lerp) — o botão "persegue" o ponteiro com
    // inércia em vez de saltar para a posição exata a cada mousemove.
    document.querySelectorAll('.pricing-card .btn').forEach(btn => {
        let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
        const tick = () => {
            x += (tx - x) * 0.14; y += (ty - y) * 0.14;
            btn.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
            if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(tick);
            else { raf = 0; if (!tx && !ty) btn.style.transform = ''; }
        };
        const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            tx = (e.clientX - r.left - r.width / 2) * 0.22;
            ty = (e.clientY - r.top - r.height / 2) * 0.35;
            go();
        });
        btn.addEventListener('mouseleave', () => { tx = 0; ty = 0; go(); });
    });
})();

/* ---------------- Acesso discreto ao painel admin (2 cliques) ---------------- */
(function () {
    const btn = document.getElementById('admin-access');
    if (!btn) return;

    const icon = btn.querySelector('i');
    let armed = false;
    let disarmTimer = null;

    const disarm = () => {
        armed = false;
        btn.classList.remove('armed');
        if (icon) icon.className = 'fa-solid fa-lock';
        btn.title = 'Acesso admin';
    };

    btn.addEventListener('click', () => {
        if (!armed) {
            // 1º clique/toque: "arma" o acesso (cadeado abre + fica dourado)
            armed = true;
            btn.classList.add('armed');
            if (icon) icon.className = 'fa-solid fa-lock-open';
            btn.title = 'Toque novamente para entrar';
            clearTimeout(disarmTimer);
            disarmTimer = setTimeout(disarm, 4000);
        } else {
            // 2º clique/toque: acessa o painel (que exige login)
            clearTimeout(disarmTimer);
            window.location.href = 'admin.html';
        }
    });
})();

/* Benefícios do hero: só aparecem quando o dissolve vira creme (evita invadir a floresta no topo) */
(function () {
    const hero = document.querySelector('.hero');
    const bc = document.getElementById('beneficios');
    if (!hero || !bc || !bc.classList.contains('hero__content')) return;
    const upd = () => {
        const maxScroll = hero.offsetHeight - window.innerHeight;
        const p = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        bc.style.opacity = p > 0.6 ? '1' : '0';
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
})();
