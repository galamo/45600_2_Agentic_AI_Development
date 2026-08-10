# --- build stage (can be larger) ---
    FROM node:20-alpine AS build

    WORKDIR /app
    COPY package.json package-lock.json ./
    RUN npm ci
    
    COPY tsconfig.json ./
    COPY src ./src
    RUN npm run build && npm prune --omit=dev
    
    # --- runtime: tiny, no OS tools ---
    FROM gcr.io/distroless/nodejs20-debian12
    
    WORKDIR /app
    COPY --from=build /app/package.json ./
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/dist ./dist
    
    ENV PORT=3400
    ENV LOG_LEVEL=info
    ENV NODE_ENV=production
    
    EXPOSE 3400
    CMD ["dist/server.js"]