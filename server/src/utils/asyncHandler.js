// Express 4 does not catch errors thrown inside async route handlers.
// A rejected promise never reaches the error middleware in app.js, so the
// request hangs until the client times out. Wrapping handlers with this
// forwards any rejection to next(), where the central error handler responds.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
