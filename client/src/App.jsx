import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/Navbar/Navbar";
import "./App.css";
import { lazy, Suspense, useState } from "react";
import Loader from "./components/Loader/Loader";
import { useAuth } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
// Login/Register are the entry pages for guests, so they stay in the main bundle.
import Login from "./pages/Login";
import Register from "./pages/Register";

// Every other page is split into its own chunk and downloaded on first visit.
const Home = lazy(() => import("./pages/Home"));
const Customers = lazy(() => import("./pages/Customers"));
const Bill = lazy(() => import("./pages/Bill"));
const UploadExcellData = lazy(() => import("./components/UploadExcellData/UploadExcellData"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Masters = lazy(() => import("./pages/Masters"));

const App = () => {
  const [showLoader, setShowLoader] = useState(false);
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Router>
          <NavigationBar />
          <Loader visible={showLoader} />
          <div className={`${isAuthenticated ? "app-shell" : ""}`}>
            <Suspense fallback={<Loader visible />}>
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
            </Suspense>
          </div>
      </Router>
    </>
  );
};

export default App;
