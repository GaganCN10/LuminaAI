import React, { useEffect, useState } from "react";
import "../assets/componentsCss/DoctorDashboard.css";

export default function DoctorDashboard() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [suggestionText, setSuggestionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Mood configuration
  const moodConfig = {
    1: { emoji: "😢", label: "Terrible" },
    2: { emoji: "😟", label: "Bad" },
    3: { emoji: "😐", label: "Okay" },
    4: { emoji: "😊", label: "Good" },
    5: { emoji: "🤩", label: "Amazing" }
  };

  // Load reports from backend
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("http://localhost:5000/api/report/doctor", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("Loaded reports:", data);
        setReports(data);
      } catch (err) {
        console.error("Error loading reports", err);
        showNotification("Error loading reports", "error");
      }
      setLoading(false);
    }

    loadReports();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openReport = (id) => {
    const r = reports.find((x) => x._id === id);
    setSelected(r);
    setSuggestionText(r?.suggestion?.text || "");
  };

  const closePanel = () => {
    setSelected(null);
    setSuggestionText("");
  };

  const saveSuggestion = async (reportId) => {
    if (!suggestionText.trim()) {
      showNotification("Please enter a suggestion", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/report/suggestion", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          suggestion: suggestionText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Suggestion saved successfully!", "success");

        setReports((prev) =>
          prev.map((r) =>
            r._id === reportId ? { ...r, suggestion: { text: suggestionText, when: new Date() } } : r
          )
        );

        setSelected((prev) =>
          prev ? { ...prev, suggestion: { text: suggestionText, when: new Date() } } : prev
        );
      } else {
        showNotification(data.message || "Failed to save suggestion", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error saving suggestion", "error");
    }
  };

  // Filter, search, and sort
  const filtered = reports
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => {
      const q = query.toLowerCase();
      return (r.patient?.name?.toLowerCase() || "").includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return a.status.localeCompare(b.status);
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-icon">👨‍⚕️</div>
          <div>
            <h1>Doctor Dashboard</h1>
            <p className="header-subtitle">Review and manage patient reports</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-number">{reports.length}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat-badge new">
            <span className="stat-number">{reports.filter(r => r.status === 'new').length}</span>
            <span className="stat-label">New</span>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="filter-bar">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by patient name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Reports List */}
        <section className="reports-list">
          <div className="section-title">
            <h2>Patient Reports</h2>
            <span className="count-badge">{filtered.length}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No reports found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            filtered.map((r) => (
              <article 
                key={r._id} 
                className={`report-card ${selected?._id === r._id ? 'active' : ''}`}
                onClick={() => openReport(r._id)}
              >
                <div className="card-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      {(r.patient?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="patient-name">{r.patient?.name || "Unknown Patient"}</h3>
                      <span className="report-date">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${r.status}`}>
                    {r.status === 'new' && '🆕'}
                    {r.status === 'accepted' && '✓'}
                    {r.status === 'declined' && '✕'}
                    {r.status}
                  </span>
                </div>

                <p className="report-summary">
                  {r.reportData?.summary?.slice(0, 150) || "No summary available"}...
                </p>

                <div className="card-footer">
                  <div className="data-counts">
                    <span className="data-badge">
                      <span className="data-icon">😊</span>
                      {r.reportData?.moods?.length || 0}
                    </span>
                    <span className="data-badge">
                      <span className="data-icon">🍽️</span>
                      {r.reportData?.meals?.length || 0}
                    </span>
                    <span className="data-badge">
                      <span className="data-icon">💊</span>
                      {r.reportData?.medications?.length || 0}
                    </span>
                  </div>
                  {r.suggestion?.text && (
                    <span className="has-suggestion">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Reviewed
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        {/* Right Column - Report Details */}
        <aside className="report-details">
          {!selected ? (
            <div className="details-empty">
              <div className="empty-icon-large">📋</div>
              <h3>Select a report to view details</h3>
              <p>Click on any report from the list to review patient information</p>
            </div>
          ) : (
            <div className="details-panel">
              <div className="panel-header">
                <h2>Report Details</h2>
                <button className="close-btn" onClick={closePanel}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div className="panel-body">
                {/* Patient Info */}
                <div className="patient-header">
                  <div className="patient-avatar-large">
                    {(selected.patient?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selected.patient?.name || "Unknown Patient"}</h3>
                    <p className="patient-meta">{formatDate(selected.createdAt)}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="detail-section">
                  <h4>📊 Executive Summary</h4>
                  <div className="summary-box">
                    <pre>{selected?.reportData?.summary || "No summary available"}</pre>
                  </div>
                </div>

                {/* Mood Logs */}
                <div className="detail-section">
                  <h4>
                    😊 Mood Logs
                    <span className="section-count">{selected.reportData?.moods?.length || 0}</span>
                  </h4>
                  {!selected.reportData?.moods || selected.reportData.moods.length === 0 ? (
                    <p className="no-data">No mood logs recorded</p>
                  ) : (
                    <ul className="data-list">
                      {selected.reportData.moods.map((m) => (
                        <li key={m._id} className="data-list-item">
                          <div className="list-item-icon">{moodConfig[m.mood]?.emoji}</div>
                          <div className="list-item-content">
                            <div className="list-item-title">
                              {moodConfig[m.mood]?.label} ({m.mood}/5)
                            </div>
                            {m.note && <div className="list-item-note">{m.note}</div>}
                            <div className="list-item-date">{formatDate(m.date)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Meal Logs */}
                <div className="detail-section">
                  <h4>
                    🍽️ Nutrition Log
                    <span className="section-count">{selected.reportData?.meals?.length || 0}</span>
                  </h4>
                  {!selected.reportData?.meals || selected.reportData.meals.length === 0 ? (
                    <p className="no-data">No meal logs recorded</p>
                  ) : (
                    <ul className="data-list">
                      {selected.reportData.meals.map((m) => (
                        <li key={m._id} className="data-list-item">
                          <div className="list-item-badge">{m.mealType}</div>
                          <div className="list-item-content">
                            <div className="list-item-title">{m.food}</div>
                            {m.calories && <div className="list-item-note">{m.calories} calories</div>}
                            <div className="list-item-date">{formatDate(m.date)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Medications */}
                <div className="detail-section">
                  <h4>
                    💊 Medications
                    <span className="section-count">{selected.reportData?.medications?.length || 0}</span>
                  </h4>
                  {!selected.reportData?.medications || selected.reportData.medications.length === 0 ? (
                    <p className="no-data">No medications on record</p>
                  ) : (
                    <ul className="data-list">
                      {selected.reportData.medications.map((med) => (
                        <li key={med._id} className="data-list-item medication">
                          <div className="list-item-icon">💊</div>
                          <div className="list-item-content">
                            <div className="list-item-title">{med.name}</div>
                            <div className="list-item-note">
                              {med.dosage} • {med.frequency} • {med.time}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Suggestion Input */}
                <div className="detail-section suggestion-section">
                  <h4>✍️ Medical Suggestion</h4>
                  <textarea
                    className="suggestion-textarea"
                    placeholder="Enter your medical advice or recommendations for the patient..."
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    rows="5"
                  />
                  <button
                    className="save-suggestion-btn"
                    onClick={() => saveSuggestion(selected._id)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16 2L6 12L2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Suggestion
                  </button>

                  {selected.suggestion?.text && (
                    <div className="previous-suggestion">
                      <div className="suggestion-header">
                        <span className="suggestion-label">Previous Suggestion</span>
                        <span className="suggestion-date">
                          {formatDate(selected.suggestion.when)}
                        </span>
                      </div>
                      <p className="suggestion-text">{selected.suggestion.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" && "✓ "}
          {notification.type === "error" && "✕ "}
          {notification.type === "warning" && "⚠ "}
          {notification.message}
        </div>
      )}
    </div>
  );
}
