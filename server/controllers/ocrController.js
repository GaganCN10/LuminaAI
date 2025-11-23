const axios = require("axios");

// --- SAFE LEVENSHTEIN (STRONGER FILTER, MUCH LESS FALSE POSITIVE) ---
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

// --- MAIN DETECTION FUNCTION ---
exports.detectMedicines = async (req, res) => {
  try {
    const { text } = req.body;

    console.log("OCR Text Received:", text);

    if (!text || text.trim().length === 0) {
      return res.json({ medicines: [] });
    }

    // 🎯 Only REAL medicines in DB
    const medicinesDB = [
  "paracetamol",
  "dolo",
  "crocin",
  "calpol",
  "neurofen",
  "ibuprofen",
  "diclofenac",
  "ketorolac",
  "aspirin",
  "amoxicillin",
  "augmentin",
  "azithromycin",
  "cefixime",
  "ofloxacin",
  "doxycycline",
  "metformin",
  "glimepiride",
  "sitagliptin",
  "atorvastatin",
  "rosuvastatin",
  "pantoprazole",
  "omeprazole",
  "rabeprazole",
  "esomeprazole",
  "levocetirizine",
  "cetirizine",
  "fexofenadine",
  "montelukast",
  "vitamin",
  "vitaminc",
  "vitamind",
  "bcomplex",
  "oral",
  "ors",
  "zincovit",
  "betadine",
  "metronidazole",
  "ondansetron",
  "domperidone",
  "cyclopam",
  "tamsulosin",
  "losartan",
  "amlodipine",
  "telmisartan"
];
const medicineInfo = {
  paracetamol: {
    name: "Paracetamol (Acetaminophen)",
    use: "Fever, mild pain relief",
    dosage: "500–1000 mg every 6 hours (max 3000 mg/day)",
    instructions: "Safe on empty stomach. Do not exceed daily limit.",
    avoid: "Avoid in severe liver disease.",
    sideEffects: "Very safe; rare nausea or rash."
  },

  dolo: {
    name: "Dolo 650",
    use: "Fever, body pain",
    dosage: "650 mg every 6–8 hours",
    instructions: "Do not exceed 3 tablets/day.",
    avoid: "Avoid in liver issues.",
    sideEffects: "Nausea, rare skin allergy."
  },

  crocin: {
    name: "Crocin",
    use: "Fever and pain relief",
    dosage: "500–650 mg every 6 hours",
    instructions: "Avoid overdose.",
    avoid: "Liver disease.",
    sideEffects: "Generally safe."
  },

  ibuprofen: {
    name: "Ibuprofen",
    use: "Pain relief, fever, inflammation",
    dosage: "200–400 mg every 6–8 hours",
    instructions: "Take after food.",
    avoid: "Stomach ulcers, kidney issues, pregnancy.",
    sideEffects: "Acidity, stomach pain."
  },

  diclofenac: {
    name: "Diclofenac",
    use: "Back pain, joint pain, inflammation",
    dosage: "50 mg twice daily",
    instructions: "Always take after food.",
    avoid: "Kidney disease, gastric bleeding.",
    sideEffects: "Acidity, nausea."
  },

  ketorolac: {
    name: "Ketorolac",
    use: "Severe pain (short term only)",
    dosage: "10 mg every 6 hours",
    instructions: "Not for long-term use.",
    avoid: "Ulcers, kidney issues.",
    sideEffects: "Strong acidity, dizziness."
  },

  aspirin: {
    name: "Aspirin",
    use: "Pain, fever, heart protection",
    dosage: "75 mg daily (heart), 325–500 mg for pain",
    instructions: "Take with food.",
    avoid: "Bleeding disorders.",
    sideEffects: "Stomach bleeding (rare)."
  },

  amoxicillin: {
    name: "Amoxicillin",
    use: "Bacterial infections",
    dosage: "250–500 mg every 8 hours",
    instructions: "Complete full course.",
    avoid: "Penicillin allergy.",
    sideEffects: "Rash, stomach upset."
  },

  augmentin: {
    name: "Augmentin (Amoxicillin + Clavulanic Acid)",
    use: "Strong bacterial infections",
    dosage: "625 mg twice a day",
    instructions: "Take after food.",
    avoid: "Penicillin allergy.",
    sideEffects: "Loose motions, nausea."
  },

  azithromycin: {
    name: "Azithromycin",
    use: "Throat, chest infections",
    dosage: "500 mg on day 1, then 250 mg for 2–4 days",
    instructions: "Take 1 hour before food.",
    avoid: "Heart rhythm issues.",
    sideEffects: "Diarrhea, stomach cramps."
  },

  cefixime: {
    name: "Cefixime",
    use: "Bacterial infections (ENT, urinary, respiratory)",
    dosage: "200 mg twice daily",
    instructions: "Take with or without food.",
    avoid: "Severe kidney issues.",
    sideEffects: "Loose motion, allergy."
  },

  doxycycline: {
    name: "Doxycycline",
    use: "Skin infections, acne, chest infections",
    dosage: "100 mg twice daily",
    instructions: "Do not lie down immediately after taking.",
    avoid: "Pregnancy.",
    sideEffects: "Acidity, nausea."
  },

  pantoprazole: {
    name: "Pantoprazole",
    use: "Acidity, GERD",
    dosage: "40 mg once daily",
    instructions: "Take 30 min before breakfast.",
    avoid: "Severe liver disease.",
    sideEffects: "Headache."
  },

  omeprazole: {
    name: "Omeprazole",
    use: "Acidity, ulcers",
    dosage: "20–40 mg daily",
    instructions: "Take in the morning.",
    avoid: "Liver issues.",
    sideEffects: "Headache, constipation."
  },

  rabeprazole: {
    name: "Rabeprazole",
    use: "Acidity and GERD",
    dosage: "20 mg daily",
    instructions: "Before breakfast.",
    avoid: "Severe liver disease.",
    sideEffects: "Mild headache."
  },

  esomeprazole: {
    name: "Esomeprazole",
    use: "Acid reflux, gastritis",
    dosage: "20–40 mg daily",
    instructions: "Empty stomach.",
    avoid: "Liver problems.",
    sideEffects: "Nausea."
  },

  metformin: {
    name: "Metformin",
    use: "Type-2 diabetes",
    dosage: "500–850 mg twice daily",
    instructions: "Take with food.",
    avoid: "Kidney issues.",
    sideEffects: "Stomach upset."
  },

  glimepiride: {
    name: "Glimepiride",
    use: "Diabetes (blood sugar control)",
    dosage: "1–4 mg daily",
    instructions: "Take with breakfast.",
    avoid: "Low blood sugar risk.",
    sideEffects: "Hypoglycemia."
  },

  sitagliptin: {
    name: "Sitagliptin",
    use: "Type-2 diabetes",
    dosage: "50–100 mg daily",
    instructions: "Anytime of day.",
    avoid: "Kidney issues.",
    sideEffects: "Mild stomach pain."
  },

  atorvastatin: {
    name: "Atorvastatin",
    use: "Cholesterol control",
    dosage: "10–40 mg at night",
    instructions: "Take once daily.",
    avoid: "Liver issues.",
    sideEffects: "Muscle pain (rare)."
  },

  rosuvastatin: {
    name: "Rosuvastatin",
    use: "Cholesterol reduction",
    dosage: "5–20 mg daily",
    instructions: "Night time preferred.",
    avoid: "Liver disease.",
    sideEffects: "Muscle ache."
  },

  levocetirizine: {
    name: "Levocetirizine",
    use: "Allergy, cold, sneezing",
    dosage: "5 mg at night",
    instructions: "May cause sleepiness.",
    avoid: "Driving immediately after.",
    sideEffects: "Drowsiness."
  },

  cetirizine: {
    name: "Cetirizine",
    use: "Allergy symptoms",
    dosage: "10 mg daily",
    instructions: "Best taken at night.",
    avoid: "Driving.",
    sideEffects: "Drowsiness."
  },

  vitamin: {
    name: "Multivitamin",
    use: "General health, energy, immunity",
    dosage: "Once daily",
    instructions: "Take after breakfast.",
    avoid: "Kidney stones (high vitamin C).",
    sideEffects: "Mild stomach upset."
  }
};

    // Split OCR text into clean words
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")  // remove symbols
      .split(/\s+/)
      .filter(w => w.length >= 4);   // ignore very short noise words

    const medsFound = new Set();

    for (const word of words) {
  for (let med of medicinesDB) {
      
    // 1️⃣ Substring check (very effective for OCR)
    if (word.includes(med.slice(0, 3))) {
      medsFound.add(med);
      continue;
    }

    // 2️⃣ Fuzzy match — allow bigger distance for handwriting
    const dist = levenshtein(word, med);

    // dynamic threshold based on length
    const maxDist = med.length <= 6 ? 2 : 3;

    if (dist <= maxDist) {
      medsFound.add(med);
    }
  }
}


   const result = Array.from(medsFound).map(med => ({
    name: med,
    info: medicineInfo[med] || null
    }));

    return res.json({ medicines: result });


  } catch (err) {
    console.error("Detection error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};