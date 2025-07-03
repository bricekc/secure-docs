FROM node:lts-alpine3.22

WORKDIR /app

COPY package*.json ./
RUN npm install -g @nestjs/cli
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && exec node dist/main"]
