import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/componentsCss/SOS.css';

export default function SOSPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sosActive, setSOSActive] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [location, setLocation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'Friend'
  });

  // IMPORTANT: Update this to match your backend URL
  const API_URL = 'http://localhost:5000/api/sos';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      const response = await axios.get(`${API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      if (error.response?.status === 401) {
        showNotification('Please login to access SOS features', 'error');
      }
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      await axios.post(`${API_URL}/contacts`, contactForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showNotification('✅ Contact added successfully', 'success');
      setContactForm({ name: '', email: '', phone: '', relationship: 'Friend' });
      setShowAddForm(false);
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      showNotification('Failed to add contact', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Delete this emergency contact?')) return;

    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showNotification('Contact deleted', 'success');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      showNotification('Failed to delete contact', 'error');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleTriggerSOS = async () => {
    if (contacts.length === 0) {
      showNotification('⚠️ Add emergency contacts first!', 'error');
      return;
    }

    if (!window.confirm('🚨 Send emergency alert to all contacts?')) {
      return;
    }

    setLoading(true);
    
    try {
      showNotification('Getting your location...', 'info');
      const loc = await getCurrentLocation();
      setLocation(loc);

      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/trigger`,
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          message: 'Emergency assistance needed'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSOSActive(true);
      setActiveAlertId(response.data.alertId);
      showNotification('🚨 SOS Alert Sent to ' + contacts.length + ' contacts!', 'success');
    } catch (error) {
      console.error('SOS trigger error:', error);
      showNotification('Failed to send SOS. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateSOS = async () => {
    if (!activeAlertId) return;

    try {
      const token = getAuthToken();
      await axios.put(
        `${API_URL}/deactivate/${activeAlertId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSOSActive(false);
      setActiveAlertId(null);
      showNotification('✅ SOS Deactivated', 'success');
    } catch (error) {
      console.error('Deactivate error:', error);
      showNotification('Failed to deactivate', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Emergency hotlines data
  const emergencyHotlines = [
    { name: 'Police', number: '100', icon: '👮' },
    { name: 'Ambulance', number: '108', icon: '🚑' },
    { name: 'Fire Brigade', number: '101', icon: '🚒' },
    { name: 'Women Helpline', number: '1091', icon: '👩' },
    { name: 'Child Helpline', number: '1098', icon: '👶' },
    { name: 'Disaster Management', number: '108', icon: '⚠️' }
  ];

  return (
    <div className="sos-page">
      <div className="sos-container">
        
        {/* Header */}
        <header className="sos-header">
          <h1>🚨 Emergency SOS System</h1>
          <p>Quick access to emergency contacts and alerts</p>
        </header>

        {/* Emergency Hotlines Section */}
        <section className="emergency-info-section">
          <h2>📞 Emergency Hotlines (India)</h2>
          <p className="info-subtitle">Direct access to emergency services</p>
          
          <div className="hotlines-grid">
            {emergencyHotlines.map((hotline, index) => (
              <div key={index} className="hotline-card">
                <span className="hotline-icon">{hotline.icon}</span>
                <h3>{hotline.name}</h3>
                <a href={`tel:${hotline.number}`} className="hotline-number">
                  {hotline.number}
                </a>
                <button 
                  className="call-button"
                  onClick={() => window.open(`tel:${hotline.number}`)}
                >
                  📞 Call Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SOS Alert Trigger */}
        <section className={`sos-trigger-section ${sosActive ? 'active' : ''}`}>
          {!sosActive ? (
            <div className="sos-trigger-container">
              <h2>🚨 Send Emergency Alert</h2>
              <p>Alert your emergency contacts with your location</p>
              
              <button
                className="sos-button"
                onClick={handleTriggerSOS}
                disabled={loading || contacts.length === 0}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <span className="sos-icon">🚨</span>
                    <span>TRIGGER SOS ALERT</span>
                  </>
                )}
              </button>

              {contacts.length === 0 && (
                <div className="warning-box">
                  <p>⚠️ No emergency contacts added</p>
                  <p>Add contacts below to enable SOS alerts</p>
                </div>
              )}
              
              {contacts.length > 0 && (
                <p className="contact-count">
                  Will notify {contacts.length} emergency contact{contacts.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          ) : (
            <div className="sos-active-container">
              <div className="pulse-circle"></div>
              <h2>🚨 SOS ALERT ACTIVE</h2>
              <p>Alert sent to {contacts.length} contact(s)</p>
              {location && (
                <div className="location-info">
                  <p>📍 Location shared successfully</p>
                  <a 
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-link"
                  >
                    View Location on Maps
                  </a>
                </div>
              )}
              <button 
                className="deactivate-button"
                onClick={handleDeactivateSOS}
              >
                ✅ I'm Safe - Deactivate Alert
              </button>
            </div>
          )}
        </section>

        {/* Emergency Contacts Management */}
        <section className="contacts-section">
          <div className="section-header">
            <h2>👥 My Emergency Contacts</h2>
            <button 
              className="add-contact-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '✕ Cancel' : '+ Add Contact'}
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddForm && (
            <form className="contact-form" onSubmit={handleAddContact}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 1234567890"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Relationship</label>
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({...contactForm, relationship: e.target.value})}
                  >
                    <option value="Friend">Friend</option>
                    <option value="Family">Family</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Roommate">Roommate</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="submit-btn">
                ✓ Save Contact
              </button>
            </form>
          )}

          {/* Contact List */}
          <div className="contacts-list">
            {contacts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>No Emergency Contacts Yet</h3>
                <p>Add trusted contacts who will be notified during emergencies</p>
                <button 
                  className="empty-add-btn"
                  onClick={() => setShowAddForm(true)}
                >
                  + Add Your First Contact
                </button>
              </div>
            ) : (
              <div className="contacts-grid">
                {contacts.map((contact) => (
                  <div key={contact._id} className="contact-card">
                    <div className="contact-header">
                      <div className="contact-avatar">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteContact(contact._id)}
                        title="Delete contact"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="contact-details">
                      <h3>{contact.name}</h3>
                      <span className="relationship-badge">{contact.relationship}</span>
                      
                      <div className="contact-info-item">
                        <span className="info-icon">📧</span>
                        <span>{contact.email}</span>
                      </div>
                      
                      <div className="contact-info-item">
                        <span className="info-icon">📱</span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Important Information */}
        <section className="info-section">
          <h3>ℹ️ How It Works</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-number">1</span>
              <p>Add trusted contacts with their email and phone number</p>
            </div>
            <div className="info-item">
              <span className="info-number">2</span>
              <p>Click "Trigger SOS Alert" in emergency situations</p>
            </div>
            <div className="info-item">
              <span className="info-number">3</span>
              <p>Your location and emergency message will be sent via SMS and email</p>
            </div>
            <div className="info-item">
              <span className="info-number">4</span>
              <p>Deactivate the alert when you're safe</p>
            </div>
          </div>
        </section>

        {/* Notification Toast */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
