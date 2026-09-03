/* eslint-disable react/prop-types */
import BillTable from "../Bill/BillTable";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import UploadExcel from "../UploadExcel/UploadExcel";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { IconFileSpreadsheet, IconTable } from "@tabler/icons-react";
import Select from "../Common/Select/Select";
import { getSelectedFileData, loadData } from "../../Utilities/Utils";
import { toast } from "react-toastify";
import homeBannerImage from "../../assets/home-screen-banner.png";

const UploadExcellData = () => {
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [customer_id, setCustomerId] = useState("");
  const [selectedWorkSheet, setSelectedWorkSheet] = useState({});
  const [selectedWorkSheetName, setSelectedWorkSheetName] = useState();
  const [workBook, setWorkBook] = useState();
  const [convertedData, setConvertedData] = useState();
  const [selectedWorkSheetNamesArray, setSelectedWorkSheetNamesArray] =
    useState();
  const [worksSheets, setWorksSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const selectedFileRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetOptions, setSheetOptions] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ["xlsx", "xls"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        toast.warn("Please upload a valid Excel file.");
        e.target.value = ""; // Clear the input
        return;
      }
    }
    setSelectedFile(e.target.files[0]);
    getSelectedFileData(e).then((res) => {
      if (JSON.stringify(res) != "{}") {
        let {
          selectedWorkSheet,
          selectedWorkSheetName,
          workBook,
          convertedData,
          selectedWorkSheetNamesArray,
          worksSheets,
        } = res;
        setSelectedWorkSheet(selectedWorkSheet);
        setSelectedWorkSheetName(selectedWorkSheetName);
        const sheetOption = selectedWorkSheetNamesArray.map((data) => {
          return {
            value: data,
            label: data,
          };
        });
        setSheetOptions(sheetOption);
        setWorkBook(workBook);
        setConvertedData(convertedData);
        setSelectedWorkSheetNamesArray(selectedWorkSheetNamesArray);
        setWorksSheets(worksSheets);
        setSelectedSheet(null);
        console.log("res", res);
      }
    });
  };

  const apiUrl = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${apiUrl}/bills`);
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Error fetching bills");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/customers`);
      console.log('data',res)
      setCustomers(res?.data?.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers");
    }
  };

  const clearFile = () => {
    selectedFileRef.current.value = null;
    setSelectedFile(null);
  };

  const uploadExcel = async () => {
    if (customer_id) {
      try {
        const response = await axios.post(
          `${apiUrl}/bills/upload-data-from-table/${customer_id?.value}`,
          bills
        );
        if (!response?.data?.isError) {
          toast.warn("File uploaded successfully");
          fetchBills();
        } else {
          toast.error("Error uploading Excel file", response?.data?.messgae);
        }
      } catch (error) {
        console.error("Error uploading Excel file:", error);
        toast.error("Error uploading Excel file");
      }
    } else {
      toast("Please Select Customer First");
    }
  };

  const handleSheetSelect = (e) => {
    try {
      debugger
      const sheetName = e.value;
      const isCustomerFound = customers.find(
        (c) => c?.name?.toLowerCase() === sheetName?.toLowerCase()
      );
      if (!isCustomerFound) {
        toast.error(
          "Customer not found. Please add a new customer with this name."
        );
        setSelectedSheet(null);
        setBills([]);
        return;
      } else {
        setSelectedSheet(e);
        setCustomerId({
          value: isCustomerFound?._id,
          label: isCustomerFound?.name,
        });
        loadData(workBook, convertedData, sheetName)
          .then((data) => {
            let { convertedData } = data;
            setBills(convertedData);
          })
          .catch((err) => {
            toast.error(err);
          });
      }
    } catch (error) {
       toast.error(error);
    }
  };
  return (
    <>
      <Container className="app-container">
        <div className="page-hero">
           <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconFileSpreadsheet size={28} stroke={1.75} />
          </div>
          <div>
            <p className="page-hero-eyebrow">Bulk Import</p>
            <h1 className="page-hero-title">Upload Bill Data</h1>
            <p className="page-hero-subtitle">
              Import bills in bulk from an Excel worksheet.
            </p>
          </div>
          </div>
          <div className="page-hero-art" aria-hidden="true">
            <img src={homeBannerImage} alt="Bill illustration" />
          </div>
        </div>
        <Card className="mb-4">
          <Card.Header className="customer-form">
            <div className="card-title-row">
              <div className="card-title-icon">
                <IconFileSpreadsheet size={20} stroke={1.75} />
              </div>
              <div className="card-title-text">
                <h4 className="section-title">Upload Excel File</h4>
                <span className="helper-text">
                  Import your rent-person bill data
                </span>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="align-items-end g-3">
              <Col md={5}>
                <UploadExcel
                  uploadExcel={uploadExcel}
                  handleFileUpload={handleFileUpload}
                  selectedFile={selectedFile}
                  fileRef={selectedFileRef}
                  clearFile={clearFile}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Select Sheet</Form.Label>
                <Select
                  isDisabled={!selectedFile}
                  onChange={handleSheetSelect}
                  value={selectedSheet}
                  options={sheetOptions}
                />
              </Col>
              <Col md={3}>
                <Button
                  variant="dark"
                  className="w-100"
                  disabled={bills?.length === 0}
                  onClick={uploadExcel}
                >
                  Upload
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Row>
          <Col>
            <Card>
              <Card.Header className="customer-form">
                <div className="card-title-row">
                  <div className="card-title-icon">
                    <IconTable size={20} stroke={1.75} />
                  </div>
                  <div className="card-title-text">
                    <h4 className="section-title">Bill Table</h4>
                    <span className="helper-text">
                      Preview of the imported bill rows
                    </span>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <BillTable
                  bills={bills}
                  fetchBills={() => {}}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UploadExcellData;
