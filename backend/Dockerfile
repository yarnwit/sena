# Backend Dockerfile (Production Runtime for pre-built dist)
FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# คัดลอก package.json และ package-lock.json เพื่อติดตั้ง production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# คัดลอก dist ที่ build เสร็จแล้ว
COPY dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
