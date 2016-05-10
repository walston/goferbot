FROM node:4.4.3-onbuild

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY entry-beep-boop.js /usr/src/app/

COPY lib/botkit-storage.js /usr/src/app/lib/
COPY lib/dbmanager.js /usr/src/app/lib/
COPY lib/orderTicket.js /usr/src/app/lib/
COPY lib/takeOrder.js /usr/src/app/lib/
COPY lib/witlogic.js /usr/src/app/lib/
COPY package.json /usr/src/app/
RUN npm install

CMD ["node", "entry-beep-boop.js"]
