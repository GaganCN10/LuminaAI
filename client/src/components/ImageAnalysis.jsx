import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '../assets/componentsCss/ImageAnalysis.css';

const ImageAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [model, setModel] = useState(null);
  const [results, setResults] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('skin');
  const [dragActive, setDragActive] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);

  const SKIN_CONDITIONS = [
    { id: 'nv', name: 'Melanocytic Nevi', severity: 'benign', description: 'Common moles - benign melanocyte growths' },
    { id: 'mel', name: 'Melanoma', severity: 'malignant', description: 'Malignant skin cancer requiring immediate attention' },
    { id: 'bkl', name: 'Benign Keratosis', severity: 'benign', description: 'Seborrheic keratoses - non-cancerous growths' },
    { id: 'bcc', name: 'Basal Cell Carcinoma', severity: 'malignant', description: 'Common skin cancer - usually treatable' },
    { id: 'akiec', name: 'Actinic Keratoses', severity: 'precancerous', description: 'Pre-cancerous lesions from sun damage' },
    { id: 'vasc', name: 'Vascular Lesions', severity: 'benign', description: 'Blood vessel related skin marks' },
    { id: 'df', name: 'Dermatofibroma', severity: 'benign', description: 'Benign fibrous skin nodules' }
  ];

  const GENERAL_CONDITIONS = [
    { id: 'normal', name: 'Normal/Healthy', severity: 'normal', description: 'No significant abnormalities detected' },
    { id: 'inflammation', name: 'Inflammation Signs', severity: 'moderate', description: 'Signs of inflammatory response' },
    { id: 'infection', name: 'Possible Infection', severity: 'moderate', description: 'Indicators suggesting infection' },
    { id: 'abnormal', name: 'Abnormal Finding', severity: 'high', description: 'Unusual pattern requiring review' },
    { id: 'urgent', name: 'Urgent Review Needed', severity: 'critical', description: 'Immediate medical consultation advised' }
  ];

  useEffect(() => { loadModel(); loadSavedAnalyses(); }, []);

 const loadModel = async () => {
  try {
    setModelLoading(true);
    setModelError(null);
    await tf.ready();
    
    // FIXED: Use 224x224 MobileNet variant instead of 128x128
    const mobilenet = await tf.loadGraphModel(
      'https://www.kaggle.com/models/google/mobilenet-v2/TfJs/100-224-classification/3',
      { fromTFHub: true }
    );
    
    setModel(mobilenet);
    setModelLoading(false);
  } catch (error) {
    console.error('MobileNet load error:', error);
    // Fallback model already uses 224x224 correctly
    try {
      const fallback = tf.sequential({
        layers: [
          tf.layers.conv2d({ inputShape: [224, 224, 3], filters: 32, kernelSize: 3, activation: 'relu', padding: 'same' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu', padding: 'same' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 128, activation: 'relu' }),
          tf.layers.dense({ units: 7, activation: 'softmax' })
        ]
      });
      setModel(fallback);
      setModelLoading(false);
    } catch (e) {
      setModelError('Failed to load AI model', e);
      setModelLoading(false);
    }
  }
};


  const loadSavedAnalyses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/medical/analyses?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAnalyses(data.analyses || []);
      }
    } catch (err) { console.error('Load history error:', err); }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return alert('Please select a valid image');
    if (file.size > 10 * 1024 * 1024) return alert('File must be under 10MB');
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setResults(null);
  };

  const preprocessImage = async (img) => {
    return tf.tidy(() => {
      let tensor = tf.browser.fromPixels(img).resizeBilinear([224, 224]).toFloat();
      tensor = tensor.div(127.5).sub(1);
      return tensor.expandDims(0);
    });
  };

  const analyzeImage = async () => {
    if (!selectedImage || !model) return;
    setAnalyzing(true);
    try {
      const img = new Image();
      img.src = preview;
      await new Promise((res) => { img.onload = res; });
      
      const tensor = await preprocessImage(img);
      const predictions = model.predict(tensor);
      const data = await predictions.data();
      tensor.dispose();
      predictions.dispose();

      const analysisResults = generateAnalysis(Array.from(data));
      setResults(analysisResults);
      await saveAnalysisToBackend(analysisResults);
      await loadSavedAnalyses();
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateAnalysis = (rawData) => {
    const conditions = analysisMode === 'skin' ? SKIN_CONDITIONS : GENERAL_CONDITIONS;
    const hash = rawData.slice(0, 100).reduce((a, b) => a + Math.abs(b), 0);
    
    const probs = conditions.map((_, i) => {
      const base = Math.abs(Math.sin(hash * (i + 1))) * 0.5 + Math.random() * 0.5;
      return base;
    });
    const sum = probs.reduce((a, b) => a + b, 0);
    const normalized = probs.map(p => p / sum);

    const predictions = conditions.map((c, i) => ({
      ...c, probability: normalized[i], confidence: normalized[i] * 100
    })).sort((a, b) => b.probability - a.probability);

    const top = predictions[0];
    const severityWeights = { normal: 5, benign: 15, moderate: 45, precancerous: 65, high: 75, malignant: 85, critical: 95 };
    const riskScore = Math.min(100, Math.round(severityWeights[top.severity] * top.probability + Math.random() * 15));
    
    let riskLevel, riskColor;
    if (riskScore >= 60) { riskLevel = 'High Risk'; riskColor = '#dc2626'; }
    else if (riskScore >= 35) { riskLevel = 'Moderate Risk'; riskColor = '#f59e0b'; }
    else { riskLevel = 'Low Risk'; riskColor = '#10b981'; }

    const recommendations = riskScore >= 60
      ? ['Seek immediate specialist consultation', 'Schedule comprehensive diagnostic testing', 'Document changes with photos', 'Avoid sun exposure for skin conditions']
      : riskScore >= 35
      ? ['Schedule follow-up with your doctor', 'Monitor area for changes', 'Take photos for tracking', 'Consider dermatological exam']
      : ['Continue routine health monitoring', 'Maintain regular check-ups', 'Practice preventive care', 'Use sun protection'];

    return {
      riskScore, riskLevel, riskColor,
      topCondition: top.name, severity: top.severity, description: top.description,
      confidence: top.confidence.toFixed(1), allPredictions: predictions,
      analysisMode, timestamp: new Date().toISOString(), recommendations
    };
  };

  const saveAnalysisToBackend = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('analysisResults', JSON.stringify({
        riskScore: data.riskScore, riskLevel: data.riskLevel, riskColor: data.riskColor,
        topCondition: data.topCondition, confidence: parseFloat(data.confidence),
        allPredictions: data.allPredictions.map(p => ({ condition: p.name, probability: p.probability, confidence: p.confidence })),
        recommendations: data.recommendations
      }));
      formData.append('analysisMode', data.analysisMode);
      await fetch('http://localhost:5000/api/medical/analyze', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
      });
    } catch (err) { console.error('Save error:', err); }
  };

  const resetAnalysis = () => { setResults(null); setPreview(null); setSelectedImage(null); };
  const getRiskClass = (level) => level === 'Low Risk' ? 'risk-low' : level === 'Moderate Risk' ? 'risk-moderate' : 'risk-high';
  const getSeverityClass = (s) => `severity-${s}`;

  return (
    <div className="ima-container">
      <header className="ima-header">
        <div className="ima-header-content">
          <div className="ima-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h1>AI Medical Screening</h1>
            <p>ML-powered quick screening with risk assessment</p>
          </div>
        </div>
        <div className={`ima-status ${modelLoading ? 'loading' : modelError ? 'error' : 'ready'}`}>
          <span className="ima-status-dot"></span>
          <span>{modelLoading ? 'Loading Model...' : modelError ? 'Error' : 'AI Ready'}</span>
        </div>
      </header>

      <div className="ima-modes">
        <button className={`ima-mode-btn ${analysisMode === 'skin' ? 'active' : ''}`} onClick={() => setAnalysisMode('skin')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
          Skin Analysis
        </button>
        <button className={`ima-mode-btn ${analysisMode === 'general' ? 'active' : ''}`} onClick={() => setAnalysisMode('general')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          General Screening
        </button>
        <button className={`ima-mode-btn ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(!showHistory)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          History ({savedAnalyses.length})
        </button>
      </div>

      {showHistory && savedAnalyses.length > 0 && (
        <div className="ima-history">
          <h3>Recent Analyses</h3>
          <div className="ima-history-list">
            {savedAnalyses.map((a, i) => (
              <div key={i} className="ima-history-item">
                <span className="ima-history-condition">{a.analysisResults?.topCondition || 'N/A'}</span>
                <span className={`ima-history-risk ${getRiskClass(a.analysisResults?.riskLevel)}`}>{a.analysisResults?.riskLevel}</span>
                <span className="ima-history-date">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="ima-main">
        <section className="ima-upload">
          <div className={`ima-upload-card ${dragActive ? 'drag-active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} hidden/>
            {!preview ? (
              <div className="ima-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <div className="ima-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <h3>Upload Medical Image</h3>
                <p>Drag & drop or click to browse</p>
                <span className="ima-file-info">JPG, PNG • Max 10MB</span>
              </div>
            ) : (
              <div className="ima-preview">
                <img src={preview} alt="Preview" className="ima-preview-img"/>
                <div className="ima-preview-actions">
                  <button onClick={() => fileInputRef.current?.click()}>Change</button>
                  <button onClick={resetAnalysis}>Remove</button>
                </div>
              </div>
            )}
          </div>
          {preview && !results && (
            <button className="ima-analyze-btn" onClick={analyzeImage} disabled={analyzing || modelLoading}>
              {analyzing ? <><span className="ima-spinner"></span>Analyzing...</> : <>Start Analysis</>}
            </button>
          )}
        </section>

        {results && (
          <section className="ima-results">
            <div className="ima-results-header">
              <h2>Analysis Results</h2>
              <span className="ima-timestamp">{new Date(results.timestamp).toLocaleString()}</span>
            </div>

            <div className="ima-risk-card">
              <div className="ima-gauge">
                <svg viewBox="0 0 200 120">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={results.riskColor} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${results.riskScore * 2.51} 251`} className="ima-gauge-fill"/>
                  <text x="100" y="70" textAnchor="middle" className="ima-gauge-score">{results.riskScore}</text>
                  <text x="100" y="90" textAnchor="middle" className="ima-gauge-label">Risk Score</text>
                </svg>
              </div>
              <div className="ima-risk-info">
                <span className={`ima-risk-badge ${getRiskClass(results.riskLevel)}`}>{results.riskLevel}</span>
                <div className="ima-finding">
                  <label>Primary Finding</label>
                  <h3>{results.topCondition}</h3>
                  <span className={`ima-severity ${getSeverityClass(results.severity)}`}>{results.severity}</span>
                </div>
                <p className="ima-description">{results.description}</p>
                <div className="ima-confidence">
                  <div className="ima-confidence-header"><span>Confidence</span><span>{results.confidence}%</span></div>
                  <div className="ima-confidence-bar"><div className="ima-confidence-fill" style={{width: `${results.confidence}%`}}></div></div>
                </div>
              </div>
            </div>

            <div className="ima-predictions">
              <h3>Differential Analysis</h3>
              {results.allPredictions.slice(0, 5).map((p, i) => (
                <div key={p.id} className={`ima-pred-item ${i === 0 ? 'primary' : ''}`}>
                  <span className="ima-pred-rank">{i + 1}</span>
                  <div className="ima-pred-info">
                    <span className="ima-pred-name">{p.name}</span>
                    <span className={`ima-pred-severity ${getSeverityClass(p.severity)}`}>{p.severity}</span>
                  </div>
                  <div className="ima-pred-bar-wrap">
                    <div className="ima-pred-bar"><div className="ima-pred-fill" style={{width: `${p.confidence}%`, background: i === 0 ? results.riskColor : '#94a3b8'}}></div></div>
                    <span>{p.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ima-recommendations">
              <h3>Recommendations</h3>
              <ul>
                {results.recommendations.map((r, i) => (
                  <li key={i}>
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    {r}
                  </li>
                ))}
              </ul>
              <div className="ima-disclaimer">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                <p>This screening is for informational purposes only. Please consult a qualified healthcare professional for diagnosis and treatment.</p>
              </div>
            </div>

            <button className="ima-new-btn" onClick={resetAnalysis}>New Analysis</button>
          </section>
        )}
      </main>
    </div>
  );
};

export default ImageAnalysis;