/* eslint-disable react/prop-types */
import { Col } from "react-bootstrap";
import InputBoxes from "../components/Common/InputBoxes/InputBoxes";

const Home = ({ showAlertBox }) => {
  return (
    <>
      <Col className="d-flex justify-content-center mt-5" sm={12}>
        <div>
          <h1>Welcome to Bill System</h1>
          <p>Manage your customers and bills efficiently.</p>
        </div>
      </Col>
      <InputBoxes showAlertBox={showAlertBox} />
    </>
  );
};

export default Home;
