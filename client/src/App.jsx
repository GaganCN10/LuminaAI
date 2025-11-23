import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignInPage from "./components/SignInPage";
import UserDashboard from "./components/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Mood from "./components/Mood";
import MealInfoStatic from "./components/MealInfoStatic";
import MealTracker from "./components/MealTracker";
import ChatBot from "./components/Chat";
import MedicineTracker from "./components/MedicineTracker";
import DoctorDashboard from "./components/DoctorDashboard";
import UserReport from "./components/UserReport";
import MentalAssessment from "./components/MentalAssessment"
import SOS from "./components/SOS"
import MentalHealthCommunity from "./components/MentalHealthCommunity";
import WellnessRecommendations from "./components/WellnessRecommendations";
import OCR from "./components/OCR";
import ImageAnalysis from './components/ImageAnalysis';
import React from "react";
import QuickScreening from "./components/QuickScreening";
import NotFound from './components/NotFound';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />

        <Route
          path="/dashboard/user"
          element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
        />

        <Route
          path="/dashboard/user/mood"
          element={<ProtectedRoute><Mood /></ProtectedRoute>}
        />

        <Route
          path="/dashboard/user/meal-info"
          element={<ProtectedRoute><MealInfoStatic /></ProtectedRoute>}
        />

        <Route
          path="/dashboard/user/meal-tracker"
          element={<ProtectedRoute><MealTracker /></ProtectedRoute>}
        />

        <Route
          path="/dashboard/user/chat"
          element={<ProtectedRoute><ChatBot /></ProtectedRoute>}
        />

        <Route
          path="/dashboard/user/medicine-tracker"
          element={<ProtectedRoute><MedicineTracker /></ProtectedRoute>}
        />

        <Route
          path="/dashboard/doctor"
          element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}
        />
        <Route path="/dashboard/user/report" element={<UserReport />} />
        <Route path="/dashboard/user/image-analyzer" element={<ImageAnalysis />} />
        <Route path="/dashboard/user/sos" element={<SOS />} />
        <Route path="/dashboard/user/test" element={<MentalAssessment />} />
        <Route path="/dashboard/user/community" element={<MentalHealthCommunity />} />
        <Route path="/dashboard/user/wellness" element={<WellnessRecommendations />} />
        <Route path="/dashboard/user/ocr" element={<OCR />} />
        <Route path="/dashboard/user/screening" element={<QuickScreening />} />
          <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
