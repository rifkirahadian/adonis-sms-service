#!/bin/sh

cd /home/node/app
npm install
node ace migration:run
node ace serve --watch