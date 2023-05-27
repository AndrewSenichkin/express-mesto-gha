const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const regex = require('../utils/constants');
const {
  getUsers,
  getUserId,
  editProfileUserInfo,
  updateProfileUserAvatar,
  getUserInfo,
} = require('../controllers/users');

// Пользователи:
router.get('/', getUsers);
router.get('/me', getUserInfo);

// Конкретный пользователь по его ID:
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24),
  }),
}), getUserId);

// Редактирование данных пользователя:
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2)
      .max(30),
    about: Joi.string().required().min(2)
      .max(30),
  }),
}), editProfileUserInfo);

// Редактирование аватара пользователя:
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regex),
  }),
}), updateProfileUserAvatar);

module.exports = router;
