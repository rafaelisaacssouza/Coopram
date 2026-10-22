/* ══════════════════════════════════════════════════════════════
   COOPRAM · Café das Montanhas Capixabas
   Comportamento da página — sem dependências externas.
   Depende de js/i18n.js (window.COOPRAM_I18N), carregado antes.
   ══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var palcoTri = document.getElementById("tri");

  /* O HTML chega no modo "calmo" (legível sem JS). Com JS e sem
     pedido de movimento reduzido, liga o palco e trava a rolagem
     enquanto a abertura roda. */
  if(!calmo){
    document.body.classList.add("travado");
    if(palcoTri) palcoTri.classList.remove("tri--calmo");
  }

  /* ── 0 · IDIOMAS ─────────────────────────────────────────────
     O dicionário usa o texto original em português como chave.
     Guardamos cada nó de texto e cada atributo traduzível uma
     vez e reescrevemos a cada troca de idioma. */
  var DIC = window.COOPRAM_I18N || {pt:{}};
  var idioma = "pt", chaveRot = "A serra";
  var bases = [], atributos = [];

  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    var node = walker.currentNode;
    if(node.parentElement && !node.parentElement.closest("script,style") && node.textContent.trim()){
      bases.push({node:node, value:node.textContent, key:node.textContent.trim()});
    }
  }
  document.querySelectorAll("[aria-label],[alt],[data-rotulo]").forEach(function(el){
    ["aria-label","alt","data-rotulo"].forEach(function(a){
      if(el.hasAttribute(a)) atributos.push({el:el, attr:a, key:el.getAttribute(a)});
    });
  });

  function translateText(key){ return (DIC[idioma] && DIC[idioma][key]) || key; }

  function traduz(l){
    idioma = DIC[l] ? l : "pt";
    bases.forEach(function(b){ b.node.textContent = b.value.replace(b.key, translateText(b.key)); });
    atributos.forEach(function(a){ a.el.setAttribute(a.attr, translateText(a.key)); });
    document.documentElement.lang = {pt:"pt-BR", en:"en", es:"es"}[idioma];
    document.querySelectorAll(".idiomas button").forEach(function(b){
      var on = b.dataset.lang === idioma;
      b.classList.toggle("ativo", on);
      b.setAttribute("aria-pressed", String(on));
    });
    var rot = document.getElementById("rotSecao");
    if(rot) rot.textContent = translateText(chaveRot);
    var menu = document.querySelector(".menu-toggle");
    if(menu) menu.setAttribute("aria-label", translateText(menu.getAttribute("aria-expanded") === "true" ? "Fechar menu" : "Abrir menu"));
    try{ localStorage.setItem("coopram-lang", idioma); }catch(e){}
    document.body.classList.remove("i18n-fade");
    requestAnimationFrame(function(){ document.body.classList.add("i18n-fade"); });
  }

  var escolhido = "pt";
  try{ escolhido = new URLSearchParams(location.search).get("lang") || localStorage.getItem("coopram-lang") || "pt"; }catch(e){}
  traduz(escolhido);
  document.querySelectorAll(".idiomas button").forEach(function(b){
    b.addEventListener("click", function(){ traduz(b.dataset.lang); });
  });

  /* ── 1 · ABERTURA ────────────────────────────────────────── */
  var abertura = document.getElementById("abertura");
  var contAbre = document.getElementById("contAbre");

  function libera(){
    document.body.classList.remove("travado");
    document.body.classList.add("pronto");
    if(abertura) abertura.setAttribute("aria-hidden", "true");
  }

  if(calmo || !abertura){
    if(abertura) abertura.remove();
    libera();
  }else{
    var dur = 2100, t0 = performance.now();
    (function conta(now){
      var p = Math.min(1, (now - t0) / dur);
      var n = Math.round(100 * (1 - Math.pow(1 - p, 3)));
      contAbre.textContent = n < 10 ? "0" + n : String(n);
      if(p < 1) requestAnimationFrame(conta);
    })(t0);

    setTimeout(function(){ abertura.classList.add("sobe"); }, 2350);
    setTimeout(function(){ abertura.classList.add("sai"); libera(); }, 3550);
    setTimeout(function(){ abertura.remove(); }, 5200);
  }

  /* ── 2 · LINHAS VIVAS ────────────────────────────────────────
     Cordilheiras desenhadas a cada quadro. Onda triangular com
     a crista arredondada: silhueta de montanha, não serrote. */
  var NS = "http://www.w3.org/2000/svg";

  function tri(u){ return (2 / Math.PI) * Math.asin(Math.sin(u)); }
  function crista(u){ return Math.sin(tri(u) * Math.PI / 2); }

  function montaLinhas(svg, cfg){
    var W = 1440, H = cfg.h, linhas = [];
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    for(var i = 0; i < cfg.n; i++){
      var g = document.createElementNS(NS, "g");
      var area = document.createElementNS(NS, "path");
      area.setAttribute("class", "serra-corpo");
      area.setAttribute("fill", cfg.tons[i % cfg.tons.length]);
      area.setAttribute("fill-opacity", (cfg.preenche + i * 0.09).toFixed(3));
      area.setAttribute("stroke", "none");
      var risco = document.createElementNS(NS, "path");
      risco.setAttribute("class", "serra-aresta");
      risco.setAttribute("fill", "none");
      risco.setAttribute("stroke-opacity", (cfg.op - i * 0.07).toFixed(3));
      g.appendChild(area); g.appendChild(risco);
      svg.appendChild(g);
      linhas.push({
        area: area, el: risco,
        base: cfg.topo + i * (H - cfg.topo * 1.2) / Math.max(1, cfg.n - 1),
        amp: cfg.amp * (0.62 + (i % 3) * 0.3),
        len: 330 + i * 126,
        vel: (0.05 + i * 0.017) * (i % 2 ? 1 : -1),
        fase: i * 2.4
      });
    }
    return {W:W, H:H, linhas:linhas};
  }

  function desenha(mapa, t){
    for(var i = 0; i < mapa.linhas.length; i++){
      var L = mapa.linhas[i], passo = 48, pts = [], x, y;
      for(x = 0; x <= mapa.W + passo; x += passo){
        y = L.base - L.amp * (0.70 * crista(x / L.len + t * L.vel + L.fase)
                            + 0.30 * crista(x / (L.len * 0.46) + t * L.vel * 1.4 + L.fase * 1.7));
        pts.push([x, y]);
      }
      /* suavização por ponto médio: cada quina vira curva */
      var d = "M" + pts[0][0] + "," + pts[0][1].toFixed(1);
      for(var k = 1; k < pts.length - 1; k++){
        var mx = (pts[k][0] + pts[k + 1][0]) / 2;
        var my = (pts[k][1] + pts[k + 1][1]) / 2;
        d += "Q" + pts[k][0] + "," + pts[k][1].toFixed(1) + " " + mx.toFixed(1) + "," + my.toFixed(1);
      }
      L.el.setAttribute("d", d);
      L.area.setAttribute("d", d + "L" + mapa.W + "," + mapa.H + "L0," + mapa.H + "Z");
    }
  }

  var mapas = [];
  document.querySelectorAll("[data-linhas]").forEach(function(svg){
    var m = montaLinhas(svg, svg.getAttribute("data-linhas") === "tri"
      ? {h:900, n:4, topo:230, amp:104, op:.44, preenche:.22, tons:["#0C2A19","#0A2416","#081D12","#061710"]}
      : {h:600, n:3, topo:210, amp:70,  op:.36, preenche:.20, tons:["#5E1A15","#4E1512","#3E110F"]});
    m.svg = svg; m.visivel = true;
    mapas.push(m);
  });

  if(calmo){
    mapas.forEach(function(m){ desenha(m, 0); });
  }else{
    /* cordilheira fora da tela não é desenhada */
    var obsLinhas = new IntersectionObserver(function(en){
      en.forEach(function(e){
        mapas.forEach(function(m){ if(m.svg === e.target) m.visivel = e.isIntersecting; });
      });
    }, {rootMargin:"120px"});
    mapas.forEach(function(m){ obsLinhas.observe(m.svg); });

    (function anima(now){
      var t = now / 1000;
      for(var i = 0; i < mapas.length; i++){ if(mapas[i].visivel) desenha(mapas[i], t); }
      requestAnimationFrame(anima);
    })(0);
  }

  /* ── 3 · PÉ DE CAFÉ ──────────────────────────────────────────
     A ilustração é revelada por clip-path do rodapé para o topo. */
  var PE_SVG = '<svg viewBox="0 0 3750 5950" aria-hidden="true"><use href="#pe-cafe"/></svg>';
  var pes = document.querySelectorAll(".pe");
  pes.forEach(function(p){ p.innerHTML = PE_SVG; });

  if(calmo){
    pes.forEach(function(p){ p.classList.add("cresceu"); });
  }else{
    var obsPe = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("cresceu"); obsPe.unobserve(e.target); }
      });
    }, {rootMargin:"0px 0px -16% 0px", threshold:.04});
    pes.forEach(function(p){
      if(p.closest("#tri")) setTimeout(function(){ p.classList.add("cresceu"); }, 3800);
      else obsPe.observe(p);
    });
  }

  /* ── 4 · TRISCROLL ───────────────────────────────────────────
     O palco fica preso na tela e o rolar vira linha do tempo.
     Uma progressão de 0 a 1 comanda céu, folha, ramos e atos. */
  if(palcoTri){
    var ceuCer   = palcoTri.querySelector(".tri__ceu--cereja");
    var linhasT  = palcoTri.querySelector(".tri__linhas");
    var folhaT   = palcoTri.querySelector(".tri__folha");
    var scrim    = palcoTri.querySelector(".tri__scrim");
    var gravura  = palcoTri.querySelector(".tri__gravura");
    var peTE     = palcoTri.querySelector(".pe--tri-e");
    var peTD     = palcoTri.querySelector(".pe--tri-d");
    var atoA     = palcoTri.querySelector(".ato--1");
    var atoB     = palcoTri.querySelector(".ato--2");
    var atoC     = palcoTri.querySelector(".ato--3");
    var lockup   = palcoTri.querySelector(".cdlm--palco");
    var barra    = palcoTri.querySelector(".role i b");
    var indicaRole = palcoTri.querySelector(".role");
    var saida    = palcoTri.querySelector(".saida");
    var contR    = document.getElementById("rotSecao");

    if(gravura) gravura.innerHTML = PE_SVG;

    var suave = function(x, a, b){
      x = (x - a) / (b - a);
      x = x < 0 ? 0 : (x > 1 ? 1 : x);
      return x * x * (3 - 2 * x);
    };

    var progresso = function(){
      var alto = palcoTri.offsetHeight - window.innerHeight;
      if(alto <= 0) return 0;
      var p = -palcoTri.getBoundingClientRect().top / alto;
      return p < 0 ? 0 : (p > 1 ? 1 : p);
    };

    var cena = function(p){
      /* céu: mata do começo ao fim, cereja entra na terceira dobra */
      ceuCer.style.opacity = suave(p, 0.62, 0.74).toFixed(3);

      /* linhas de montanha entram e depois recuam */
      linhasT.style.opacity = (suave(p, 0.02, 0.12) * (1 - suave(p, 0.44, 0.58) * 0.74)).toFixed(3);

      /* ramos laterais entram pela esquerda e pela direita */
      var ent = suave(p, 0.03, 0.20);
      peTE.style.opacity = (ent * 0.44 * (1 - suave(p, 0.42, 0.56))).toFixed(3);
      peTD.style.opacity = (ent * 0.36 * (1 - suave(p, 0.42, 0.56))).toFixed(3);
      peTE.style.transform = "translateX(" + (-105 + 105 * ent).toFixed(1) + "%)";
      peTD.style.transform = "scaleX(-1) translateX(" + (-105 + 105 * ent).toFixed(1) + "%)";

      /* a folha atravessa as três dobras sem cortar */
      var esc, opF, rot, ty;
      if(p < 0.30){
        var t = p / 0.30;
        esc = 1.05 - 0.20 * t;
        opF = 1 - 0.52 * suave(p, 0.03, 0.14);
        rot = -3 + 3 * t; ty = 0;
      }else if(p < 0.62){
        var t2 = suave(p, 0.29, 0.40);
        esc = 0.85 - 0.57 * t2; opF = 0.28 + 0.66 * t2; rot = 0; ty = 26 * t2;
      }else{
        var t3 = (p - 0.62) / 0.38;
        esc = 0.28 + 5.8 * t3 * t3; opF = 0.94 * (1 - suave(p, 0.66, 0.78)); rot = 0;
        ty = 26 * (1 - suave(p, 0.62, 0.72));
      }
      folhaT.style.opacity = opF.toFixed(3);
      folhaT.style.transform = "translate(-50%,-50%) translateY(" + ty.toFixed(2) + "vh) scale("
        + esc.toFixed(3) + ") rotate(" + rot.toFixed(2) + "deg)";

      /* gravura do pé de café ao fundo da terceira dobra */
      gravura.style.opacity = (suave(p, 0.74, 0.90) * 0.20).toFixed(3);
      gravura.style.transform = "translateX(-50%) translateY(" + (14 - 14 * suave(p, 0.72, 0.94)).toFixed(1) + "%)";

      /* atos */
      var a = suave(p, 0.04, 0.12) * (1 - suave(p, 0.30, 0.36));
      var b = suave(p, 0.38, 0.44) * (1 - suave(p, 0.62, 0.68));
      var c = suave(p, 0.72, 0.78);
      atoA.style.opacity = a.toFixed(3);
      atoA.style.transform = "translateY(" + (3.2 * (1 - a)).toFixed(2) + "vh)";
      scrim.style.opacity = (suave(p, 0.02, 0.10) * (1 - suave(p, 0.32, 0.40))).toFixed(3);
      atoB.style.opacity = b.toFixed(3);
      atoB.style.transform = "translateY(" + (2.4 * (1 - b)).toFixed(2) + "vh)";
      atoC.style.opacity = c.toFixed(3);
      atoC.style.transform = "translateY(" + (3.5 * (1 - c)).toFixed(2) + "vh)";
      /* atos inativos não recebem clique */
      atoA.style.pointerEvents = a > 0.5 ? "auto" : "none";

      /* bússola: nome do ato e barra de progresso */
      var cx = palcoTri.getBoundingClientRect();
      if(cx.top < window.innerHeight * 0.5 && cx.bottom > window.innerHeight * 0.5){
        chaveRot = ["A serra", "A marca", "A origem"][p < 0.36 ? 0 : (p < 0.70 ? 1 : 2)];
        if(contR && contR.textContent !== translateText(chaveRot)) contR.textContent = translateText(chaveRot);
      }
      barra.style.transform = "translateX(" + (-100 + 100 * p).toFixed(1) + "%)";
      indicaRole.style.opacity = (0.8 * (1 - suave(p, 0.84, 0.96))).toFixed(3);
      saida.style.opacity = (0.66 * (1 - suave(p, 0.08, 0.20))).toFixed(3);
      saida.style.pointerEvents = p > 0.20 ? "none" : "auto";

      if(lockup){
        var fl = suave(p, 0.36, 0.50);
        lockup.style.transform = "translateY(" + (4 - 4 * fl).toFixed(2) + "vh) scale(" + (0.93 + 0.07 * fl).toFixed(3) + ")";
      }
    };

    if(!calmo){
      /* Filtro de um polo entre a rolagem e a cena: um clique de
         roda (~100px) não faz a folha saltar. */
      var pAlvo = progresso(), pSuave = pAlvo, rodando = false;

      var tique = function(){
        var g = Math.abs(pAlvo - pSuave);
        var k = 0.16 + 0.62 * Math.min(1, g * 3.2);
        pSuave += (pAlvo - pSuave) * k;
        if(g < 0.0008){ pSuave = pAlvo; rodando = false; }
        cena(pSuave);
        if(rodando) requestAnimationFrame(tique);
      };
      var medir = function(){
        pAlvo = progresso();
        if(!rodando){ rodando = true; requestAnimationFrame(tique); }
      };
      window.addEventListener("scroll", medir, {passive:true});
      window.addEventListener("resize", medir);
      window.addEventListener("load", medir);
      cena(pSuave);
      /* a abertura trava o corpo: reencena quando ela sai */
      setTimeout(medir, 3800);
      setTimeout(medir, 5400);

      /* Teclas de página saltam para o pico de cada ato e, no
         último, liberam para a seção seguinte. */
      var PARADAS = [0.22, 0.57, 0.94];
      var ancorado = function(){
        var r = palcoTri.getBoundingClientRect();
        return r.top <= 1 && r.bottom >= window.innerHeight - 1;
      };
      var irPara = function(p){
        var alto = palcoTri.offsetHeight - window.innerHeight;
        var topo = window.scrollY + palcoTri.getBoundingClientRect().top;
        window.scrollTo({top: Math.round(topo + alto * p), behavior: "smooth"});
      };
      document.addEventListener("keydown", function(e){
        if(e.metaKey || e.ctrlKey || e.altKey) return;
        var t = e.target;
        if(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        var avanca = e.key === "PageDown" || (e.key === " " && !e.shiftKey);
        var volta  = e.key === "PageUp"   || (e.key === " " && e.shiftKey);
        if((!avanca && !volta) || !ancorado()) return;
        e.preventDefault();
        var p = progresso(), i;
        if(avanca){
          for(i = 0; i < PARADAS.length; i++){
            if(PARADAS[i] > p + 0.03){ irPara(PARADAS[i]); return; }
          }
          var prox = document.getElementById("origem");
          if(prox) prox.scrollIntoView({behavior:"smooth", block:"start"});
        }else{
          for(i = PARADAS.length - 1; i >= 0; i--){
            if(PARADAS[i] < p - 0.03){ irPara(PARADAS[i]); return; }
          }
          window.scrollTo({top:0, behavior:"smooth"});
        }
      });
    }
  }

  /* ── 5 · TOPO E RÓTULO DE SEÇÃO ──────────────────────────── */
  var topo = document.getElementById("topo");
  window.addEventListener("scroll", function(){
    topo.classList.toggle("densa", window.scrollY > 80);
  }, {passive:true});

  var rotSecao = document.getElementById("rotSecao");
  var obsSecao = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(e.isIntersecting){
        var reg = atributos.find(function(a){ return a.el === e.target && a.attr === "data-rotulo"; });
        chaveRot = reg ? reg.key : "A serra";
        rotSecao.textContent = translateText(chaveRot);
      }
    });
  }, {rootMargin:"-45% 0px -45% 0px"});
  document.querySelectorAll("[data-secao]").forEach(function(s){ obsSecao.observe(s); });

  /* ── 6 · REVELAÇÃO ───────────────────────────────────────── */
  var obsRev = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("viu"); obsRev.unobserve(e.target); }
    });
  }, {rootMargin:"0px 0px -12% 0px", threshold:.12});
  document.querySelectorAll(".rev").forEach(function(el){ obsRev.observe(el); });

  /* ── 7 · MENU RESPONSIVO ─────────────────────────────────── */
  var menuBotao = document.querySelector(".menu-toggle");
  var menuPrincipal = document.getElementById("menuPrincipal");
  if(menuBotao && menuPrincipal){
    var fechaMenu = function(){
      menuBotao.setAttribute("aria-expanded", "false");
      menuBotao.setAttribute("aria-label", translateText("Abrir menu"));
      menuPrincipal.classList.remove("aberto");
    };
    menuBotao.addEventListener("click", function(){
      if(menuBotao.getAttribute("aria-expanded") === "true"){ fechaMenu(); return; }
      menuBotao.setAttribute("aria-expanded", "true");
      menuBotao.setAttribute("aria-label", translateText("Fechar menu"));
      menuPrincipal.classList.add("aberto");
    });
    menuPrincipal.querySelectorAll("a").forEach(function(link){ link.addEventListener("click", fechaMenu); });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && menuPrincipal.classList.contains("aberto")){ fechaMenu(); menuBotao.focus(); }
    });
  }
})();
