const express = require('express');
const router = express.Router();

// --- LEVENSHTEIN DISTANCE FUNCTION ---
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

// --- MEDICINE DATABASE ---
const medicinesDB = [
  "paracetamol", "dolo", "crocin", "calpol", "neurofen",
  "ibuprofen", "diclofenac", "ketorolac", "aspirin",
  "amoxicillin", "augmentin", "azithromycin", "cefixime",
  "ofloxacin", "doxycycline", "metformin", "glimepiride",
  "sitagliptin", "atorvastatin", "rosuvastatin",
  "pantoprazole", "omeprazole", "rabeprazole", "esomeprazole",
  "levocetirizine", "cetirizine", "fexofenadine", "montelukast",
  "vitamin", "vitaminc", "vitamind", "bcomplex",
  "oral", "ors", "zincovit", "betadine",
  "metronidazole", "ondansetron", "domperidone", "cyclopam",
  "tamsulosin", "losartan", "amlodipine", "telmisartan"
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
  azithromycin: {
    name: "Azithromycin",
    use: "Throat, chest infections",
    dosage: "500 mg on day 1, then 250 mg for 2–4 days",
    instructions: "Take 1 hour before food.",
    avoid: "Heart rhythm issues.",
    sideEffects: "Diarrhea, stomach cramps."
  },
  omeprazole: {
    name: "Omeprazole",
    use: "Acidity, ulcers",
    dosage: "20–40 mg daily",
    instructions: "Take in the morning.",
    avoid: "Liver issues.",
    sideEffects: "Headache, constipation."
  },
  metformin: {
    name: "Metformin",
    use: "Type-2 diabetes",
    dosage: "500–850 mg twice daily",
    instructions: "Take with food.",
    avoid: "Kidney issues.",
    sideEffects: "Stomach upset."
  },
  atorvastatin: {
    name: "Atorvastatin",
    use: "Cholesterol control",
    dosage: "10–40 mg at night",
    instructions: "Take once daily.",
    avoid: "Liver issues.",
    sideEffects: "Muscle pain (rare)."
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

// --- DETECTION ENDPOINT ---
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;

    console.log("📥 OCR Text Received:", text);

    if (!text || text.trim().length === 0) {
      return res.json({ medicines: [] });
    }

    // Split OCR text into clean words
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3);

    console.log("🔍 Words extracted:", words);

    const medsFound = new Set();

    // In the detection loop, make it stricter:
for (const word of words) {
  for (let med of medicinesDB) {
    // 1️⃣ Exact match (best)
    if (word === med) {
      console.log(`✅ Exact match: "${word}" → ${med}`);
      medsFound.add(med);
      continue;
    }

    // 2️⃣ Substring check (word contains medicine name)
    if (word.length >= 5 && word.includes(med)) {
      console.log(`✅ Substring match: "${word}" → ${med}`);
      medsFound.add(med);
      continue;
    }

    // 3️⃣ Fuzzy match (stricter threshold)
    const dist = levenshtein(word, med);
    const maxDist = med.length <= 5 ? 1 : 2; // Stricter: only allow 1-2 char difference

    if (dist <= maxDist) {
      console.log(`✅ Fuzzy match: "${word}" → ${med} (distance: ${dist})`);
      medsFound.add(med);
    }
  }
}


    const result = Array.from(medsFound).map(med => ({
      name: med,
      info: medicineInfo[med] || {
        name: med,
        use: "Information not available",
        dosage: "Consult your doctor",
        instructions: "Take as prescribed",
        avoid: "Consult your doctor",
        sideEffects: "Consult your doctor"
      }
    }));

    console.log(`✅ Detected ${result.length} medicines:`, result.map(m => m.name));

    return res.json({ medicines: result });

  } catch (err) {
    console.error("❌ Detection error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
