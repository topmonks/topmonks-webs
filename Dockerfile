# Dockerize the app
# Very usefull when running on Windows because of eternal problems with npm install, node gyp etc
FROM node:10.24.0

RUN echo node version
RUN node --version

# Install Pulumi
RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH /root/.pulumi/bin:$PATH
# Ensure that Pulumi is installed
RUN pulumi version

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# increment this line when you updated the package.json
RUN touch break-cache-1

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install

# add app
COPY . /usr/src/app
