/* ============================================================
   BOLLADINHO — Servidor (Node.js puro, sem dependências)
   - Serve o site estático
   - API: produtos, pedidos (Mercado Pago), comentários, CEP
   - Painel admin: /admin
   Rodar: tools\node\node.exe server.js
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'server-config.json'), 'utf8'));
const PORT = process.env.PORT || CONFIG.port || 8321;

/* ---------------- Armazenamento em JSON ---------------- */
function loadJSON(name) {
    try {
        return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
    } catch {
        return []; // arquivo de runtime ausente (ex.: após clone) — começa vazio
    }
}
function saveJSON(name, data) {
    fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2), 'utf8');
}

/* ---------------- Sessões de admin ---------------- */
const adminSessions = new Map(); // token -> expiração
function createAdminToken() {
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, Date.now() + 8 * 3600 * 1000);
    return token;
}
function isAdmin(req) {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const exp = adminSessions.get(token);
    if (!exp) return false;
    if (Date.now() > exp) { adminSessions.delete(token); return false; }
    return true;
}

/* ---------------- Limite de tentativas de login (por IP) ---------------- */
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000; // bloqueio de 15 min após exceder
const loginAttempts = new Map(); // ip -> { count, lockUntil }

function clientIp(req) {
    const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}
function loginState(ip) {
    const s = loginAttempts.get(ip);
    if (!s) return { locked: false, remaining: MAX_LOGIN_ATTEMPTS };
    if (s.lockUntil && Date.now() < s.lockUntil) {
        return { locked: true, retryMs: s.lockUntil - Date.now(), remaining: 0 };
    }
    if (s.lockUntil && Date.now() >= s.lockUntil) {
        loginAttempts.delete(ip); // bloqueio expirou
        return { locked: false, remaining: MAX_LOGIN_ATTEMPTS };
    }
    return { locked: false, remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - s.count) };
}
function registerLoginFail(ip) {
    const s = loginAttempts.get(ip) || { count: 0 };
    s.count += 1;
    if (s.count >= MAX_LOGIN_ATTEMPTS) s.lockUntil = Date.now() + LOGIN_LOCK_MS;
    loginAttempts.set(ip, s);
}
function clearLoginAttempts(ip) { loginAttempts.delete(ip); }

/* ---------------- Utilidades HTTP ---------------- */
function sendJSON(res, status, obj) {
    const body = JSON.stringify(obj);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
}
function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', c => { data += c; if (data.length > 1e6) req.destroy(); });
        req.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch (e) { reject(new Error('JSON inválido')); }
        });
        req.on('error', reject);
    });
}
function baseUrl(req) {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}`;
}

/* ---------------- Mercado Pago ---------------- */
async function mpFetch(endpoint, options = {}) {
    const res = await fetch(`https://api.mercadopago.com${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${CONFIG.mpAccessToken}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.message || `Mercado Pago HTTP ${res.status}`);
        err.mp = data;
        throw err;
    }
    return data;
}

/* Marca pedido como pago e baixa o estoque (idempotente) */
function markOrderPaid(orderId, paymentInfo) {
    const orders = loadJSON('orders.json');
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    if (order.status !== 'pago') {
        order.status = 'pago';
        order.paymentId = paymentInfo.id;
        order.paidAt = new Date().toISOString();
        if (!order.stockDecremented) {
            const products = loadJSON('products.json');
            order.items.forEach(item => {
                const p = products.find(x => x.id === item.id);
                if (p) p.stock = Math.max(0, p.stock - item.qty);
            });
            saveJSON('products.json', products);
            order.stockDecremented = true;
        }
        saveJSON('orders.json', orders);
        notifyAdmin('Pagamento confirmado', order);
    }
    return order;
}

/* Notifica o admin por e-mail (via FormSubmit — sem credenciais no servidor) */
function notifyAdmin(subject, order) {
    const to = CONFIG.notifyEmail || 'bolladinhosmoking@gmail.com';
    const c = order.customer || {};
    const payload = {
        _subject: `[Bolladinho] ${subject} — ${c.nome || ''}`,
        Pedido: order.id,
        Cliente: c.nome, CPF: c.cpf, Email: c.email, WhatsApp: c.whatsapp,
        Endereco: `${c.rua || ''}, ${c.numero || ''} ${c.complemento || ''} - ${c.bairro || ''}, ${c.cidade || ''}/${c.uf || ''} - CEP ${c.cep || ''}`,
        Produtos: (order.items || []).map(i => `${i.qty}x ${i.name}`).join(', '),
        Total: 'R$ ' + Number(order.total || 0).toFixed(2),
        Pagamento: order.paymentMethod || 'Mercado Pago',
        Status: order.status
    };
    fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(e => console.error('notifyAdmin:', e.message));
}

