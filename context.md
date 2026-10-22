# CONTEXTO — Site Café das Montanhas Capixabas (COOPRAM)

Documento de referência para quem for editar o projeto (pessoa ou assistente de IA).
Descreve o estado atual. A migração para **GSAP + Lenis** está feita; a de **layout em grid** é a próxima etapa.

---

## 1. Visão geral

- One-page institucional/comercial da COOPRAM (cooperativa de Domingos Martins, ES) para o produto
  **Café das Montanhas Capixabas — Café Arábica Verde Especial**. Foco: compradores e exportação.
- **Stack atual:** HTML + CSS + JS puros, sem build. Animação com GSAP 3.13.0 (ScrollTrigger, CustomEase) e rolagem suave com Lenis 1.3.4, em cópias locais em `assets/js/vendor/`.
- Idiomas: PT (padrão), EN, ES — troca em tempo real, sem recarregar.
- Origem: exportado de um projeto Lovable (React/TanStack que só exibia este HTML num iframe).

```
index.html
assets/css/style.css     tokens + todos os estilos (organizado por seções numeradas)
assets/js/main.js        todo o comportamento (IIFE, sem módulos)
assets/js/vendor/        gsap, ScrollTrigger, CustomEase, lenis (.min.js, versões fixas)
assets/js/i18n.js        window.COOPRAM_I18N = { pt:{}, en:{}, es:{} }
assets/fonts/arome.woff2 fonte da marca (títulos "Origem", lockup, ano)
assets/img/*.webp        imagens + favicon.png / apple-touch-icon.png
```

Fontes externas: Google Fonts (Archivo 400–800, Roboto 300–700).

---

## 2. Design tokens (`:root` em style.css)

| Grupo                                  | Tokens                                                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Base                                   | `--noite #0C2318` (fundo padrão), `--mata #123A26`, `--mata-alta #1B5233`, `--grao #2A1A10`, `--nevoa #F4EFE4` (texto claro), `--papel #FBF8F2`, `--pedra #8A9A8C` |
| Acentos oficiais COOPRAM (não alterar) | `--azul #0B4DA0`, `--turquesa #26A8A6`, `--lima #85C61B` (cor de ação), `--laranja #FFA300`, `--magenta #AE013C`                                                   |
| Origem/impresso                        | `--cereja #9C2F26`, `--cereja-esc #6E1D17`, `--pasto #89933E`, `--pasto-claro #D9E39D`                                                                             |
| Fontes                                 | `--f-tit` Archivo · `--f-txt` Roboto · `--f-marca` Arome                                                                                                           |
| Tipo fluido                            | `--t-h1`, `--t-h2`, `--t-h3`, `--t-lead`, `--t-num`, `--t-body`, `--t-micro` (todos `clamp()`)                                                                     |
| Espaço                                 | `--sp-2`…`--sp-9` (de 8px a `clamp(84px,11vw,168px)`)                                                                                                              |
| Layout                                 | `--rail` (margem lateral fluida 20–86px), `--max 1480px`                                                                                                           |
| Easing                                 | `--e-out cubic-bezier(.16,.84,.44,1)`, `--e-io cubic-bezier(.72,0,.24,1)`                                                                                          |

Equivalentes GSAP dos easings (registrar com `CustomEase`):

```js
CustomEase.create("eOut", ".16,.84,.44,1");
CustomEase.create("eIo", ".72,0,.24,1");
```

Breakpoints em uso: **1199** (menu vira gaveta), **880** (colunas → 1), **767**, **640**, **560**, **420**.

---

## 3. Mapa da página (ordem do HTML)

