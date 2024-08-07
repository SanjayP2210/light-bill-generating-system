import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Bill from "./pages/Bill";
import "./App.css";
import UploadExcellData from "./components/UploadExcellData/UploadExcellData";
import AlertBox from "./components/AlertBox/AlertBox";
import { useEffect, useState } from "react";
import Loader from "./components/Loader/Loader";

const App = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [showLoader, setShowLoader] = useState(false);

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
      <Loader visible={showLoader} />
      <Routes>
        <Route
          path="/"
          element={<Home showAlertBox={showAlertBox} setShowLoader={setShowLoader}
          />}
        />
        <Route
          path="/customer"
          element={
            <Customers
              setShowLoader={setShowLoader}
              showAlertBox={showAlertBox}
            />
          }
        />
        <Route
          path="/lite-bill"
          element={
            <Bill setShowLoader={setShowLoader} showAlertBox={showAlertBox} />
          }
        />
        <Route
          path="/upload-bill-from-excel"
          element={
            <UploadExcellData
              setShowLoader={setShowLoader}
              showAlertBox={showAlertBox}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
