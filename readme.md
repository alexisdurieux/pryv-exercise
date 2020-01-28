# PRYV Technical exercise

## Setup the project

### Dependencies:
  * node version v12.14.1

### Setup
  * install dependencies: `npm i`
  * run the migrations: `node_modules/db-migrate/bin/db-migrate up --env dev`
  * run the server `npm run build && npm run start` or in development mode `npm run start-dev`

### Run tests
  * `npm run test`

#### To do
  * add a test for every route:
    * create and get by id:
      * POST a resource and get it (both POST and )
    * create, get, update, get by id
    * create, create and get all
    * create, get, delete, get
