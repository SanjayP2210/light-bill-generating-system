import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Bill from "./pages/Bill";
import "./App.css";
import UploadExcellData from "./components/UploadExcellData/UploadExcellData";
import AlertBox from "./components/AlertBox/AlertBox";
import { useEffect, useState } from "react";

const App = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  function showAlertBox(message='', variantType='success') {
    setAlertVariant(variantType);
    setShowAlert(true);
    setAlertMsg(message);
  }

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        setShowAlert(false);
        setAlertMsg("");
      }, 2000);
    }
  }, [showAlert]);

  return (
    <Router>
      <NavigationBar />
        <AlertBox show={showAlert} message={alertMsg} variant={alertVariant} />
      <Routes>
        <Route path="/" element={<Home showAlertBox={showAlertBox} />} />
        <Route
          path="/customer"
          element={<Customers showAlertBox={showAlertBox} />}
        />
        <Route
          path="/lite-bill"
          element={<Bill showAlertBox={showAlertBox} />}
        />
        <Route
          path="/upload-bill-from-excel"
          element={<UploadExcellData showAlertBox={showAlertBox} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
