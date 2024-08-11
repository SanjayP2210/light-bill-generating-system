/* eslint-disable react/prop-types */
import { Button, Form, InputGroup } from "react-bootstrap";

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
          onClick={clearFile}
        >
          x
        </Button>
      </InputGroup>
    </div>
  );
};

export default UploadExcel;