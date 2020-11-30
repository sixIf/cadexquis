FROM node:12-alpine
LABEL name "cadexquis"
LABEL version "0.0.1"
LABEL maintainer "coucoulescoucou@protonmail.com"
WORKDIR /usr/src/cadexquis
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
