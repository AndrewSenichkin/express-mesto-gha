const router = require('express').Router();
const auth = require('../middlewares/auth');
const userRoutes = require('./users');
const cardRoutes = require('./cards');

router
  .use('/users', auth, userRoutes)
  .use('/cards', auth, cardRoutes);

module.exports = router;
