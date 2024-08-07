/* eslint-disable react/prop-types */
import { Col } from "react-bootstrap";
import InputBoxes from "../components/Common/InputBoxes/InputBoxes";

const Home = ({ showAlertBox, setShowLoader }) => {
  return (
    <>
      <Col className="mt-5" style={{ padding: "0px 12px" }} sm={12}>
        <div className="center-item">
          <h1>Welcome to Bill Generating System</h1>
        </div>
        <div className="center-item">
          <p>Manage your customers and bills efficiently.</p>
        </div>
      </Col>
      <InputBoxes showAlertBox={showAlertBox} setShowLoader={setShowLoader} />
    </>
  );
};

export default Home;
