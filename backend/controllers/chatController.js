import { controller } from "./controllerUtils.js";
import { createFrontPageChatReply } from "../services/chatService.js";

export const createFrontPageChat = controller(async (request, response) => {
  response.json(await createFrontPageChatReply(request.body));
});
