export function notFoundHandler(_request, response) {
  response.status(404).json({
    message: "API route not found.",
  });
}
