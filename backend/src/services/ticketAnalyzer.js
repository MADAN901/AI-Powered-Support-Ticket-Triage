import { RULES } from "../config/rules.js";

const CATEGORY_NAMES = ["Billing", "Technical", "Account", "Feature Request", "Other"];
const PRIORITY_ORDER = ["P0", "P1", "P2", "P3"];

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const normalized = normalize(text);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
}

function keywordEvidence(text, keywords) {
  const evidence = [];
  for (const keyword of keywords) {
    if (text.includes(keyword)) evidence.push(keyword);
  }
  return evidence;
}

function extractKeywords(tokens) {
  const freq = new Map();
  for (const token of tokens) {
    if (token.length < 4) continue;
    if (RULES.stopWords.has(token)) continue;
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function detectCategory(text) {
  const categoryScores = Object.entries(RULES.categories).map(([category, keywords]) => {
    const evidence = keywordEvidence(text, keywords);
    return { category, score: evidence.length, evidence };
  });

  categoryScores.sort((a, b) => b.score - a.score);
  const top = categoryScores[0];

  if (!top || top.score === 0) {
    return { category: "Other", categoryScore: 0, categoryEvidence: [] };
  }

  return {
    category: CATEGORY_NAMES.includes(top.category) ? top.category : "Other",
    categoryScore: top.score,
    categoryEvidence: top.evidence,
  };
}

function detectUrgency(text) {
  const urgencySignals = keywordEvidence(text, RULES.urgencyKeywords);
  return {
    isUrgent: urgencySignals.length > 0,
    urgencySignals,
  };
}

function detectPriority(text, category, urgencySignals) {
  const urgencySignalCount = urgencySignals.length;
  const securityEscalation = text.includes("security") || text.includes("breach");

  // Custom twist (required): any security incident is always critical.
  if (securityEscalation) {
    return { priority: "P0", severitySignals: ["security"] };
  }

  const severitySignalsByPriority = Object.fromEntries(
    PRIORITY_ORDER.map((level) => [
      level,
      keywordEvidence(text, RULES.severityKeywords[level] || []),
    ])
  );

  // Outage/down detection as critical for technical-ish tickets.
  const outageSignals = [
    ...severitySignalsByPriority.P0,
    ...(text.includes("outage") || text.includes("system down") ? ["outage"] : []),
  ];
  if ((category === "Technical" || text.includes("production")) && outageSignals.length > 0) {
    return { priority: "P0", severitySignals: outageSignals };
  }

  // Urgency => high
  if (urgencySignalCount > 0) {
    // Special handling: billing refunds marked urgent become P1.
    const refundUrgent = category === "Billing" && text.includes("refund") && urgencySignalCount > 0;
    if (refundUrgent) {
      return { priority: "P1", severitySignals: ["refund", ...urgencySignals] };
    }
    return { priority: "P1", severitySignals: [...urgencySignals] };
  }

  // Severity keywords => P2
  for (const level of ["P2", "P3"]) {
    if (severitySignalsByPriority[level].length > 0) {
      return { priority: level, severitySignals: severitySignalsByPriority[level] };
    }
  }

  // If we have category matches but no severity/urgency, keep it medium.
  if (category !== "Other") {
    return { priority: "P2", severitySignals: [] };
  }

  return { priority: "P3", severitySignals: [] };
}

function computeConfidence({
  categoryScore,
  urgencySignals,
  categoryEvidence,
  severitySignals,
  keywordCount,
}) {
  // Weighted, capped, and message-dependent.
  const urgencyScore = urgencySignals.length * 0.12;
  const categoryScorePart = categoryScore * 0.12;
  const evidenceScore = (categoryEvidence.length + severitySignals.length) * 0.05;
  const keywordScore = keywordCount * 0.01;
  const raw = 0.22 + urgencyScore + categoryScorePart + evidenceScore + keywordScore;
  const confidence = Math.max(0.2, Math.min(0.95, raw));
  return Number(confidence.toFixed(2));
}

export function analyzeTicket(message) {
  const text = normalize(message);
  const tokens = tokenize(message);

  const { category, categoryScore, categoryEvidence } = detectCategory(text);
  const { isUrgent, urgencySignals } = detectUrgency(text);
  const { priority, severitySignals } = detectPriority(text, category, urgencySignals);

  const keywords = extractKeywords(tokens);
  const confidence = computeConfidence({
    categoryScore,
    urgencySignals,
    categoryEvidence,
    severitySignals,
    keywordCount: keywords.length,
  });

  return {
    category,
    priority,
    urgency: isUrgent,
    confidence,
    signals: {
      urgencySignals,
      categoryEvidence,
      severitySignals,
    },
    keywords,
  };
}

