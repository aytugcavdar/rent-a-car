// Asenkron route handler'lardaki hataları yakalayıp errorHandler'a yönlendirir.
const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);

module.exports = asyncHandler;