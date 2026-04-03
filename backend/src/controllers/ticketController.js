import { z } from "zod";
import { analyzeAndStoreTicket, listTickets } from "../services/ticketService.js";

const analyzeSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "message must be at least 10 characters long")
    .max(3000, "message too long"),
});

export function analyzeTicketController(req, res, next) {
  try {
    const { message } = analyzeSchema.parse(req.body);
    const ticket = analyzeAndStoreTicket(message);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

export function listTicketsController(req, res, next) {
  try {
    const limitSchema = z.object({
      limit: z.coerce.number().optional(),
    });
    const { limit } = limitSchema.parse(req.query);
    const tickets = listTickets(limit);
    res.json({ items: tickets });
  } catch (err) {
    next(err);
  }
}

