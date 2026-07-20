FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

ENV MCP_PORT=3300
ENV LOG_LEVEL=info

EXPOSE 3300

CMD ["node", "dist/index.js"]
