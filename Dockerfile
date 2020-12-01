FROM node:12-alpine
LABEL name "cadexquis"
LABEL version "0.0.1"
LABEL maintainer "coucoulescoucou@protonmail.com"
WORKDIR /usr/src/cadexquis
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "build"]