FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g npm@11

COPY package*.json ./
RUN npm ci

COPY . .

ARG BACKEND_URL=http://backend:3001
ENV BACKEND_URL=${BACKEND_URL}

RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_URL=http://backend:3001

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
