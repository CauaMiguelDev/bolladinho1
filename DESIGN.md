---
name: Bolladinho
description: O bambuzal à meia-noite — verde profundo, ouro filtrado e vidro orvalhado, com um painel operacional em preto e platina.
colors:
  verde-mata-fechada: "#0c2e17"
  verde-mata-clara: "#133d1f"
  verde-colmo: "#345e43"
  verde-colmo-claro: "#4A7A5B"
  bambu-curado: "#D4C3A3"
  ouro-de-resina: "#fec81d"
  orvalho: "#E8F0EA"
  orvalho-fosco: "#A3B5AA"
  painel-preto: "#000000"
  painel-base: "#070709"
  painel-elevado: "#121318"
  platina: "#FFFFFF"
  platina-fosca: "#A1A1A6"
  painel-texto-secundario: "#8E8E93"
  painel-texto-fraco: "#636366"
  sucesso: "#00E676"
  alerta: "#FFD600"
  perigo: "#FF1744"
typography:
  display:
    fontFamily: "PPWoodland, Cormorant Garamond, serif"
    fontSize: "clamp(48px, 14.5vw, 240px)"
    fontWeight: 200
    lineHeight: 0.88
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Playfair Display, serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Playfair Display, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.26em"
  kicker:
    fontFamily: "GT America Trial, Outfit, sans-serif"
    fontSize: "clamp(0.72rem, 1.2vw, 0.95rem)"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.42em"
  painel-heading:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  painel-body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  painel-numeral:
    fontFamily: "Outfit, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "normal"
rounded:
  input: "10px"
  sm: "12px"
  md: "16px"
  card: "20px"
  button: "50px"
  chip: "100px"
  painel-sm: "12px"
  painel-md: "16px"
  painel-lg: "20px"
  painel-pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "3.5rem"
  section: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.verde-colmo}"
    textColor: "{colors.orvalho}"
    typography: "{typography.body}"
    rounded: "{rounded.button}"
    padding: "1rem 2rem"
  button-primary-hover:
    backgroundColor: "{colors.verde-colmo-claro}"
    textColor: "{colors.orvalho}"
  button-large:
    backgroundColor: "{colors.verde-colmo}"
    textColor: "{colors.orvalho}"
    rounded: "{rounded.button}"
    padding: "1.2rem 2.5rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.bambu-curado}"
    rounded: "{rounded.button}"
    padding: "1rem 2rem"
  button-outline-hover:
    backgroundColor: "{colors.bambu-curado}"
    textColor: "{colors.verde-mata-fechada}"
  card-glass:
    textColor: "{colors.orvalho}"
    rounded: "{rounded.card}"
    padding: "2.5rem"
  card-pricing:
    textColor: "{colors.orvalho}"
    rounded: "{rounded.card}"
    padding: "3.5rem 2.5rem 3rem"
  input-field:
    backgroundColor: "rgba(0, 0, 0, 0.3)"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "{rounded.input}"
    padding: "0.85rem 1rem"
  chip-eyebrow:
    backgroundColor: "rgba(254, 200, 29, 0.08)"
    textColor: "{colors.ouro-de-resina}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "0.4rem 0.95rem"
  painel-button-primary:
    backgroundColor: "{colors.platina}"
    textColor: "{colors.painel-preto}"
    rounded: "{rounded.painel-sm}"
    padding: "0.7rem 1.3rem"
  painel-button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.012)"
    textColor: "{colors.painel-texto-secundario}"
    rounded: "{rounded.painel-sm}"
    padding: "0.7rem 1.3rem"
  painel-card:
    backgroundColor: "rgba(255, 255, 255, 0.012)"
    textColor: "{colors.platina}"
    rounded: "{rounded.painel-lg}"
    padding: "20px 22px"
  painel-nav-item-active:
    backgroundColor: "{colors.platina}"
    textColor: "{colors.painel-preto}"
    padding: "12px 20px"
---

# Design System: Bolladinho

## Overview

**Creative North Star: "O Bambuzal à Meia-Noite"**

