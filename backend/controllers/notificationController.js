import { getNotifications } from "../services/runtimeService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllNotifications = controller((request, response) => {
  const level = readQueryText(request, "level");
  const search = readQueryText(request, "search");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 40,
  });

  let notifications = getNotifications();
  notifications = filterByExactText(notifications, level, (item) => item.level);
  notifications = filterByContainsText(
    notifications,
    search,
    (item) => `${item.title} ${item.body}`,
  );

  const total = notifications.length;
  notifications = limitItems(notifications, limit);

  sendList(response, "notifications", notifications, {
    total,
    filters: {
      level,
      search,
      limit,
    },
  });
});
