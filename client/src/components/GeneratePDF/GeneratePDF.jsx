/* eslint-disable react/prop-types */

import { Button, Form } from "react-bootstrap";

const GeneratePDF = ({ generatePDF }) => {
  return (
    <>
      <Button variant="dark" onClick={generatePDF}>
        Generate PDF
      </Button>
    </>
  );
};

export default GeneratePDF;