# Demetra — site (wireframe navegável)

Página única em HTML, CSS e JavaScript puro. Pronta para subir no GitHub e publicar na Vercel sem build.

## Estrutura

```
index.html
assets/
  css/styles.css      tokens (cores, fontes, pesos) no topo do arquivo
  css/lenis.css
  js/main.js          animações e interações
  js/gsap.min.js, ScrollTrigger.min.js, lenis.min.js
  fonts/              Apple Garamond, Instrument Sans, IBM Plex Mono, Libre Caslon Condensed (fallback)
```

## Antes de publicar

1. **WhatsApp:** em `assets/js/main.js`, troque `WHATSAPP = '55XXXXXXXXXXX'` pelo número com DDI + DDD (só dígitos). Cada botão tem a própria mensagem pré-preenchida no atributo `data-wa` do HTML.
2. **Licença da Apple Garamond:** é uma fonte proprietária (Apple/Bitstream) e não tem licença pública de uso web. Confirme a licença antes de publicar; a alternativa comercial mais próxima é a ITC Garamond Condensed. Para trocar, basta substituir os arquivos em `assets/fonts/` e o nome em `--f-display` no `styles.css`.
3. **Conteúdo:** textos provisórios; prints/fotos de clientes e retratos dos fundadores entram nos placeholders das seções 04 e 05.

## Ajustes rápidos (styles.css, `:root`)

- `--w-h1` peso do H1 (300 Light, 400 Regular)
- `--w-h2` peso de H2/H3 (400 Regular, 700 Bold)
- cores: `--abeto`, `--abeto-2`, `--tangerina`, `--branco`, `--claro`

## Publicar na Vercel

Crie o repositório, envie estes arquivos e importe o repositório na Vercel (Framework preset: "Other", sem comando de build, diretório de saída: raiz).

## Animações

GSAP + ScrollTrigger + Lenis (rolagem suave). Tudo respeita `prefers-reduced-motion`. No celular, a rolagem horizontal das frentes vira lista vertical e o cursor personalizado é desativado.
