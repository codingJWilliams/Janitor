FROM node:carbon
WORKDIR /bot
COPY package*.json ./
RUN npm install
COPY . .
#ENTRYPOINT ["exec"]
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]
CMD ["node", "bot.js"]