Imagine um bambuzal fechado depois do anoitecer. O chão é verde tão profundo que quase não é mais cor (`#0c2e17`); a névoa corre entre os colmos; e a única luz que entra é dourada, filtrada, chegando em faixas estreitas. Tudo que é claro nesse ambiente é claro porque a luz atravessou algo — nunca porque alguém acendeu uma lâmpada branca. É essa a física deste sistema, e ela decide praticamente tudo: por que o fundo é escuro, por que o dourado é raro e precioso, por que as superfícies são vidro embaçado em vez de painel sólido, e por que a profundidade vem da atmosfera e não do contorno.

O sistema é **orgânico e tátil**. Nada tem canto vivo; botões são cápsulas completas (50px) e cards têm 20px de raio, porque o produto que eles vendem é uma peça de bambu torneada, sem aresta. Os elementos respondem ao cursor como matéria física: sobem 10px, ganham sombra e mudam de tom. Essa elevação no hover não é enfeite — é a assinatura de interação da marca, e um card que não levanta parece quebrado dentro deste mundo.

O projeto opera **dois mundos visuais, e isso é deliberado**. A vitrine (`index.html`, `revendedor.html`) vive no bambuzal: verde, ouro, vidro, Playfair Display, névoa 3D. O painel do dono (`admin.html`) vive num mundo separado de preto absoluto e platina, com Plus Jakarta Sans e Fraunces — porque ali o trabalho é operar, não ser seduzido. Os dois não se misturam e não devem convergir; o que os une é o rigor, não a paleta.

**Key Characteristics:**
- Fundo verde quase preto como chão universal do storefront — nenhuma superfície branca sólida
- Ouro de Resina raro e pontual, tratado como luz filtrada e não como cor de preenchimento
- Vidro fosco (`backdrop-filter: blur(16px) saturate(1.25)`) como material padrão das superfícies
- Duas vozes tipográficas de display: PPWoodland monumental no hero, Playfair Display em todo o resto
- Caixa alta sempre com rastro largo (letter-spacing ≥ 0.26em)
- Profundidade atmosférica: sombras enormes e difusas, jamais contorno duro
- Hover que levanta 10px como gesto padrão de resposta
- Um segundo mundo, preto e platina, exclusivo da operação

## Colors

Uma mata noturna iluminada por uma única fresta de luz: cinco verdes e neutros vegetais que formam o ambiente, um dourado que é a luz, e uma paleta separada de preto e platina que pertence só ao painel.

### Primary
- **Verde Mata Fechada** (`#0c2e17`): o chão de todo o storefront. É o `background-color` do `body` e o fundo padrão de qualquer seção que não tenha motivo para ser outra coisa. Também é a cor do *texto* sobre superfícies bege claras (botão outline em hover), fechando o ciclo.
- **Verde Mata Clara** (`#133d1f`): a segunda camada. Usada para alternar seções adjacentes e criar ritmo vertical sem introduzir uma cor nova. A diferença é sutil de propósito — separa, não divide.
- **Verde Colmo** (`#345e43`): a cor de ação. É o preenchimento do botão primário e a borda do card de preço em destaque. É o verde que existe para ser clicado.
- **Verde Colmo Claro** (`#4A7A5B`): estado ativo. Aparece no hover do botão primário, na borda de foco dos campos de formulário e no `accent-color` dos rádios. Nunca é cor de repouso — só de resposta.

### Secondary
- **Bambu Curado** (`#D4C3A3`): o bege da fibra seca. Carrega toda a titulação em Playfair Display (`h2` de seção, `h3` de card, o logotipo) e as bordas de vidro (`rgba(212,195,163,0.14)`). É o que faz o sistema parecer madeira e não plástico escuro.

### Tertiary
- **Ouro de Resina** (`#fec81d`): a luz filtrada. O H1 do hero, o eyebrow em caixa alta, o sublinhado que cresce sob o link de navegação no hover, e o anel de destaque do card popular. Nunca preenche um botão inteiro, nunca é fundo de bloco. Sua raridade é a razão de ele funcionar.

### Neutral
- **Orvalho** (`#E8F0EA`): a cor padrão do texto corrido sobre o verde. Um branco levemente esverdeado, nunca `#fff` puro no corpo de texto — o branco puro é reservado ao H1 de página interna e a campos de entrada.
- **Orvalho Fosco** (`#A3B5AA`): texto secundário, legendas e subtítulos de seção. Recua sem sumir.

