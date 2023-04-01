# MusalaSoft Technical Interview Project

## Getting Started

1. Ensure you have Node.js installed.
2. Create a free [Mongo Atlas](https://www.mongodb.com/atlas/database) database online or start a local MongoDB database.
3. Create a `.env` file in the **gateway-project** directory with a `MONGO_URL` property set to your MongoDB connection string.
4. In the terminal, run: `npm install`

## Running the Project

1. In the terminal, run: `npm run deploy`
2. Browse to the mission control frontend at [localhost:8000](http://localhost:8000) and schedule an interstellar launch!

## Docker

1. Ensure you have the latest version of Docker installed
2. Run `docker build -t gateway-project .`
3. Run `docker run -it -p 8000:8000 gateway-project`

## Running the Tests

To run any automated tests, run `npm test`. This will:
* Run all the tests: `npm test --prefix server` 
