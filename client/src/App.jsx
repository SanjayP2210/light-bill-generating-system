import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Bill from "./pages/Bill";
import "./App.css";
import UploadExcellData from "./components/UploadExcellData/UploadExcellData";
import { useState } from "react";
import Loader from "./components/Loader/Loader";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import Masters from "./pages/Masters";

const App = () => {
  const [showLoader, setShowLoader] = useState(false);
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Router>
          <NavigationBar />
          <Loader visible={showLoader} />
          <div className={`${isAuthenticated ? "app-shell" : ""}`}>
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                }
              />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home setShowLoader={setShowLoader} />} />
                <Route
                  path="/customer"
                  element={<Customers setShowLoader={setShowLoader} />}
                />
                <Route
                  path="/lite-bill"
                  element={<Bill setShowLoader={setShowLoader} />}
                />
                <Route
                  path="/upload-bill-from-excel"
                  element={<UploadExcellData setShowLoader={setShowLoader} />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route path="/masters" element={<Masters />} />
              </Route>

              <Route element={<ProtectedRoute adminOnly />}>
                <Route
                  path="/users"
                  element={<UserManagement setShowLoader={setShowLoader} />}
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
      </Router>
    </>
  );
};

export default App;
