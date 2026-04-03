import { Router } from "express";
import { analyzeTicketController, listTicketsController } from "../controllers/ticketController.js";

export const ticketRouter = Router();

ticketRouter.post("/analyze", analyzeTicketController);
ticketRouter.get("/", listTicketsController);

