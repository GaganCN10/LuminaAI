import React, { useState, useEffect } from "react";
import { Calendar, Utensils, Coffee, Sun, Moon, Cookie, Plus, Clock, FileText } from "lucide-react";
import "../assets/componentsCss/MealTracker.css";

export default function MealTracker() {
  const [mealType, setMealType] = useState("Breakfast");
  const [food, setFood] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showForm, setShowForm] = useState(true);

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/data", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await res.json();
      setLogs(data.eatingLogs || []);
    } catch (err) {
      console.log("Meal Logs Error:", err);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Submit meal
  const submitMeal = async (e) => {
    e.preventDefault();

    if (!food.trim()) {
      setError("Please enter a food item");
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/data/meal", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mealType, food, note, date })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to log meal");
      }

      setSuccess("Meal logged successfully!");
      setFood("");
      setNote("");

      fetchLogs();
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.log("POST ERROR:", err);
      setError(err.message || "Failed to log meal.");
    }

    setLoading(false);
  };

  const mealIcons = {
    Breakfast: <Coffee className="badge-icon" />,
    Lunch: <Sun className="badge-icon" />,
    Dinner: <Moon className="badge-icon" />,
    Snack: <Cookie className="badge-icon" />
  };

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = new Date(log.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  return (
    <div className="meal-tracker-container">
      {/* Navigation */}
      <nav className="tracker-nav">
        <a href="/dashboard/user" className="nav-back-link">
          ← Back to Dashboard
        </a>
        <a href="/dashboard/user/sos" className="nav-sos-btn">
          🚨 SOS
        </a>
      </nav>

      <div className="tracker-content">
        {/* Header */}
        <div className="tracker-header">
          <div className="header-icon-wrapper">
            <Utensils className="header-icon" />
            <h1 className="tracker-title">Meal Tracker</h1>
          </div>
          <p className="tracker-subtitle">
            Track your nutrition and build healthy eating habits
          </p>
        </div>

        <div className="tracker-grid">
          {/* Add Meal Card */}
          <div className="tracker-card">
            <div className="card-header">
              <h2 className="card-title">Log New Meal</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="toggle-form-btn"
              >
                {showForm ? "Hide Form" : "Show Form"}
              </button>
            </div>

            {showForm && (
              <div className="meal-form">
                <div className="form-grid">
                  {/* Date */}
                  <div className="form-group">
                    <label className="form-label">
                      <Calendar className="label-icon" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Meal Type */}
                  <div className="form-group">
                    <label className="form-label">
                      <Clock className="label-icon" />
                      Meal Type
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="form-select"
                    >
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Snack</option>
                    </select>
                  </div>
                </div>

                {/* Food Item */}
                <div className="form-group">
                  <label className="form-label">
                    <Utensils className="label-icon" />
                    Food Item
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Oatmeal with berries, Grilled chicken salad"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">
                    <FileText className="label-icon" />
                    Notes (optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="How did you feel? Portion size? Any cravings?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitMeal}
                  disabled={loading}
                  className="submit-btn"
                >
                  <Plus className="btn-icon" />
                  {loading ? "Saving..." : "Log Meal"}
                </button>

                {/* Success/Error Messages */}
                {success && (
                  <div className="message-box message-success">
                    ✓ {success}
                  </div>
                )}
                {error && (
                  <div className="message-box message-error">
                    ✗ {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meal History */}
          <div className="tracker-card">
            <h2 className="history-title">Meal History</h2>

            {loadingLogs ? (
              <p className="loading-text">Loading your meals...</p>
            ) : logs.length === 0 ? (
              <div className="empty-state">
                <Utensils className="empty-icon" />
                <p className="empty-title">No meals logged yet</p>
                <p className="empty-subtitle">Start tracking your meals to see your history here</p>
              </div>
            ) : (
              <div className="meal-groups">
                {Object.entries(groupedLogs).map(([dateKey, meals]) => (
                  <div key={dateKey} className="meal-group">
                    <h3 className="date-header">{dateKey}</h3>
                    <div className="meal-list">
                      {meals.map((log) => (
                        <div key={log._id} className="meal-item">
                          <div className="meal-item-header">
                            <span className={`meal-type-badge meal-type-${log.mealType.toLowerCase()}`}>
                              {mealIcons[log.mealType]}
                              {log.mealType}
                            </span>
                          </div>
                          <h4 className="meal-food-name">{log.food}</h4>
                          {log.note && (
                            <p className="meal-note">"{log.note}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
