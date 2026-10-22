# Café das Montanhas Capixabas — COOPRAM

Site estático (HTML + CSS + JS puro, sem dependências). Basta publicar a pasta inteira em qualquer hospedagem.

## Estrutura

    index.html
    assets/css/style.css   folha de estilos consolidada
    assets/js/i18n.js      dicionário PT / EN / ES (chave = texto original em PT)
    assets/js/main.js      abertura, triscroll, linhas, pé de café, revelação, menu, idiomas
    assets/fonts/arome.woff2
    assets/img/            imagens em WebP + favicons

## Pendências antes de publicar

- Definir a URL final e preencher canonical, og:url e og:image (comentário no <head>).
- Criar uma imagem de compartilhamento 1200×630 (assets/img/og-image.jpg).
- Escrever a nota dos asteriscos da ficha técnica (comentário no fim da seção #ficha-tecnica).

## Observações

- O idioma pode ser forçado pela URL: index.html?lang=en ou ?lang=es.
- Ao editar um texto em PT, atualize a chave correspondente em assets/js/i18n.js,
  senão a tradução daquele trecho deixa de funcionar.
- Sem JavaScript ou com "movimento reduzido" ativo, o topo vira três blocos estáticos.
