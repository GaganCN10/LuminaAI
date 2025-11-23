import React, { useState, useEffect } from "react";
import "../assets/componentsCss/MedicineTracker.css";

export default function MedicineTracker() {
  const [medicines, setMedicines] = useState([]);
  const [notifiedIds, setNotifiedIds] = useState(new Set());

useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    medicines.forEach(med => {
      if (!med.time || notifiedIds.has(med._id)) return;

      const [hour, minute] = med.time.split(":");
      const medTime = new Date();
      medTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

      const diff = medTime - now;
      // Notify if time is <= 0 and within 1 minute window (to avoid late notifications)
      if (diff <= 0 && diff > -60000) {
        showNotification(`Time to take your medicine: ${med.name}`, "success");
        setNotifiedIds(prev => new Set(prev).add(med._id));
      }
    });
  }, 60000);

  return () => clearInterval(interval);
}, [medicines, notifiedIds]);

  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: ""
  });
  const [notification, setNotification] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch medicines from backend
  async function loadMedicines() {
    try {
      const res = await fetch("http://localhost:5000/api/data", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setMedicines(data.medications || []);
    } catch (err) {
      console.error("Error loading meds:", err);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);
  function urlBase64ToUint8Array(base64String) {
  // Helper function to convert VAPID key
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeUser() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Push notifications are not supported by your browser.');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('BPuXII5pz5rAa1mmjn9CLXz9n1boWdyfWfX2c4tXYmfH_jfQWxjmPA-g3IH6zA6Z7sFjFDjukv3LyzxuxRsJrE8')
  });

  await fetch('http://localhost:5000/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  alert('Subscribed to notifications!');
}

  // Safe time-left calculator
  function getTimeLeft(targetTime) {
    if (!targetTime) return "N/A";

    const now = new Date();
    const [hour, minute] = targetTime.split(":");
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    let diff = target - now;
    if (diff < 0) diff += 24 * 60 * 60 * 1000;

    const min = Math.floor(diff / 60000);
    const hrs = Math.floor(min / 60);
    const minutes = min % 60;

    if (hrs === 0 && minutes === 0) return { text: "Due now!", urgent: true };
    if (hrs === 0) return { text: `${minutes} mins`, urgent: true };
    if (hrs < 2) return { text: `${hrs} hrs ${minutes} mins`, soon: true };
    return { text: `${hrs} hrs ${minutes} mins`, normal: true };
  }

  // Show notification
  function showNotification(message, type = "success") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }

  // Add Medication
  async function addMedicine(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/data/medicine-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const saved = await res.json();

      if (saved.message) {
        showNotification(saved.message, "error");
        return;
      }

      setMedicines([...medicines, saved]);
      setForm({ name: "", dosage: "", frequency: "", time: "" });
      showNotification("Medicine added successfully! 🎉");
    } catch (err) {
      console.error("Error adding medicine:", err);
      showNotification("Failed to add medicine", "error");
    }
  }

  async function deleteMedicine(id) {
    try {
      const res = await fetch(`http://localhost:5000/api/data/medicine-tracker/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.message === "Medication removed") {
        setMedicines(prev => prev.filter(m => m._id !== id));
        showNotification("Medicine removed successfully");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("Failed to delete medicine", "error");
    }
  }

  const timeLeftInfo = (time) => getTimeLeft(time);

  return (
    <div className="tracker-container">
      {/* Animated Background */}
      <div className="bg-gradient"></div>
      
      <main className="main-content">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-text">
            <h1>💊 Medicine Tracker</h1>
            <button onClick={subscribeUser} className="subscribe-btn">
              Enable Push Notifications
            </button>
            <p className="subtitle">Stay on top of your health routine</p>
          </div>
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-number">{medicines.length}</span>
                <span className="stat-label">Active Meds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Medicine Form - Glassmorphism */}
        <form onSubmit={addMedicine} className="form-glass">
          <div className="form-header">
            <h2>➕ Add New Medicine</h2>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label>Medicine Name</label>
              <input
                placeholder="e.g., Aspirin"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Dosage</label>
              <input
                placeholder="e.g., 500mg"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Frequency</label>
              <input
                placeholder="e.g., Twice daily"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="add-btn">
            <span>Add Medicine</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </form>

        {/* Medicine Cards */}
        <div className="section-header">
          <h2>Your Medicines</h2>
          <span className="medicine-count">{medicines.length} total</span>
        </div>

        <div className="medicine-grid">
          {medicines.map((m, index) => {
            const timeInfo = timeLeftInfo(m.time);
            return (
              <div 
                className={`medicine-card ${timeInfo.urgent ? 'urgent' : timeInfo.soon ? 'soon' : ''}`}
                key={m._id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div className="pill-icon">💊</div>
                  <button className="delete-btn" onClick={() => deleteMedicine(m._id)}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <h3 className="medicine-name">{m.name}</h3>
                <p className="medicine-dosage">{m.dosage}</p>

                <div className="medicine-details">
                  <div className="detail-item">
                    <span className="detail-icon">🔄</span>
                    <span className="detail-text">{m.frequency}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span className="detail-text">{m.time}</span>
                  </div>

                  <div className={`time-left ${timeInfo.urgent ? 'urgent' : timeInfo.soon ? 'soon' : ''}`}>
                    <span className="time-icon">⏱️</span>
                    <span className="time-text">{timeInfo.text}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {medicines.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏥</div>
              <h3>No medicines yet</h3>
              <p>Add your first medicine to get started</p>
            </div>
          )}
        </div>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
