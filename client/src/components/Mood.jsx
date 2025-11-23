import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/componentsCss/Mood.css";
import React from "react";

export default function MoodTracker() {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [moodLogs, setMoodLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [filter, setFilter] = useState("all"); // all, week, month

  const token = localStorage.getItem("token");

  // Mood configurations with emojis and colors
  const moodConfig = {
    1: { emoji: "😢", label: "Terrible", color: "#ff4757", gradient: "linear-gradient(135deg, #ff4757, #ff6b81)" },
    2: { emoji: "😟", label: "Bad", color: "#ffa502", gradient: "linear-gradient(135deg, #ffa502, #ffb732)" },
    3: { emoji: "😐", label: "Okay", color: "#70a1ff", gradient: "linear-gradient(135deg, #70a1ff, #7bed9f)" },
    4: { emoji: "😊", label: "Good", color: "#2ed573", gradient: "linear-gradient(135deg, #2ed573, #7bed9f)" },
    5: { emoji: "🤩", label: "Amazing", color: "#5f27cd", gradient: "linear-gradient(135deg, #5f27cd, #a55eea)" }
  };

  const fetchMoodLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMoodLogs(res.data.moodLogs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMoodLogs();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood) {
      showNotification("Please select a mood", "error");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/data/mood",
        { mood, note, date: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMoodLogs([res.data, ...moodLogs]);
      setMood(null);
      setNote("");
      showNotification("Mood logged successfully! 🎉");
    } catch (err) {
      console.error(err);
      showNotification("Error saving mood", "error");
    }
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    if (moodLogs.length === 0) return null;
    
    const total = moodLogs.length;
    const average = (moodLogs.reduce((sum, log) => sum + log.mood, 0) / total).toFixed(1);
    const moodCounts = moodLogs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
      return acc;
    }, {});
    
    return { total, average, moodCounts };
  };

  const stats = getMoodStats();

  // Filter logs
  const getFilteredLogs = () => {
    const now = new Date();
    return moodLogs.filter(log => {
      const logDate = new Date(log.date);
      if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      }
      if (filter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return logDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="mood-tracker-container">
      {/* Animated Background */}
      <div className="mood-bg-gradient"></div>

      <div className="mood-main-content">
        {/* Header Section */}
        <div className="mood-header">
          <div className="mood-header-text">
            <h1> Daily Mood Tracker</h1>
            <p className="mood-subtitle">Track your emotional wellness journey</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="mood-stats-grid">
              <div className="mood-stat-card">
                <div className="mood-stat-icon">📊</div>
                <div className="mood-stat-info">
                  <span className="mood-stat-number">{stats.total}</span>
                  <span className="mood-stat-label">Total Logs</span>
                </div>
              </div>

              <div className="mood-stat-card">
                <div className="mood-stat-icon">⭐</div>
                <div className="mood-stat-info">
                  <span className="mood-stat-number">{stats.average}</span>
                  <span className="mood-stat-label">Avg Mood</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mood Input Card */}
        <div className="mood-input-card">
          <div className="mood-card-header">
            <h2>How are you feeling today?</h2>
            <p>Select your current mood and add notes</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Mood Selector */}
            <div className="mood-selector-grid">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setMood(num)}
                  className={`mood-option ${mood === num ? "selected" : ""}`}
                  style={{
                    background: mood === num ? moodConfig[num].gradient : "rgba(255, 255, 255, 0.9)"
                  }}
                >
                  <span className="mood-emoji">{moodConfig[num].emoji}</span>
                  <span className={`mood-label ${mood === num ? "selected" : ""}`}>
                    {moodConfig[num].label}
                  </span>
                </button>
              ))}
            </div>

            {/* Note Input */}
            <div className="mood-note-section">
              <label className="mood-input-label">
                <span className="label-icon">📝</span>
                Add a note (optional)
              </label>
              <textarea
                className="mood-textarea"
                placeholder="What's on your mind? Share your thoughts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="4"
              />
            </div>

            <button type="submit" className="mood-submit-btn">
              <span>Log Mood</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Mood History Section */}
        <div className="mood-history-section">
          <div className="mood-history-header">
            <h2>Your Mood Journey</h2>
            
            {/* Filter Buttons */}
            <div className="mood-filter-buttons">
              <button 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Time
              </button>
              <button 
                className={`filter-btn ${filter === "week" ? "active" : ""}`}
                onClick={() => setFilter("week")}
              >
                This Week
              </button>
              <button 
                className={`filter-btn ${filter === "month" ? "active" : ""}`}
                onClick={() => setFilter("month")}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Mood Distribution */}
          {stats && filteredLogs.length > 0 && (
            <div className="mood-distribution">
              <h3>Mood Distribution</h3>
              <div className="mood-bars">
                {[5, 4, 3, 2, 1].map(num => {
                  const count = stats.moodCounts[num] || 0;
                  const percentage = (count / stats.total) * 100;
                  return (
                    <div key={num} className="mood-bar-item">
                      <div className="mood-bar-label">
                        <span className="bar-emoji">{moodConfig[num].emoji}</span>
                        <span className="bar-text">{moodConfig[num].label}</span>
                        <span className="bar-count">{count}</span>
                      </div>
                      <div className="mood-bar-track">
                        <div 
                          className="mood-bar-fill" 
                          style={{
                            width: `${percentage}%`,
                            background: moodConfig[num].gradient
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mood Logs */}
          <div className="mood-logs-grid">
            {filteredLogs.length === 0 ? (
              <div className="mood-empty-state">
                <div className="empty-icon">🌟</div>
                <h3>No mood logs yet</h3>
                <p>Start tracking your mood to see your emotional patterns</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div 
                  className="mood-log-card" 
                  key={log._id}
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    borderLeftColor: moodConfig[log.mood].color
                  }}
                >
                  <div className="mood-log-header">
                    <div className="mood-log-info">
                      <span className="mood-log-emoji">{moodConfig[log.mood].emoji}</span>
                      <div>
                        <h4>{moodConfig[log.mood].label}</h4>
                        <span className="mood-rating">{log.mood}/5</span>
                      </div>
                    </div>
                    <span className="mood-log-date">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  {log.note && (
                    <p className="mood-log-note">{log.note}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`mood-notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
