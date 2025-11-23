import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import "../assets/componentsCss/MentalAssessment.css";

const TESTS = {
  "PHQ-9": {
    maxScore: 27,
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure",
      "Trouble concentrating on things",
      "Moving/speaking slowly or being restless",
      "Thoughts of self-harm"
    ],
    interpretations: [
      { max: 4, label: "Minimal", advice: "Maintain healthy habits.", color: "#8b5cf6" },
      { max: 9, label: "Mild", advice: "Practice self-care.", color: "#6366f1" },
      { max: 14, label: "Moderate", advice: "Consider talking to a therapist.", color: "#f59e0b" },
      { max: 19, label: "Moderately Severe", advice: "Seek professional help.", color: "#f97316" },
      { max: 27, label: "Severe", advice: "Contact a mental-health professional urgently.", color: "#ef4444" }
    ]
  },

  "GAD-7": {
    maxScore: 21,
    questions: [
      "Feeling nervous, anxious or on edge",
      "Unable to stop or control worrying",
      "Worrying too much about many things",
      "Trouble relaxing",
      "Restlessness",
      "Becoming easily annoyed or irritable",
      "Feeling afraid something awful might happen"
    ],
    interpretations: [
      { max: 4, label: "Minimal", advice: "Maintain healthy habits.", color: "#8b5cf6" },
      { max: 9, label: "Mild", advice: "Practice mindfulness.", color: "#6366f1" },
      { max: 14, label: "Moderate", advice: "Consider therapy.", color: "#f59e0b" },
      { max: 21, label: "Severe", advice: "Seek professional help.", color: "#ef4444" }
    ]
  }
};

export default function MentalAssessment() {
  const [testName, setTestName] = useState("PHQ-9");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const currentTest = TESTS[testName];

  const handleAnswer = (index, value) => {
    setAnswers({ ...answers, [index]: Number(value) });
    if (submitted) setSubmitted(false);
  };

  const score = currentTest.questions.reduce(
    (acc, _, i) => acc + (answers[i] || 0),
    0
  );

  const interpretation = submitted
    ? currentTest.interpretations.find((i) => score <= i.max)
    : null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = currentTest.questions.length;
  const allAnswered = answeredCount === totalQuestions;

  const chartData = [
    { name: "Your Score", value: score, fill: interpretation?.color || "#8b5cf6" },
    { name: "Remaining", value: currentTest.maxScore - score, fill: "#e9d5ff" }
  ];

  return (
    <div className="assessment-wrapper">
      <div className="assessment-container">
        
        {/* Header */}
        <div className="assessment-header">
          <div className="header-icon-wrapper">
            <span className="header-icon">🧠</span>
          </div>
          <h1 className="assessment-title">Mental Health Assessment</h1>
          <p className="assessment-subtitle">
            Self-screening tools for depression and anxiety
          </p>
        </div>

        {/* Test Selector */}
        <div className="selector-card">
          <label className="selector-label">
            Select Assessment Type
          </label>
          <select
            className="selector-input"
            value={testName}
            onChange={(e) => {
              setTestName(e.target.value);
              setAnswers({});
              setSubmitted(false);
            }}
          >
            <option value="PHQ-9">PHQ-9 — Depression Screening</option>
            <option value="GAD-7">GAD-7 — Anxiety Screening</option>
          </select>
          
          <div className="progress-info">
            <span className="progress-badge">
              {answeredCount} / {totalQuestions} questions answered
            </span>
            {answeredCount > 0 && !allAnswered && (
              <small className="progress-hint">Please answer all questions to submit</small>
            )}
          </div>
        </div>

        {/* Results Section */}
        {submitted && interpretation && (
          <div className="results-section">
            <div className="results-card" style={{ backgroundColor: interpretation.color }}>
              <h2 className="results-heading">Your Results</h2>
              <div className="score-display">
                <span className="score-number">{score}</span>
                <span className="score-max">/ {currentTest.maxScore}</span>
              </div>
              <h3 className="results-label">{interpretation.label}</h3>
              <p className="results-advice">{interpretation.advice}</p>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Score Visualization</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                  <XAxis dataKey="name" stroke="#7c3aed" />
                  <YAxis domain={[0, currentTest.maxScore]} stroke="#7c3aed" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-box">
          <p className="instructions-text">
            <strong>Instructions:</strong> Over the last 2 weeks, how often have you been bothered by the following?
          </p>
        </div>

        {/* Questions */}
        <div className="questions-list">
          {currentTest.questions.map((q, i) => (
            <div 
              key={i} 
              className={`question-card ${answers[i] !== undefined ? 'answered' : ''}`}
            >
              <div className="question-header">
                <span className="question-number">{i + 1}</span>
                <span className="question-text">{q}</span>
              </div>

              <select
                className={`question-select ${answers[i] !== undefined ? 'selected' : ''}`}
                value={answers[i] ?? ""}
                onChange={(e) => handleAnswer(i, e.target.value)}
              >
                <option value="">— Select frequency —</option>
                <option value="0">0 - Not at all</option>
                <option value="1">1 - Several days</option>
                <option value="2">2 - More than half the days</option>
                <option value="3">3 - Nearly every day</option>
              </select>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          className={`submit-btn ${allAnswered ? 'enabled' : 'disabled'}`}
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
        >
          {allAnswered ? '✓ Submit Assessment' : `Please answer all ${totalQuestions} questions`}
        </button>

        {/* Reset Button */}
        {submitted && (
          <button
            className="reset-btn"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            ↺ Reset Assessment
          </button>
        )}

        {/* Disclaimer */}
        <div className="disclaimer-box">
          <p className="disclaimer-text">
            <strong>⚠️ Important Notice:</strong> This is a screening tool, not a diagnostic test. 
            If you're experiencing mental health concerns, please consult with a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}