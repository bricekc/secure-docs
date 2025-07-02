FROM node:lts-alpine3.22

WORKDIR /app

RUN npm install -g @nestjs/cli && apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]