FROM node:lts

ENV PATH /usr/src/app/node_modules/.bin:/root/.pulumi/bin:$PATH

RUN npm install -g yarn
RUN curl -fsSL https://get.pulumi.com | sh
RUN mkdir /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN yarn install
COPY . /usr/src/app
