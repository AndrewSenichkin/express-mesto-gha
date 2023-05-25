module.exports = class IncorrectDate extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
};
