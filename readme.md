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


# TO DO for tests:
  * Split login and user tests
  * Test login
    * Create user in before
    * Test wrong login
    * Test good login
  * Test user
    * Test user already exists
    * Test new user
  * Test resource
    * get all
      * Test wrong token
    * get by id
      * test 404 
      * test found
    * update
      * test data fields incorrect
      * test ok
    * delete
      * test delete on unknown id
    * create 
      * id already exists