/* Registra recusas/erros de pagamento para consulta no painel */
function logPaymentError(order, detail, message) {
    let errs; try { errs = loadJSON('payment-errors.json'); } catch { errs = []; }
    errs.push({
        id: crypto.randomUUID(),
        orderId: order ? order.id : null,
        cliente: order ? order.customer.nome : null,
        email: order ? order.customer.email : null,
        whatsapp: order ? order.customer.whatsapp : null,
        total: order ? order.total : null,
        items: order ? (order.items || []).map(i => `${i.qty}x ${i.name}`).join(', ') : null,
        detail: detail || '',
        message: message || '',
        at: new Date().toISOString()
    });
    if (errs.length > 100) errs = errs.slice(-100);
    saveJSON('payment-errors.json', errs);
}

/* Registra TODA tentativa de pagamento (cartão e PIX, aprovada ou não) para a aba Pagamentos */
function logPaymentAttempt(order, info) {
    let list; try { list = loadJSON('payment-attempts.json'); } catch { list = []; }
    list.push({
        id: crypto.randomUUID(),
        orderId: order ? order.id : null,
        cliente: order ? order.customer.nome : null,
        email: order ? order.customer.email : null,
        whatsapp: order ? order.customer.whatsapp : null,
        items: order ? (order.items || []).map(i => `${i.qty}x ${i.name}`).join(' · ') : null,
        method: info.method || '',            // 'card' | 'pix'
        status: info.status || '',            // approved | in_process | pending | rejected | error | expired
        statusDetail: info.statusDetail || '',
        amount: info.amount != null ? info.amount : (order ? order.total : null),
        installments: info.installments || 0,
        paymentId: info.paymentId ? String(info.paymentId) : '',
        at: new Date().toISOString()
    });
    if (list.length > 200) list = list.slice(-200);
    saveJSON('payment-attempts.json', list);
}

/* Consulta um pagamento no MP e atualiza o pedido correspondente */
async function syncPayment(paymentId) {
    const payment = await mpFetch(`/v1/payments/${paymentId}`);
    const orderId = payment.external_reference;
    if (!orderId) return null;
    const methodType = payment.payment_type_id === 'bank_transfer' || payment.payment_method_id === 'pix' ? 'pix' : 'card';
    if (payment.status === 'approved') {
        const ord = loadJSON('orders.json').find(o => o.id === orderId);
        if (ord && ord.status !== 'pago') {
            logPaymentAttempt(ord, { method: methodType, status: 'approved', statusDetail: payment.status_detail || 'accredited', amount: payment.transaction_amount, paymentId: payment.id });
        }
        return markOrderPaid(orderId, payment);
    }
    const orders = loadJSON('orders.json');
    const order = orders.find(o => o.id === orderId);
    if (order && order.status !== 'pago') {
        order.status = payment.status === 'rejected' ? 'cancelado' : 'aguardando_pagamento';
        order.paymentId = payment.id;
        saveJSON('orders.json', orders);
        if (payment.status === 'rejected') {
            logPaymentAttempt(order, { method: methodType, status: 'rejected', statusDetail: payment.status_detail || '', amount: payment.transaction_amount, paymentId: payment.id });
        }
    }
    return order;
}

/* Mensagens amigáveis para recusas de cartão do Mercado Pago */
const CARD_ERRORS = {
    cc_rejected_bad_filled_card_number: 'Número do cartão incorreto. Confira os dígitos e tente novamente.',
    cc_rejected_bad_filled_date: 'Data de validade incorreta. Use o formato MM/AA.',
    cc_rejected_bad_filled_security_code: 'CVV incorreto. Confira o código de segurança.',
    cc_rejected_bad_filled_other: 'Confira os dados do cartão e tente novamente.',
    cc_rejected_insufficient_amount: 'Cartão sem limite disponível para esta compra.',
    cc_rejected_call_for_authorize: 'O banco pediu autorização. Ligue para o seu banco e tente de novo.',
    cc_rejected_card_disabled: 'Cartão desativado. Fale com o seu banco.',
    cc_rejected_disabled_card: 'Cartão desativado. Fale com o seu banco.',
    cc_rejected_duplicated_payment: 'Pagamento duplicado. Aguarde alguns minutos antes de tentar de novo.',
    cc_rejected_high_risk: 'Pagamento recusado por segurança. Tente PIX ou outro cartão.',
    cc_rejected_max_attempts: 'Muitas tentativas seguidas. Aguarde alguns minutos.',
    cc_rejected_other_reason: 'Cartão recusado pelo banco emissor. Tente outro cartão ou PIX.'
};
function cardErrorMessage(detail) {
    return CARD_ERRORS[detail] || 'Pagamento recusado pelo banco. Tente outro cartão ou pague com PIX.';
}