### Painel (mundo separado)
- **Painel Preto** (`#000000`) e **Painel Base** (`#070709`): o fundo do admin, com dois gradientes radiais fixos por cima que dão uma respiração cinza no canto superior esquerdo e inferior direito.
- **Painel Elevado** (`#121318`): superfícies levantadas da operação.
- **Platina** (`#FFFFFF`) e **Platina Fosca** (`#A1A1A6`): o acento do painel, quase sempre aplicado como o gradiente `linear-gradient(135deg, #FFFFFF 0%, #A1A1A6 100%)` em botões primários e no item de navegação ativo, com texto preto por cima.
- **Sucesso** (`#00E676`), **Alerta** (`#FFD600`), **Perigo** (`#FF1744`): estados de pedido e pagamento. Existem **apenas** no painel — o storefront não tem semântica de status.

### Named Rules

**A Regra da Luz Filtrada.** O Ouro de Resina ocupa no máximo ~10% de qualquer tela e nunca preenche uma superfície. Ele marca: um eyebrow, um sublinhado, um número de preço, o H1 do hero. Um botão dourado sólido quebra a regra e mata o efeito. Teste: se você conseguir cobrir todo o dourado da tela com dois dedos, está certo.

**A Regra do Chão Verde.** Nenhuma superfície do storefront é um bloco branco ou cinza claro sólido. Superfícies claras existem só como vidro translúcido sobre o verde. Um card branco neste sistema lê como um erro de carregamento.

**A Regra da Fronteira.** As cores de status (`#00E676`, `#FFD600`, `#FF1744`) e a paleta platina pertencem ao painel. Elas não atravessam para a vitrine, e o verde/ouro não atravessa para o painel.

## Typography

**Display Font:** PPWoodland (Ultralight 200 / Bold 700, `.woff2` local em `assets/fonts/`), com fallback Cormorant Garamond, serif
**Headline Font:** Playfair Display (600), serif
**Body Font:** Outfit (300–700), sans-serif
**Kicker Font:** GT America Trial, com fallback Outfit
**Painel:** Fraunces (títulos), Plus Jakarta Sans (interface), Outfit (numerais)

**Character:** PPWoodland em peso 200 e escala colossal é a voz da marca falando uma vez só — fina, alta e dourada, como luz vertical. Playfair Display assume depois, mais quente e editorial, e Outfit carrega tudo que precisa ser lido rápido sem chamar atenção. O contraste entre uma serifada de altíssimo contraste e uma sem-serifa geométrica neutra é o que dá ao sistema seu ar de produto artesanal apresentado com rigor.

### Hierarchy
- **Display** (PPWoodland 200, `clamp(48px, 14.5vw, 240px)`, line-height 0.88, letter-spacing 0.04em): exclusivo do H1 do hero, em Ouro de Resina com `text-shadow: 0 4px 45px rgba(254,200,29,0.28)`. Uma vez por página, no primeiro viewport.
- **Headline** (Playfair Display 600, 2.5rem): títulos de seção, em Bambu Curado. É o tamanho que organiza a página inteira abaixo do hero.
- **Title** (Playfair Display 600, 1.5rem–1.8rem): títulos de card — 1.5rem em cards de benefício, 1.8rem em cards de preço, sempre em Bambu Curado.
- **Body** (Outfit 400, 1rem, line-height 1.6): texto corrido em Orvalho. Parágrafos de seção limitados a `max-width: 600px` e centralizados; nunca deixe uma linha passar de ~75 caracteres.
- **Label** (Outfit 700, 0.7rem, letter-spacing 0.26em, caixa alta): o eyebrow em cápsula dourada que abre cada seção.
- **Kicker** (GT America Trial 600, `clamp(0.72rem, 1.2vw, 0.95rem)`, letter-spacing 0.42em, caixa alta): as duas linhas douradas que emolduram o H1 do hero ("SUBA NO" / "CONHECIDO POR ALGUNS, DESCOBERTO POR POUCOS"). O rastro extremo é o ponto.

### Named Rules

**A Regra das Duas Vozes.** PPWoodland só existe no hero. Playfair Display governa todos os outros títulos. Usar PPWoodland numa seção interna gasta a única cartada monumental do sistema e nivela a página.

