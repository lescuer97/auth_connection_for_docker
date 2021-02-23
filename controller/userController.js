const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios').default;
const { promisify } = require('util');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const paswordCompare = promisify(bcrypt.compare);

const signToken = email => {
  return jwt.sign({ email }, process.env.JWT_SECRET);
};

const createSendToken = (email, statusCode, res) => {
  const token = signToken(email);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const check = await axios({
    method: 'get',
    url: `http://${process.env.DB_MYSQL}/user`,
    data: {
      email: req.body.email
    }
  }).then(response => {
    return response.data.results;
  });

  // this looks if there was a user already
  if (check.length > 0) {
    next(new AppError('user already exists ', 403));
  } else {
    const hashedPassword = await bcrypt
      .hash(req.body.password, 0)
      .then(hash => {
        return hash;
      });

    req.body.password = hashedPassword;

    const result = await axios({
      method: 'post',
      url: `http://${process.env.DB_MYSQL}/createUser`,
      data: req.body
    }).then(response => {
      return response.data;
    });

    if (result.status === 'success') {
      res.status(200).json({
        status: 'success',
        results: 'user created '
      });
    } else {
      next(new AppError('there was an error creating your user', 404));
    }
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const axiosReponse = await axios({
    method: 'get',
    url: `http://${process.env.DB_MYSQL}/user`,
    data: {
      email: req.body.email
    }
  }).then(resAx => {
    return resAx.data.results;
  });

  // check if there is a user or more than one
  if (axiosReponse.length > 1 || axiosReponse.length === 0) {
    next(new AppError('there was an error getting your credentials', 403));
  }
  const user = axiosReponse[0];
  const hashCompare = await paswordCompare(
    req.body.password,
    user.password
  ).then(prom => {
    return prom;
  });

  if (!hashCompare) {
    next(new AppError('wrong password', 403));
  } else {
    createSendToken(user.email, 200, res);
  }
});
