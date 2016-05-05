FROM node:4.4.3-onbuild

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY app.js /usr/src/app/
COPY dbmanager.js /usr/src/app/
COPY takeOrder.js /usr/src/app/
COPY package.json /usr/src/app/
RUN npm install

CMD ["node", "app.js"]
