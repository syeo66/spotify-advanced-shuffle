FROM node:16 as node

ARG CLIENT_ID=${CLIENT_ID}
ENV CLIENT_ID=${CLIENT_ID}

WORKDIR /usr/src/app
COPY package*.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN echo "REACT_APP_CLIENT_ID=$CLIENT_ID" > .env
RUN make build

FROM nginx as server

EXPOSE 80

COPY --from=node /usr/src/app/src /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf 

