# AI-Powered Support Ticket Triage

## 📌 Overview
This project is a full-stack application that analyzes customer support tickets using rule-based AI logic.
---

## 🚀 Features

### Backend
- REST API for ticket analysis
- Rule-based NLP logic
- Ticket classification:
  - Billing
  - Technical
  - Account
  - Feature Request
  - Other
- Priority assignment:
  - P0 (Critical)
  - P1 (High)
  - P2 (Medium)
  - P3 (Low)
- Keyword extraction
- Confidence scoring
- SQLite database storage

### Frontend
- Text area to submit tickets
- Submit button with API call
- Result panel showing:
  - Category
  - Priority
  - Keywords
  - Confidence
- Table showing previous tickets (latest first)
- Loading and error handling

---

## 🏗️ Architecture

Frontend (React)
↓
Backend API (Flask)
↓
Analyzer (Rule-based logic)
↓
Database (SQLite)

---

## 🧠 AI / NLP Logic

### Keyword-Based Classification
- Billing → payment, refund, invoice
- Technical → error, bug, crash
- Account → login, password, account
- Feature Request → feature, add, improve

### Urgency Detection
Keywords:
- urgent, asap, immediately, down

### Priority Logic
- P0 → urgent keywords present
- P1 → errors/failures
- P2 → normal issues
- P3 → general queries

### Keyword Extraction
Extract important words from the input text based on predefined rules.

### Confidence Score
confidence = matched_keywords / total_keywords

---

## 🌟 Custom Rule

If the ticket contains "refund":
- Category → Billing
- Priority → P0

Reason:
Refund-related issues are critical and require immediate attention.

---

## 🔌 API Endpoints

### POST /tickets/analyze

Request:
{
  "message": "My payment failed, refund ASAP"
}

Response:
{
  "category": "Billing",
  "priority": "P0",
  "keywords": ["payment", "refund", "asap"],
  "confidence": 0.9
}

---

### GET /tickets

Returns all previously analyzed tickets (latest first).

---

## 🗄️ Database Schema

tickets:
- id
- message
- category
- priority
- keywords
- confidence
- created_at

---

## 🐳 Running with Docker

Run the application:

docker-compose up --build

Access:
Frontend → http://localhost:3000  
Backend → http://localhost:5000  

---

## ⚙️ Manual Setup

### Backend
cd backend  
pip install -r requirements.txt  
python app.py  

### Frontend
cd frontend  
npm install  
npm start  

---

## 🧪 Unit Tests

Example:

def test_priority():
    assert get_priority("urgent issue") == "P0"

---

## 📁 Project Structure

backend/
  controller/
  service/
  analyzer/
  models/
  config/
  app.py

frontend/
  components/
  App.js

docker-compose.yml  
README.md  

---

## 🛠️ Engineering Practices

- Separation of concerns
- Config-driven rules
- Input validation and error handling
- Clean modular structure

---

## ⚖️ Design Decisions

- Flask used for simplicity
- SQLite for lightweight storage
- Rule-based logic to avoid external AI APIs
- REST API for frontend-backend communication

---

## ⚠️ Limitations

- Rule-based system has limited accuracy
- Cannot handle complex language
- No learning capability

---

## 🚀 Future Improvements

- Use ML/NLP models
- Better keyword matching
- Improved UI
- Add authentication
- Deploy to cloud

---

## 🎥 Demo

Demo video shows:
- Ticket submission
- Analysis result
- Custom rule behavior
- Ticket history

---

## 👨‍💻 Author

Madan Kumar
