const router = require('express').Router();
const auth = require('../middlewares/auth');
const userRoutes = require('./users');
const cardRoutes = require('./cards');

const NotFoundError = require('../errors/NotFoundError');

router
  .use('/users', auth, userRoutes)
  .use('/cards', auth, cardRoutes)
  .use('/*', auth, (req, res, next) => {
    next(new NotFoundError('Запрашиваемый ресурс не найден'));
  });

module.exports = router;
