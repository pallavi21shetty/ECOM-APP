FROM node:18

WORKDIR /usr/src/app

RUN apt-get update

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]