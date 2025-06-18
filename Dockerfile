FROM node:22-alpine AS base

WORKDIR /app

FROM base AS dependencies

COPY package*.json ./

RUN npm install

FROM dependencies AS builder

COPY . .

RUN npm run build

FROM base AS development

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
