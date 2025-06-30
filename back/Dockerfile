FROM node:lts-alpine3.22

WORKDIR /app

RUN npm install -g @nestjs/cli nodemon

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start:dev"]