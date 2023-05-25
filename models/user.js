const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Unauthorized = require('../errors/Unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    required: [true, 'Поле "name" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    validate: {
      validator: (value) => validator.isAlpha(value),
      message: 'Некорректное имя',
    },
  },
  about: {
    type: String,
    default: 'Исследователь',
    required: [true, 'Поле "about" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "about" - 2'],
    maxlength: [30, 'Максимальная длина поля "about" - 30'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    required: true,
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Некорректный адрес URL',
    },
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
    validate: {
      validator: (email) => /.+@.+\..+/.test(email),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
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
          if (!user) throw new Unauthorized('Неправильные почта или пароль');
          // нашёлся — сравниваем хеши
          return Promise.all([
            bcrypt.compare(password, user.password),
            user,
          ]);
        });
    },
  },
});

module.exports = mongoose.model('user', userSchema);
