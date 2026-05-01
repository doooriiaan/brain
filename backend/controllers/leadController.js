import { createLead, getLeads } from "../services/leadService.js";

export function getAllLeads(_request, response) {
  response.json({
    leads: getLeads(),
  });
}

export function createLeadRequest(request, response) {
  const lead = createLead(request.body ?? {});

  response.status(201).json({
    lead,
  });
}
