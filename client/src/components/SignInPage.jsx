import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../assets/componentsCss/SignInPage.css";

const SignInPage = () => {
  const navigate = useNavigate();
  const [lampOn, setLampOn] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [mode, setMode] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });

  const [signinData, setSigninData] = useState({
    email: "",
    password: ""
  });

  function getLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }),
        () => resolve(null),
        { enableHighAccuracy: true }
      );
    });
  }

  const handleLampToggle = () => {
    setPulling(true);
    setTimeout(() => setPulling(false), 180);
    setLampOn((prev) => !prev);
  };

  const handleRoleToggle = () => {
    const newToggle = !toggle;
    setToggle(newToggle);
    setSignupData((prev) => ({
      ...prev,
      role: newToggle ? "doctor" : "user"
    }));
  };

  const handleSignup = async () => {
    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirmPassword ||
      !signupData.role
    ) {
      setAlert({
        show: true,
        type: "error",
        message: "All fields are required!"
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "Passwords do not match!"
      });
      return;
    }

    if (signupData.password.length < 6) {
      setAlert({
        show: true,
        type: "error",
        message: "Password must be at least 6 characters!"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData)
        }
      );
      const data = await response.json();

      if (response.ok) {
        setAlert({
          show: true,
          type: "success",
          message: "Account created successfully! Please sign in."
        });
        setSignupData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user"
        });
        setMode("login");
      } else {
        setAlert({
          show: true,
          type: "error",
          message: data.message || "Registration failed!"
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Server error. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async () => {
    if (!signinData.email || !signinData.password) {
      setAlert({
        show: true,
        type: "error",
        message: "Email and password are required!"
      });
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signinData)
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setAlert({
          show: true,
          type: "error",
          message: data.message
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "doctor") {
        const coords = await getLocation();
        if (coords) {
          await fetch("http://localhost:5000/api/auth/update-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`
            },
            body: JSON.stringify(coords)
          });
        }
        navigate("/dashboard/doctor");
        return;
      }
      navigate("/dashboard/user");
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Server error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  const isLogin = mode === "login";

  return (
    <div className="cute-lamp-auth" style={{width: "100vw", height: "100vh"}}>
      <div className="cla-wrapper">
        {/* Lamp */}
        <div
          className={
            "lamp-wrap" +
            (lampOn ? " lamp-on" : "") +
            (pulling ? " pull" : "")
          }
        >
          {/* <div className="header-title">Cute Lamp Login</div> */}

          <svg className="lamp" viewBox="0 0 220 260" aria-hidden="true">
            <defs>
              <linearGradient
                id="lampLightGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="rgba(255,255,224,0.9)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
            </defs>

            {/* light cone */}
            <path
              className="lamp-light"
              d="M45 115 L175 115 L205 260 L15 260 Z"
            />

            {/* shade */}
            <path
              className="lamp-shade"
              d="M40 20 L180 20 L165 115 Q110 135 55 115 Z"
            />
            {/* inner underside */}
            <ellipse
              className="lamp-inner"
              cx="110"
              cy="115"
              rx="55"
              ry="10"
            />

            {/* stand */}
            <rect
              className="lamp-stand"
              x="100"
              y="115"
              width="20"
              height="95"
              rx="10"
            />
            {/* base */}
            <ellipse className="lamp-base" cx="110" cy="220" rx="55" ry="12" />

            {/* face - eyes */}
            <path
              className="lamp-face-eye"
              d="M76 60 q8 -10 16 0"
              stroke="#111"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="lamp-face-eye"
              d="M133 60 q8 -10 16 0"
              stroke="#111"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* mouth */}
            <path
              className="lamp-face-mouth"
              d="M90 82 q20 18 40 0 q-5 22 -20 22 q-15 0 -20 -22"
              fill="#111"
            />

            {/* tongue */}
            <path
              className="lamp-tongue"
              d="M103 94 q7 7 14 0 q-2 10 -7 13 q-5 -3 -7 -13"
            />

            {/* cord */}
            <line
              x1="85"
              y1="115"
              x2="85"
              y2="160"
              className="lamp-cord"
            />
            {/* toggle handle */}
            <g
              className="lamp-toggle"
              onClick={(e) => {
                e.stopPropagation();
                handleLampToggle();
              }}
            >
              <circle className="lamp-toggle-circle" cx="85" cy="170" r="8" />
            </g>
          </svg>
          <div className="tap-me-text">
            Pull the cord
          </div>
        </div>

        {/* Login / Signup panel (appears only when lamp is ON) */}
        <div className="login-panel">
          <div className="login-card">
            <h1 className="login-title">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>

            <div className="tabs">
              <button
                className={"tab-btn" + (isLogin ? " active" : "")}
                onClick={() => setMode("login")}
                disabled={loading}
              >
                Login
              </button>
              <button
                className={"tab-btn" + (!isLogin ? " active" : "")}
                onClick={() => setMode("signup")}
                disabled={loading}
              >
                Sign up
              </button>
            </div>

            {/* ALERTER */}
            {alert.show && (
              <div
                style={{
                  backgroundColor:
                    alert.type === "success"
                      ? "#d1fae5"
                      : alert.type === "error"
                      ? "#fee2e2"
                      : "#dbeafe",
                  color:
                    alert.type === "success"
                      ? "#065f46"
                      : alert.type === "error"
                      ? "#991b1b"
                      : "#1e3a8a",
                  marginBottom: "1rem",
                  padding: ".75rem",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>{alert.message}</span>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1.3em",
                    padding: "0 0.5rem"
                  }}
                  onClick={() => setAlert({ ...alert, show: false })}
                >
                  ×
                </button>
              </div>
            )}

            {/* --- SIGNUP FORM --- */}
            {!isLogin ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignup();
                }}
              >
                <div className="field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        name: e.target.value
                      })
                    }
                    onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                    disabled={loading}
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        email: e.target.value
                      })
                    }
                    onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                    disabled={loading}
                  />
                </div>
                <div className="field">
                  <label htmlFor="spass">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="spass"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value
                        })
                      }
                      onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ba3b0"
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="confirm">Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          confirmPassword: e.target.value
                        })
                      }
                      onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ba3b0"
                      }}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={toggle}
                      onChange={handleRoleToggle}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      disabled={loading}
                    />
                    <span>Register as Doctor</span>
                  </label>
                </div>
                <button className="login-btn" disabled={loading} type="submit">
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
                <div className="form-footer">
                  Already have an account? Choose Login above.
                </div>
              </form>
            ) : (
              // --- LOGIN FORM ---
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignin();
                }}
              >
                <div className="field">
                  <label htmlFor="lemail">Email</label>
                  <input
                    id="lemail"
                    type="email"
                    placeholder="john@example.com"
                    value={signinData.email}
                    onChange={(e) =>
                      setSigninData({
                        ...signinData,
                        email: e.target.value
                      })
                    }
                    onKeyPress={(e) => handleKeyPress(e, handleSignin)}
                    disabled={loading}
                  />
                </div>
                <div className="field">
                  <label htmlFor="lpass">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="lpass"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signinData.password}
                      onChange={(e) =>
                        setSigninData({
                          ...signinData,
                          password: e.target.value
                        })
                      }
                      onKeyPress={(e) => handleKeyPress(e, handleSignin)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ba3b0"
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>
                <button className="login-btn" disabled={loading} type="submit">
                  {loading ? "Signing In..." : "Login"}
                </button>
                <div className="form-footer">
                  <a href="#forgot" className="forgot-link">
                    Forgot password?
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;


//Language added

// import React, { useState } from 'react';
// import { Eye, EyeOff, User, Lock, Mail, Moon, Sun } from 'lucide-react';
// import "../assets/componentsCss/SignInPage.css";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from 'react-i18next';
// import LanguageSwitcher from './LanguageSwitcher';

// export default function AuthPage() {
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   const [tab, setTab] = useState("signup");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [alert, setAlert] = useState({ show: false, type: "", message: "" });
//   const [darkMode, setDarkMode] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toggle, setToggle] = useState(false);

//   const [signupData, setSignupData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "user"
//   });

//   const [signinData, setSigninData] = useState({
//     email: "",
//     password: ""
//   });

//   function getLocation() {
//     return new Promise((resolve) => {
//       if (!navigator.geolocation) return resolve(null);

//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           resolve({
//             latitude: pos.coords.latitude,
//             longitude: pos.coords.longitude
//           });
//         },
//         () => resolve(null),
//         { enableHighAccuracy: true }
//       );
//     });
//   }

//   const handleSignup = async () => {
//     if (
//       !signupData.name ||
//       !signupData.email ||
//       !signupData.password ||
//       !signupData.confirmPassword ||
//       !signupData.role
//     ) {
//       setAlert({
//         show: true,
//         type: "error",
//         message: t('auth.allFieldsRequired')
//       });
//       return;
//     }

//     if (signupData.password !== signupData.confirmPassword) {
//       setAlert({
//         show: true,
//         type: "error",
//         message: t('auth.passwordMismatch')
//       });
//       return;
//     }

//     if (signupData.password.length < 6) {
//       setAlert({
//         show: true,
//         type: "error",
//         message: t('auth.passwordMinLength')
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(signupData)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setAlert({
//           show: true,
//           type: "success",
//           message: t('auth.accountCreated')
//         });

//         setSignupData({
//           name: "",
//           email: "",
//           password: "",
//           confirmPassword: "",
//           role: "user"
//         });

//         setTab("signin");
//       } else {
//         setAlert({
//           show: true,
//           type: "error",
//           message: data.message || t('auth.registrationFailed')
//         });
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       setAlert({
//         show: true,
//         type: "error",
//         message: t('auth.serverError')
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRoleToggle = () => {
//     const newToggle = !toggle;
//     setToggle(newToggle);

//     setSignupData((prev) => ({
//       ...prev,
//       role: newToggle ? "doctor" : "user"
//     }));
//   };

//   const handleSignin = async () => {
//     if (!signinData.email || !signinData.password) {
//       setAlert({
//         show: true,
//         type: "error",
//         message: t('auth.emailPasswordRequired')
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(signinData)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setAlert({
//           show: true,
//           type: "error",
//           message: data.message
//         });
//         setLoading(false);
//         return;
//       }

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       if (data.user.role === "doctor") {
//         const coords = await getLocation();

//         if (coords) {
//           await fetch("http://localhost:5000/api/auth/update-location", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${data.token}`
//             },
//             body: JSON.stringify(coords)
//           });
//         }

//         navigate("/dashboard/doctor");
//         return;
//       }

//       navigate("/dashboard/user");
//     } catch (error) {
//       console.error("Signin error:", error);
//       setAlert({
//         show: true,
//         type: "error",
//         message: t('auth.serverError')
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e, action) => {
//     if (e.key === "Enter") action();
//   };

//   return (
//     <div
//       className="bodyAlign flex items-center justify-center p-5"
//       style={{
//         background: darkMode
//           ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
//           : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
//       }}
//     >
//       <div style={{ position: 'absolute', top: '20px', right: '80px', zIndex: 100 }}>
//         <LanguageSwitcher />
//       </div>

//       <button
//         onClick={() => setDarkMode(!darkMode)}
//         className="modeAlign rounded-full shadow-lg z-50 transition-transform hover:scale-110"
//         style={{
//           backgroundColor: darkMode ? "#374151" : "#ffffff",
//           color: darkMode ? "#fbbf24" : "#1f2937"
//         }}
//       >
//         {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//       </button>

//       <div
//         className="CenterCardAlign w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
//         style={{
//           backgroundColor: darkMode ? "#1f2937" : "#ffffff"
//         }}
//       >
//         {/* TABS */}
//         <div
//           className="flex"
//           style={{
//             borderBottom: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`
//           }}
//         >
//           <button
//             onClick={() => {
//               setTab("signup");
//               setAlert({ show: false, type: "", message: "" });
//               setLoading(false);
//             }}
//             className="flex-1 py-2 text-center font-semibold transition-all"
//             style={{
//               color:
//                 tab === "signup"
//                   ? darkMode ? "#60a5fa" : "#2563eb"
//                   : darkMode ? "#9ca3af" : "#6b7280",
//               borderBottom:
//                 tab === "signup"
//                   ? `2px solid ${darkMode ? "#60a5fa" : "#2563eb"}`
//                   : "none"
//             }}
//           >
//             {t('auth.signUp')}
//           </button>

//           <button
//             onClick={() => {
//               setTab("signin");
//               setAlert({ show: false, type: "", message: "" });
//               setLoading(false);
//             }}
//             className="flex-1 py-2 text-center font-semibold transition-all"
//             style={{
//               color:
//                 tab === "signin"
//                   ? darkMode ? "#60a5fa" : "#2563eb"
//                   : darkMode ? "#9ca3af" : "#6b7280",
//               borderBottom:
//                 tab === "signin"
//                   ? `2px solid ${darkMode ? "#60a5fa" : "#2563eb"}`
//                   : "none"
//             }}
//           >
//             {t('auth.signIn')}
//           </button>
//         </div>

//         <div className="p-8">

//           {/* ALERT */}
//           {alert.show && (
//             <div
//               className="mb-4 p-3 rounded-lg flex items-center justify-between"
//               style={{
//                 backgroundColor:
//                   alert.type === "success"
//                     ? darkMode ? "#065f46" : "#d1fae5"
//                     : alert.type === "error"
//                     ? darkMode ? "#7f1d1d" : "#fee2e2"
//                     : darkMode ? "#1e3a8a" : "#dbeafe",
//                 color:
//                   alert.type === "success"
//                     ? darkMode ? "#a7f3d0" : "#065f46"
//                     : alert.type === "error"
//                     ? darkMode ? "#fca5a5" : "#991b1b"
//                     : darkMode ? "#93c5fd" : "#1e3a8a"
//               }}
//             >
//               <span className="text-sm">{alert.message}</span>
//               <button
//                 onClick={() => setAlert({ ...alert, show: false })}
//                 className="text-xl font-bold"
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {/* SIGNUP FORM */}
//           {tab === "signup" ? (
//             <div className="space-y-5">

//               {/* NAME */}
//               <div>
//                 <label className="block textAlign text-sm font-medium mb-2">
//                   {t('auth.fullName')}
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={signupData.name}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, name: e.target.value })
//                     }
//                     onKeyPress={(e) => handleKeyPress(e, handleSignup)}
//                     placeholder={t('auth.fullNamePlaceholder')}
//                     disabled={loading}
//                     className="w-full pl-11 pr-4 py-3 rounded-lg border"
//                   />
//                 </div>
//               </div>

//               {/* EMAIL */}
//               <div>
//                 <label className="block textAlign text-sm font-medium mb-2">
//                   {t('auth.email')}
//                 </label>
//                 <div className="relative">
//                   {/* TRANSLATED */}
//                   <input
//                     type="email"
//                     value={signupData.email}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, email: e.target.value })
//                     }
//                     onKeyPress={(e) => handleKeyPress(e, handleSignup)}
//                     placeholder={t('auth.emailPlaceholder')}
//                     disabled={loading}
//                     className="w-full pl-11 pr-4 py-3 rounded-lg border"
//                   />
//                 </div>
//               </div>

//               {/* PASSWORD */}
//               <div>
//                 <label className="block textAlign text-sm font-medium mb-2">
//                   {t('auth.password')}
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={signupData.password}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, password: e.target.value })
//                     }
//                     onKeyPress={(e) => handleKeyPress(e, handleSignup)}
//                     placeholder="••••••••"
//                     disabled={loading}
//                     className="w-full pl-11 pr-12 py-3 rounded-lg border"
//                   />

//                   <button
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               {/* CONFIRM PASSWORD */}
//               <div>
//                 <label className="block textAlign text-sm font-medium mb-2">
//                   {t('auth.confirmPassword')}
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     value={signupData.confirmPassword}
//                     onChange={(e) =>
//                       setSignupData({ ...signupData, confirmPassword: e.target.value })
//                     }
//                     onKeyPress={(e) => handleKeyPress(e, handleSignup)}
//                     placeholder="••••••••"
//                     disabled={loading}
//                     className="w-full pl-11 pr-12 py-3 rounded-lg border"
//                   />

//                   <button
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                   >
//                     {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               {/* ROLE */}
//               <div>
//                 <label className="block text-sm mb-2">
//                   {t('auth.selectRole')}
//                 </label>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={toggle}
//                     onChange={handleRoleToggle}
//                     style={{ width: "60px", height: "25px" }}
//                   />
//                   <label className="text-blue-600">
//                     {t('auth.doctor')}
//                   </label>
//                 </div>
//               </div>

//               {/* SIGNUP BUTTON */}
//               <button
//                 onClick={handleSignup}
//                 disabled={loading}
//                 className="w-full py-3 rounded-lg font-semibold text-white"
//                 style={{
//                   backgroundColor: "#2563eb",
//                   opacity: loading ? 0.6 : 1
//                 }}
//               >
//                 {loading ? t('auth.creatingAccount') : t('auth.signUp')}
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-5">

//               {/* EMAIL */}
//               <div>
//                 <label className="block textAlign text-sm font-medium mb-2">
//                   {t('auth.email')}
//                 </label>
//                 {/* TRANSLATED */}
//                 <input
//                   type="email"
//                   value={signinData.email}
//                   onChange={(e) =>
//                     setSigninData({ ...signinData, email: e.target.value })
//                   }
//                   onKeyPress={(e) => handleKeyPress(e, handleSignin)}
//                   placeholder={t('auth.emailPlaceholder')}
//                   disabled={loading}
//                   className="w-full pl-11 pr-4 py-3 rounded-lg border"
//                 />
//               </div>

//               {/* PASSWORD */}
//               <div>
//                 <label className="block textAlign text-sm font-medium mb-2">
//                   {t('auth.password')}
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={signinData.password}
//                     onChange={(e) =>
//                       setSigninData({ ...signinData, password: e.target.value })
//                     }
//                     onKeyPress={(e) => handleKeyPress(e, handleSignin)}
//                     placeholder="••••••••"
//                     disabled={loading}
//                     className="w-full pl-11 pr-12 py-3 rounded-lg border"
//                   />

//                   <button
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               {/* SIGNIN BUTTON */}
//               <button
//                 onClick={handleSignin}
//                 disabled={loading}
//                 className="w-full py-3 rounded-lg font-semibold text-white"
//                 style={{
//                   backgroundColor: "#2563eb",
//                   opacity: loading ? 0.6 : 1
//                 }}
//               >
//                 {loading ? t('auth.signingIn') : t('auth.signIn')}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
