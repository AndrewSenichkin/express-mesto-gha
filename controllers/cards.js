const validator = require('validator');
const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');

// Все карточки:
module.exports.getInitialCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((card) => res.send({ data: card }))
    .catch(next);
};

// Создание новой карточки:
module.exports.addNewCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch(next);
};

// Удаление карточки:
module.exports.removeCard = (req, res, next) => {
  if (validator.isMongoId(req.params.cardId)) {
    Card.findByIdAndRemove({ _id: req.params.cardId, owner: req.user._id })
      .then((user) => res.send({ data: user }))
      .catch(next);
  } else next(new NotFoundError('Нет карточки с таким id'));
};

// Лайк на карточки:
module.exports.addLike = (req, res, next) => {
  if (req.params.cardId && validator.isMongoId(req.params.cardId)) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    ).then((card) => res.send({ data: card }))
      .catch(next);
  } else next(new NotFoundError('Нет карточки с таким id'));
};

// Удаление лайка с карточки:
module.exports.removeLike = (req, res, next) => {
  if (req.params.cardId && validator.isMongoId(req.params.cardId)) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).then((card) => res.send({ data: card }))
      .catch(next);
  } else next(new NotFoundError('Нет карточки с таким id'));
};
