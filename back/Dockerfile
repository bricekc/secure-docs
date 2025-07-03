FROM node:lts-alpine3.22

WORKDIR /app

RUN npm install -g @nestjs/cli nodemon ts-node

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm run start"]