import React, { useState } from 'react';
import "../assets/componentsCss/QuickScreening.css"
const QuickScreening = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [result, setResult] = useState(null);

  // Official PHQ-9 Questions (validated instrument)
  const questions = [
    { id: 1, text: "Little interest or pleasure in doing things", domain: "anhedonia", critical: true },
    { id: 2, text: "Feeling down, depressed, or hopeless", domain: "mood", critical: true },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much", domain: "sleep" },
    { id: 4, text: "Feeling tired or having little energy", domain: "fatigue" },
    { id: 5, text: "Poor appetite or overeating", domain: "appetite" },
    { id: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", domain: "self-worth" },
    { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television", domain: "concentration" },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", domain: "psychomotor" },
    { id: 9, text: "Thoughts that you would be better off dead or of hurting yourself in some way", domain: "suicidal", critical: true, crisis: true }
  ];

  const options = [
    { value: 0, label: "Not at all", days: "0 days" },
    { value: 1, label: "Several days", days: "1-7 days" },
    { value: 2, label: "More than half the days", days: "8-11 days" },
    { value: 3, label: "Nearly every day", days: "12-14 days" }
  ];

  // PHQ-9 Validated Severity Thresholds (Kroenke et al., 2001)
  const severityLevels = [
    { min: 0, max: 4, level: "Minimal", color: "#10b981", bgColor: "#d1fae5", textColor: "#065f46", recommendation: "No treatment typically needed. Continue monitoring." },
    { min: 5, max: 9, level: "Mild", color: "#eab308", bgColor: "#fef9c3", textColor: "#854d0e", recommendation: "Watchful waiting. Repeat PHQ-9 at follow-up. Consider counseling." },
    { min: 10, max: 14, level: "Moderate", color: "#f59e0b", bgColor: "#fed7aa", textColor: "#9a3412", recommendation: "Treatment plan recommended. Consider counseling, medication, or both." },
    { min: 15, max: 19, level: "Moderately Severe", color: "#ef4444", bgColor: "#fecaca", textColor: "#991b1b", recommendation: "Active treatment with pharmacotherapy and/or psychotherapy recommended." },
    { min: 20, max: 27, level: "Severe", color: "#dc2626", bgColor: "#fecaca", textColor: "#7f1d1d", recommendation: "Immediate initiation of pharmacotherapy. If severe impairment or poor response, refer to mental health specialist." }
  ];

  const handleResponse = (value) => {
    const newResponses = [...responses, value];
    setResponses(newResponses);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults(newResponses);
    }
  };

  const analyzeResults = (finalResponses) => {
    const totalScore = finalResponses.reduce((sum, val) => sum + val, 0);
    
    // Get severity level based on validated thresholds
    const severity = severityLevels.find(s => totalScore >= s.min && totalScore <= s.max);
    
    // PHQ-2 Analysis (first 2 questions are cardinal symptoms)
    const phq2Score = finalResponses[0] + finalResponses[1];
    const phq2Positive = phq2Score >= 3; // Validated cutoff for PHQ-2
    
    // Crisis detection (Question 9)
    const suicidalIdeation = finalResponses[8];
    const hasCrisis = suicidalIdeation >= 1; // Any positive response requires attention
    const severeCrisis = suicidalIdeation >= 2;
    
    // Domain-specific pattern analysis
    const domainAnalysis = {
      cardinalSymptoms: {
        label: "Cardinal Symptoms",
        score: finalResponses[0] + finalResponses[1],
        maxScore: 6,
        items: ["Anhedonia", "Depressed Mood"],
        interpretation: phq2Positive ? "Significant" : "Within normal range"
      },
      somatic: {
        label: "Somatic Symptoms",
        score: finalResponses[2] + finalResponses[3] + finalResponses[4],
        maxScore: 9,
        items: ["Sleep", "Energy", "Appetite"],
        interpretation: (finalResponses[2] + finalResponses[3] + finalResponses[4]) >= 5 ? "Elevated" : "Within normal range"
      },
      cognitive: {
        label: "Cognitive Symptoms",
        score: finalResponses[5] + finalResponses[6],
        maxScore: 6,
        items: ["Self-worth", "Concentration"],
        interpretation: (finalResponses[5] + finalResponses[6]) >= 4 ? "Elevated" : "Within normal range"
      },
      psychomotor: {
        label: "Psychomotor",
        score: finalResponses[7],
        maxScore: 3,
        items: ["Activity changes"],
        interpretation: finalResponses[7] >= 2 ? "Notable" : "Within normal range"
      }
    };

    // Functional impairment patterns
    const patterns = [];
    
    if (phq2Positive) {
      patterns.push({ type: "warning", text: "Cardinal symptoms (anhedonia + mood) above clinical threshold" });
    }
    
    if (finalResponses[2] >= 2 && finalResponses[3] >= 2) {
      patterns.push({ type: "info", text: "Sleep-fatigue cluster detected — common in depression" });
    }
    
    if (finalResponses[5] >= 2 && finalResponses[0] >= 2) {
      patterns.push({ type: "info", text: "Low self-worth with anhedonia — may benefit from behavioral activation" });
    }
    
    if (finalResponses[7] >= 2) {
      patterns.push({ type: "info", text: "Psychomotor changes present — notable clinical indicator" });
    }

    // Major Depressive Disorder screening criteria
    // Requires: PHQ-9 ≥ 10 AND at least one cardinal symptom ≥ 2 AND 5+ symptoms ≥ 2
    const symptomCount = finalResponses.filter(r => r >= 2).length;
    const hasCardinalSymptom = finalResponses[0] >= 2 || finalResponses[1] >= 2;
    const meetsMDDCriteria = totalScore >= 10 && hasCardinalSymptom && symptomCount >= 5;

    setResult({
      totalScore,
      severity,
      phq2Score,
      phq2Positive,
      hasCrisis,
      severeCrisis,
      suicidalIdeation,
      domainAnalysis,
      patterns,
      meetsMDDCriteria,
      symptomCount,
      responses: finalResponses
    });
  };

  const restart = () => {
    setCurrentQuestion(0);
    setResponses([]);
    setResult(null);
  };

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f0f9ff 100%)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    card: { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '20px 24px', boxSizing: 'border-box' },
    header: { textAlign: 'center', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 },
    subtitle: { fontSize: 11, color: '#6b7280', marginTop: 4 },
    progressBar: { height: 4, background: '#e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 16 },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: 10, transition: 'width 0.3s' },
    questionNum: { fontSize: 11, color: '#6b7280', marginBottom: 8 },
    question: { fontSize: 15, fontWeight: 500, color: '#1f2937', lineHeight: 1.5, marginBottom: 16 },
    questionContext: { fontSize: 12, color: '#6b7280', marginBottom: 16, fontStyle: 'italic' },
    optionBtn: { width: '100%', padding: '12px 14px', textAlign: 'left', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer', marginBottom: 8, transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    optionDays: { fontSize: 11, color: '#9ca3af' },
    
    // Results styles
    resultHeader: { textAlign: 'center', marginBottom: 16 },
    scoreDisplay: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
    scoreCircle: { width: 80, height: 80, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid' },
    scoreNum: { fontSize: 28, fontWeight: 700 },
    scoreMax: { fontSize: 10, color: '#6b7280' },
    severityBadge: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
    
    crisisBox: { background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', padding: 12, borderRadius: '0 8px 8px 0', marginBottom: 14 },
    crisisTitle: { fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 4 },
    crisisText: { fontSize: 12, color: '#b91c1c', margin: 0 },
    
    section: { marginBottom: 14 },
    sectionTitle: { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    domainRow: { display: 'flex', alignItems: 'center', marginBottom: 6, padding: '6px 0' },
    domainLabel: { width: 110, fontSize: 11, color: '#4b5563' },
    domainBar: { flex: 1, height: 6, background: '#e5e7eb', borderRadius: 10, margin: '0 8px', overflow: 'hidden' },
    domainScore: { width: 45, fontSize: 10, color: '#6b7280', textAlign: 'right' },
    
    patternBox: { padding: '8px 10px', borderRadius: 6, marginBottom: 6, fontSize: 11 },
    patternWarning: { background: '#fef3c7', color: '#92400e', borderLeft: '3px solid #f59e0b' },
    patternInfo: { background: '#e0f2fe', color: '#0369a1', borderLeft: '3px solid #0ea5e9' },
    
    recommendationBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 14 },
    recommendationTitle: { fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 4 },
    recommendationText: { fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.5 },
    
    mddBox: { background: '#fefce8', border: '1px solid #fef08a', borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 11, color: '#854d0e' },
    
    disclaimer: { background: '#f9fafb', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 10, color: '#6b7280', lineHeight: 1.5 },
    citation: { fontSize: 9, color: '#9ca3af', marginTop: 8 },
    
    btn: { width: '100%', padding: 12, background: 'linear-gradient(90deg, #10b981, #06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer' }
  };

  if (result) {
    const { severity } = result;
    
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.resultHeader}>
            <h2 style={{...styles.title, marginBottom: 4}}>PHQ-9 Results</h2>
            <p style={{fontSize: 11, color: '#6b7280', margin: 0}}>Patient Health Questionnaire</p>
          </div>

          <div style={styles.scoreDisplay}>
            <div style={{...styles.scoreCircle, borderColor: severity.color, color: severity.color}}>
              <span style={styles.scoreNum}>{result.totalScore}</span>
              <span style={styles.scoreMax}>of 27</span>
            </div>
            <div>
              <div style={{...styles.severityBadge, background: severity.bgColor, color: severity.textColor}}>
                {severity.level} Depression
              </div>
              <div style={{fontSize: 11, color: '#6b7280', marginTop: 6}}>
                PHQ-2: {result.phq2Score}/6 {result.phq2Positive ? "⚠️" : "✓"}
              </div>
            </div>
          </div>

          {result.hasCrisis && (
            <div style={styles.crisisBox}>
              <div style={styles.crisisTitle}>⚠️ Safety Concern Detected</div>
              <p style={styles.crisisText}>
                {result.severeCrisis 
                  ? "Immediate safety assessment recommended. Please contact a crisis line or emergency services."
                  : "Any thoughts of self-harm require professional evaluation. Please discuss with a healthcare provider."}
              </p>
              <p style={{...styles.crisisText, marginTop: 8, fontWeight: 600}}>
                988 Suicide & Crisis Lifeline | Text HOME to 741741
              </p>
            </div>
          )}

          {result.meetsMDDCriteria && (
            <div style={styles.mddBox}>
              <strong>Screening Positive:</strong> Score and symptom pattern meet criteria for Major Depressive Disorder screening. 
              Professional evaluation recommended for diagnosis.
            </div>
          )}

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Symptom Domain Analysis</div>
            {Object.values(result.domainAnalysis).map((domain, i) => (
              <div key={i} style={styles.domainRow}>
                <span style={styles.domainLabel}>{domain.label}</span>
                <div style={styles.domainBar}>
                  <div style={{
                    height: '100%', 
                    width: `${(domain.score / domain.maxScore) * 100}%`,
                    background: domain.score / domain.maxScore >= 0.67 ? '#ef4444' : domain.score / domain.maxScore >= 0.5 ? '#f59e0b' : '#10b981',
                    borderRadius: 10
                  }}/>
                </div>
                <span style={styles.domainScore}>{domain.score}/{domain.maxScore}</span>
              </div>
            ))}
          </div>

          {result.patterns.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Clinical Patterns</div>
              {result.patterns.map((p, i) => (
                <div key={i} style={{...styles.patternBox, ...(p.type === 'warning' ? styles.patternWarning : styles.patternInfo)}}>
                  {p.text}
                </div>
              ))}
            </div>
          )}

          <div style={styles.recommendationBox}>
            <div style={styles.recommendationTitle}>Clinical Recommendation</div>
            <p style={styles.recommendationText}>{severity.recommendation}</p>
          </div>

          <div style={styles.disclaimer}>
            <strong>Important:</strong> The PHQ-9 is a screening tool, not a diagnostic instrument. 
            Results should be interpreted by a qualified healthcare provider who can conduct a comprehensive evaluation.
            <div style={styles.citation}>
              Reference: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.
            </div>
          </div>

          <button style={styles.btn} onClick={restart}>Start New Screening</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>PHQ-9 Depression Screening</h1>
          <p style={styles.subtitle}>Validated Patient Health Questionnaire</p>
        </div>
        
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${((currentQuestion + 1) / questions.length) * 100}%`}}/>
        </div>
        
        <div style={styles.questionNum}>Question {currentQuestion + 1} of {questions.length}</div>
        
        <div style={styles.questionContext}>Over the last 2 weeks, how often have you been bothered by:</div>
        
        <div style={styles.question}>{questions[currentQuestion].text}</div>
        
        <div>
          {options.map((opt) => (
            <button 
              key={opt.value} 
              style={styles.optionBtn} 
              onClick={() => handleResponse(opt.value)}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
            >
              <span>{opt.label}</span>
              <span style={styles.optionDays}>{opt.days}</span>
            </button>
          ))}
        </div>
        
        <div style={{marginTop: 16, fontSize: 10, color: '#9ca3af', textAlign: 'center'}}>
          Based on the PHQ-9 (Kroenke et al., 2001)
        </div>
      </div>
    </div>
  );
};

export default QuickScreening;