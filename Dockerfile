FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
