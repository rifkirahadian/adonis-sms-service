#!/bin/sh

cd /home/node/app  
node ace migration:run
node ace serve --watch