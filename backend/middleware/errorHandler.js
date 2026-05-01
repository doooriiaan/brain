export function errorHandler(error, _request, response, next) {
  if (!error) {
    next();
    return;
  }

  if (error.name === "MulterError") {
    response.status(400).json({
      message: error.message,
    });
    return;
  }

  response.status(error.statusCode ?? 500).json({
    message: error.message || "Unexpected server error.",
  });
}
