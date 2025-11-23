import React, { useState, useRef, useEffect } from "react";
import { createWorker } from "tesseract.js";
import "../assets/componentsCss/OCR.css";

export default function OCR() {
  const [imageSrc, setImageSrc] = useState('');
  const [ocrText, setOcrText] = useState("");
  const [detectedMeds, setDetectedMeds] = useState([]);
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  function cleanText(text) {
    if (!text) return "";
    return text
      .replace(/\u00A0/g, " ")
      .replace(/[0]/g, "o")
      .replace(/[1]/g, "l")
      .replace(/[5]/g, "s")
      .replace(/@/g, "a");
  }

  async function runOCR(file) {
    setIsWorking(true);
    setProgress(6);
    setOcrText("");
    setDetectedMeds([]);
    setWords([]);

    try {
      const worker = await createWorker("eng", 1);
      setProgress(24);

      const { data } = await worker.recognize(file);
      setProgress(72);

      const extracted = cleanText(data.text || "");
      setOcrText(extracted);

      const w = (data.words || []).map((wd) => ({
        text: cleanText(wd.text || ""),
        bbox: wd.bbox || null,
      }));
      setWords(w);

      await worker.terminate();
      setProgress(100);

      await detectFromBackend(extracted);
    } catch (err) {
      console.error("OCR error:", err);
      alert("OCR failed: " + (err.message || err));
      setProgress(0);
    } finally {
      setIsWorking(false);
      setTimeout(() => setProgress(0), 700);
    }
  }

  async function detectFromBackend(text) {
  if (!text || !text.trim()) {
    setDetectedMeds([]);
    return;
  }

  console.log('📤 Sending to backend:', text); // Debug log

  try {
    const res = await fetch("http://localhost:5000/api/ocr/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    console.log('📥 Response status:', res.status); // Debug log

    if (!res.ok) {
      console.warn("Backend returned non-OK", res.status);
      setDetectedMeds([]);
      return;
    }

    const data = await res.json();
    console.log("✅ Backend response:", data); // Debug log
    setDetectedMeds(data.medicines || []);
  } catch (err) {
    console.error("❌ Detection error:", err);
    setDetectedMeds([]);
  }
}


  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    runOCR(file);
  }

  useEffect(() => {
    function handlePaste(e) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type?.startsWith("image")) {
          const file = item.getAsFile();
          if (file) {
            setImageSrc(URL.createObjectURL(file));
            runOCR(file);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  function getScaledBoxes() {
    if (!imgRef.current || !words.length) return [];
    const img = imgRef.current;
    const displayW = img.clientWidth;
    const displayH = img.clientHeight;
    const naturalW = img.naturalWidth || displayW;
    const naturalH = img.naturalHeight || displayH;
    const scaleX = displayW / naturalW;
    const scaleY = displayH / naturalH;

    return words
      .map((w) => {
        if (!w || !w.bbox) return null;
        const b = w.bbox;
        return {
          text: w.text,
          x: b.x0 * scaleX,
          y: b.y0 * scaleY,
          width: Math.max(2, (b.x1 - b.x0) * scaleX),
          height: Math.max(2, (b.y1 - b.y0) * scaleY),
        };
      })
      .filter(Boolean);
  }

  const boxes = getScaledBoxes();

  function isMedicineWord(word) {
    if (!word) return false;
    return detectedMeds.some((m) => {
      const medName = typeof m === "string" ? m : m.name;
      return word.toLowerCase().includes(medName.toLowerCase());
    });
  }

  function highlightTextHtml(text) {
    if (!text) return "";
    let html = escapeHtml(text);
    if (!detectedMeds.length) return html;

    detectedMeds.forEach((m) => {
      const medName = typeof m === "string" ? m : m.name;
      if (!medName) return;

      const safe = escapeHtml(medName);
      const re = new RegExp(`\\b${escapeRegExp(safe)}\\b`, "gi");
      html = html.replace(re, `<mark class="ocr-mark">${safe}</mark>`);
    });

    return html;
  }

  function escapeHtml(s) {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function handleCaptureClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="ocr-container">
      <header className="ocr-header">
        <div className="header-icon">💊</div>
        <h1 className="ocr-title">Prescription Scanner</h1>
        <p className="ocr-sub">Scan prescriptions instantly with AI-powered OCR</p>
      </header>

      <div className="ocr-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="ocr-file"
          onChange={handleFile}
        />

        <div className="ocr-buttons">
          <button
            className="btn primary"
            onClick={handleCaptureClick}
            disabled={isWorking}
          >
            <span className="btn-icon">📷</span>
            <span>Scan Prescription</span>
          </button>

          <button
            className="btn secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isWorking}
          >
            <span className="btn-icon">📁</span>
            <span>Upload Image</span>
          </button>
        </div>

        {(isWorking || progress > 0) && (
          <div className="status-section">
            <div className="progress-wrap">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="status-text">
              {isWorking ? (
                <div className="pulse">
                  <span className="dot" />
                  <span className="pulse-text">Analyzing prescription...</span>
                </div>
              ) : progress === 100 ? (
                <div className="done-text">✓ Scan complete!</div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <main className="ocr-main">
        <section className="ocr-image-section">
          <div className="section-title">
            <h2>Scanned Image</h2>
            {imageSrc && <span className="badge">{detectedMeds.length} medicines detected</span>}
          </div>
          
          <div className="image-frame">
            {imageSrc ? (
              <>
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Scanned prescription"
                  className="preview-img"
                />
                {boxes.map((b, i) => {
                  const med = isMedicineWord(b.text);
                  return (
                    <div
                      key={i}
                      className={`box ${med ? "box-med" : "box-lite"}`}
                      style={{
                        left: b.x,
                        top: b.y,
                        width: b.width,
                        height: b.height,
                      }}
                    />
                  );
                })}
              </>
            ) : (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <p>No prescription scanned yet</p>
                <p className="empty-hint">Click "Scan Prescription" to get started</p>
              </div>
            )}
          </div>
        </section>

        <section className="ocr-results-section">
          <div className="section-title">
            <h2>Detected Medicines</h2>
          </div>

          {detectedMeds.length > 0 ? (
            <div className="med-grid">
              {detectedMeds.map((m, idx) => (
                <div 
                  key={idx} 
                  className="med-card"
                  onClick={() => setSelectedMed(selectedMed === idx ? null : idx)}
                >
                  <div className="med-header">
                    <div className="med-icon">💊</div>
                    <h3>{m.info?.name || m.name}</h3>
                    <button className="expand-btn">
                      {selectedMed === idx ? '−' : '+'}
                    </button>
                  </div>

                  {selectedMed === idx && m.info && (
                    <div className="med-details">
                      {m.info.use && (
                        <div className="detail-row">
                          <span className="detail-label">Purpose:</span>
                          <span className="detail-value">{m.info.use}</span>
                        </div>
                      )}
                      {m.info.dosage && (
                        <div className="detail-row">
                          <span className="detail-label">Dosage:</span>
                          <span className="detail-value">{m.info.dosage}</span>
                        </div>
                      )}
                      {m.info.instructions && (
                        <div className="detail-row">
                          <span className="detail-label">Instructions:</span>
                          <span className="detail-value">{m.info.instructions}</span>
                        </div>
                      )}
                      {m.info.sideEffects && (
                        <div className="detail-row warning">
                          <span className="detail-label">⚠️ Side Effects:</span>
                          <span className="detail-value">{m.info.sideEffects}</span>
                        </div>
                      )}
                      {m.info.avoid && (
                        <div className="detail-row danger">
                          <span className="detail-label">🚫 Avoid:</span>
                          <span className="detail-value">{m.info.avoid}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-meds">
              <div className="empty-icon">🔍</div>
              <p>No medicines detected yet</p>
              {ocrText && <p className="empty-hint">Try scanning a clearer image</p>}
            </div>
          )}

          {ocrText && (
            <details className="extracted-text-section">
              <summary>View Extracted Text</summary>
              <div
                className="ocr-text"
                dangerouslySetInnerHTML={{ __html: highlightTextHtml(ocrText) }}
              />
            </details>
          )}
        </section>
      </main>

      <footer className="ocr-footer">
        <p className="footer-note">
          💡 <strong>Tip:</strong> For best results, ensure good lighting and hold camera steady
        </p>
      </footer>
    </div>
  );
}