| #   | Seletor             | Fundo                   | Conteúdo                                                                                                                      | Layout atual                                                        |
| --- | ------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| —   | `#abertura`         | nevoa → mata            | Loader: serra traçada, logo, 4 rótulos de canto, contador 00–100% e 3 "lâminas" (folhas)                                      | fixed, fullscreen                                                   |
| —   | `header#topo`       | transparente → `.densa` | Logo, `nav#menuPrincipal`, idiomas, CTA, `.menu-toggle`                                                                       | grid `auto 1fr auto`; <1200 `1fr auto` + gaveta                     |
| 1   | `section#tri`       | mata/cereja             | Palco fixo com 3 atos: **1** título H1 + lead + botão · **2** lockup "Café das Montanhas" · **3** "Origem" + selo 800–1.200 m | `height:260vh` + `.tri__palco` sticky                               |
| 2   | `#origem` (`.mapa`) | mata                    | Texto + SVG de perfil de altitude                                                                                             | grid 1fr / .92fr                                                    |
| —   | `.tira`             | noite                   | Faixa de texto correndo (decorativa, `aria-hidden`)                                                                           | flex                                                                |
| 3   | `#geracoes`         | grao                    | Cabeça + texto duplo/citação + 3 números                                                                                      | `.cabeca` .9fr/1.1fr · `.texto-duplo` .8fr/1.2fr · `.numeros` 3 col |
| 4   | `#estrutura`        | nevoa                   | Cabeça + 4 cards com folha colorida                                                                                           | `.estrutura` 2 col                                                  |
| 5   | `#territorio`       | papel                   | Só cabeça (título + 3 parágrafos)                                                                                             | `.cabeca`                                                           |
| 6   | `#produto`          | noite                   | Arte do produto (blob verde) + texto + botão                                                                                  | 1.05fr / .95fr                                                      |
| 7   | `#sensorial`        | cereja                  | Título sticky + 5 atributos em lista                                                                                          | .9fr / 1.1fr                                                        |
| 8   | `#qualidade`        | papel                   | Cabeça + 2 marquees de etapas (sentidos opostos)                                                                              | marquee full-bleed                                                  |
| 9   | `#rastreabilidade`  | noite                   | Cabeça + manifesto (3 células com ícone)                                                                                      | 3 col                                                               |
| 10  | `#ficha-tecnica`    | cereja                  | Título sticky + `<dl class="ficha__lista">`                                                                                   | .7fr / 1.3fr                                                        |
| 11  | `#coopram`          | nevoa                   | Só cabeça                                                                                                                     | `.cabeca`                                                           |
| 12  | `#exportacao`       | noite                   | Cabeça + manifesto lima                                                                                                       | 3 col                                                               |
| 13  | `#contato`          | noite                   | Título + botão WhatsApp · dados de contato                                                                                    | 1fr / .8fr                                                          |
| 14  | `.cta-final`        | mata                    | Chamada centralizada + linhas de montanha                                                                                     | centralizado                                                        |
| —   | `footer`            | grao                    | Logo, selo SVG redondo, SomosCoop, Agricultura Familiar, rodapé                                                               | grid auto/1fr                                                       |

Padrão de seção: `section.secao[.secao--clara|--papel|--cereja] > .rail > .cabeca > (div.rev[eixo+h2], div.rev[p…])`.

---

## 4. Contrato HTML ↔ JS (não renomear sem ajustar o main.js)

- IDs: `#abertura`, `#contAbre`, `#topo`, `#menuPrincipal`, `#tri`, `#rotSecao`, `#origem`, `#pe-cafe` (symbol SVG no topo do body).
- Classes lidas pelo JS: `.tri__palco`, `.tri__ceu--cereja`, `.tri__linhas`, `.tri__folha`, `.tri__scrim`, `.tri__gravura`, `.pe--tri-e`, `.pe--tri-d`, `.ato--1/2/3`, `.cdlm--palco`, `.role i b`, `.role`, `.saida`, `.pe`, `.rev`, `.menu-toggle`, `.idiomas button[data-lang]`.
- Atributos: `data-linhas="tri|mapa"` (SVG das cordilheiras), `data-secao` + `data-rotulo` (rótulo do rodapé do palco), `data-d="1|2|3"` (atraso do reveal).
- Classes de estado: `body.pronto`, `.topo.densa`, `.menu.aberto`, `.tri--calmo`, `.pe.cresceu` (só no movimento reduzido). O Lenis põe `html.lenis` / `.lenis-stopped` (rolagem travada durante a abertura). As antigas `body.travado`, `.abertura.sobe/.sai`, `.rev.viu`, `.perfil.viu` e `.i18n-fade` não existem mais: essas animações são tweens GSAP no main.js. O traço do `.perfil .solo` tem gatilho próprio.

