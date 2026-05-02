import {
  getDemoCredentials,
  getAuthSnapshot,
  loginUser,
  registerUser,
} from "../services/authService.js";

export function getAuthDemo(_request, response) {
  response.json({
    credentials: getDemoCredentials(),
  });
}

export function getAuthStatus(_request, response) {
  response.json(getAuthSnapshot());
}

export function loginRequest(request, response) {
  const session = loginUser(request.body ?? {});

  response.status(201).json({
    session,
  });
}

export function registerRequest(request, response) {
  const session = registerUser(request.body ?? {});

  response.status(201).json({
    session,
  });
}