/* Valida cliente + itens e monta o pedido.
   Compartilhado entre o Checkout Pro (PIX/redirect) e o cartão transparente. */
async function buildOrderFromRequest(body) {
    const { customer, items } = body;
    const fail = (status, msg) => ({ erro: true, status, msg });

    if (!customer || String(customer.nome || '').trim().length < 3)
        return fail(400, 'Informe o nome completo.');
    if (String(customer.whatsapp || '').replace(/\D/g, '').length < 10)
        return fail(400, 'Informe um WhatsApp válido.');
    const cpfDigits = String(customer.cpf || '').replace(/\D/g, '');
    if (cpfDigits.length !== 11)
        return fail(400, 'Informe um CPF válido (11 dígitos).');
    const email = String(customer.email || '').trim().slice(0, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return fail(400, 'Informe um e-mail válido.');

    // CEP obrigatório e verificado de verdade no ViaCEP
    const cep = String(customer.cep || '').replace(/\D/g, '');
    if (cep.length !== 8) return fail(400, 'CEP obrigatório (8 dígitos).');
    let cepData;
    try {
        const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        cepData = await r.json();
    } catch (e) {
        return fail(502, 'Não foi possível validar o CEP. Tente novamente.');
    }
    if (cepData.erro) return fail(400, 'CEP inexistente. Verifique e tente novamente.');
    if (!String(customer.numero || '').trim())
        return fail(400, 'Informe o número do endereço.');

    // Itens validados contra o catálogo do servidor (preço nunca vem do cliente)
    const products = loadJSON('products.json');
    if (!Array.isArray(items) || items.length === 0)
        return fail(400, 'Carrinho vazio.');
    const orderItems = [];
    for (const it of items) {
        const p = products.find(x => x.id === it.id && x.active);
        const qty = parseInt(it.qty) || 0;
        if (!p || qty < 1) return fail(400, 'Produto inválido no carrinho.');
        if (p.stock < qty) return fail(409, `Estoque insuficiente de ${p.name} (restam ${p.stock}).`);
        orderItems.push({ id: p.id, name: p.name, price: p.price, qty });
    }
    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = Number(CONFIG.shippingFlat) || 0;
    const total = subtotal + shipping;

    const order = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'aguardando_pagamento',
        customer: {
            nome: String(customer.nome).trim().slice(0, 100),
            cpf: cpfDigits,
            email,
            whatsapp: String(customer.whatsapp).trim().slice(0, 20),
            cep, rua: cepData.logradouro || String(customer.rua || '').slice(0, 120),
            numero: String(customer.numero).trim().slice(0, 20),
            complemento: String(customer.complemento || '').trim().slice(0, 80),
            bairro: cepData.bairro || String(customer.bairro || '').slice(0, 80),
            cidade: cepData.localidade, uf: cepData.uf
        },
        items: orderItems, subtotal, shipping, total,
        stockDecremented: false
    };
    return { order };
}

