FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

RUN mkdir -p logs

ENV PORT=3400
ENV LOG_LEVEL=info
ENV NODE_ENV=production

EXPOSE 3400

CMD ["node", "dist/server.js"]
