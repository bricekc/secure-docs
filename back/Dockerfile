FROM node:lts-alpine3.22

WORKDIR /app

RUN npm install -g @nestjs/cli nodemon

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
