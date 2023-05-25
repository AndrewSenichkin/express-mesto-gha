const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers,
  getUserId,
  editProfileUserInfo,
  updateProfileUserAvatar,
  getUserInfo,
} = require('../controllers/users');

// Пользователи:
router.get('/', getUsers);

// Конкретный пользователь по его ID:
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), getUserId);

// Редактирование данных пользователя:
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().alphanum().min(2)
      .max(30),
    about: Joi.string().required().alphanum().min(2)
      .max(30),
    avatar: Joi.string().required().uri(),
  }),
}), editProfileUserInfo);

// Редактирование аватара пользователя:
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().uri(),
  }),
}), updateProfileUserAvatar);

router.get('/me', getUserInfo);

module.exports = router;
