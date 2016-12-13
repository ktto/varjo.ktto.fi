#!/bin/sh

sudo mkdir -p /usr/local/etc/nginx
sudo cp proxy/nginx.conf /usr/local/etc/nginx/nginx.conf
npm run build:prod
npm run stop:prod
npm run start:prod
sudo service nginx restart

