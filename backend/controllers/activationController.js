import {
  createActivation,
  getActivations,
} from "../services/activationService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllActivations = controller((request, response) => {
  const company = readQueryText(request, "company");
  const sector = readQueryText(request, "sector");
  const plan = readQueryText(request, "plan");
  const status = readQueryText(request, "status");
  const deviceKey = readQueryText(request, "deviceKey");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 30,
  });

  let activations = getActivations();
  activations = filterByContainsText(activations, company, (item) => item.company);
  activations = filterByExactText(activations, sector, (item) => item.sector);
  activations = filterByExactText(activations, plan, (item) => item.plan);
  activations = filterByExactText(activations, status, (item) => item.status);
  activations = filterByExactText(activations, deviceKey, (item) => item.deviceKey);

  const total = activations.length;
  activations = limitItems(activations, limit);

  sendList(response, "activations", activations, {
    total,
    filters: {
      company,
      sector,
      plan,
      status,
      deviceKey,
      limit,
    },
  });
});

export const createActivationRequest = controller((request, response) => {
  const activation = createActivation(request.body ?? {});

  response.status(201).json({
    message: "Activation created successfully.",
    activation,
  });
});
