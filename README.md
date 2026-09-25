<div align="center">

# 🌿 Bolladinho

**A primeira piteira de fibras naturais do mercado — feita de bambu selecionado.**
Biodescartável, reutilizável e única como uma impressão digital.

[![Site no ar](https://img.shields.io/badge/🌐_site_no_ar-cauamigueldev.github.io%2Fbolladinho1-2f8f5b?style=for-the-badge)](https://cauamigueldev.github.io/bolladinho1/)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/CauaMiguelDev/bolladinho1)

[![Instagram](https://img.shields.io/badge/Instagram-@soubolladinho-4aa168?logo=instagram&logoColor=white)](https://www.instagram.com/soubolladinho)
![Node](https://img.shields.io/badge/Node.js-18%2B-33844f?logo=node.js&logoColor=white)
![Sem dependências](https://img.shields.io/badge/depend%C3%AAncias-zero-74c08e)
![Mercado Pago](https://img.shields.io/badge/pagamento-Mercado_Pago-266b3f)

### 👉 [**Acessar o site**](https://cauamigueldev.github.io/bolladinho1/) · [**Seja revendedor**](https://cauamigueldev.github.io/bolladinho1/revendedor.html) · [**Painel (demo)**](https://cauamigueldev.github.io/bolladinho1/admin.html)

</div>

---

## 🌐 Onde o site está no ar

| Versão | Link | O que funciona |
|---|---|---|
| **Vitrine** (GitHub Pages) | **https://cauamigueldev.github.io/bolladinho1/** | Site inteiro navegável, produtos, depoimentos, página de revendedor (formulário envia por e-mail). O checkout completo abre normalmente (dados, CEP com endereço automático, PIX ou cartão animado) e o pedido **é concluído pelo WhatsApp** da loja — os dados do cartão nunca saem do aparelho. O [painel admin](https://cauamigueldev.github.io/bolladinho1/admin.html) abre em **modo demonstração** (dados de exemplo, nada é salvo). Atualiza sozinho a cada push na `main`. |
| **Loja completa** (Render) | clique em **Deploy to Render** acima | Tudo da vitrine **+** checkout com Mercado Pago (PIX e cartão), cálculo de frete (SuperFrete), estoque, avaliações moderadas e o painel admin em `/admin`. |

> O GitHub Pages só hospeda arquivos estáticos, por isso a versão de lá não tem o servidor de
> pagamento. Para a loja completa, use o Render (plano grátis disponível) — veja [Deploy](#-deploy-loja-completa-no-render).

## ✨ O que tem no site

- **Hero cinematográfico** — névoa em Three.js, dissolve e parallax reativo ao mouse.
- **Visual "Mata Viva"** — paleta em tons de verde (musgo → jade → menta), fundo animado,
  navegação em ilha de vidro com scrollspy, botões com hover suave e rodapé com chamada.
- **Loja** — três caixas (Pequena, Média, Grande), carrinho lateral e checkout transparente
  com validação ao vivo dos campos (CPF, e-mail, CEP com endereço automático, cartão).
- **Pagamento** — Mercado Pago: PIX e cartão em até 12x.
- **Revendedores** — página B2B com FAQ e cadastro de lojas.
- **Painel admin** (`/admin`) — dashboard com período 7/14/30/90 dias, KPIs com tendência,
  meta do mês, gráficos, estoque, regiões, avaliações, atividade recente, exportação CSV;
  além de gestão de produtos, pedidos, comentários, leads e tentativas de pagamento.

## 🧱 Stack

- **Front-end:** HTML + CSS + JavaScript puro (sem framework, sem build). GSAP, Lenis, Three.js e Chart.js via CDN.
- **Back-end:** Node.js puro, **sem nenhuma dependência** — `server.js`.
- **Pagamento:** Mercado Pago · **Frete:** SuperFrete · **Dados:** arquivos JSON em `data/`.

## 📁 Estrutura

```
index.html            Landing page + loja
revendedor.html       Página de revendedor (B2B)
admin.html            Painel administrativo (/admin)
style.css             Estilos base do site
enhance.css/.js       Camada visual "Mata Viva" (nav, rodapé, botões, checkout)
admin-design.css      Estilos base do painel
admin-enhance.css     Paleta verde + dashboard do painel
script.js             Front-end (carrinho, produtos, hero, checkout)
server.js             Servidor + API + Mercado Pago + SuperFrete
render.yaml           Blueprint de deploy no Render
.github/workflows/    Publicação automática da vitrine no GitHub Pages
data/                 Catálogo e avaliações (pedidos/leads/pagamentos não são versionados)
img/  assets/         Imagens e fontes
DESIGN.md PRODUCT.md  Documentação de design e produto
```

## 💻 Rodando localmente

```bash
cp server-config.example.json server-config.json   # preencha as credenciais
node server.js                                      # Node 18+
```

- Site: http://localhost:8321
- Admin: http://localhost:8321/admin

## 🚀 Deploy (loja completa no Render)

1. Clique em [**Deploy to Render**](https://render.com/deploy?repo=https://github.com/CauaMiguelDev/bolladinho1)
   e faça login (dá para usar a conta do GitHub).
2. O Render lê o `render.yaml` e pede as variáveis:
   - `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY` — Mercado Pago (produção)
   - `ADMIN_USER`, `ADMIN_PASSWORD` — login do painel `/admin`
   - `SUPERFRETE_TOKEN`, `ORIGIN_CEP` — frete (SuperFrete + CEP de origem)
   - `NOTIFY_EMAIL` (opcional)
3. Em ~1 minuto o site fica no ar em `https://bolladinho.onrender.com` (ou o nome que o Render
   atribuir). Coloque esse link na tabela lá em cima.

4. **Ligar o GitHub Pages ao Render (opcional):** em *Settings → Secrets and variables → Actions →
   Variables*, crie a variável `BOLLA_API` com a URL do Render (ex.: `https://bolladinho.onrender.com`)
   e rode o workflow *Publicar vitrine*. A partir daí o site do GitHub Pages também cobra por PIX/cartão
   de verdade, calcula frete e o `admin.html` faz login real — o servidor já libera o acesso (CORS)
   para `https://cauamigueldev.github.io`.

> ⚠️ O disco do plano grátis é **efêmero**: pedidos e avaliações gravados em `data/` se perdem
> a cada redeploy/restart, e o serviço hiberna após 15 min sem acesso. Para produção de
> verdade, use o plano pago com disco ou migre os dados para um banco.

## 🔒 Segurança

- `server-config.json` **nunca** vai para o repositório (`.gitignore`): guarda o token do
  Mercado Pago e a senha do admin.
- Arquivos de runtime em `data/` (`orders.json`, `payment-attempts.json`,
  `payment-errors.json`, `reseller-leads.json`) são ignorados por conterem dados de clientes.
- A versão do GitHub Pages publica só arquivos públicos (HTML, CSS, JS e imagens) — nada do servidor nem do painel.

---

<div align="center">
Feito com 🌿 no Brasil · <a href="https://www.instagram.com/soubolladinho">@soubolladinho</a>
</div>
