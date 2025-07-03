FROM node:lts-alpine3.22

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm run start:prod"]