/* ---------------- Rotas da API ---------------- */
const routes = {

    /* Config pública do front (só a public key — nunca o access token) */
    'GET /api/config': async (req, res) => {
        sendJSON(res, 200, { publicKey: CONFIG.mpPublicKey });
    },

    /* Parcelas reais do emissor para o BIN digitado (o que aparece = o que o banco cobra) */
    'GET /api/checkout/installments': async (req, res, urlObj) => {
        const bin = (urlObj.searchParams.get('bin') || '').replace(/\D/g, '').slice(0, 8);
        const amount = Number(urlObj.searchParams.get('amount'));
        if (bin.length < 6 || !amount || amount <= 0)
            return sendJSON(res, 400, { erro: true, msg: 'Parâmetros inválidos.' });
        try {
            const data = await mpFetch(`/v1/payment_methods/installments?bin=${bin}&amount=${amount}`);
            const first = Array.isArray(data) ? data[0] : null;
            if (!first) return sendJSON(res, 404, { erro: true, msg: 'Bandeira não reconhecida.' });
            sendJSON(res, 200, {
                ok: true,
                paymentMethodId: first.payment_method_id,
                installments: (first.payer_costs || []).map(c => ({
                    installments: c.installments,
                    message: c.recommended_message
                }))
            });
        } catch (e) {
            sendJSON(res, 502, { erro: true, msg: 'Falha ao consultar parcelas.' });
        }
    },

    /* Cartão transparente: recebe o token (gerado no navegador) e cobra via /v1/payments */
    'POST /api/checkout/pay-card': async (req, res) => {
        const body = await readBody(req);
        const { token, paymentMethodId } = body;
        const installments = parseInt(body.installments, 10) || 1;

        if (!token || !paymentMethodId)
            return sendJSON(res, 400, { erro: true, msg: 'Dados do cartão incompletos.' });

        // Valida cliente + itens e monta o pedido (preço sempre do catálogo do servidor)
        const built = await buildOrderFromRequest(body);
        if (built.erro) return sendJSON(res, built.status, { erro: true, msg: built.msg });
        const order = built.order;

        let payment;
        try {
            payment = await mpFetch('/v1/payments', {
                method: 'POST',
                headers: { 'X-Idempotency-Key': crypto.randomUUID() },
                body: JSON.stringify({
                    transaction_amount: Number(order.total.toFixed(2)),
                    token,
                    description: `Bolladinho - Pedido ${order.id}`,
                    installments,
                    payment_method_id: paymentMethodId,
                    external_reference: order.id,
                    statement_descriptor: 'BOLLADINHO',
                    payer: {
                        email: order.customer.email,
                        identification: { type: 'CPF', number: order.customer.cpf }
                    }
                })
            });
        } catch (e) {
            const detail = (e.mp && (e.mp.cause?.[0]?.code || e.mp.message)) || '';
            console.error('Erro cartão MP:', e.message, e.mp || '');
            logPaymentError(order, detail, cardErrorMessage(detail));
            logPaymentAttempt(order, { method: 'card', status: 'error', statusDetail: detail || 'error', amount: order.total, installments });
            return sendJSON(res, 402, { erro: true, msg: cardErrorMessage(detail) });
        }

        order.paymentId = payment.id;
        order.paymentMethod = 'cartao';

        // Aprovado: registra e baixa o estoque. Em análise: fica aguardando.
        if (payment.status === 'approved') {
            order.status = 'pago';
            const orders = loadJSON('orders.json');
            orders.push(order);
            saveJSON('orders.json', orders);
            logPaymentAttempt(order, { method: 'card', status: 'approved', statusDetail: payment.status_detail || 'accredited', amount: order.total, installments, paymentId: payment.id });
            markOrderPaid(order.id, payment);
            return sendJSON(res, 201, { ok: true, orderId: order.id, status: 'pago' });
        }
        if (payment.status === 'in_process' || payment.status === 'pending' || payment.status === 'authorized') {
            order.status = 'aguardando_pagamento';
            const orders = loadJSON('orders.json');
            orders.push(order);
            saveJSON('orders.json', orders);
            logPaymentAttempt(order, { method: 'card', status: payment.status, statusDetail: payment.status_detail || '', amount: order.total, installments, paymentId: payment.id });
            notifyAdmin('Novo pedido (aguardando pagamento)', order);
            return sendJSON(res, 201, { ok: true, orderId: order.id, status: 'aguardando_pagamento' });
        }

        // Recusado: cria o pedido como CANCELADO (aparece no painel) + registra a tentativa e o motivo
        order.status = 'cancelado';
        { const orders = loadJSON('orders.json'); orders.push(order); saveJSON('orders.json', orders); }
        logPaymentAttempt(order, { method: 'card', status: 'rejected', statusDetail: payment.status_detail || '', amount: order.total, installments, paymentId: payment.id });
        logPaymentError(order, payment.status_detail, cardErrorMessage(payment.status_detail));
        return sendJSON(res, 402, { erro: true, msg: cardErrorMessage(payment.status_detail) });
    },

    /* ---- Público ---- */
    'GET /api/products': async (req, res) => {
        const products = loadJSON('products.json').filter(p => p.active);
        sendJSON(res, 200, products.map(({ id, name, desc, price, stock, popular }) =>
            ({ id, name, desc, price, stock, popular: !!popular })));
    },

    'GET /api/cep': async (req, res, urlObj) => {
        const cep = (urlObj.searchParams.get('cep') || '').replace(/\D/g, '');
        if (cep.length !== 8) return sendJSON(res, 400, { erro: true, msg: 'CEP deve ter 8 dígitos.' });
        try {
            const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await r.json();
            if (data.erro) return sendJSON(res, 404, { erro: true, msg: 'CEP não encontrado.' });
            sendJSON(res, 200, {
                erro: false, cep: data.cep, rua: data.logradouro,
                bairro: data.bairro, cidade: data.localidade, uf: data.uf
            });
        } catch (e) {
            sendJSON(res, 502, { erro: true, msg: 'Falha ao consultar o CEP. Tente novamente.' });
        }
    },

    'GET /api/comments': async (req, res) => {
        const comments = loadJSON('comments.json').filter(c => c.approved);
        sendJSON(res, 200, comments.map(({ id, name, city, rating, text, date }) =>
            ({ id, name, city, rating, text, date })));
    },

    'POST /api/comments': async (req, res) => {
        const body = await readBody(req);
        const name = String(body.name || '').trim().slice(0, 60);
        const city = String(body.city || '').trim().slice(0, 60);
        const text = String(body.text || '').trim().slice(0, 500);
        const rating = Math.min(5, Math.max(1, parseInt(body.rating) || 5));
        if (name.length < 2 || text.length < 10) {
            return sendJSON(res, 400, { erro: true, msg: 'Preencha nome e um comentário com pelo menos 10 caracteres.' });
        }
        const comments = loadJSON('comments.json');
        comments.push({
            id: crypto.randomUUID(), name, city, rating, text,
            date: new Date().toISOString(), approved: false
        });
        saveJSON('comments.json', comments);
        sendJSON(res, 201, { ok: true, msg: 'Avaliação enviada! Ela aparece no site após aprovação.' });
    },

    'POST /api/orders': async (req, res) => {
        const body = await readBody(req);
        const { customer, items } = body;

        // Validação do cliente
        if (!customer || String(customer.nome || '').trim().length < 3)
            return sendJSON(res, 400, { erro: true, msg: 'Informe o nome completo.' });
        if (String(customer.whatsapp || '').replace(/\D/g, '').length < 10)
            return sendJSON(res, 400, { erro: true, msg: 'Informe um WhatsApp válido.' });
        const cpfDigits = String(customer.cpf || '').replace(/\D/g, '');
        if (cpfDigits.length !== 11)
            return sendJSON(res, 400, { erro: true, msg: 'Informe um CPF válido (11 dígitos).' });
        const email = String(customer.email || '').trim().slice(0, 120);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return sendJSON(res, 400, { erro: true, msg: 'Informe um e-mail válido.' });

        // CEP obrigatório e verificado de verdade no ViaCEP
        const cep = String(customer.cep || '').replace(/\D/g, '');
        if (cep.length !== 8) return sendJSON(res, 400, { erro: true, msg: 'CEP obrigatório (8 dígitos).' });
        let cepData;
        try {
            const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            cepData = await r.json();
        } catch (e) {
            return sendJSON(res, 502, { erro: true, msg: 'Não foi possível validar o CEP. Tente novamente.' });
        }
        if (cepData.erro) return sendJSON(res, 400, { erro: true, msg: 'CEP inexistente. Verifique e tente novamente.' });
        if (!String(customer.numero || '').trim())
            return sendJSON(res, 400, { erro: true, msg: 'Informe o número do endereço.' });

        // Itens validados contra o catálogo do servidor (preço nunca vem do cliente)
        const products = loadJSON('products.json');
        if (!Array.isArray(items) || items.length === 0)
            return sendJSON(res, 400, { erro: true, msg: 'Carrinho vazio.' });
        const orderItems = [];
        for (const it of items) {
            const p = products.find(x => x.id === it.id && x.active);
            const qty = parseInt(it.qty) || 0;
            if (!p || qty < 1) return sendJSON(res, 400, { erro: true, msg: 'Produto inválido no carrinho.' });
            if (p.stock < qty) return sendJSON(res, 409, { erro: true, msg: `Estoque insuficiente de ${p.name} (restam ${p.stock}).` });
            orderItems.push({ id: p.id, name: p.name, price: p.price, qty });
        }
        const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
        const shipping = Number(CONFIG.shippingFlat) || 0;
        const total = subtotal + shipping;

        // Cria o pedido
        const orderId = crypto.randomUUID();
        const order = {
            id: orderId,
            createdAt: new Date().toISOString(),
            status: 'aguardando_pagamento',
            customer: {
                nome: String(customer.nome).trim().slice(0, 100),
                cpf: cpfDigits,
                email,
                whatsapp: String(customer.whatsapp).trim().slice(0, 20),
                cep, rua: cepData.logradouro || String(customer.rua || '').slice(0, 120),
                numero: String(customer.numero).trim().slice(0, 20),
                complemento: String(customer.complemento || '').trim().slice(0, 80),
                bairro: cepData.bairro || String(customer.bairro || '').slice(0, 80),
                cidade: cepData.localidade, uf: cepData.uf
            },
            items: orderItems, subtotal, shipping, total,
            stockDecremented: false
        };

        // Preferência do Mercado Pago (Checkout Pro: PIX, cartão, boleto)
        const base = baseUrl(req);
        const isPublic = !/localhost|127\.0\.0\.1/.test(base);
        const preferenceBody = {
            items: orderItems.map(i => ({
                id: i.id, title: `Bolladinho - ${i.name}`,
                quantity: i.qty, unit_price: i.price, currency_id: 'BRL'
            })),
            payer: {
                name: order.customer.nome,
                email: order.customer.email,
                identification: { type: 'CPF', number: order.customer.cpf }
            },
            external_reference: orderId,
            statement_descriptor: 'BOLLADINHO',
            back_urls: {
                success: `${base}/?pagamento=sucesso&pedido=${orderId}`,
                pending: `${base}/?pagamento=pendente&pedido=${orderId}`,
                failure: `${base}/?pagamento=falha&pedido=${orderId}`
            }
        };
        if (shipping > 0) {
            preferenceBody.items.push({ id: 'frete', title: 'Frete', quantity: 1, unit_price: shipping, currency_id: 'BRL' });
        }
        if (isPublic) {
            preferenceBody.auto_return = 'approved';
            preferenceBody.notification_url = `${base}/api/webhooks/mercadopago`;
        }

        let pref;
        try {
            pref = await mpFetch('/checkout/preferences', {
                method: 'POST', body: JSON.stringify(preferenceBody)
            });
        } catch (e) {
            console.error('Erro Mercado Pago:', e.message, e.mp || '');
            return sendJSON(res, 502, { erro: true, msg: 'Falha ao iniciar o pagamento. Tente novamente em instantes.' });
        }

        order.mpPreferenceId = pref.id;
        const orders = loadJSON('orders.json');
        orders.push(order);
        saveJSON('orders.json', orders);
        logPaymentAttempt(order, { method: 'pix', status: 'pending', statusDetail: 'pix_generated', amount: total });
        notifyAdmin('Novo pedido', order);

        sendJSON(res, 201, { ok: true, orderId, initPoint: pref.init_point, total });
    },

    /* Retorno do checkout: confirma o pagamento direto na API do MP */
    'POST /api/orders/verify': async (req, res) => {
        const body = await readBody(req);
        const { orderId, paymentId } = body;
        if (!orderId) return sendJSON(res, 400, { erro: true });
        try {
            if (paymentId) await syncPayment(paymentId);
            else {
                // Sem paymentId: busca pagamentos pela referência externa
                const search = await mpFetch(`/v1/payments/search?external_reference=${encodeURIComponent(orderId)}&sort=date_created&criteria=desc`);
                if (search.results && search.results.length) await syncPayment(search.results[0].id);
            }
        } catch (e) { console.error('verify:', e.message); }
        const order = loadJSON('orders.json').find(o => o.id === orderId);
        if (!order) return sendJSON(res, 404, { erro: true });
        sendJSON(res, 200, { status: order.status, total: order.total });
    },

    /* Webhook do Mercado Pago (produção) */
    'POST /api/webhooks/mercadopago': async (req, res) => {
        const body = await readBody(req).catch(() => ({}));
        try {
            const urlObj = new URL(req.url, 'http://x');
            const paymentId = (body.data && body.data.id) || urlObj.searchParams.get('data.id') || urlObj.searchParams.get('id');
            const type = body.type || urlObj.searchParams.get('type') || urlObj.searchParams.get('topic');
            if (paymentId && String(type).includes('payment')) await syncPayment(paymentId);
        } catch (e) { console.error('webhook:', e.message); }
        sendJSON(res, 200, { received: true });
    },

    /* Prova social honesta: últimas vendas pagas (só primeiro nome + cidade) */
    'GET /api/social': async (req, res) => {
        const orders = loadJSON('orders.json')
            .filter(o => o.status === 'pago')
            .slice(-8).reverse()
            .map(o => ({
                name: o.customer.nome.split(' ')[0],
                city: `${o.customer.cidade} - ${o.customer.uf}`,
                product: o.items[0] ? o.items[0].name : 'Bolladinho'
            }));
        sendJSON(res, 200, orders);
    },

    /* ---- Admin ---- */
    'POST /api/admin/login': async (req, res) => {
        const ip = clientIp(req);
        const state = loginState(ip);
        if (state.locked) {
            const mins = Math.ceil(state.retryMs / 60000);
            return sendJSON(res, 429, { erro: true, locked: true, msg: `Muitas tentativas. Tente novamente em ${mins} min.` });
        }
        const body = await readBody(req);
        const userOk = !CONFIG.adminUser || String(body.user || '') === CONFIG.adminUser;
        if (!userOk || String(body.password || '') !== CONFIG.adminPassword) {
            registerLoginFail(ip);
            const after = loginState(ip);
            if (after.locked) {
                const mins = Math.ceil(after.retryMs / 60000);
                return sendJSON(res, 429, { erro: true, locked: true, msg: `Muitas tentativas. Acesso bloqueado por ${mins} min.` });
            }
            return sendJSON(res, 401, { erro: true, msg: 'Senha incorreta.', remaining: after.remaining });
        }
        clearLoginAttempts(ip);
        sendJSON(res, 200, { token: createAdminToken() });
    },

    'GET /api/admin/overview': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const orders = loadJSON('orders.json');
        const comments = loadJSON('comments.json');
        const products = loadJSON('products.json');
        const paid = orders.filter(o => o.status === 'pago');
        let leads; try { leads = loadJSON('reseller-leads.json'); } catch { leads = []; }
        let payErrs; try { payErrs = loadJSON('payment-errors.json'); } catch { payErrs = []; }
        sendJSON(res, 200, {
            totalOrders: orders.length,
            paidOrders: paid.length,
            paymentErrors: payErrs.length,
            revenue: paid.reduce((s, o) => s + o.total, 0),
            awaitingPayment: orders.filter(o => o.status === 'aguardando_pagamento').length,
            pendingComments: comments.filter(c => !c.approved).length,
            lowStock: products.filter(p => p.active && p.stock <= 10).map(p => ({ name: p.name, stock: p.stock })),
            unitsSold: paid.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
            resellerLeads: leads.length,
            newLeads: leads.filter(l => l.status === 'novo').length,
            recentOrders: orders.slice(-10).reverse()
        });
    },

    'GET /api/admin/products': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        sendJSON(res, 200, loadJSON('products.json'));
    },

    'PUT /api/admin/products': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const body = await readBody(req);
        if (!Array.isArray(body)) return sendJSON(res, 400, { erro: true });
        const clean = body.map(p => ({
            id: String(p.id), name: String(p.name || '').slice(0, 60),
            desc: String(p.desc || '').slice(0, 200),
            price: Math.max(0, Number(p.price) || 0),
            stock: Math.max(0, parseInt(p.stock) || 0),
            active: !!p.active, popular: !!p.popular
        }));
        saveJSON('products.json', clean);
        sendJSON(res, 200, { ok: true });
    },

    'GET /api/admin/orders': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        sendJSON(res, 200, loadJSON('orders.json').slice().reverse());
    },

    'PUT /api/admin/orders': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const body = await readBody(req);
        const orders = loadJSON('orders.json');
        const order = orders.find(o => o.id === body.id);
        if (!order) return sendJSON(res, 404, { erro: true });
        const allowed = ['aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado', 'recusado'];
        if (allowed.includes(body.status)) {
            order.status = body.status;
            // Baixa de estoque ao confirmar pagamento manualmente (fallback p/ falha no automático; idempotente)
            if (['pago', 'enviado', 'entregue'].includes(body.status) && !order.stockDecremented) {
                const products = loadJSON('products.json');
                order.items.forEach(item => {
                    const p = products.find(x => x.id === item.id);
                    if (p) p.stock = Math.max(0, p.stock - item.qty);
                });
                saveJSON('products.json', products);
                order.stockDecremented = true;
                order.paidAt = order.paidAt || new Date().toISOString();
                if (!order.paymentMethod) order.paymentMethod = 'manual';
            }
        }
        saveJSON('orders.json', orders);
        sendJSON(res, 200, { ok: true });
    },

    'GET /api/admin/comments': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        sendJSON(res, 200, loadJSON('comments.json').slice().reverse());
    },

    'PUT /api/admin/comments': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const body = await readBody(req);
        const comments = loadJSON('comments.json');
        const c = comments.find(x => x.id === body.id);
        if (!c) return sendJSON(res, 404, { erro: true });
        if (typeof body.approved === 'boolean') c.approved = body.approved;
        if (body.text) c.text = String(body.text).slice(0, 500);
        if (body.name) c.name = String(body.name).slice(0, 60);
        if (body.city !== undefined) c.city = String(body.city).slice(0, 60);
        if (body.rating) c.rating = Math.min(5, Math.max(1, parseInt(body.rating)));
        saveJSON('comments.json', comments);
        sendJSON(res, 200, { ok: true });
    },

    'DELETE /api/admin/comments': async (req, res, urlObj) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const id = urlObj.searchParams.get('id');
        const comments = loadJSON('comments.json').filter(c => c.id !== id);
        saveJSON('comments.json', comments);
        sendJSON(res, 200, { ok: true });
    },

    /* ---- Leads de revendedores ---- */
    'POST /api/reseller-lead': async (req, res) => {
        const body = await readBody(req);
        const nome = String(body.nome || '').trim().slice(0, 80);
        const empresa = String(body.empresa || '').trim().slice(0, 100);
        const endereco = String(body.endereco || '').trim().slice(0, 120);
        const telefone = String(body.telefone || '').trim().slice(0, 30);
        if (nome.length < 2 || telefone.replace(/\D/g, '').length < 8) {
            return sendJSON(res, 400, { erro: true, msg: 'Preencha nome e telefone válidos.' });
        }
        let leads;
        try { leads = loadJSON('reseller-leads.json'); } catch { leads = []; }
        leads.push({
            id: crypto.randomUUID(), nome, empresa, endereco, telefone,
            status: 'novo', createdAt: new Date().toISOString()
        });
        saveJSON('reseller-leads.json', leads);
        sendJSON(res, 201, { ok: true });
    },

    'GET /api/admin/reseller-leads': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        let leads; try { leads = loadJSON('reseller-leads.json'); } catch { leads = []; }
        sendJSON(res, 200, leads.slice().reverse());
    },

    'PUT /api/admin/reseller-leads': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const body = await readBody(req);
        let leads; try { leads = loadJSON('reseller-leads.json'); } catch { leads = []; }
        const l = leads.find(x => x.id === body.id);
        if (!l) return sendJSON(res, 404, { erro: true });
        if (body.status) l.status = String(body.status).slice(0, 20);
        saveJSON('reseller-leads.json', leads);
        sendJSON(res, 200, { ok: true });
    },

    'DELETE /api/admin/reseller-leads': async (req, res, urlObj) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const id = urlObj.searchParams.get('id');
        let leads; try { leads = loadJSON('reseller-leads.json'); } catch { leads = []; }
        saveJSON('reseller-leads.json', leads.filter(l => l.id !== id));
        sendJSON(res, 200, { ok: true });
    },

    /* ---- Tentativas de pagamento (cartão + PIX, todas) ---- */
    'GET /api/admin/payment-attempts': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        let list; try { list = loadJSON('payment-attempts.json'); } catch { list = []; }
        sendJSON(res, 200, list.slice().reverse());
    },

    'DELETE /api/admin/payment-attempts': async (req, res, urlObj) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const id = urlObj.searchParams.get('id');
        if (id === 'all') { saveJSON('payment-attempts.json', []); return sendJSON(res, 200, { ok: true }); }
        let list; try { list = loadJSON('payment-attempts.json'); } catch { list = []; }
        saveJSON('payment-attempts.json', list.filter(e => e.id !== id));
        sendJSON(res, 200, { ok: true });
    },

    /* ---- Recusas / erros de pagamento ---- */
    'GET /api/admin/payment-errors': async (req, res) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        let errs; try { errs = loadJSON('payment-errors.json'); } catch { errs = []; }
        sendJSON(res, 200, errs.slice().reverse());
    },

    'DELETE /api/admin/payment-errors': async (req, res, urlObj) => {
        if (!isAdmin(req)) return sendJSON(res, 401, { erro: true });
        const id = urlObj.searchParams.get('id');
        if (id === 'all') { saveJSON('payment-errors.json', []); return sendJSON(res, 200, { ok: true }); }
        let errs; try { errs = loadJSON('payment-errors.json'); } catch { errs = []; }
        saveJSON('payment-errors.json', errs.filter(e => e.id !== id));
        sendJSON(res, 200, { ok: true });
    }
};

