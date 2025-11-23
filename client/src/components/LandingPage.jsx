import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/componentsCss/LandingPage.css";
import heroVideo from "../assets/bg-video.mp4";

export default function LuminaPage() {
  const navigate = useNavigate();
  const DRAW_DURATION = 900;
  const BRAIN_STAGGER = 90;
  const PERCENT_DURATION = 1400;
  const POST_COMPLETE_DELAY = 220;
  
  const loaderRef = useRef(null);
  const fillLineRef = useRef(null);
  const percentRef = useRef(null);
  const wordmarkRef = useRef(null);
  const brainPathsRef = useRef([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return token && user;
  };

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate("/dashboard/user");
    } else {
      navigate("/signin");
    }
  };

  /* LOADER PREPARATION */
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const brainPaths = Array.from(loader.querySelectorAll(".brain-svg .stroke"));
    brainPathsRef.current = brainPaths;

    const fillLine = loader.querySelector("#fill");
    fillLineRef.current = fillLine;

    const percentEl = loader.querySelector("#percent");
    percentRef.current = percentEl;

    const wordmark = loader.querySelector("#wordmark");
    wordmarkRef.current = wordmark;

    brainPaths.forEach((p) => {
      try {
        const len = Math.ceil(p.getTotalLength());
        p.style.strokeDasharray = `${len} ${len}`;
        p.style.strokeDashoffset = `${len}`;
        p.style.transition = `stroke-dashoffset ${DRAW_DURATION}ms cubic-bezier(.2,.9,.2,1)`;
      } catch (e) {
        console.log(e);
      }
    });

    if (fillLine) {
      try {
        const totalLen = Math.ceil(fillLine.getTotalLength());
        fillLine.style.strokeDasharray = `${totalLen} ${totalLen}`;
        fillLine.style.strokeDashoffset = `${totalLen}`;
      } catch (e) {
        console.log(e);
      }
    }

    setupWordmark(wordmark);

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) setTimeout(() => finish(loader), 150);
    else runSequence(loader);
  }, []);

  /* SIMPLE VIDEO AUTOPLAY - NO SCROLL EFFECTS */
  useEffect(() => {
    const video = document.getElementById("bgVideo");
    if (!video) return;

    video.muted = true;
    video.play().catch(() => {});
  }, []); // Empty dependency - runs only once

  /* FEATURES REVEAL */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    document.querySelectorAll(".feature").forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  function setupWordmark(node) {
    if (!node) return;
    const WORD = "LUMINA";
    node.innerHTML = "";

    WORD.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      node.appendChild(span);
    });
  }

  function runSequence(loader) {
    const brainPaths = brainPathsRef.current;
    const fillLine = fillLineRef.current;
    const percentEl = percentRef.current;

    let delay = 0;
    brainPaths.forEach((p) => {
      setTimeout(() => {
        try {
          p.style.strokeDashoffset = 0;
        } catch (e) {
          console.log(e);
        }
      }, delay);
      delay += BRAIN_STAGGER + DRAW_DURATION;
    });

    const chars = Array.from(document.querySelectorAll(".wordmark .char"));
    chars.forEach((ch, i) => setTimeout(() => ch.classList.add("visible"), 160 + i * 120));

    const wait = DRAW_DURATION + BRAIN_STAGGER * brainPaths.length + chars.length * 120;

    setTimeout(() => {
      if (percentEl) percentEl.classList.add("show");

      if (fillLine) {
        // const total = fillLine.getTotalLength();
        fillLine.style.transition = `stroke-dashoffset ${PERCENT_DURATION}ms linear`;
        fillLine.getBoundingClientRect();
        fillLine.style.strokeDashoffset = 0;
      }

      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / PERCENT_DURATION);
        percentEl.textContent = `${Math.round(t * 100)}%`;
        if (t < 1) requestAnimationFrame(step);
        else setTimeout(() => finish(loader), POST_COMPLETE_DELAY);
      }
      requestAnimationFrame(step);
    }, wait);
  }

  function finish(loader) {
    loader?.classList.add("hidden");
    setTimeout(() => setLoading(false), 120);
  }

  return (
    <div className="lumina-root">
      {loading && (
        <div id="loader" ref={loaderRef} className="loader-overlay">
          <div className="loader-card">
            <div className="brain-wrap">
              <svg className="brain-svg" viewBox="0 0 520 360">
                <path className="stroke" d="M95 200c-8-50 22-110 86-124 46-11 96 7 132 36 46 38 78 92 50 154-21 44-70 56-120 50-54-6-110-28-148-116z" />
                <path className="stroke" d="M150 160c-14 18-14 36-6 52 11 22 36 32 62 26 26-6 32-24 26-44-5-17-22-36-48-30-16 4-29 12-34 36z" />
                <path className="stroke" d="M370 148c14 18 12 36 4 54-10 22-36 34-62 28-26-6-34-24-30-44 3-16 18-36 44-30 16 4 30 12 44 36z" />
                <path className="stroke" d="M260 110c8 6 10 12 12 18 2 8 0 14-2 20" />
                <path className="stroke" d="M205 180c18-6 34-2 50 6 10 5 22 8 34 6" />
                <path className="stroke" d="M320 198c16-6 30-10 44-8 8 1 18 4 24 10" />
                <path className="stroke" d="M230 230c12 8 28 12 42 10 10-2 20-6 28-12" />
              </svg>
            </div>
            <div id="wordmark" ref={wordmarkRef} className="wordmark"></div>
          </div>
          <div id="percent" ref={percentRef} className="percent-badge" style={{width: "100", display: "none"}}>0%</div>
        </div>
      )}

      <main id="landing" className={`landing-root ${loading ? "hidden-by-loader" : "visible"}`}>
        <section className="hero">
          <h1 className="hero-title">LUMINA</h1>
          <p className="hero-sub">
            Your journey to mental and emotional well-being begins with a single light—let Lumina guide you with care and insight.
          </p>
          <div className="cta-row">
            <button className="btn primary" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </section>

        {/* Static background video - just loops continuously */}
        <div className="video-layer">
          <video
            id="bgVideo"
            src={heroVideo}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          />
        </div>
{/* Features intro */}
          <section className="lumina-section lumina-section-alt" id="features">
            <div className="lumina-container">
              <h2 className="lumina-section-heading">All your mental &amp; general health in one calm view</h2>
              <p className="lumina-section-sub">
                LUMINA brings together mood tracking, meals, outcomes and risk
                signals, image analysis, mindfulness, and a thoughtful AI
                companion—so you can notice patterns early and act with support.
              </p>

              <div className="lumina-features-grid">
                {/* Mood Tracker */}
                <div className="feature">
                  <div className="feature-card">
                    <div className="feature-tag">Daily signal</div>
                    <h3 className="feature-title">User Mood Tracker</h3>
                    <p className="feature-body">
                      Log how you feel in seconds using simple sliders or
                      emojis. LUMINA turns your daily check-ins into gentle
                      patterns—highs, lows, triggers, and recovery arcs.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Streak-friendly prompts
                      </div>
                      <div className="feature-meta-pill">
                        Mood &amp; energy graphs
                      </div>
                    </div>
                  </div>
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Mood over time
                      </div>
                      <div className="feature-visual-main">🙂 😊 😐 😟 🙃</div>
                      <div className="feature-visual-sub">
                        Micro trends across days and weeks.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meal Tracker */}
                <div className="feature">
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Gentle meal card
                      </div>
                      <div className="feature-visual-main">MEAL • BALANCED</div>
                      <div className="feature-visual-sub">
                        Proteins, plants, patterns—not calorie anxiety.
                      </div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-tag">Nourish</div>
                    <h3 className="feature-title">
                      Meal Tracker (Meal Info)
                    </h3>
                    <p className="feature-body">
                      Capture what you eat with simple tags instead of
                      overwhelming numbers. LUMINA focuses on balance, timing,
                      and how meals connect to mood and energy.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Gentle nutrition cues
                      </div>
                      <div className="feature-meta-pill">
                        Meal &amp; mood linkage
                      </div>
                    </div>
                  </div>
                </div>

                {/* OSR Analysis */}
                <div className="feature">
                  <div className="feature-card">
                    <div className="feature-tag">Clarity</div>
                    <h3 className="feature-title">OSR Analysis</h3>
                    <p className="feature-body">
                      Outcome / Symptom / Risk analysis that compresses scattered
                      notes into a simple snapshot. See what&apos;s improving,
                      what needs attention, and when to seek more help.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Outcome snapshots
                      </div>
                      <div className="feature-meta-pill">
                        Gentle risk flags
                      </div>
                    </div>
                  </div>
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">OSR radar</div>
                      <div className="feature-visual-main">
                        OUTCOME • SYMPTOM • RISK
                      </div>
                      <div className="feature-visual-sub">
                        One simple panel to see the week.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Analysis */}
                <div className="feature">
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Image triage preview
                      </div>
                      <div className="feature-visual-main">
                        IMAGE • ANALYSIS
                      </div>
                      <div className="feature-visual-sub">
                        X-rays, scans, or photos—early AI-supported context.
                      </div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-tag">Context</div>
                    <h3 className="feature-title">Image Analysis</h3>
                    <p className="feature-body">
                      Upload health images such as scans or photos and receive
                      AI-generated descriptions and triage suggestions that you
                      can discuss with clinicians—not as a diagnosis, but as a
                      starting point.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Visual change over time
                      </div>
                      <div className="feature-meta-pill">
                        Shareable with care teams
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mindfulness */}
                <div className="feature">
                  <div className="feature-card">
                    <div className="feature-tag">Reset</div>
                    <h3 className="feature-title">Mindfulness</h3>
                    <p className="feature-body">
                      Short, guided moments of grounding, breathing, and gentle
                      reflection. Built to fit between meetings, classes, or
                      caregiving—without pressure to perform.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        2–5 minute practices
                      </div>
                      <div className="feature-meta-pill">
                        Ambient sound suggestions
                      </div>
                    </div>
                  </div>
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Breath session
                      </div>
                      <div className="feature-visual-main">IN • OUT • PAUSE</div>
                      <div className="feature-visual-sub">
                        Follow a calm arc, not a timer.
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Chatbot */}
                <div className="feature">
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Conversation snippet
                      </div>
                      <div className="feature-visual-main">"I feel off today."</div>
                      <div className="feature-visual-sub">
                        LUMINA: &ldquo;Let&apos;s unpack that together.&rdquo;
                      </div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-tag">Companion</div>
                    <h3 className="feature-title">AI Chatbot</h3>
                    <p className="feature-body">
                      Talk to LUMINA about how you feel, any time. A calm,
                      always-available companion that remembers context, reflects
                      patterns back to you, and nudges you toward next steps.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Context-aware support
                      </div>
                      <div className="feature-meta-pill">
                        Boundary-respecting design
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your Report */}
                <div className="feature">
                  <div className="feature-card">
                    <div className="feature-tag">Perspective</div>
                    <h3 className="feature-title">Your Report</h3>
                    <p className="feature-body">
                      Periodic summaries that weave together your mood, meals,
                      sleep, and symptoms. Understand your week at a glance and
                      carry a single report into sessions if you choose.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Weekly and monthly views
                      </div>
                      <div className="feature-meta-pill">
                        Downloadable summaries
                      </div>
                    </div>
                  </div>
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Insight snapshot
                      </div>
                      <div className="feature-visual-main">
                        THIS WEEK • 72% STABLE
                      </div>
                      <div className="feature-visual-sub">
                        Subtle shifts, clearly explained.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mental Test */}
                <div className="feature">
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Questionnaire state
                      </div>
                      <div className="feature-visual-main">MENTAL TEST • 8/16</div>
                      <div className="feature-visual-sub">
                        Evidence-informed questions, gentle language.
                      </div>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-tag">Insight</div>
                    <h3 className="feature-title">Mental Test</h3>
                    <p className="feature-body">
                      Structured, evidence-inspired questionnaires that help you
                      notice patterns in mood and function. See scores with
                      clear context and suggestions—not labels.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Short &amp; repeatable
                      </div>
                      <div className="feature-meta-pill">
                        Track change over time
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Page */}
                <div className="feature">
                  <div className="feature-card">
                    <div className="feature-tag">Belonging</div>
                    <h3 className="feature-title">Community Page</h3>
                    <p className="feature-body">
                      A safe, moderated space to share lived experiences,
                      strategies, and support. Built with community guidelines
                      and guardrails baked in from day one.
                    </p>
                    <div className="feature-meta-row">
                      <div className="feature-meta-pill">
                        Moderated threads
                      </div>
                      <div className="feature-meta-pill">
                        No public metrics
                      </div>
                    </div>
                  </div>
                  <div className="feature-visual" aria-hidden="true">
                    <div className="feature-visual-inner">
                      <div className="feature-visual-label">
                        Community space
                      </div>
                      <div className="feature-visual-main">YOU&apos;RE NOT ALONE</div>
                      <div className="feature-visual-sub">
                        Quiet circles instead of noisy feeds.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why LUMINA */}
          <section className="lumina-section lumina-section-light">
            <div className="lumina-container">
              <h2 className="lumina-section-heading">Why LUMINA?</h2>
              <p className="lumina-section-sub" style={{ color: "#555" }}>
                A companion built for modern life: grounded in research, careful
                with your data, and designed to feel like a soft place to land
                on the days you need it most.
              </p>

              <div className="lumina-why-grid">
                <div className="lumina-why-card">
                  <h3 className="lumina-why-title">Evidence-informed</h3>
                  <ul className="lumina-why-list">
                    <li>
                      Inspired by clinical best practices and emerging
                      literature.
                    </li>
                    <li>
                      Built to complement—not replace—professional care.
                    </li>
                    <li>
                      Iterates with feedback from users and experts.
                    </li>
                  </ul>
                </div>
                <div className="lumina-why-card">
                  <h3 className="lumina-why-title">Privacy-first</h3>
                  <ul className="lumina-why-list">
                    <li>
                      Clear controls over what you store and what you share.
                    </li>
                    <li>Encryption and safety reviews as a baseline.</li>
                    <li>
                      No surprise ads or dark patterns around your data.
                    </li>
                  </ul>
                </div>
                <div className="lumina-why-card">
                  <h3 className="lumina-why-title">Compassionate design</h3>
                  <ul className="lumina-why-list">
                    <li>
                      Language that talks with you, not at you or about you.
                    </li>
                    <li>No "doom charts"—only supportive, clear visuals.</li>
                    <li>
                      Built around small steps and everyday wins, not
                      perfection.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

        <footer className="footer">
          <div style={{ textAlign: "center", padding: 28 }}>© LUMINA</div>
        </footer>
      </main>
    </div>
  );
}
