import ReactDOM from "react-dom/client";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
// App.css (imported by App.jsx) must be injected after Bootstrap's
// stylesheet so app-specific overrides win same-specificity ties.
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Every axios call in the app must send the httpOnly auth cookie.
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition:Zoom
    />
     <AuthProvider>
    <App />
    </AuthProvider>
  </>
);
