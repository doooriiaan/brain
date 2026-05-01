import {
  createActivation,
  getActivations,
} from "../services/activationService.js";

export function getAllActivations(_request, response) {
  response.json({
    activations: getActivations(),
  });
}

export function createActivationRequest(request, response) {
  const activation = createActivation(request.body ?? {});

  response.status(201).json({
    activation,
  });
}