**A Regra do Rastro Largo.** Todo texto em caixa alta carrega `letter-spacing` de no mínimo 0.26em, e usa `text-indent` igual ao spacing para compensar o espaço final da última letra. Caixa alta apertada não existe neste sistema.

**A Regra do Peso Fino.** No display, quanto maior, mais fino. PPWoodland em 240px roda em peso 200. Escala grande com peso pesado pertence a outro mundo visual, não a este.

## Layout

Container centralizado de `max-width: 1200px` com `padding: 0 2rem`, sobre um `body` que carrega `overflow-x: hidden` — o sistema tem elementos decorativos (bambus em SVG, blobs de luz) que sangram intencionalmente para fora da viewport e não podem gerar scroll horizontal.

O ritmo vertical é generoso e editorial: seções respiram a `8rem` de padding vertical, o título de seção fica isolado e centralizado acima do conteúdo, e cards se organizam em grids de 3 colunas que colapsam para 1. A densidade é deliberadamente baixa — este não é um sistema que empilha informação, é um que dá espaço a ela.

Breakpoints observados, do maior para o menor: `992px` (grid de 3 colunas quebra), `900px`, `768px` (breakpoint principal — navegação vira menu hambúrguer, grids viram coluna única, escalas de tipo caem), `560px` e `480px` (ajustes finos de tipografia e padding em telas pequenas).

O `.hero` ocupa a viewport inteira e é a única região com sistema de camadas próprio: fundo em `<img>`, canvas Three.js de névoa, galhos com parallax (`data-sway`), vinheta e conteúdo — todos em `transform-style: preserve-3d` com `will-change: transform`.

**A Regra da Barra Ausente.** A navegação começa fora da tela (`translateY(-105%)`, `opacity: 0`, `pointer-events: none`) e só entra quando a página rola, via `.scrolled`. O primeiro viewport pertence inteiramente ao hero. Nunca coloque uma barra fixa opaca sobre o topo do hero.

## Elevation & Depth

**A profundidade deste sistema é atmosférica, não estrutural.** Ela vem de três coisas empilhadas: névoa real (o canvas Three.js do hero), vidro fosco (`backdrop-filter: blur(16px) saturate(1.25)`) e sombras enormes e muito difusas que leem como distância dentro do bambuzal. Sombra aqui não desenha a borda de um objeto — ela afasta o objeto do fundo. Por isso todos os valores têm blur alto (20px a 60px), offset vertical grande e offset horizontal zero.

A borda de um card não é uma linha desenhada: é `1px solid rgba(212, 195, 163, 0.14)` — bambu a 14% de opacidade, quase o brilho de uma quina molhada. Junto vem um `inset 0 1px 0 rgba(255,255,255,0.06)` que simula a luz batendo no topo da superfície de vidro.

### Shadow Vocabulary
- **Repouso do vidro** (`box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`): estado padrão de qualquer superfície `.glass`.
- **Elevação de hover** (`box-shadow: 0 20px 45px rgba(0,0,0,0.45)`): acompanha o `translateY(-10px)` em cards de benefício e depoimento.
- **Destaque de preço** (`box-shadow: 0 15px 40px rgba(0,0,0,0.5)`): o card popular, que já vive elevado com `transform: scale(1.05)`.
- **Halo dourado** (`box-shadow: 0 0 0 1px rgba(254,200,29,0.28), 0 28px 60px rgba(0,0,0,0.55)`): destaque máximo, para o elemento mais importante de uma tela. O anel dourado de 1px substitui a borda de bambu.
- **Brilho verde de ação** (`box-shadow: 0 10px 20px rgba(52,94,67,0.4)`): exclusivo do botão primário em hover — a sombra herda a cor do próprio botão, não o preto.
- **Painel** (`0 20px 50px rgba(0,0,0,0.6)` + `0 0 24px rgba(255,255,255,0.15)` como brilho de platina): mesma doutrina difusa, executada em preto.

### Named Rules

**A Regra da Sombra sem Contorno.** Blur mínimo de 20px, offset horizontal sempre zero, opacidade máxima ~0.6. Nenhuma sombra curta, dura ou colada ao objeto. Se a sombra desenha a silhueta em vez de afastá-la do fundo, está errada.

