FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma

FROM node:22-alpine AS final-prod
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5122
CMD ["node", "dist/src/main.js"]
