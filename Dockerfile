FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY backend/package*.json ./backend/
RUN npm ci --prefix backend

COPY frontend ./frontend
COPY backend ./backend

RUN npm --prefix frontend run build

FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --prefix backend

COPY backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/server.js"]