### Estados de fallback (manter)

- O HTML vem com `section#tri.tri--calmo` (três blocos estáticos). O JS **remove** essa classe quando há JS e sem movimento reduzido.
- `<noscript>` esconde a abertura e mostra os `.rev`.
- `prefers-reduced-motion`: sem abertura, palco calmo, plantas e linhas estáticas.

---

## 5. i18n — cuidados (importante para a migração)

- O dicionário usa **o texto original em PT como chave** (`"Conheça nosso café": "Discover our coffee"`).
- No carregamento, `main.js` percorre **todos os nós de texto** do body e guarda `{nó, texto original}`; também `aria-label`, `alt` e `data-rotulo`.
- Consequências:
  1. Mudou um texto em PT no HTML → atualize a chave nos 3 idiomas no `i18n.js`, senão aquele trecho para de traduzir.
  2. **SplitText (GSAP) quebra o i18n**: ele divide nós de texto em `<div>/<span>`. Regras:
     - rode o walker do i18n **antes** de qualquer split;
     - ao trocar idioma: `split.revert()` → `traduz()` → criar o split de novo;
     - ou só aplique SplitText em elementos sem tradução, ou mude o i18n para atributos `data-i18n="chave"` (recomendado se for usar SplitText em muitos títulos).
  3. Texto injetado depois do carregamento não é traduzido automaticamente.
- Idioma por URL: `?lang=en|es`; lembrado em `localStorage("coopram-lang")`.

---

## 6. Inventário de animações → GSAP + Lenis (migração feita)

Decisões tomadas na migração: bibliotecas locais; o Triscroll **manteve o `sticky` + `260vh`** (um `ScrollTrigger` entrega `progress` para a `cena(p)` e o filtro manual foi removido); sem SplitText (i18n intacto); marquees e menu continuam em CSS. A tabela abaixo é o plano original, mantido como referência.

