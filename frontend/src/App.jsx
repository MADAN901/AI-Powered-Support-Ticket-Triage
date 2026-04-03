import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [result, setResult] = useState(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
    []
  );

  const loadTickets = useCallback(async () => {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/tickets?limit=3`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load tickets");
      }
      setTickets(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoadingList(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoadingAnalyze(true);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/tickets/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.details?.[0] || data?.error || "Failed to analyze");
      }

      setResult(data);
      setMessage("");
      await loadTickets();
    } catch (err) {
      setError(err.message || "Failed to analyze");
    } finally {
      setLoadingAnalyze(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI-Powered Support Ticket Triage (Local Heuristics)</h1>
        <p>Submit a ticket and get category, priority, urgency, confidence, and keywords.</p>
      </header>

      <section className="panel">
        <form onSubmit={onSubmit} className="form">
          <label htmlFor="message">Support ticket message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Our production checkout is down and customers can't pay. Urgent!"
            rows={6}
            minLength={10}
            required
          />
          <button type="submit" disabled={loadingAnalyze}>
            {loadingAnalyze ? "Analyzing..." : "Analyze Ticket"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <section className="panel">
          <h2>Result</h2>
          <div className="grid">
            <div className="kv">
              <div className="k">Category</div>
              <div className="v">{result.category}</div>
            </div>
            <div className="kv">
              <div className="k">Priority</div>
              <div className="v">{result.priority}</div>
            </div>
            <div className="kv">
              <div className="k">Urgency</div>
              <div className="v">{result.urgency ? "Urgent" : "Normal"}</div>
            </div>
            <div className="kv">
              <div className="k">Confidence</div>
              <div className="v">{result.confidence}</div>
            </div>
          </div>

          <div className="row">
            <div className="k">Keywords</div>
            <div className="v">{(result.keywords || []).join(", ") || "None"}</div>
          </div>

          <div className="row">
            <div className="k">Urgency signals</div>
            <div className="v">{result.signals?.urgencySignals?.join(", ") || "None"}</div>
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Recent Tickets</h2>
        {loadingList ? (
          <p>Loading...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets yet. Submit one above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Urgency</th>
                <th>Confidence</th>
                <th>Keywords</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{new Date(ticket.created_at).toLocaleString()}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.urgency ? "Yes" : "No"}</td>
                  <td>{ticket.confidence}</td>
                  <td>{(ticket.keywords || []).join(", ")}</td>
                  <td>{ticket.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
