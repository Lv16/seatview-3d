# SeatView 3D

SeatView 3D é um protótipo independente para explorar, em 2D e 3D, a disposição e a perspectiva de assentos de uma sala de cinema. O mapa local é uma reconstrução ilustrativa e não representa uma integração com sistemas de venda ou disponibilidade em tempo real.

**O SeatView 3D não é afiliado, associado, patrocinado nem oficialmente relacionado à Ingresso.com ou ao Kinoplex.** Marcas e nomes citados são usados apenas para identificar a referência visual simulada.

## Requisitos

- Node.js 22.12 ou mais recente
- npm

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço local exibido pelo Vite. No mapa da Sala 6, selecione até dois assentos disponíveis e escolha **Visualizar em 3D**. A seleção e a disponibilidade são dados locais de demonstração.

## Verificações

```bash
npm test
npm run lint
npm run build
```

## Tecnologias

React, TypeScript, Vite, Three.js, React Three Fiber, Drei e GSAP.