| Animação                                  | Como é hoje                                                                                                                               | Proposta GSAP/Lenis                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Abertura**                              | `@keyframes` CSS + `setTimeout` (2350 ms `.sobe`, 3550 ms `.sai` + libera scroll, 5200 ms remove) + contador por rAF (2,1 s, ease cúbico) | Uma `gsap.timeline()`: traço da serra (strokeDashoffset), logo/rótulos (stagger), contador (`gsap.to(obj,{v:100, onUpdate})`), lâminas, saída `yPercent:-101`. `lenis.stop()` no início e `lenis.start()` no fim (substitui `body.travado`). `onComplete` remove o nó.     |
| **Triscroll** (palco 3 atos)              | `position:sticky` + função `cena(p)` com p 0→1, `smoothstep` em faixas, filtro de suavização próprio (um polo)                            | `ScrollTrigger` com `pin: ".tri__palco"`, `end:"+=160%"`, `scrub:true` (Lenis já suaviza; remover o filtro manual). Converter cada `suave(p,a,b)` em tween posicionado na timeline em `a` com duração `b-a` (timeline total = 1). Tirar `height:260vh` do CSS se usar pin. |
| Teclas PageUp/PageDown/Espaço no palco    | `PARADAS = [0.22, 0.57, 0.94]` + `scrollTo smooth`                                                                                        | `lenis.scrollTo(st.start + (st.end - st.start) * parada)`; ou `ScrollTrigger` `snap` com labels.                                                                                                                                                                           |
| **Linhas vivas** (cordilheiras)           | SVG path recalculado a cada frame (rAF), só quando visível (IntersectionObserver)                                                         | Manter a matemática; trocar o loop por `gsap.ticker.add` e visibilidade por `ScrollTrigger.create({onToggle})`.                                                                                                                                                            |
| **Pé de café** crescendo                  | `clip-path: inset(100% 0 0 0)` → `inset(0)` via transition CSS, ativado por IntersectionObserver                                          | `gsap.fromTo(svg,{clipPath:"inset(100% 0 0 0)", y:16, scaleY:.93},{clipPath:"inset(0% 0 0 0)", y:0, scaleY:1, duration:3.2, scrollTrigger:{start:"top 84%", once:true}})`. No palco: delay 3,8 s após a abertura → encadear na timeline da abertura.                       |
| **Reveal `.rev`**                         | transition CSS (opacity + 30px), atrasos `data-d` 0,1/0,2/0,3 s                                                                           | `ScrollTrigger.batch(".rev",{onEnter: b => gsap.to(b,{opacity:1,y:0,stagger:.1,ease:"eOut",duration:1})})`. Tirar o estado inicial do CSS ou definir com `gsap.set` (cuidado com flash: deixar `opacity:0` no CSS sob `html.js`).                                          |
| Traço do perfil de altitude               | `stroke-dashoffset` via keyframes quando `.perfil.viu`                                                                                    | `gsap.to(".perfil .solo",{strokeDashoffset:0,duration:2.4,scrollTrigger:".perfil"})`.                                                                                                                                                                                      |
| **Marquees** (`.tira`, `.etapas-marquee`) | `@keyframes` translateX(-50%) infinito (42 s / 38 s / 44 s)                                                                               | Pode ficar em CSS. Se quiser reagir à velocidade do scroll: `gsap.to(trilha,{xPercent:-50,repeat:-1,ease:"none"})` + `timeScale` ligado a `lenis.velocity`.                                                                                                                |
| Topo `.densa`                             | listener de scroll (`scrollY > 80`)                                                                                                       | `ScrollTrigger.create({start:80, onToggle: s => topo.classList.toggle("densa", s.isActive)})`.                                                                                                                                                                             |
| Rótulo da seção (`#rotSecao`)             | IntersectionObserver no centro da viewport                                                                                                | `ScrollTrigger` por `[data-secao]` com `start:"top center", end:"bottom center", onToggle`.                                                                                                                                                                                |
| Menu mobile                               | classes + transition CSS                                                                                                                  | Pode ficar em CSS; se animar com GSAP, manter `aria-expanded`.                                                                                                                                                                                                             |
| Troca de idioma                           | fade `.i18n-fade`                                                                                                                         | `gsap.fromTo("main",{opacity:.75},{opacity:1,duration:.25})`.                                                                                                                                                                                                              |

### Setup Lenis + ScrollTrigger

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/CustomEase.min.js"></script>
<script src="https://unpkg.com/lenis@1/dist/lenis.min.js"></script>
<!-- fixe versões exatas antes de publicar -->
```

```js
gsap.registerPlugin(ScrollTrigger, CustomEase);
const lenis = new Lenis({ lerp: 0.1 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// âncoras do menu respeitando o header fixo
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const alvo = document.querySelector(a.getAttribute("href"));
    if (!alvo) return;
    e.preventDefault();
    lenis.scrollTo(alvo, { offset: -80 });
  }),
);
```

Use `gsap.matchMedia()` para separar `(prefers-reduced-motion: reduce)` (sem Lenis, sem pin, aplicar `.tri--calmo`) e breakpoints (ex.: palco mais curto no mobile, hoje 250vh ≤880px).

Lembretes:

- Lenis + `position: sticky` funcionam juntos (Lenis usa o scroll nativo), mas se migrar para `pin`, remova o sticky do `.tri__palco`.
- Elementos `position: fixed` dentro de um pin quebram: o `#topo` e a `#abertura` ficam fora do `#tri` (já estão).
- Chame `ScrollTrigger.refresh()` depois que as fontes carregarem (`document.fonts.ready`) e após trocar idioma (textos mudam de altura).
- `.sensorial .cabeca` e `.ficha-titulo` usam `position: sticky` (top:150px). Funcionam com Lenis; não precisam de pin.

