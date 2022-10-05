1. Init NPM : npm init -y
2. Nodemon : npm install nodemen *--save-dev*
4. ESLint : npm install eslint *--save-dev*
    - npx eslint --init
    - setting eslintrc.json
    
3. Dotenv : npm install dotenv
    - setting env prod
    - setting env dev

4. Setting pacakge json scripts
    -

5. HAPI : npm install @hapi/hapi
6. NanoId : npm install nanoid@3.x.x
7. Postgres : npm install pg
8. Postgres Migration : npm install node-pg-migrate
9. JOI Data Validation : npm install joi
10. Git Init
11. Config : npm install config
12. RabbitMQ amqplib : npm install amqplib

# Create DB

- psql -U <username>
- GRANT ALL PRIVILEGES ON DATABASE companydb TO developer;
- CREATE DATABASE <db_name>
- GRANT ALL PRIVILEGES ON <db_name> TO <username_db>

# Create Table with Migration
- npm run migrate create "create table songs"
- npm run migrate up

- create server.js

