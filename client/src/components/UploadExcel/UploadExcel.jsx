/* eslint-disable react/prop-types */
import { Button, Form, InputGroup } from "react-bootstrap";
import { IconX } from "@tabler/icons-react";

const UploadExcel = ({
  handleFileUpload,
  selectedFile,
  clearFile,
  fileRef
}) => {

  return (
    <div>
      <Form.Label>Select File</Form.Label>
      <InputGroup className="mb-3">
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          ref={fileRef}
        />
        <Button
          variant="outline-danger"
          disabled={!selectedFile?.name}
          id="button-addon2"
          aria-label="Clear selected file"
          onClick={clearFile}
        >
          <IconX size={18} stroke={1.75} />
        </Button>
      </InputGroup>
    </div>
  );
};

export default UploadExcel;