---

## 7. Grid de colunas (migração feita)

Aplicado em `style.css` (logo após `.rail`): `--cols` 12 / 6 (≤880) / 4 (≤560), `--gutter`; os blocos `.cabeca`, `.texto-duplo`, `.mapa__grade`, `.numeros`, `.produto`, `#sensorial > .rail`, `.ficha-layout` e `.contato` usam a mesma grade e posicionam os filhos com `grid-column`. Colunas usadas: cabeça/texto-duplo/mapa/sensorial 1–5 + 7–12; produto 1–6 + 8–12; ficha 1–3 + 5–12; contato 1–6 + 8–12; números 4+4+4 (2+2+2 no tablet). Até 880px todo filho ocupa `1/-1`. `.estrutura` e `.manifesto` mantêm o grid próprio com linhas de 1px. Botão **Grid** (ou tecla G) mostra a sobreposição das colunas: temporário, remover antes de publicar (seção 9b do CSS e 8 do JS).

Texto original do plano, para referência:

Hoje cada seção define o próprio `grid-template-columns` em `fr` (ver tabela da seção 3). Sugestão de sistema:

```css
:root {
  --cols: 12;
  --gutter: clamp(16px, 2vw, 32px);
}
.grade {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  column-gap: var(--gutter);
}
@media (max-width: 880px) {
  :root {
    --cols: 6;
  }
}
@media (max-width: 560px) {
  :root {
    --cols: 4;
  }
}
```

`.rail` continua sendo o container (largura máx. `--max`, margem `--rail`).

Equivalências aproximadas das proporções atuais em 12 colunas:

| Bloco                    | Atual          | Em 12 col             |
| ------------------------ | -------------- | --------------------- |
| `.cabeca`                | .9fr / 1.1fr   | 5 / 7 (ou 1–5 e 6–13) |
| `.texto-duplo`           | .8fr / 1.2fr   | 5 / 7                 |
| `.mapa__grade`           | 1fr / .92fr    | 6 / 6 (ou 7 / 5)      |
| `.produto`               | 1.05fr / .95fr | 6 / 6                 |
| `#sensorial > .rail`     | .9fr / 1.1fr   | 5 / 7                 |
| `.ficha-layout`          | .7fr / 1.3fr   | 4 / 8                 |
| `.contato`               | 1fr / .8fr     | 7 / 5                 |
| `.numeros`, `.manifesto` | 3 col          | 4 + 4 + 4             |
| `.estrutura`             | 2 col          | 6 + 6                 |

Abaixo de 880px quase tudo vira 1 coluna; `.numeros`/`.manifesto`/`.estrutura` viram 1 coluna em ≤767/880.

---

## 8. Pendências de conteúdo

- URL final → preencher `canonical`, `og:url`, `og:image` (comentário no `<head>`); criar imagem 1200×630.
- Nota dos asteriscos da ficha técnica (comentário no fim de `#ficha-tecnica`; classe `.ficha__nota` já existe no CSS).
- Favicon foi gerado a partir do símbolo; trocar pelo oficial se existir.
- Contato comercial: WhatsApp `+55 27 99952-1097` (links `wa.me/5527999521097`), e-mail `coffee@coopram.com.br`.

## 9. Convenções

- Nomes de classes e variáveis em português, estilo BEM leve (`bloco__elemento`, `bloco--variação`).
- Comentários em português explicando a intenção da animação, não só o código.
- Não alterar as cores oficiais COOPRAM.
- Sempre testar: desktop 1440, tablet 1024, mobile 390, troca de idioma e `prefers-reduced-motion`.
