# API backend
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY tools ./tools
COPY agents ./agents
COPY utils ./utils
COPY services ./services
COPY generated-images ./generated-images

RUN mkdir -p logs generated-images

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
