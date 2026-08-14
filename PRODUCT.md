# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Três públicos confirmados, todos prioritários — nenhum é secundário:

1. **Consumidor final (B2C).** Brasileiro, chega pelo Instagram [@soubolladinho](https://www.instagram.com/soubolladinho) ou por indicação, quase sempre no celular. Compra uma caixa de piteiras de bambu para uso próprio. Decide e paga na mesma visita: escolhe o tamanho da caixa, preenche CEP e endereço, paga por cartão ou PIX. Ticket baixo (R$ 5 a R$ 20), então a decisão é rápida e movida por desejo e confiança, não por comparação técnica.

2. **Revendedor / lojista (B2B).** Tabacarias, headshops e lojas físicas que avaliam colocar o produto na vitrine. Chegam por `revendedor.html`, avaliam margem, ticket médio e o suporte oferecido, e se convertem preenchendo um formulário de cadastro (nome, empresa, endereço, telefone) — não há checkout B2B. O lead cai no painel admin, aba "Revendedores".

3. **Dono (operação).** Opera o negócio inteiro sozinho pelo painel em `admin.html`: acompanha pedidos, ajusta produtos e estoque, modera comentários de clientes, lê leads de revendedores e investiga tentativas de pagamento que falharam. Uso diário, muitas vezes no celular, entre outras tarefas.

## Product Purpose

Bolladinho vende **piteiras de bambu** — biodescartáveis e reutilizáveis, feitas de bambu selecionado — em caixas de três tamanhos, direto ao consumidor e através de uma rede de lojas revendedoras.

O site é a operação inteira: vitrine, prova social, checkout com Mercado Pago (cartão e PIX), captação de revendedores e painel administrativo. Sucesso é duplo — venda concluída no B2C e cadastro de lojista qualificado no B2B — e ambos dependem de o produto parecer, na tela, tão elevado quanto é na mão.

## Positioning

O produto se posiciona como uma peça **natural e única**, não como um acessório funcional barato. Três eixos que a cópia do site afirma hoje:

- **Fibra natural em vez de vidro ou papel.** O argumento é material: bambu renovável, biodegradável, resistente, reutilizável, que não altera o sabor.
- **Cada peça é única.** Variação natural do tom da madeira é tratada como valor, não como defeito de fabricação.
- **Parceria real com o lojista, não só fornecimento.** A oferta B2B inclui drive com fotos e vídeos profissionais, material de PDV (displays de balcão e flyers) e divulgação da loja como ponto de venda oficial no Instagram da marca. Esse pacote de suporte é o diferencial competitivo declarado.

**Afirmações de liderança presentes na cópia, ainda não verificadas independentemente:** "a primeira piteira de fibras naturais do mercado" (title e meta description do `index.html`) e "a piteira de bambu nº 1 do Brasil" (title do `revendedor.html`). São posicionamento afirmado pelo dono. Trabalho futuro pode mantê-las e reescrevê-las, mas **não deve criar novas afirmações de superlativo, número ou liderança** sem confirmação.

## Operating Context

- **Origem de tráfego:** Instagram [@soubolladinho](https://www.instagram.com/soubolladinho) é o canal principal e o único link social no site. Mobile domina.
- **Jornada B2C:** vitrine → benefícios do bambu → detalhe do produto → depoimentos → cards de preço → carrinho lateral → checkout (dados pessoais, CPF, CEP com preenchimento automático de endereço, opções de frete, cartão ou PIX).
- **Jornada B2B:** `revendedor.html` → oferta e FAQ → formulário de cadastro → lead no painel.
- **Operação do dono:** login pelo botão-folha discreto no rodapé de `index.html` → `admin.html` → seis abas (Dashboard, Produtos, Pedidos, Comentários, Revendedores, Pagamentos).
- **Retorno dos clientes ao site:** clientes deixam avaliações pelo próprio site (formulário na seção de depoimentos, com nota em estrelas), que entram em moderação antes de aparecer.

## Capabilities and Constraints

**Stack (existente, não é decisão em aberto):** HTML/CSS/JavaScript sem framework e sem bundler no front-end. Back-end é um servidor Node.js **sem nenhuma dependência externa** (`server.js`, apenas `http`/`fs`/`path`/`crypto`), rodando na porta 8321 via `tools\node\node.exe`. Persistência em arquivos JSON em `data/`. Não há `package.json`, `node_modules`, nem processo de build na raiz. Essa ausência de dependências é uma restrição arquitetural deliberada: qualquer proposta que exija npm install, bundler ou framework é uma mudança de arquitetura, não um detalhe de implementação.

**Funcionalidades confirmadas:**
- Catálogo de três produtos (Caixa Pequena R$ 5, Média R$ 9,90 marcada como popular, Grande R$ 20) com controle de estoque, editáveis no painel.
- Carrinho e checkout transparente com Mercado Pago: cartão de crédito com bandeira/parcelas e PIX.
- Consulta de CEP com preenchimento automático de endereço e opções de frete (`shippingFlat: 0` — frete grátis na configuração atual).
- Avaliações enviadas por clientes, com moderação no painel.
- Formulário de leads de revendedores.
- Login de admin com token de sessão de 8h e bloqueio por IP após 5 tentativas (15 min).
- Registro de tentativas de pagamento com motivo da falha, para diagnóstico no painel.

**Restrições e fatos técnicos:**
- Site inteiramente em **português do Brasil**. Não há internacionalização e nenhuma foi pedida.
- Moeda BRL, CPF, CEP e telefone em formatos brasileiros.
- `server-config.json` contém credenciais reais de produção do Mercado Pago e a senha do painel em texto puro no diretório do projeto. O servidor bloqueia acesso HTTP a esse arquivo, mas ele nunca pode ser publicado, versionado ou copiado para dentro de qualquer artefato de design.
- O hero usa Three.js com névoa animada, dissolve e parallax reativo ao mouse (`hero-fog.html`, canvas em `index.html`). É o elemento mais pesado do site e o mais característico da marca.

**Fora de escopo — não confundir:** `plataforma/` contém um sistema de e-commerce separado ("Bolladinho | Lacoste Premium", vestuário, Brasília, Instagram @bolladinho061, React + Vite + Express + Mercado Pago, herdado de um sistema chamado "Artigo de Grife"). O usuário confirmou que **este registro cobre apenas o site da piteira na raiz**. `plataforma/` não é autoridade visual, não é referência de produto e não deve ser editado por trabalho de design deste registro.

## Brand Commitments

- **Nome:** Bolladinho. **Instagram:** @soubolladinho.
- **Assinatura visual incumbente** (autoridade de design existente, documentada aqui como fato, não como direção): fundo verde escuro (`#0c2e17`), bege bambu (`#D4C3A3`), dourado (`#fec81d`), tipografia Playfair Display para títulos e Outfit para corpo, superfícies em vidro fosco, folhas de bambu caindo e hastes decorativas em SVG. Fontes PPWoodland (Bold e Ultralight) estão em `assets/fonts/` e são usadas no hero.
- **Voz:** português brasileiro, sensorial e ritualístico ("o seu ritual diário", "Sinta a Natureza em Suas Mãos", "Conhecido por alguns, descoberto por poucos"), respeitosa com a natureza, sem gíria pesada e sem apelo de desconto agressivo.
- **Discrição deliberada:** a entrada do painel admin é um ícone de folha sem rótulo no rodapé. Não deve virar um link visível de "Admin".

## Evidence on Hand

**Reais e utilizáveis:**
- Quatro depoimentos de clientes em `data/comments.json` (Lucas M. — Brasília/DF, Ana P. — Goiânia/GO, Rafael S. — São Paulo/SP, Juliana R. — Belo Horizonte/MG), todos 5 estrelas, confirmados pelo usuário como **clientes reais com nomes abreviados**. Podem ser usados como prova social legítima. Os IDs `seed-*` são artefato de importação, não indicação de conteúdo fictício.
- Fotografia de produto em `img/`: `img detail.jpg` (macro do produto), `hero-bg.webp`, `mask-1.webp` / `mask-2.webp` (galhos do hero), `hero_revendedor_nature.png`, `bolladinho revenda.PNG`, e quatro fotos de caixa (`sucata_pequena_*`, `sucata_media_*`, `sucata_grande_*`).
- Preços e estoque reais em `data/products.json`.
- Oferta B2B concreta e verificável: drive de fotos/vídeos, displays de balcão, flyers, marcação da loja no Instagram oficial.

**Ausente — nunca inventar:**
- Nenhum pedido real registrado (`data/orders.json` vazio) e nenhum lead de revendedor (`data/reseller-leads.json` vazio). Não existem números de vendas, contagem de clientes, unidades vendidas ou lojas parceiras. Nada disso pode aparecer como contador, estatística ou "mais de X clientes".
- Nenhuma certificação ambiental, laudo, selo de sustentabilidade ou teste de laboratório. As afirmações sobre biodegradabilidade e renovabilidade são descritivas do material, não certificadas.
- Nenhum logo de imprensa, cliente corporativo ou parceiro.
- Nenhuma política de troca, prazo de entrega ou garantia documentada.

## Product Principles

1. **O material é o argumento.** Toda decisão deve fazer o bambu — sua textura, seu tom, sua origem natural — ser sentido antes de ser explicado. O produto se vende pelo toque; a tela precisa substituir o toque.
2. **Ticket baixo, decisão rápida.** A compra custa entre R$ 5 e R$ 20. Nada no caminho até o pagamento pode pedir mais esforço do que o valor justifica. Fricção no checkout custa mais do que a margem do pedido.
3. **Três públicos, um mundo.** Consumidor, lojista e dono usam superfícies diferentes com necessidades opostas — desejo, margem, velocidade operacional — mas nenhuma delas pode parecer de outra marca.
4. **Provar sem inflar.** A marca tem depoimentos reais, fotos reais e uma oferta B2B concreta. Isso é suficiente. Números fabricados, selos inventados e superlativos novos destruiriam a credibilidade que o cuidado material constrói.
5. **Peso onde importa.** O hero carrega efeito 3D e névoa animada de propósito — é a assinatura. Em contrapartida, o resto do site e o painel devem ser leves e rápidos, porque o público é majoritariamente móvel.

## Accessibility & Inclusion

Nenhum padrão formal (WCAG nível X) foi estabelecido pelo usuário — decisão em aberto. Restrições factuais conhecidas: público majoritariamente móvel em conexões brasileiras variáveis; o hero animado com movimento contínuo e parallax reativo ao mouse é um risco real para usuários sensíveis a movimento, e o comportamento sob `prefers-reduced-motion` precisa ser tratado como requisito, não como refinamento opcional.
