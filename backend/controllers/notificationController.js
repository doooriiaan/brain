import { getNotifications } from "../services/runtimeService.js";

export function getAllNotifications(_request, response) {
  response.json({
    notifications: getNotifications(),
  });
}
