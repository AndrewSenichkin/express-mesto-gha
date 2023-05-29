const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const IncorrectDate = require('../errors/IncorrectDate');
const Forbidden = require('../errors/Forbidden');
// Все карточки:
module.exports.getInitialCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => res.send({ data: card }))
    .catch(next);
};

// Создание новой карточки:
module.exports.addNewCard = (req, res, next) => {
  const { name, link } = req.body;
  const { userId } = req.user;
  Card.create({ name, link, owner: userId })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDate('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Удаление карточки:
module.exports.removeCard = (req, res, next) => {
  const { id: cardId } = req.params;
  const { userId } = req.user;
  Card.findById({ _id: cardId })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Данные по указанному id не найдены');
      }
      const { owner: cardOwnerId } = card;
      if (cardOwnerId.valueOf() !== userId) {
        throw new Forbidden('нет доступа');
      }
      return Card.findByIdAndDelete(cardId);
    })
    .then((cardDeleted) => {
      if (!cardDeleted) {
        throw new NotFoundError('Карточка уже была удалена');
      }
      res.send({ data: cardDeleted });
    })
    .catch(next);
};

// Лайк на карточке:
module.exports.addLike = (req, res, next) => {
  const { cardId } = req.params;
  const { userId } = req.user;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true },
  ).then((card) => {
    if (card) {
      return res.status(200).send({ data: card });
    }
    throw new NotFoundError('Карточка с id не найдена');
  })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new IncorrectDate('Переданы некорректные данные при лайке'));
      } else {
        next(err);
      }
    });
};

// Удаление лайка с карточки:
module.exports.removeLike = (req, res, next) => {
  const { cardId } = req.params;
  const { userId } = req.user;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  ).then((card) => {
    if (card) {
      return res.status(200).send({ data: card });
    }
    throw new NotFoundError('Карточка с id не найдена');
  })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new IncorrectDate('Переданы некорректные данные при снятии лайка'));
      } else {
        next(err);
      }
    });
};
