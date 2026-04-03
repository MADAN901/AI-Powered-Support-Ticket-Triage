import { db } from "../db/index.js";
import { analyzeTicket } from "./ticketAnalyzer.js";

const insertStmt = db.prepare(`
  INSERT INTO tickets (
    message, category, priority, urgency, confidence, keywords, signals
  ) VALUES (
    @message, @category, @priority, @urgency, @confidence, @keywords, @signals
  )
`);

const listStmt = db.prepare(`
  SELECT
    id, message, category, priority, urgency, confidence, keywords, signals, created_at
  FROM tickets
  ORDER BY datetime(created_at) DESC, id DESC
  LIMIT @limit
`);

function mapRow(row) {
  return {
    ...row,
    urgency: Boolean(row.urgency),
    keywords: JSON.parse(row.keywords),
    signals: JSON.parse(row.signals),
  };
}

export function analyzeAndStoreTicket(message) {
  const analysis = analyzeTicket(message);
  const payload = {
    message,
    category: analysis.category,
    priority: analysis.priority,
    urgency: analysis.urgency ? 1 : 0,
    confidence: analysis.confidence,
    keywords: JSON.stringify(analysis.keywords),
    signals: JSON.stringify(analysis.signals),
  };

  const info = insertStmt.run(payload);
  const storedRow = db
    .prepare("SELECT id, message, category, priority, urgency, confidence, keywords, signals, created_at FROM tickets WHERE id = ?")
    .get(info.lastInsertRowid);

  return mapRow(storedRow);
}

export function listTickets(limit = 3) {
  const safeLimit = Math.min(Math.max(Number(limit) || 3, 1), 3);
  return listStmt.all({ limit: safeLimit }).map(mapRow);
}

