# wedding-gift-presentation

Versão Angular do projeto original React/Vite, mantendo o mesmo estilo visual.

## Pré-requisitos

- Node.js 18+
- npm ou pnpm

## Como rodar

```bash
npm install
npm start
```

Acesse: http://localhost:4200

## Como fazer build de produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/wedding-gift-presentation/browser/`.

## Como subir com Docker

### Opção 1: Docker (build + run)

```bash
docker build -t wedding-gift-presentation .
docker run --rm -p 8080:80 wedding-gift-presentation
```

Acesse: http://localhost:8080

### Opção 2: Docker Compose

```bash
docker compose up --build
```

Acesse: http://localhost:8080

---

## Estrutura do projeto

```
src/
├── app/
│   ├── app.component.ts          # Componente raiz (controla a view atual)
│   ├── models/
│   │   └── gift.model.ts         # Interface Gift + dados mock
│   └── components/
│       ├── button/               # Botão reutilizável (primary/secondary/outline)
│       ├── feature-card/         # Card de benefício (ícone + título + descrição)
│       ├── testimonial/          # Card de depoimento
│       ├── gift-card/            # Card de presente com progresso
│       ├── gift-details-modal/   # Modal de detalhes + formulário de contribuição
│       ├── landing-page/         # Página principal (hero, como funciona, etc.)
│       └── guest-view/           # Visão do convidado (lista de presentes)
├── styles/
│   └── global.css                # Variáveis CSS + reset global
└── index.html
```

## Tecnologias

- **Angular 17** com Standalone Components
- **CSS puro** (sem Tailwind, sem dependências de UI)
- **Fontes**: Playfair Display + Lato (Google Fonts)
- **Paleta**: Dourado rosé (#C79A6D) + Bege (#F7F0EA)
