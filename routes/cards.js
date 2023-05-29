const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const regex = require('../utils/constants');
const {
  getInitialCards,
  addNewCard,
  removeCard,
  addLike,
  removeLike,
} = require('../controllers/cards');

// Все карточки:
router.get('/', getInitialCards);

// Создание новой карточки:
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2)
      .max(30),
    link: Joi.string().required().pattern(regex),
  }),
}), addNewCard);

// Удаление карточки:
router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), removeCard);

// Лайк на карточки:
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), addLike);

// Удаление лайка с карточки:
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), removeLike);

module.exports = router;
