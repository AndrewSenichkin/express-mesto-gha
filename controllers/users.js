const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
// централизованнуая обработка ошибок
const NotFoundError = require('../errors/NotFoundError');
const IncorrectDate = require('../errors/IncorrectDate');
const Conflict = require('../errors/Conflict');
const Unauthorized = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

// логин пользователя:
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign(
          { userId },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          { expiresIn: '3d' },
        );
        return res.send({ _id: token });
      }
      throw new Unauthorized('Неправильные почта или пароль');
    })
    .catch(next);
};

// Пользователи:
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

// Конкретный пользователь по его ID:
module.exports.getUserId = (req, res, next) => {
  const { id } = req.params;
  User
    .findById(id)
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
      const { _id } = user;
      return res.status(201).send({
        name, about, avatar, email, _id,
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
  const { name, about } = req.body;
  const { userId } = req.user;
  User.findByIdAndUpdate(userId, {
    name, about,
  }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        return res.send({ user });
      }
      throw new NotFoundError('id не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') next(new IncorrectDate('Переданы некорректные данные'));
      else next(err);
    });
};

// Редактирование аватара пользователя:
module.exports.updateProfileUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const { userId } = req.user;
  User.findOneAndUpdate(userId, {
    avatar,
  }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      throw new NotFoundError('id не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new IncorrectDate('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Получение информации о пользователе:
module.exports.getUserInfo = (req, res, next) => {
  const { userId } = req.user;
  User
    .findById(userId)
    .then((user) => {
      if (user) {
        return res.send({ user });
      }
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDate('Передан некорректный id'));
      } else {
        next(err);
      }
    });
};
