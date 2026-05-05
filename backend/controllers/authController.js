import {
  getDemoCredentials,
  getAuthSnapshot,
  loginUser,
  registerUser,
} from "../services/authService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryBoolean,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAuthDemo = controller((request, response) => {
  const role = readQueryText(request, "role");
  const company = readQueryText(request, "company");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 20,
  });

  let credentials = getDemoCredentials();
  credentials = filterByExactText(credentials, role, (item) => item.role);
  credentials = filterByContainsText(credentials, company, (item) => item.company);

  const total = credentials.length;
  credentials = limitItems(credentials, limit);

  sendList(response, "credentials", credentials, {
    total,
    filters: {
      role,
      company,
      limit,
    },
  });
});

export const getAuthStatus = controller((request, response) => {
  const includeUsers = readQueryBoolean(request, "includeUsers", true);
  const includeAccounts = readQueryBoolean(request, "includeAccounts", true);
  const includeSessions = readQueryBoolean(request, "includeSessions", true);
  const snapshot = getAuthSnapshot();

  response.json({
    ...(includeUsers ? { users: snapshot.users } : {}),
    ...(includeAccounts ? { accounts: snapshot.accounts } : {}),
    ...(includeSessions ? { sessions: snapshot.sessions } : {}),
    totals: {
      users: snapshot.users.length,
      accounts: snapshot.accounts.length,
      sessions: snapshot.sessions.length,
    },
  });
});

export const loginRequest = controller((request, response) => {
  const session = loginUser(request.body ?? {});

  response.status(201).json({
    message: `${session.user.role} session created successfully.`,
    session,
  });
});

export const registerRequest = controller((request, response) => {
  const session = registerUser(request.body ?? {});

  response.status(201).json({
    message: "Client workspace account created successfully.",
    session,
  });
});
