# 推廣中心後端（Express + sql.js，無原生 sqlite 編譯）
FROM node:20-bookworm-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NO_OPEN_BROWSER=1
EXPOSE 3856

CMD ["node", "server/backend-server.js"]
