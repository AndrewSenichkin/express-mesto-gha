const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const routes = require('./routes/router');
// mongodb://localhost:27017 через этот порт не подключался, подключил через терминал с помощью mongosh
const URL = 'mongodb://127.0.0.1:27017/mestodb';
const { PORT = 3000 } = process.env;
const app = express();
app.use(helmet());
app.use(express.json());
app.use(routes);

app.use((req, res, next) => {
  req.user = {
    _id: '645c9465c38af38ed961aea1', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

mongoose.connect(URL)
  .then(() => {
    console.log('БД подключена');
  })
  .catch(() => {
    console.log('Не удалось подключиться к БД');
  });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