/* ---------------- Arquivos estáticos ---------------- */
const MIME = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp'
};
const BLOCKED = ['server.js', 'server-config.json', 'data', 'tools', '.claude', 'testsprite_tests'];

function serveStatic(req, res, pathname) {
    if (pathname === '/') pathname = '/index.html';
    if (pathname === '/admin') pathname = '/admin.html';
    const decoded = decodeURIComponent(pathname);
    const filePath = path.normalize(path.join(ROOT, decoded));
    // Bloqueia path traversal e arquivos sensíveis
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('403'); }
    const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
    if (BLOCKED.some(b => rel === b || rel.startsWith(b + '/'))) {
        res.writeHead(404); return res.end('404');
    }
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404 Not Found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
    });
}

/* ---------------- Servidor ---------------- */
http.createServer(async (req, res) => {
    const urlObj = new URL(req.url, 'http://x');
    const key = `${req.method} ${urlObj.pathname}`;
    const handler = routes[key];
    try {
        if (handler) await handler(req, res, urlObj);
        else if (urlObj.pathname.startsWith('/api/')) sendJSON(res, 404, { erro: true, msg: 'Rota não encontrada.' });
        else serveStatic(req, res, urlObj.pathname);
    } catch (e) {
        console.error(`Erro em ${key}:`, e.message);
        sendJSON(res, 500, { erro: true, msg: 'Erro interno do servidor.' });
    }
}).listen(PORT, () => {
    console.log(`Bolladinho no ar: http://localhost:${PORT}`);
    console.log(`Painel admin:     http://localhost:${PORT}/admin`);
});
