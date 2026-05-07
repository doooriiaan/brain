import { createPayment, getPayments } from "../services/paymentService.js";
import {
  controller,
  filterByExactText,
  limitItems,
  readQueryBoolean,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllPayments = controller((request, response) => {
  const company = readQueryText(request, "company");
  const plan = readQueryText(request, "plan");
  const status = readQueryText(request, "status");
  const cardBrand = readQueryText(request, "cardBrand");
  const linkedOnly = readQueryBoolean(request, "linkedOnly", null);
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 30,
  });

  let payments = getPayments({
    company,
  });
  payments = filterByExactText(payments, plan, (item) => item.plan);
  payments = filterByExactText(payments, status, (item) => item.status);
  payments = filterByExactText(payments, cardBrand, (item) => item.cardBrand);

  if (linkedOnly === true) {
    payments = payments.filter((payment) => Boolean(payment.linkedCardCode));
  }

  if (linkedOnly === false) {
    payments = payments.filter((payment) => !payment.linkedCardCode);
  }

  const total = payments.length;
  payments = limitItems(payments, limit);

  sendList(response, "payments", payments, {
    total,
    filters: {
      company,
      plan,
      status,
      cardBrand,
      linkedOnly,
      limit,
    },
  });
});

export const createPaymentRequest = controller((request, response) => {
  const payment = createPayment(request.body ?? {});

  response.status(201).json({
    message: "Payment request sent to admin approval.",
    payment,
  });
});
