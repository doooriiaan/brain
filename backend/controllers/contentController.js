import { getLandingContent } from "../services/contentService.js";

export async function getContent(_request, response) {
  const content = await getLandingContent();
  response.json(content);
}
