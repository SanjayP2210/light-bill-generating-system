/* eslint-disable react/prop-types */

import { Button } from "react-bootstrap";
import { IconFileTypeXls } from "@tabler/icons-react";

const GenerateExcel = ({ generateExcel, disabled }) => {
  return (
    <>
      <Button
        disabled={disabled}
        variant="outline-dark"
        className="w-100"
        onClick={generateExcel}
      >
        <IconFileTypeXls size={18} stroke={1.75} className="me-2" />
        Generate Excel
      </Button>
    </>
  );
};

export default GenerateExcel;