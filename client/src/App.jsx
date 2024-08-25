import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Bill from "./pages/Bill";
import "./App.css";
import UploadExcellData from "./components/UploadExcellData/UploadExcellData";
import { useState } from "react";
import Loader from "./components/Loader/Loader";

const App = () => {
  const [showLoader, setShowLoader] = useState(false);
  console.log(import.meta.env.VITE_APP_API_URL);

  return (
    <>
      <Router>
        <NavigationBar />
        <Loader visible={showLoader} />
        <Routes>
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
          <Route path="*" element={<Home setShowLoader={setShowLoader} />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
