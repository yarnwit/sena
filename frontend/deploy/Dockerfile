# Runtime image for a pre-built Next.js standalone output.
# Expects ./standalone, ./static, ./public next to this Dockerfile
# (produced by `npm run release` and shipped in the zip).
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY standalone/ ./
COPY static/ ./.next/static
COPY public/ ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
