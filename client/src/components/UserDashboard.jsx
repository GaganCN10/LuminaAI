import React from "react";
import { Link } from "react-router-dom";
import "../assets/componentsCss/Dashboard.css";
// import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { useEffect, useState } from "react";
import "../assets/componentsCss/UserDashboard.css"
// import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SignOutButton from "./SignOutButton";

export default function UserDashboard() {

  const token = localStorage.getItem("token");

  // Decode the token
  const user = jwtDecode(token);

        console.log("Decoded user:", user);
        const [notifications, setNotifications] = useState([]);

      useEffect(() => {
        fetch("http://localhost:5000/api/report/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(setNotifications);
      }, []);
      const markAsRead = async () => {
      await fetch("http://localhost:5000/api/report/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications([]);
    };

  return (
    <div className="container text-center mt-5">
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">User Dashboard</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
          </div>
          {/* <span className="navbar-text mr-10 Test">
            <Link to="/dashboard/user/test" style={{color: "white"}}>Test</Link>
          </span> */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* <LanguageSwitcher /> */}
            <SignOutButton />
          </div>
          <span className="navbar-text mr-5 SOS">
            <Link to="/dashboard/user/sos" >SOS</Link>
          </span>
           <span className="navbar-text mr-0">
              Hello {user.name}
            </span>
        </div>
      </nav>
      <div className="card-grid">
        {/* <Link to="/dashboard/user/chatbot" className="card">
          <h2>Chat bot</h2>
          <p>Ask Anything</p>
        </Link> */}
        <Link to="/dashboard/user/chat" className="card">
        <h2>Chat with assistant</h2>
        <p>Ask anything</p>
        </Link>

        <Link to="/dashboard/user/mood" className="card">
          <h2>Mood Analysis</h2>
          <p>Analyze mood from user responses.</p>
        </Link>

        <Link to="/dashboard/user/meal-tracker" className="card">
          <h2>Meal Tracker</h2>
          <p>Track meals and calories.</p>
        </Link>

        <Link to="/dashboard/user/meal-info" className="card">
          <h2>Meal Content & Calories</h2>
          <p>View calories and nutritional info.</p>
        </Link>

        <Link to="/dashboard/user/medicine-tracker" className="card">
          <h2>Medicine Tracker</h2>
          <p>Set reminders for medications.</p>
        </Link>

        <Link to="/dashboard/user/image-analyzer" className="card">
          <h2>Image Analyzer</h2>
          <p>Upload an image for health analysis.</p>
        </Link>

        <Link to="/dashboard/user/report" className="card">
          <h2>Report Generator</h2>
          <p>Generate a report and send to a nearby doctor.</p>
        </Link>

        <Link to="/dashboard/user/test" className="card">
          <h2>Anxiety and Stress tests</h2>
          <p>Take a quick test on mental health</p>
        </Link>

         <Link to="/dashboard/user/community" className="card">
          <h2>Community</h2>
          <p>Join other people</p>
        </Link>

        <Link to="/dashboard/user/wellness" className="card">
          <h2>Wellness Center</h2>
          <p>Get your free wellness resources</p>
        </Link>

        <Link to="/dashboard/user/ocr" className="card">
        <h2>OCR</h2>
        <p>Analyze your meds with just prescription</p>
        </Link>
        <Link to="/dashboard/user/screening" className="card">
        <h2>Take a screening test</h2>
        <p>Analyze your mental health</p>
        </Link>
        
          {notifications.length > 0 && (
          <div className="notification-panel">
           <h2>Doctor Suggestions</h2>

          {notifications.length === 0 ? (
            <p>No doctor suggestions yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.reportId}
                style={{
                  background: "#f7f7f7",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #4a90e2"
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>From:</strong> {n.suggestion?.doctor || "Unknown Doctor"}
                </p>

                <p style={{ margin: "6px 0" }}>
                  <strong>Suggestion:</strong>{" "}
                  {n.suggestion?.text
                    ? n.suggestion.text
                    : "No suggestion available"}
                </p>

                {n.suggestion?.when && (
                  <small>
                    <strong>Date:</strong>{" "}
                    {new Date(n.suggestion.when).toLocaleString()}
                  </small>
                )}
              </div>
            ))
          )}



            <button onClick={markAsRead} className="btn">Mark All as Read</button>
          </div>
        )}

      </div>
    </div>
  );
}
