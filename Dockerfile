FROM node:lts-alpine

WORKDIR /GWAPI

COPY package*.json ./

RUN npm install

COPY src/ src/

USER node

CMD [ "npm", "run" ,"start"]

EXPOSE 8000