**A Regra dos 10px.** O gesto de resposta padrão é `translateY(-10px)` com a sombra crescendo junto, em `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Botões usam uma versão curta (`-3px`). Uma superfície interativa que não se move ao hover está fora do sistema.

**A Regra da Luz de Cima.** Todo vidro carrega o `inset 0 1px 0 rgba(255,255,255,0.06)` no topo. É uma linha só, quase invisível, e é ela que impede o card de parecer um retângulo chapado.

## Shapes

Nada neste sistema tem canto vivo, porque o produto que ele vende não tem. O raio mínimo é 10px (campos de formulário) e a escala sobe por 12px, 14px, 16px até 20px, que é o raio canônico de card — benefício, preço, depoimento e formulário de avaliação usam todos os mesmos 20px.

Botões são **cápsulas completas** (`border-radius: 50px` sobre uma altura de ~56px), e eyebrows são pílulas de 100px. Elementos circulares perfeitos (`50%`) aparecem em ícones e avatares. Não existe retângulo de canto reto na interface do storefront — a única exceção é o canvas do hero, que sangra para as bordas da viewport.

Bordas são sempre translúcidas, nunca sólidas: `rgba(212,195,163,0.14)` no repouso, subindo para `rgba(212,195,163,0.3)` no hover. O card popular quebra o padrão de propósito, usando `1px solid var(--color-primary)` sólido — é o único lugar do sistema onde uma borda opaca é permitida, porque ela precisa vencer a hierarquia.

Há ainda um vocabulário decorativo de silhueta: colmos de bambu em SVG sangrando pelas laterais (`.bamboo-decor`), folhas caindo em partículas, e blobs de luz difusa (`.sfx-blob`) posicionados nos cantos das seções.

**A Regra do Colmo.** Raio mínimo de 10px em qualquer superfície. Canto reto pertence a outro sistema.

## Components

### Buttons
- **Shape:** cápsula completa (`border-radius: 50px`), com `overflow: hidden` para conter o brilho que atravessa o botão via `::before`.
- **Primary:** preenchimento Verde Colmo (`#345e43`) com texto Orvalho, `padding: 1rem 2rem`, Outfit 600, 1rem. Variante grande: `padding: 1.2rem 2.5rem`, 1.2rem.
- **Hover / Focus:** fundo passa a Verde Colmo Claro (`#4A7A5B`), sobe `translateY(-3px)` e ganha sombra verde `0 10px 20px rgba(52,94,67,0.4)` — a sombra é colorida, não preta. Transição `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- **Outline:** fundo transparente, borda `1px solid` Bambu Curado, texto Bambu Curado. No hover **inverte**: fundo bege sólido, texto Verde Mata Fechada. É o único momento em que uma superfície clara sólida aparece no storefront, e ela é temporária.

### Chips
- **Eyebrow:** cápsula de 100px com fundo `rgba(254,200,29,0.08)`, borda `1px solid rgba(254,200,29,0.22)` e texto Ouro de Resina em Outfit 700, 0.7rem, letter-spacing 0.26em, caixa alta. Quase sempre acompanhada de um ícone à esquerda com `gap: 0.5rem`. Abre cada seção.

### Cards / Containers
- **Corner Style:** 20px, uniforme.
- **Background:** `linear-gradient(155deg, rgba(46,78,54,0.30), rgba(15,40,23,0.42))` com `backdrop-filter: blur(16px) saturate(1.25)`. O gradiente diagonal a 155° é o que dá ao vidro a impressão de luz vindo do alto.
- **Border:** `1px solid rgba(212, 195, 163, 0.14)`, subindo a 0.3 no hover.
- **Shadow Strategy:** "Repouso do vidro" no default, "Elevação de hover" ao passar o cursor (ver Elevation & Depth).
- **Internal Padding:** 2.5rem para cards de conteúdo; 3.5rem 2.5rem 3rem para cards de preço, que precisam de mais ar acima do título.
- **Card popular:** `transform: scale(1.05)`, fundo mais opaco (`rgba(30,50,35,0.5)`), borda sólida Verde Colmo, `z-index: 10`. Escala e opacidade fazem o trabalho de hierarquia; nenhum badge gritante é necessário.

### Inputs / Fields
- **Style:** fundo `rgba(0,0,0,0.3)` — mais escuro que o ambiente, como um recorte no verde — borda `1px solid rgba(255,255,255,0.1)`, raio 10px, `padding: 0.85rem 1rem`, texto branco puro em Outfit 0.95rem.
- **Label:** acima do campo, Bambu Curado, 0.85rem, peso 500, `margin-bottom: 0.35rem`.
- **Focus:** `outline: none` com a borda passando a Verde Colmo Claro (`#4A7A5B`) em 0.3s. **Nota de acessibilidade:** essa troca de borda é hoje o único indicador de foco. Qualquer trabalho futuro em formulários deve reforçar isso com um anel visível (`box-shadow: 0 0 0 3px rgba(74,122,91,0.28)`, valor que já existe no sistema), porque uma borda de 1px não atende contraste de foco.
- **Radio:** `accent-color: var(--color-primary-light)`, 16px.

