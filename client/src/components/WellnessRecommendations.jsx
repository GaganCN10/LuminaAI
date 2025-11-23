import React, { useState } from 'react';
import { Heart, Youtube, Music, BookOpen, Sparkles, Loader2, Dumbbell } from 'lucide-react';
import '../assets/componentsCss/WellnessRecommendations.css';

export default function WellnessRecommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: "stress relief and anxiety management",
          focusAreas: ["anxiety", "stress", "sleep"]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const recommendations = await response.json();
      console.log('Received recommendations:', recommendations);
      setRecommendations(recommendations);

    } catch (err) {
      setError("Unable to load recommendations. Please try again.");
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wellness-container">
      <div className="wellness-content">
        {/* Header */}
        <div className="wellness-header">
          <div className="header-title-wrapper">
            <Heart className="header-icon" />
            <h1 className="header-title">Wellness Resources</h1>
          </div>
          <p className="header-subtitle">
            Personalized recommendations to support your mental health journey
          </p>
        </div>

        {/* Get Recommendations Button */}
        <div className="button-wrapper">
          <button
            onClick={getRecommendations}
            disabled={loading}
            className="recommendations-btn"
          >
            {loading ? (
              <>
                <Loader2 className="btn-icon spin" />
                Loading Resources...
              </>
            ) : (
              <>
                <Sparkles className="btn-icon" />
                Get New Recommendations
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Recommendations Grid */}
        {recommendations && (
          <div className="recommendations-grid">
            {/* YouTube Section */}
            <div className="recommendation-card">
              <div className="card-header">
                <Youtube className="card-icon youtube-icon" />
                <h2 className="card-title">YouTube Videos</h2>
              </div>
              <div className="card-content">
                {recommendations.youtube?.map((video, idx) => (
                  <div key={idx} className="recommendation-item youtube-item">
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="item-title">
                      {video.title}
                    </a>
                    <p className="item-subtitle">{video.channel}</p>
                    <p className="item-description">{video.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Spotify Section */}
            <div className="recommendation-card">
              <div className="card-header">
                <Music className="card-icon spotify-icon" />
                <h2 className="card-title">Spotify Music</h2>
              </div>
              <div className="card-content">
                {recommendations.spotify?.map((music, idx) => (
                  <div key={idx} className="recommendation-item spotify-item">
                    <a href={music.url} target="_blank" rel="noopener noreferrer" className="item-title">
                      {music.title}
                    </a>
                    <p className="item-subtitle">{music.artist}</p>
                    <p className="item-description">{music.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Section */}
            <div className="recommendation-card">
              <div className="card-header">
                <BookOpen className="card-icon reading-icon" />
                <h2 className="card-title">Reading Materials</h2>
              </div>
              <div className="card-content">
                {recommendations.reading?.map((item, idx) => (
                  <div key={idx} className="recommendation-item reading-item">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-title">
                      {item.title}
                    </a>
                    <p className="item-subtitle">{item.author}</p>
                    <p className="item-description">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Section - NEW */}
            <div className="recommendation-card">
              <div className="card-header">
                <Dumbbell className="card-icon exercise-icon" />
                <h2 className="card-title">Exercise Tips</h2>
              </div>
              <div className="card-content">
                {recommendations.exercise?.map((exercise, idx) => (
                  <div key={idx} className="recommendation-item exercise-item">
                    <h3 className="item-title-text">{exercise.title}</h3>
                    <p className="item-subtitle">{exercise.type} • {exercise.duration}</p>
                    <p className="item-description">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Message */}
        {!recommendations && !loading && (
          <div className="support-card">
            <Heart className="support-icon" />
            <h3 className="support-title">You're Not Alone</h3>
            <p className="support-description">
              Click the button above to receive personalized wellness resources tailored to support your journey.
            </p>
            <p className="support-disclaimer">
              If you're experiencing a crisis, please reach out to a mental health professional or call a crisis helpline immediately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}