FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build
# 每次构建都重新生成数据库，确保使用最新 JSON 数据
RUN node scripts/seed-data.js

EXPOSE 3000

CMD ["node", "dist/main.js"]
