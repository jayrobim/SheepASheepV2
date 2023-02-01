FROM alpine:latest

RUN apk add --no-cache --upgrade python3 nodejs npm nginx
RUN npm install -g pm2
RUN adduser -D -g 'www' www
RUN mkdir /www
RUN chown -R www:www /var/lib/nginx
RUN chown -R www:www /www

WORKDIR /workspace
COPY . .
WORKDIR /workspace/html
RUN npm install
RUN npm run build
RUN cp -r ./build/* /www
COPY ./configs/nginx.conf /etc/nginx/nginx.conf
WORKDIR /workspace
RUN npm install

CMD ["/bin/sh", "-c", "nginx; pm2-runtime server.js"]