import { createLead, getLeads } from "../services/leadService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllLeads = controller((request, response) => {
  const company = readQueryText(request, "company");
  const sector = readQueryText(request, "sector");
  const status = readQueryText(request, "status");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 30,
  });

  let leads = getLeads();
  leads = filterByContainsText(leads, company, (item) => item.company);
  leads = filterByExactText(leads, sector, (item) => item.sector);
  leads = filterByExactText(leads, status, (item) => item.status);

  const total = leads.length;
  leads = limitItems(leads, limit);

  sendList(response, "leads", leads, {
    total,
    filters: {
      company,
      sector,
      status,
      limit,
    },
  });
});

export const createLeadRequest = controller((request, response) => {
  const lead = createLead(request.body ?? {});

  response.status(201).json({
    message: "Lead captured successfully.",
    lead,
  });
});
