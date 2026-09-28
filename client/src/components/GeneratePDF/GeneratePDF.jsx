/* eslint-disable react/prop-types */

import { Button } from "react-bootstrap";
import { IconFileTypePdf } from "@tabler/icons-react";

const GeneratePDF = ({ generatePDF, disabled }) => {
  return (
    <>
      <Button
        disabled={disabled}
        variant="outline-dark"
        className="w-100"
        onClick={generatePDF}
      >
        <IconFileTypePdf size={18} stroke={1.75} className="me-2" />
        Generate PDF
      </Button>
    </>
  );
};

export default GeneratePDF;