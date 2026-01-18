<div align="center">

# 🌟 LuminaAI

### *Illuminating the Path to Mental Wellness*

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/mern-stack)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI-orange?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**A comprehensive AI-powered mental health & wellness platform that combines intelligent screening, personalized recommendations, health tracking, and emergency support—all in one compassionate ecosystem.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-getting-started) • [Usage](#-usage) • [Contributing](#-contributing)

---

</div>

## 🎯 What is LuminaAI?

LuminaAI is more than just a health app—it's a **companion for your wellness journey**. Built with cutting-edge AI technology and a deep understanding of mental health needs, LuminaAI provides a safe, intelligent, and user-friendly platform for:

- 🧠 **Mental health screening** with AI-powered risk assessment
- 💡 **Personalized wellness content** curated by advanced AI
- 📊 **Comprehensive health tracking** for mood, nutrition, and medication
- 🚨 **Emergency support system** with instant SOS alerts
- 💊 **Smart prescription management** using OCR technology

> *"Mental health is not a destination, but a process. It's about how you drive, not where you're going."* - Noam Shpancer

---

## ✨ Features

### 🧠 **AI-Powered Mental Health Assessment**

<table>
<tr>
<td width="60%">

- **Intelligent Screening**: Text-based questionnaire powered by TensorFlow.js neural networks
- **Risk Calculation**: Real-time mental health risk scoring with zero Python dependencies
- **Personalized Insights**: Immediate, actionable feedback based on your responses
- **Privacy-First**: All processing happens in-browser—your data stays yours

</td>
<td width="40%">

```javascript
// Neural network runs 
// entirely in Node.js
const model = tf.sequential();
model.add(tf.layers.dense({
  inputShape: [features],
  units: 128,
  activation: 'relu'
}));
```

</td>
</tr>
</table>

---

### 💡 **Wellness Recommendations Engine**

Powered by **Google Gemini API**, LuminaAI curates personalized content just for you:

| Content Type | Description |
|--------------|-------------|
| 🎥 **YouTube Videos** | Guided meditations, breathing exercises, and mental health education |
| 🎵 **Spotify Playlists** | Mood-enhancing music scientifically curated for relaxation |
| 📚 **Reading Materials** | Articles and resources from trusted mental health sources |
| 🧘 **Mindfulness Exercises** | Personalized daily practices based on your mental state |

---

### 📊 **Comprehensive Health Tracking**

<div align="center">

| **Feature** | **Description** |
|:-----------:|:----------------|
| 😊 **Mood Logging** | Track daily emotional states with 1-5 scale and detailed notes |
| 🍽️ **Meal Tracking** | Log nutritional intake with calorie counting and meal analysis |
| 💊 **Medication Manager** | Schedule reminders with dosage tracking and adherence metrics |
| 📈 **Health Reports** | Generate comprehensive wellness summaries with AI insights |
| 👨‍⚕️ **Doctor Sharing** | Securely send reports to nearby healthcare providers |

</div>

---

### 🚨 **Emergency SOS System**

When every second counts, LuminaAI has your back:

```mermaid
graph LR
    A[SOS Button] --> B[Geolocation Capture]
    B --> C[Emergency Contacts]
    C --> D[Email Alerts]
    C --> E[SMS Notifications]
    C --> F[Hotline Information]
    style A fill:#ff6b6b
    style C fill:#51cf66
```

- ⚡ **One-Click Emergency Alert**: Instant activation from any screen
- 📍 **Location Sharing**: Automatic GPS coordinates sent to emergency contacts
- 📧 **Multi-Channel Notifications**: Email and SMS via Nodemailer
- 📞 **Hotline Directory**: Quick access to crisis helplines
- 👥 **Contact Management**: Pre-configured emergency contact system

---

### 💊 **OCR Prescription Scanner**

<table>
<tr>
<td width="50%">

**How It Works:**

1. 📸 Capture prescription with camera
2. 🔍 Tesseract.js extracts text via OCR
3. 💊 Medicine database lookup
4. ℹ️ Display dosage, usage & side effects

</td>
<td width="50%">

**Features:**
- ✅ Automatic medicine name detection
- ✅ Comprehensive drug information database
- ✅ Dosage instructions & interactions
- ✅ Mobile-responsive camera interface
- ✅ Prescription history tracking

</td>
</tr>
</table>

---

### 🔐 **Secure Authentication**

- 🔑 **JWT-based authentication** with secure token management
- 🌐 **Google OAuth 2.0** integration for seamless login
- 🔒 **Password encryption** using industry-standard bcrypt
- 🛡️ **Protected routes** with middleware authorization
- 👤 **User profile management** with privacy controls

---

## 🛠️ Tech Stack

<div align="center">

### **Frontend**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=react-router)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios)](https://axios-http.com/)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-OCR-2396F3?style=flat-square)](https://tesseract.projectnaptha.com/)
[![CSS3](https://img.shields.io/badge/CSS3-Animations-1572B6?style=flat-square&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)

### **Backend**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=json-web-tokens)](https://jwt.io/)

### **AI & APIs**

[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ML-FF6F00?style=flat-square&logo=tensorflow)](https://www.tensorflow.org/js)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-339933?style=flat-square)](https://nodemailer.com/)

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local installation or Atlas account) - [Get Started](https://www.mongodb.com/)
- **Git** - [Install](https://git-scm.com/)
- **npm** or **yarn** package manager

### 📦 Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/GaganCN10/LuminaAI.git
cd LuminaAI
```

#### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/luminaai
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luminaai

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### 3️⃣ Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

#### 4️⃣ Database Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env`

---

## 🎮 Usage

### Running the Application

#### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

#### Production Build

```bash
# Build frontend
cd client
npm run build

# Serve with backend
cd ../server
npm start
```

---

## 📱 Key Workflows

### 1. Mental Health Screening
```
User Journey:
Login → Dashboard → Start Assessment → Answer Questions 
→ AI Analysis → View Risk Score → Get Recommendations
```

### 2. Daily Health Tracking
```
Track Mood → Log Meals → Schedule Medications 
→ View Analytics → Generate Report → Share with Doctor
```

### 3. Emergency SOS
```
Click SOS Button → System Captures Location 
→ Sends Alerts to Contacts → Displays Hotlines → Connect to Help
```

### 4. Prescription Scanning
```
Upload/Capture Prescription → OCR Processing 
→ Medicine Recognition → Database Lookup → View Info & Reminders
```

---

## 🏗️ Project Structure

```
LuminaAI/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Express app
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Write clear, commented code
- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Be respectful and collaborative

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? We'd love to hear from you!

- **Bug Reports**: [Open an issue](https://github.com/GaganCN10/LuminaAI/issues) with detailed steps to reproduce
- **Feature Requests**: Share your ideas and use cases
- **Questions**: Check existing issues or start a discussion

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Gagan CN**

- GitHub: [@GaganCN10](https://github.com/GaganCN10)
- Project Link: [LuminaAI](https://github.com/GaganCN10/LuminaAI)

---

## 🙏 Acknowledgments

- **TensorFlow.js** team for making ML accessible in JavaScript
- **Google Gemini** for powerful AI capabilities
- **MongoDB** for reliable database solutions
- **React** community for excellent documentation
- All contributors and testers who helped shape LuminaAI

---

## 📞 Support & Resources

- **Mental Health Resources**:
  - National Suicide Prevention Lifeline: 988
  - Crisis Text Line: Text HOME to 741741
  - SAMHSA Helpline: 1-800-662-4357

- **Technical Support**:
  - Documentation: [Wiki](https://github.com/GaganCN10/LuminaAI/wiki)
  - Issues: [GitHub Issues](https://github.com/GaganCN10/LuminaAI/issues)

---

<div align="center">

### 🌟 If LuminaAI helped you, please consider giving it a star!

[![GitHub stars](https://img.shields.io/github/stars/GaganCN10/LuminaAI?style=social)](https://github.com/GaganCN10/LuminaAI/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/GaganCN10/LuminaAI?style=social)](https://github.com/GaganCN10/LuminaAI/network/members)

**Made with ❤️ for mental wellness**

*Remember: You are not alone. Help is always available.*

</div>
