/* eslint-disable react/prop-types */
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";

const UploadExcel = ({
  uploadExcel,
  handleFileUpload,
  selectedFile,
  clearFile,
  fileRef
}) => {
  // const handleUpload = () => {
  //   uploadExcel(selectedFile);
  // };

  return (
    <div>
      <Form.Label>Select File</Form.Label>
      <InputGroup className="mb-3">
        <Form.Control type="file" onChange={handleFileUpload} ref={fileRef} />
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