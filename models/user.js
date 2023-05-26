const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Unauthorized = require('../errors/Unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Некорректный адрес URL',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator: (email) => /.+@.+\..+/.test(email),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: ({ length }) => length >= 8,
      message: 'Минимальная длина поля должна быть 8 символов',
    },
  },
}, {
  versionKey: false,
  statics: {
    findUserByCredentials(email, password) {
      // попытаемся найти пользователя по почте
      return this
        .findOne({ email })
        .select('+password')
        .then((user) => {
          if (!user) return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
          // нашёлся — сравниваем хеши
          return bcrypt.compare(password, user.password)
            .then((matched) => {
              if (!matched) return Promise.reject(new Unauthorized('Неверные учетные данные'));
              return user;
            });
        });
    },
  },
});

module.exports = mongoose.model('user', userSchema);
