FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:22-alpine AS final-prod

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 5122
CMD ["node", "dist/src/main.js"]

FROM node:22-alpine AS runner

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY prisma ./prisma

CMD ["/bin/sh", "-c", "npm run start:dev"]
