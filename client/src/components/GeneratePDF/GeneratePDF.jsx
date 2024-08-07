/* eslint-disable react/prop-types */

import { Button } from "react-bootstrap";

const GeneratePDF = ({ generatePDF, disabled }) => {
  return (
    <>
      <Button disabled={disabled} variant="dark" onClick={generatePDF}>
        Generate PDF
      </Button>
    </>
  );
};

export default GeneratePDF;