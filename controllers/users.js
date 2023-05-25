const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
// централизованнуая обработка ошибок
const Unauthorized = require('../errors/Unauthorized');
const NotFoundError = require('../errors/NotFoundError');
const IncorrectDate = require('../errors/IncorrectDate');
const Conflict = require('../errors/Conflict');
const ServerError = require('../errors/ServerError');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;
// логин пользователя:
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      // аутентификация успешна!
      if (userId) {
        const token = jwt.sign(
          { userId },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          { expiresIn: '7d' },
        );
        res.cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
        });
        return res.send({ _id: token });
      }
      throw new Unauthorized('Неправильные почта или пароль');
    })
    .catch(next);
};

// Пользователи:
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

// Конкретный пользователь по его ID:
module.exports.getUserId = (req, res, next) => {
  User
    .findById(req.params.userId)
    .orFail()
    .then((user) => {
      if (user) {
        return res.send({ user });
      }
      throw new NotFoundError('id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDate('Некорректный id'));
      } else {
        next(err);
      }
    });
};

// Создание и регистрация пользователя:
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new Conflict('Такой email уже зарегистрирован'));
      } else if (err.name === 'ValidationError') {
        next(new IncorrectDate('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Редактирование данных пользователя:
module.exports.editProfileUserInfo = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name, about: req.body.about, avatar: req.body.avatar,
  }, { new: true })
    .then((user) => (res.send({ data: user })))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new IncorrectDate(err));
      else next(new ServerError());
    });
};

// Редактирование аватара пользователя:
module.exports.updateProfileUserAvatar = (req, res, next) => {
  User.findOneAndUpdate(req.user._id, {
    avatar: req.body.avatar,
  }, { new: true })
    .then((user) => (res.send({ data: user })))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new IncorrectDate(err));
      else next(new ServerError());
    });
};
