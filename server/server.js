const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const i18next = require('./i18n'); // Add this
const middleware = require('i18next-http-middleware'); // Add this
const medicalAnalysisRoutes = require('./routes/medicalAnalysis.js');
const path = require('path');
const bodyParser = require('body-parser');
const screeningController = require('./controllers/screeningController.js');
const screeningRoutes = require('./routes/screening');
const webpush = require('web-push');
const ocrRoutes = require('./routes/ocr');

dotenv.config({ path: './.env' });
const subscriptions = [];
const PUBLIC_VAPID_KEY = 'BPuXII5pz5rAa1mmjn9CLXz9n1boWdyfWfX2c4tXYmfH_jfQWxjmPA-g3IH6zA6Z7sFjFDjukv3LyzxuxRsJrE8';
const PRIVATE_VAPID_KEY = '40XPCZgDrO4VFRolloOu95YEAydqPTe_XWnGOanYmcg';
const app = express();
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'] // Add Accept-Language
}));

app.use(middleware.handle(i18next)); // Add this before other middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();
app.use(bodyParser.json());

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/chat', require('./routes/chat'));
app.use("/api/report", require("./routes/report"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/image-analysis', require('./routes/imageAnalysis'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/ocr', ocrRoutes);
app.use('/api/medical', medicalAnalysisRoutes);
app.use('/api/screening', screeningRoutes);

app.post('/api/recommendations', async (req, res) => {
  console.log('🎯 Wellness Recommendations endpoint called');
  
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        details: 'GEMINI_API_KEY not found' 
      });
    }

    // ===== CURATED POOL OF VERIFIED RESOURCES =====
    const resourcePool = {
      youtube: [
        {
          title: "10 Minute Guided Meditation for Anxiety",
          channel: "The Mindful Movement",
          url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
          tags: ["meditation", "anxiety", "beginners", "calm"]
        },
        {
          title: "Breathing Exercises for Panic Attacks",
          channel: "Therapy in a Nutshell",
          url: "https://www.youtube.com/watch?v=tEmt1Znux58",
          tags: ["anxiety", "panic", "breathing", "techniques"]
        },
        {
          title: "Understanding Depression - What You Need to Know",
          channel: "Psych2Go",
          url: "https://www.youtube.com/watch?v=z-IR48Mb3W0",
          tags: ["depression", "education", "awareness", "information"]
        },
        {
          title: "15 Minute Yoga for Stress Relief",
          channel: "Yoga With Adriene",
          url: "https://www.youtube.com/watch?v=_zbtKeeAa-Y",
          tags: ["yoga", "stress", "movement", "relaxation"]
        },
        {
          title: "How to Stop Overthinking",
          channel: "Therapy in a Nutshell",
          url: "https://www.youtube.com/watch?v=bEusrD8g-dM",
          tags: ["anxiety", "overthinking", "cognitive", "mental-clarity"]
        },
        {
          title: "Sleep Meditation - Deep Relaxation",
          channel: "Jason Stephenson",
          url: "https://www.youtube.com/watch?v=aEqlQvczMJQ",
          tags: ["sleep", "meditation", "relaxation", "night"]
        },
        {
          title: "5 Ways to Help Someone with Mental Health",
          channel: "Psych2Go",
          url: "https://www.youtube.com/watch?v=IYBKrkMxJiM",
          tags: ["support", "relationships", "help", "empathy"]
        },
        {
          title: "Dealing with Social Anxiety",
          channel: "Therapy in a Nutshell",
          url: "https://www.youtube.com/watch?v=jT0w2UTn39c",
          tags: ["social-anxiety", "confidence", "exposure", "coping"]
        }
      ],
      spotify: [
        {
          title: "Peaceful Piano",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
          tags: ["piano", "calm", "instrumental", "study"]
        },
        {
          title: "Deep Focus",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
          tags: ["focus", "ambient", "concentration", "work"]
        },
        {
          title: "Chill Vibes",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DX889U0CL85jj",
          tags: ["chill", "modern", "upbeat", "relaxed"]
        },
        {
          title: "Nature Sounds",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWVFeEut75IAL",
          tags: ["nature", "sleep", "ambient", "rain"]
        },
        {
          title: "Ambient Relaxation",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWWoe1EYwFmKc",
          tags: ["ambient", "relaxation", "calm", "stress-relief"]
        },
        {
          title: "Lo-Fi Beats",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
          tags: ["lofi", "beats", "study", "chill"]
        },
        {
          title: "Sleep",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
          tags: ["sleep", "night", "calm", "rest"]
        },
        {
          title: "Stress Relief",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP",
          tags: ["stress", "relief", "calm", "peace"]
        }
      ],
      reading: [
        {
          title: "Mental Health Resources",
          author: "Mental Health America",
          url: "https://www.mhanational.org/mental-health-resources",
          tags: ["general", "resources", "support", "comprehensive"]
        },
        {
          title: "Coping with Stress and Anxiety",
          author: "CDC",
          url: "https://www.cdc.gov/mental-health/stress-coping/cope-with-stress/index.html",
          tags: ["stress", "coping", "techniques", "evidence-based"]
        },
        {
          title: "Caring for Your Mental Health",
          author: "NIMH",
          url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
          tags: ["selfcare", "tips", "wellness", "mental-health"]
        },
        {
          title: "Understanding Anxiety Disorders",
          author: "ADAA",
          url: "https://adaa.org/understanding-anxiety",
          tags: ["anxiety", "education", "treatment", "information"]
        },
        {
          title: "Getting Started with Mindfulness",
          author: "Mindful.org",
          url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
          tags: ["mindfulness", "meditation", "beginners", "practice"]
        },
        {
          title: "Depression Information and Support",
          author: "NIMH",
          url: "https://www.nimh.nih.gov/health/topics/depression",
          tags: ["depression", "information", "treatment", "support"]
        },
        {
          title: "Self-Care for Mental Health",
          author: "Psychology Today",
          url: "https://www.psychologytoday.com/us/basics/self-care",
          tags: ["selfcare", "wellness", "tips", "mental-health"]
        },
        {
          title: "Anxiety and Stress Management",
          author: "HelpGuide",
          url: "https://www.helpguide.org/articles/stress/stress-management.htm",
          tags: ["stress", "anxiety", "management", "techniques"]
        }
      ],
      exercise: [
        {
          title: "Walking for Mental Health",
          type: "Aerobic Exercise",
          duration: "20-30 minutes daily",
          description: "Simple daily walks can significantly reduce symptoms of depression and anxiety",
          tags: ["walking", "outdoors", "easy", "beginner"]
        },
        {
          title: "Yoga for Depression and Anxiety",
          type: "Mind-Body Exercise",
          duration: "45-60 minutes, 2-3x per week",
          description: "Gentle yoga poses combined with breathing exercises help calm the mind",
          tags: ["yoga", "breathing", "flexibility", "mindfulness"]
        },
        {
          title: "Strength Training for Mood",
          type: "Resistance Exercise",
          duration: "30-45 minutes, 2-3x per week",
          description: "Weightlifting or bodyweight exercises boost confidence and reduce stress",
          tags: ["strength", "weights", "confidence", "empowerment"]
        },
        {
          title: "Jogging or Running",
          type: "Aerobic Exercise",
          duration: "20-30 minutes, 3-5x per week",
          description: "Running releases endorphins and provides structured routine",
          tags: ["running", "cardio", "endorphins", "outdoors"]
        },
        {
          title: "Dance Movement",
          type: "Aerobic Exercise",
          duration: "30-45 minutes, 2-3x per week",
          description: "Dancing combines exercise with creative expression and joy",
          tags: ["dance", "fun", "creative", "social"]
        },
        {
          title: "Tai Chi or Qigong",
          type: "Mind-Body Exercise",
          duration: "30-45 minutes, 2-3x per week",
          description: "Slow, deliberate movements promote mental focus and stress reduction",
          tags: ["tai-chi", "balance", "meditation", "gentle"]
        },
        {
          title: "Swimming",
          type: "Aerobic Exercise",
          duration: "30 minutes, 2-3x per week",
          description: "Low-impact full-body exercise in a calming aquatic environment",
          tags: ["swimming", "water", "low-impact", "full-body"]
        },
        {
          title: "Stretching and Flexibility",
          type: "Gentle Movement",
          duration: "10-15 minutes daily",
          description: "Daily stretching releases physical tension and improves body awareness",
          tags: ["stretching", "flexibility", "tension-release", "daily"]
        }
      ]
    };

    // ===== GET USER PREFERENCES (if provided) =====
    const userPreferences = req.body.preferences || "general mental wellness and stress relief";
    const focusAreas = req.body.focusAreas || ["anxiety", "stress", "depression"];

    // ===== USE GEMINI TO SELECT & PERSONALIZE =====
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `You are a compassionate mental health wellness assistant. Based on the user's needs, select the 3 most helpful resources from each category.

User needs: "${userPreferences}"
Focus areas: ${focusAreas.join(", ")}

Available resources:
${JSON.stringify(resourcePool, null, 2)}

TASK: Return ONLY a JSON object with this EXACT structure:
{
  "youtube": [
    {
      "title": "exact title from pool",
      "channel": "exact channel from pool",
      "url": "exact url from pool",
      "description": "write a supportive, personalized description (10-15 words)"
    }
  ],
  "spotify": [
    {
      "title": "exact title from pool",
      "artist": "exact artist from pool",
      "url": "exact url from pool",
      "description": "write a supportive, personalized description (10-15 words)"
    }
  ],
  "reading": [
    {
      "title": "exact title from pool",
      "author": "exact author from pool",
      "url": "exact url from pool",
      "description": "write a supportive, personalized description (10-15 words)"
    }
  ],
  "exercise": [
    {
      "title": "exact title from pool",
      "type": "exact type from pool",
      "duration": "exact duration from pool",
      "description": "write a supportive, personalized description (10-15 words)"
    }
  ]
}

CRITICAL RULES:
1. Select EXACTLY 3 items from EACH of the 4 categories
2. Copy ALL fields (title, channel/artist/author/type, url/duration) EXACTLY as provided in the pool
3. ONLY write NEW descriptions that are warm, supportive, and personalized to the user's needs
4. Match selections to user's focus areas when possible
5. Return ONLY valid JSON - no markdown, no explanations, no extra text`;

    console.log('📤 Sending request to Gemini API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('No content received from Gemini');
    }

    console.log('📥 Received response from Gemini');

    // ===== EXTRACT AND PARSE JSON =====
    // Remove markdown code blocks if present
    textContent = textContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Extract JSON object
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response');
      throw new Error('No JSON object found in Gemini response');
    }

    let recommendations;
    try {
      recommendations = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed JSON');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      // Try to fix common JSON issues
      try {
        const fixedJson = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
          .replace(/'/g, '"')              // Replace single quotes
          .replace(/(\w+):/g, '"$1":');    // Quote unquoted keys
        
        recommendations = JSON.parse(fixedJson);
        console.log('✅ Successfully parsed with fixes');
      } catch (fixError) {
        throw new Error(`JSON parsing failed: ${parseError.message}`);
      }
    }

    // ===== VALIDATE STRUCTURE =====
    if (!recommendations.youtube || !recommendations.spotify || 
        !recommendations.reading || !recommendations.exercise) {
      throw new Error('Invalid structure - missing required categories');
    }

    if (recommendations.youtube.length !== 3 || 
        recommendations.spotify.length !== 3 || 
        recommendations.reading.length !== 3 ||
        recommendations.exercise.length !== 3) {
      console.warn('⚠️ Incorrect number of items in some categories');
    }

    // ===== SECURITY CHECK: Verify URLs are from our pool =====
    const poolUrls = [
      ...resourcePool.youtube.map(r => r.url),
      ...resourcePool.spotify.map(r => r.url),
      ...resourcePool.reading.map(r => r.url)
    ];

    const recommendedUrls = [
      ...recommendations.youtube.map(r => r.url),
      ...recommendations.spotify.map(r => r.url),
      ...recommendations.reading.map(r => r.url)
    ];

    const allUrlsValid = recommendedUrls.every(url => poolUrls.includes(url));
    if (!allUrlsValid) {
      console.error('⚠️ Some URLs not from pool - potential security issue');
      throw new Error('Invalid URLs detected');
    }

    console.log('✅ Successfully generated personalized recommendations');
    console.log(`   YouTube: ${recommendations.youtube.length} videos`);
    console.log(`   Spotify: ${recommendations.spotify.length} playlists`);
    console.log(`   Reading: ${recommendations.reading.length} articles`);
    console.log(`   Exercise: ${recommendations.exercise.length} tips`);

    res.json(recommendations);

  } catch (error) {
    console.error('❌ ERROR in recommendations endpoint:', error.message);
    
    // ===== FALLBACK: Return curated selections =====
    const fallback = {
      youtube: [
        {
          title: "10 Minute Guided Meditation for Anxiety",
          channel: "The Mindful Movement",
          url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
          description: "Start your journey with this calming guided meditation"
        },
        {
          title: "Breathing Exercises for Panic Attacks",
          channel: "Therapy in a Nutshell",
          url: "https://www.youtube.com/watch?v=tEmt1Znux58",
          description: "Learn practical techniques to manage overwhelming moments"
        },
        {
          title: "15 Minute Yoga for Stress Relief",
          channel: "Yoga With Adriene",
          url: "https://www.youtube.com/watch?v=_zbtKeeAa-Y",
          description: "Gentle movements to release tension and find peace"
        }
      ],
      spotify: [
        {
          title: "Peaceful Piano",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
          description: "Soothing piano melodies to calm your mind"
        },
        {
          title: "Nature Sounds",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWVFeEut75IAL",
          description: "Immerse yourself in calming natural soundscapes"
        },
        {
          title: "Ambient Relaxation",
          artist: "Spotify",
          url: "https://open.spotify.com/playlist/37i9dQZF1DWWoe1EYwFmKc",
          description: "Atmospheric music for deep relaxation and stress relief"
        }
      ],
      reading: [
        {
          title: "Caring for Your Mental Health",
          author: "NIMH",
          url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
          description: "Evidence-based tips to support your wellness journey"
        },
        {
          title: "Coping with Stress and Anxiety",
          author: "CDC",
          url: "https://www.cdc.gov/mental-health/stress-coping/cope-with-stress/index.html",
          description: "Practical strategies from trusted health experts"
        },
        {
          title: "Getting Started with Mindfulness",
          author: "Mindful.org",
          url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
          description: "Begin your mindfulness practice with gentle guidance"
        }
      ],
      exercise: [
        {
          title: "Walking for Mental Health",
          type: "Aerobic Exercise",
          duration: "20-30 minutes daily",
          description: "Simple daily movement to lift your mood naturally"
        },
        {
          title: "Yoga for Depression and Anxiety",
          type: "Mind-Body Exercise",
          duration: "45-60 minutes, 2-3x per week",
          description: "Combine gentle movement with breath work for peace"
        },
        {
          title: "Stretching and Flexibility",
          type: "Gentle Movement",
          duration: "10-15 minutes daily",
          description: "Release physical tension and reconnect with your body"
        }
      ]
    };
    
    console.log('ℹ️ Returning fallback recommendations');
    res.json(fallback);
  }
});
app.get('/', (req, res) => {
    res.send({ message: req.t('server.running') });
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});