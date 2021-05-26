const express = require('express');
const bodyParser = require('body-parser');
const user = require('./routes/user');
const InitiateMongoServer = require('./database');

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Working' });
});

/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
//Здесь подключили наш роут
app.use('/user', user);

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});