### Navigation
- **Style:** totalmente transparente, sem barra e sem fundo. Começa escondida acima da viewport e desce ao rolar (`transform` em `0.5s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Links:** Outfit 500, 0.95rem, cor Orvalho. No hover, um sublinhado dourado de 2px cresce da esquerda para a direita (`width: 0` → `100%`), 5px abaixo do texto. Esse crescimento é o único uso de ouro em movimento no sistema.
- **Logo:** Playfair Display 700, 1.5rem, Bambu Curado, com ícone de folha à esquerda.
- **Mobile (≤768px):** os links colapsam em menu hambúrguer via `#menu-toggle`.

### Overlays (carrinho e checkout)
- Painel lateral que entra pela direita sobre um fundo `rgba(0,0,0,0.6)` com `backdrop-filter: blur(5px)`, `z-index: 2000`, transição de opacidade em 0.3s. O desfoque do fundo é o que mantém o overlay dentro da linguagem de vidro em vez de virar um modal genérico.

### Painel administrativo (mundo separado)
- **Fundo:** preto absoluto com dois gradientes radiais fixos (`at 20% 0%` cinza `#17181F`, `at 80% 100%` `#08080C`), `background-attachment: fixed`.
- **Card:** `rgba(255,255,255,0.012)` — vidro quase invisível — borda `rgba(255,255,255,0.08)`, raio 20px, blur de 24px, sombra `0 20px 50px rgba(0,0,0,0.6)`.
- **Botão primário:** gradiente platina `linear-gradient(135deg, #FFFFFF, #A1A1A6)` com texto **preto**, raio 12px, Outfit 700. No hover, `filter: brightness(1.08)` e `translateY(-1px)` — gesto muito menor que o do storefront, porque é uma ferramenta de uso repetido.
- **Botão ghost:** fundo de vidro, borda sutil, texto secundário.
- **Item de navegação ativo:** preenchido com o gradiente platina, texto preto, `border-left: 3px solid #FFFFFF` e brilho `0 0 24px rgba(255,255,255,0.15)`.
- **Badge de status:** pílula de 20px, 0.72rem, peso 700, colorida pelas cores de estado.
- **Numerais de KPI:** Outfit 800 em 26px — a única concessão tipográfica que atravessa entre os dois mundos, e ela existe porque números precisam de uma sem-serifa larga e legível.

### Signature: o hero em névoa
O elemento mais característico do sistema e o mais caro. Combina imagem de fundo, canvas Three.js com névoa animada e dissolve, dois galhos em `.webp` com parallax reativo ao mouse (`data-sway="16"` e `"14"`), vinheta radial e o H1 em PPWoodland dourado. Roda em `transform-style: preserve-3d` com `will-change: transform`. É a assinatura da marca e justifica seu peso — mas é a **única** região que pode custar esse tanto.

## Do's and Don'ts

### Do:
- **Do** manter o Ouro de Resina (`#fec81d`) abaixo de ~10% da tela e sempre como marca pontual — eyebrow, sublinhado, numeral, H1 do hero.
- **Do** usar vidro (`backdrop-filter: blur(16px) saturate(1.25)` sobre gradiente 155°) para qualquer superfície nova do storefront, com borda `rgba(212,195,163,0.14)` e o `inset` de luz no topo.
- **Do** dar a toda superfície interativa o gesto de `translateY(-10px)` com sombra crescendo (`-3px` em botões).
- **Do** abrir cada seção com o eyebrow em cápsula dourada, depois Headline em Playfair Bambu Curado, depois um parágrafo em Orvalho Fosco com `max-width: 600px`.
- **Do** manter `letter-spacing` ≥ 0.26em em qualquer texto em caixa alta, com `text-indent` correspondente.
- **Do** respeitar `prefers-reduced-motion: reduce`, que já desliga o Ken Burns, os blobs, os depoimentos animados e os reveals. Todo movimento novo entra com sua regra de desligamento no mesmo commit.
- **Do** manter o hero limpo no primeiro viewport, com a navegação entrando só ao rolar.
- **Do** manter o painel no seu próprio mundo preto e platina, com gestos de hover menores e densidade maior que a da vitrine.

### Don't:
- **Don't** introduzir superfície branca ou cinza claro sólida no storefront. Claro só como vidro translúcido.
- **Don't** preencher um botão inteiro com o dourado, nem usá-lo como fundo de bloco.
- **Don't** usar PPWoodland fora do H1 do hero.
- **Don't** usar sombra dura, curta ou com offset horizontal. Blur mínimo de 20px, offset-x sempre zero.
- **Don't** usar canto reto. Raio mínimo 10px; botões são cápsulas de 50px.
- **Don't** levar as cores de status (`#00E676`, `#FFD600`, `#FF1744`) para a vitrine, nem o verde/ouro para o painel.
- **Don't** colocar uma barra de navegação fixa e opaca sobre o topo do hero.
- **Don't** derivar para **head shop genérica**: neon, roxo com verde-limão, folha de cannabis, tipografia grafitada. O produto é posicionado como peça natural elevada.
- **Don't** derivar para **SaaS minimalista**: branco liso, azul corporativo, Inter, cards sem material. Correto demais, sem natureza e sem memória.
- **Don't** derivar para **eco genérico**: verde-claro de estoque, iconezinho de folha, textura de papel kraft, tipografia manuscrita. É o clichê mais próximo deste projeto e por isso o mais perigoso — a distância entre o Bambuzal à Meia-Noite e um selo de sustentabilidade de banco de imagens é toda a marca.
- **Don't** replicar padrões de `plataforma/`. Aquele diretório é um sistema de e-commerce separado e não é autoridade visual deste projeto.

## Atualização v2 — Mata Viva (set/2026)

Camada nova carregada por último: `enhance.css` + `enhance.js` (vitrine) e `admin-enhance.css` (painel). **O hero não é tocado** — todo seletor da camada é escopado fora de `.hero`.

- **Paleta em escala de verdes** (`--g-950` … `--g-100`: mata, musgo `#266b3f`, samambaia `#33844f`, jade `#4aa168`, menta `#74c08e`, menta pálida `#a9dcb7`), misturada em gradientes. O verde de ação deixa de ser chapado e vira `--grad-action`. O ouro continua raro.
- **Fundo personalizado**: malha de luz verde fixa que respira + grão + fibras de bambu; seções translúcidas deixam a malha aparecer; holofote que segue o ponteiro no desktop; barra de progresso de leitura.
- **Movimento**: uma curva (`--ease-silk: cubic-bezier(0.22,1,0.36,1)`), durações de 0.5–0.9s, só transform/opacity. Botões: gradiente que desliza + luz que segue o cursor + pressão `scale(.98)`. Tilt e botões magnéticos são interpolados (lerp), não saltam.
- **Navegação**: ilha de vidro flutuante após o hero, links inline no desktop com indicador deslizante e scrollspy, esconde ao descer/volta ao subir.
- **Rodapé**: faixa de chamada, colunas, assinatura gigante e "voltar ao topo". O acesso admin continua discreto.
- **Checkout**: ícones nos campos, validação ao vivo com ✓/!, erro inline (sem `alert`), progresso das 3 etapas, total que pisca ao mudar, fretes em tons de verde.
- **Painel**: a Regra da Fronteira foi revista a pedido do dono — o painel agora vive na mesma mata (verde-noite + escala jade/menta) em vez de preto/platina. Cores de estado seguem com significado próprio e sempre com rótulo. Dashboard novo: período 7/14/30/90 dias, KPIs com tendência vs período anterior e sparkline, meta do mês editável, faturamento com comparação, status em rosca, dia da semana, formas de pagamento, estoque, regiões, avaliações, atividade recente, exportar CSV e atualização automática.
