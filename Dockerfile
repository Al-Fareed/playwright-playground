FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /src

ENV CI=true

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY playwright.config.ts ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src
COPY tests ./tests

CMD ["npm", "test"]
