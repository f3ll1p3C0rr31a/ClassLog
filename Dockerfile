FROM node:22-alpine

# Sem `npm ci` de propósito: o server.js usa só módulos nativos do Node (http,
# fs, path, crypto). O que está em `dependencies` no package.json é do build
# mobile (Capacitor) e não tem nada a fazer no runtime.
WORKDIR /app

# Copia o checkout inteiro e deixa o .dockerignore decidir o que fica de fora.
# A lista explícita de arquivos que existia no deploy antigo já causou o
# problema de uma página nova (schedule.html) não chegar em produção.
COPY . .

ARG APP_COMMIT_SHA=unknown
ENV APP_COMMIT_SHA=$APP_COMMIT_SHA

ENV NODE_ENV=production
ENV PORT=3000
ENV CLASSLOG_DATA_DIR=/app/data

EXPOSE 3000

CMD ["node", "server.js"]
