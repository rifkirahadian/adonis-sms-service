 SMS Service

API Documentation : https://documenter.getpostman.com/view/137855/UVsEV9AU

## Running On Docker

```bash
# install dependencies
$ cp .env.example .env

#fill SMS_URL variable at .env

# running container
$ docker compose up -d

```

## Running Natively

```bash
# install dependencies
$ cp .env.example .env

# create mysql database

# fill SMS_URL and mysql variable at .env

# install dependency
$ npm install

# run database migration
$ node ace migration:run

# running scheduler
$ node ace scheduler:run

# open another terminal tab

# running api
$ npm run dev

```