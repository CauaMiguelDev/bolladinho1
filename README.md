# Bolladinho

Site institucional e loja da **Bolladinho** — a primeira piteira de fibras naturais (bambu).
Landing page com hero cinematográfico (dissolve em Three.js), catálogo, carrinho, checkout
via Mercado Pago (PIX / cartão / boleto), página de revendedor e painel administrativo.

## Stack

- **Front-end:** HTML + CSS + JavaScript puro (sem framework). GSAP, Lenis e Three.js via CDN.
- **Back-end:** Node.js puro (sem dependências externas) — `server.js`.
- **Pagamento:** Mercado Pago Checkout Pro.
- **Dados:** arquivos JSON em `data/`.

## Estrutura

```
index.html          Landing page principal
revendedor.html     Página de revendedor
admin.html          Painel administrativo (/admin)
style.css           Estilos do site
admin-design.css    Estilos do painel
script.js           Front-end (carrinho, produtos, hero, etc.)
server.js           Servidor + API + integração Mercado Pago
data/               Catálogo e dados (products.json versionado; pedidos/pagamentos ignorados)
img/  assets/       Imagens e fontes
DESIGN.md PRODUCT.md Documentação de design e produto
```

## Rodando localmente

1. **Configure as credenciais** (não versionadas):
   ```bash
   cp server-config.example.json server-config.json
   ```
   Edite `server-config.json` com seu Access Token / Public Key do Mercado Pago e defina
   usuário e senha do admin.

2. **Suba o servidor** (Node 18+):
   ```bash
   node server.js
   ```

3. Acesse:
   - Site: http://localhost:8321
   - Admin: http://localhost:8321/admin

## Segurança

- `server-config.json` **nunca** vai para o repositório (está no `.gitignore`). Guarda o
  token do Mercado Pago e a senha do admin.
- Os arquivos de runtime em `data/` (`orders.json`, `payment-attempts.json`,
  `payment-errors.json`, `reseller-leads.json`) são ignorados por conterem dados de clientes.
  O servidor os recria vazios quando ausentes.
