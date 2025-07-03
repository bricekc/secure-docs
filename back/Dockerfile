FROM node:lts-alpine3.22

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build && npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
