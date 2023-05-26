const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const routes = require('./routes/router');
require('dotenv').config();
const NotFoundError = require('./errors/NotFoundError');
const signup = require('./routes/signup');
const signin = require('./routes/signin');

const URL = 'mongodb://127.0.0.1:27017/mestodb';
const { PORT = 3000 } = process.env;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 минут
  max: 100, // можно совершить максимум 100 запросов с одного IP
});

// Данный адрес взят после подключения через терминал с помощью mongosh:
mongoose
  .connect(URL)
  .then(() => {
    console.log('БД подключена');
  })
  .catch(() => {
    console.log('Не удалось подключиться к БД');
  });

const app = express();
// подключаем rate-limiter
app.use(limiter);
app.use(helmet());
app.disable('x-powered-by');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', signup);
app.use('/', signin);
app.use(routes);
app.use(errors());

app.use((req, res, next) => next(new NotFoundError('Страницы по запрошенному URL не существует')));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
