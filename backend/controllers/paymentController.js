import { createPayment, getPayments } from "../services/paymentService.js";

export function getAllPayments(_request, response) {
  response.json({
    payments: getPayments(),
  });
}

export function createPaymentRequest(request, response) {
  const payment = createPayment(request.body ?? {});

  response.status(201).json({
    payment,
  });
}
