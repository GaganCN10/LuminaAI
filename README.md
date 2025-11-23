# 🌟 LuminaCode - AI-Powered Mental Health & Wellness Platform

> A comprehensive MERN stack web application combining mental health screening, personalized wellness recommendations, health tracking, and emergency support features.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)](https://www.mongodb.com/mern-stack)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**LuminaCode** is a full-stack mental health and wellness platform designed to provide comprehensive health management tools including:

- **AI-powered risk assessment** using TensorFlow.js for mental health screening
- **Personalized wellness recommendations** via Google Gemini API
- **Health tracking** for mood, meals, and medications
- **OCR prescription scanning** with medicine information database
- **Emergency SOS features** with email/SMS notifications
- **User authentication** with JWT and Google OAuth
- **Real-time notifications** for medication reminders

---

## ✨ Features

### 🧠 Mental Health Assessment
- Text-based mental health screening questionnaire
- TensorFlow.js neural network for risk score calculation
- Personalized feedback based on responses
- No Python dependencies - runs entirely in Node.js

### 💡 Wellness Recommendations
- AI-generated recommendations using Google Gemini API
- Personalized YouTube videos for mental wellness
- Spotify playlists for relaxation and mood improvement
- Reading materials and articles from trusted sources

### 📊 Health Tracking
- **Mood Logging**: Track daily mood with 1-5 scale and notes
- **Meal Tracking**: Log meals with calorie information
- **Medication Management**: Schedule medications with dosage tracking
- **Personalized Reports**: Generate comprehensive health summaries
- **Doctor Sharing**: Send reports to nearby healthcare providers

### 🚨 Emergency SOS System
- One-click emergency alert button
- Geolocation sharing with emergency contacts
- Email and SMS notifications via Nodemailer
- Emergency hotline information
- Contact management system

### 💊 OCR Prescription Scanner
- Tesseract.js OCR for prescription image scanning
- Automatic medicine name extraction
- Comprehensive medicine information database
- Dosage instructions and side effects
- Mobile-responsive camera interface

### 🔐 Authentication & Security
- JWT-based authentication
- Google OAuth 2.0 integration
- Password hashing with bcrypt
- Protected routes with middleware
- Secure token management

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tesseract.js** - OCR processing
- **CSS3** - Custom styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens

### AI/ML & APIs
- **TensorFlow.js** - Mental health risk assessment
- **Google Gemini API** - Wellness recommendations
- **Nodemailer** - Email notifications
- **Google OAuth** - Social authentication

### Development Tools
- **VS Code** - Code editor
- **WSL** - Windows Subsystem for Linux
- **Git** - Version control
- **npm** - Package management

---

## 🏗️ Architecture


---

## 📥 Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- Git

### Step 1: Clone Repository
git clone https://github.com/GaganCN10/LuminaCode.git
cd LuminaCode

text

### Step 2: Install Backend Dependencies
cd server
npm install

text

### Step 3: Install Frontend Dependencies
cd ../client
npm install

text

### Step 4: Set Up MongoDB
Start MongoDB locally
mongod

Or use MongoDB Atlas connection string
text

---

## ⚙️ Configuration

### Backend Environment Variables

Create `server/.env`:
