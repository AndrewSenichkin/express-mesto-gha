const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // тут будет вся авторизация
  const { authorization } = req.headers;
  let payload;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new Unauthorized('Вам нужно войти в систему'));
  }
  const token = authorization.replace('Bearer ', '');
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return next(new Unauthorized('Вам нужно войти в систему'));
  }
  req.user = payload;
  return next();
};
