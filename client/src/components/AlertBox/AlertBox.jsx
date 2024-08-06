/* eslint-disable react/prop-types */
import Alert from "react-bootstrap/Alert";
import "./index.css";
import { useEffect, useState } from "react";
function AlertBox({ message, variant = "danger", show, setShow }) {
  const [fade, setFade] = useState(show);

  useEffect(() => {
    if (show) {
      // Automatically hide the alert after 3 seconds
      setTimeout(() => {
        setFade(show); // Start fade-out effect
      }, 1500); // Display alert for 3 seconds
    }
  }, [show]);

  return (
    <>
      <div className="alert-top-center">
        <Alert
          // className={`alert-box ${show ? "fade-out" : ""}`}
          className={`alert-box`}
          key={variant}
          variant={variant}
          show={show}
          onClose={() => setShow(false)}
          dismissible
        >
          {message}
        </Alert>
      </div>
    </>
  );
}

export default AlertBox;
