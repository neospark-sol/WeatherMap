FROM node:20-alpine AS builder
WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./backend/
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd backend && npm ci
RUN cd frontend && npm ci

COPY backend ./backend
COPY frontend ./frontend

# Icons must exist (committed or regenerated in CI)
RUN cd backend && npm run build
RUN cd frontend && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm ci --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 8080
ENV PORT=8080
ENV PROVIDER=live
CMD ["node", "backend/dist/server.js"]
