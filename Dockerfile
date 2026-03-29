# 推廣中心後端（展示／原型用）
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY . .

ENV NO_OPEN_BROWSER=1
EXPOSE 3856

CMD ["node", "backend-server.js"]
