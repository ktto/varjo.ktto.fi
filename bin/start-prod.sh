#!/bin/sh

cp proxy/default /etx/nginx/sites-available/default
npm run build:prod
npm run stop:prod
npm run start:prod
service nginx restart

