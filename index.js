const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const { register, login } = require('./controller/userController');
const globalErrorHandler = require('./controller/errorController');

const AppError = require('./utils/appError');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const port = 4001;

// adds new user
app.post('/register', register);

app.get('/login', login);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
