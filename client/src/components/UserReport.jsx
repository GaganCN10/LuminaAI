import React, { useEffect, useState } from "react";
import "../assets/componentsCss/UserReport.css";

export default function UserReport() {
  const [loading, setLoading] = useState(true);
  const [moodLogs, setMoodLogs] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [summary, setSummary] = useState("");

  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const token = localStorage.getItem("token");

  // Mood configuration
  const moodConfig = {
    1: { emoji: "😢", label: "Terrible" },
    2: { emoji: "😟", label: "Bad" },
    3: { emoji: "😐", label: "Okay" },
    4: { emoji: "😊", label: "Good" },
    5: { emoji: "🤩", label: "Amazing" }
  };

  // 1) Fetch all logs
  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/data", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      setMoodLogs(data.moodLogs || []);
      setMealLogs(data.eatingLogs || []);
      setMedLogs(data.medications || []);

      generateSummary(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLoading(false);
    }
  };

  // 2) Generate summary locally
  // 2) Generate personalized summary based on actual user data
const generateSummary = (data) => {
  const moodLogs = data.moodLogs || [];
  const meals = data.eatingLogs || [];
  const meds = data.medications || [];

  // Mood analysis
  const moodCount = moodLogs.length;
  let moodAnalysis = "No mood data available yet.";
  
  if (moodCount > 0) {
    const avgMood = (moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodCount).toFixed(1);
    const recentMoods = moodLogs.slice(-7); // Last 7 entries
    const recentAvg = (recentMoods.reduce((sum, log) => sum + log.mood, 0) / recentMoods.length).toFixed(1);
    
    let moodTrend = "";
    if (moodCount >= 2) {
      const oldAvg = moodLogs.slice(0, Math.floor(moodCount / 2))
        .reduce((sum, log) => sum + log.mood, 0) / Math.floor(moodCount / 2);
      const newAvg = moodLogs.slice(Math.floor(moodCount / 2))
        .reduce((sum, log) => sum + log.mood, 0) / Math.ceil(moodCount / 2);
      
      if (newAvg > oldAvg + 0.3) moodTrend = " showing improvement over time 📈";
      else if (newAvg < oldAvg - 0.3) moodTrend = " showing decline - consider consulting your doctor 📉";
      else moodTrend = " remaining stable 📊";
    }
    
    moodAnalysis = `${moodCount} mood entries recorded with an average score of ${avgMood}/5. Recent mood average: ${recentAvg}/5${moodTrend}.`;
  }

  // Meal analysis
  let mealAnalysis = "No meal logs recorded yet.";
  
  if (meals.length > 0) {
    const mealTypes = meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + 1;
      return acc;
    }, {});
    
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const avgCalories = totalCalories > 0 ? Math.round(totalCalories / meals.length) : null;
    
    const mostCommon = Object.entries(mealTypes).sort((a, b) => b[1] - a[1])[0];
    
    mealAnalysis = `${meals.length} meal entries logged. Most frequently tracked: ${mostCommon[0]} (${mostCommon[1]} times).`;
    if (avgCalories) {
      mealAnalysis += ` Average calories per meal: ${avgCalories} kcal.`;
    }
  }

  // Medication analysis
  let medAnalysis = "No medications currently tracked.";
  
  if (meds.length > 0) {
    const totalDailyDoses = meds.reduce((sum, med) => {
      const freq = parseInt(med.frequency) || 0;
      return sum + freq;
    }, 0);
    
    medAnalysis = `${meds.length} active medication(s) with ${totalDailyDoses} total daily doses. Remember to take medications at prescribed times.`;
  }

  // Overall health insights
  let healthInsights = "";
  
  if (moodCount > 0 && meals.length > 0 && meds.length > 0) {
    healthInsights = "\n\n✓ Comprehensive tracking: You're actively monitoring mood, nutrition, and medications - excellent health management!";
  } else if (moodCount === 0 && meals.length === 0 && meds.length === 0) {
    healthInsights = "\n\n⚠ Start tracking: Begin logging your mood, meals, and medications to build your health profile.";
  } else {
    const missing = [];
    if (moodCount === 0) missing.push("mood");
    if (meals.length === 0) missing.push("meals");
    if (meds.length === 0) missing.push("medications");
    
    if (missing.length > 0) {
      healthInsights = `\n\n💡 Suggestion: Consider tracking ${missing.join(" and ")} for a complete health overview.`;
    }
  }

  // Personalized recommendations
  let recommendations = "\n\nPersonalized Recommendations:";
  
  if (moodCount > 0) {
    const avgMood = moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodCount;
    if (avgMood < 3) {
      recommendations += "\n• Your mood scores suggest you may benefit from stress management techniques or professional support.";
    } else if (avgMood >= 4) {
      recommendations += "\n• Great mood patterns! Continue your current wellness practices.";
    }
  }
  
  if (meals.length > 0 && meals.length < 21) { // Less than 3 meals/day for a week
    recommendations += "\n• Try to log meals consistently for better nutritional insights.";
  }
  
  if (meds.length > 0) {
    recommendations += "\n• Set medication reminders to ensure consistent adherence.";
  }

  // Build final summary
  const summaryText = `📊 YOUR PERSONALIZED HEALTH SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOOD TRACKING
${moodAnalysis}

NUTRITION TRACKING  
${mealAnalysis}

MEDICATION MANAGEMENT
${medAnalysis}
${healthInsights}
${recommendations}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This report is based on your logged data. Regular tracking helps your healthcare provider make informed decisions about your care.`;

  setSummary(summaryText);
};


  useEffect(() => {
    loadData();
  }, []);

  // 3) Get nearby doctors
  const findNearbyDoctors = async () => {
    setMessage("Getting your location…");
    setMessageType("info");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await fetch("http://localhost:5000/api/auth/nearby-doctors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        });

        const docs = await res.json();
        setNearbyDoctors(docs);
        setMessage(docs.length > 0 ? `Found ${docs.length} nearby doctors` : "No doctors found within 10km");
        setMessageType(docs.length > 0 ? "success" : "warning");
      },
      () => {
        setMessage("Location access denied. Please enable location services.");
        setMessageType("error");
      }
    );
  };

  // 4) Send report to selected doctor
  const sendReport = async () => {
    if (!selectedDoctor) {
      setMessage("Please select a doctor first");
      setMessageType("warning");
      return;
    }

    setMessage("Sending report...");
    setMessageType("info");

    const res = await fetch("http://localhost:5000/api/report/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        doctorId: selectedDoctor,
        summary,
        moods: JSON.parse(JSON.stringify(moodLogs)),
        meals: JSON.parse(JSON.stringify(mealLogs)),
        medications: JSON.parse(JSON.stringify(medLogs)),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✓ Report successfully sent to doctor!");
      setMessageType("success");
      setSelectedDoctor("");
    } else {
      setMessage(data.message || "Failed to send report");
      setMessageType("error");
    }
  };

  // 5) Download report as text file
  const downloadReport = () => {
    const reportContent = `
HEALTH REPORT
Generated on: ${new Date().toLocaleDateString()}
================================================================

${summary}

================================================================
MOOD LOGS (${moodLogs.length} entries)
================================================================
${moodLogs.length === 0 ? "No mood logs recorded" : 
  moodLogs.map(m => 
    `Date: ${new Date(m.date).toLocaleDateString()}
Mood: ${m.mood}/5 (${moodConfig[m.mood]?.label})
Note: ${m.note || "No notes"}
---`
  ).join("\n")}

================================================================
MEAL LOGS (${mealLogs.length} entries)
================================================================
${mealLogs.length === 0 ? "No meal logs recorded" : 
  mealLogs.map(m => 
    `Date: ${new Date(m.date).toLocaleDateString()}
Meal Type: ${m.mealType}
Food: ${m.food}
Calories: ${m.calories || "N/A"}
---`
  ).join("\n")}

================================================================
MEDICATIONS (${medLogs.length} active)
================================================================
${medLogs.length === 0 ? "No medications on record" : 
  medLogs.map(m => 
    `Name: ${m.name}
Dosage: ${m.dosage}
Frequency: ${m.frequency}
Time: ${m.time}
---`
  ).join("\n")}

================================================================
End of Report
================================================================
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `health-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setMessage("Report downloaded successfully!");
    setMessageType("success");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading your health report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-content">
        {/* Header */}
        <div className="report-header">
          <div className="header-content">
            <div className="header-icon">📋</div>
            <div>
              <h1>Health Report</h1>
              <p className="report-date">Generated on {formatDate(new Date())}</p>
            </div>
          </div>
          <button className="download-btn" onClick={downloadReport}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2V14M10 14L6 10M10 14L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 14V17C2 17.5523 2.44772 18 3 18H17C17.5523 18 18 17.5523 18 17V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Download Report
          </button>
        </div>

        {/* Summary Section */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">📊</span>
              <h2>Executive Summary</h2>
            </div>
          </div>
          <div className="summary-box">
            <pre className="summary-text">{summary}</pre>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">😊</div>
            <div className="stat-details">
              <span className="stat-value">{moodLogs.length}</span>
              <span className="stat-label">Mood Entries</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🍽️</div>
            <div className="stat-details">
              <span className="stat-value">{mealLogs.length}</span>
              <span className="stat-label">Meal Logs</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">💊</div>
            <div className="stat-details">
              <span className="stat-value">{medLogs.length}</span>
              <span className="stat-label">Medications</span>
            </div>
          </div>
        </div>

        {/* Mood Logs Section */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">🌈</span>
              <h2>Mood Tracking History</h2>
            </div>
            <span className="section-count">{moodLogs.length} entries</span>
          </div>

          <div className="data-list">
            {moodLogs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <p>No mood logs recorded yet</p>
              </div>
            ) : (
              moodLogs.map((m) => (
                <div className="data-item mood-item" key={m._id}>
                  <div className="item-left">
                    <span className="mood-indicator">
                      {moodConfig[m.mood]?.emoji}
                    </span>
                    <div className="item-details">
                      <h4>{moodConfig[m.mood]?.label || `Mood ${m.mood}`}</h4>
                      <p className="item-meta">Rating: {m.mood}/5</p>
                      {m.note && <p className="item-note">{m.note}</p>}
                    </div>
                  </div>
                  <span className="item-date">{formatDate(m.date)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meal Logs Section */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">🍴</span>
              <h2>Nutrition Log</h2>
            </div>
            <span className="section-count">{mealLogs.length} entries</span>
          </div>

          <div className="data-list">
            {mealLogs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🍽️</span>
                <p>No meal logs recorded yet</p>
              </div>
            ) : (
              mealLogs.map((m) => (
                <div className="data-item meal-item" key={m._id}>
                  <div className="item-left">
                    <span className="meal-type-badge">{m.mealType}</span>
                    <div className="item-details">
                      <h4>{m.food}</h4>
                      {m.calories && <p className="item-meta">{m.calories} calories</p>}
                    </div>
                  </div>
                  <span className="item-date">{formatDate(m.date)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medications Section */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">💊</span>
              <h2>Current Medications</h2>
            </div>
            <span className="section-count">{medLogs.length} active</span>
          </div>

          <div className="data-list">
            {medLogs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💉</span>
                <p>No medications on record</p>
              </div>
            ) : (
              medLogs.map((m) => (
                <div className="data-item med-item" key={m._id}>
                  <div className="item-left">
                    <span className="med-icon-circle">💊</span>
                    <div className="item-details">
                      <h4>{m.name}</h4>
                      <p className="item-meta">
                        <span className="med-detail">Dosage: {m.dosage}</span>
                        <span className="med-separator">•</span>
                        <span className="med-detail">Frequency: {m.frequency}</span>
                        <span className="med-separator">•</span>
                        <span className="med-detail">Time: {m.time}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Send to Doctor Section */}
        <div className="report-section doctor-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">👨‍⚕️</span>
              <h2>Share with Healthcare Provider</h2>
            </div>
          </div>

          <div className="doctor-actions">
            <button 
              className="find-doctors-btn" 
              onClick={findNearbyDoctors}
              disabled={nearbyDoctors.length > 0}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C6.13 2 3 5.13 3 9C3 13.17 10 20 10 20C10 20 17 13.17 17 9C17 5.13 13.87 2 10 2ZM10 11.5C8.62 11.5 7.5 10.38 7.5 9C7.5 7.62 8.62 6.5 10 6.5C11.38 6.5 12.5 7.62 12.5 9C12.5 10.38 11.38 11.5 10 11.5Z" fill="currentColor"/>
              </svg>
              Find Nearby Doctors (10km)
            </button>

            {nearbyDoctors.length > 0 && (
              <div className="doctor-selection">
                <label className="select-label">Select Healthcare Provider:</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="doctor-select"
                >
                  <option value="">Choose a doctor...</option>
                  {nearbyDoctors.map((d) => (
                    <option value={d._id} key={d._id}>
                      Dr. {d.name} — {d.email}
                    </option>
                  ))}
                </select>

                <button 
                  className="send-report-btn" 
                  onClick={sendReport}
                  disabled={!selectedDoctor}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2 10L18 2L10 18L8 12L2 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send Report
                </button>
              </div>
            )}

            {message && (
              <div className={`message-box ${messageType}`}>
                {messageType === "success" && "✓ "}
                {messageType === "error" && "✕ "}
                {messageType === "warning" && "⚠ "}
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
