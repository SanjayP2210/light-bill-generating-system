/* eslint-disable react/prop-types */

import { Button } from "react-bootstrap";

const GenerateExcel = ({ generateExcel, disabled }) => {
  return (
    <>
      <Button disabled={disabled} variant="dark" onClick={generateExcel}>
        Generate Excel
      </Button>
    </>
  );
};

export default GenerateExcel;