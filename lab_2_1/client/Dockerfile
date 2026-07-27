# Multi-stage: build Vite app, then serve static + proxy to API
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY server.js ./
COPY --from=build /app/dist ./dist

ENV PORT=3000
ENV API_URL=http://api:3001

EXPOSE 3000

CMD ["npm", "start"]
