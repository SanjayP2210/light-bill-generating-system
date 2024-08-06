/* eslint-disable react/prop-types */
import BillForm from "../components/Bill/BillForm";
import BillTable from "../components/Bill/BillTable";
import axios from "axios";
import { useState, useEffect } from "react";
import GeneratePDF from "../components/GeneratePDF/GeneratePDF";
import { Container, Row, Col, Card, Modal } from "react-bootstrap";
import CustomerSelector from "../components/CustomerSelector";

const Bill = ({ showAlertBox }) => {
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [customer_id, setCustomerId] = useState("");
  const [prev_unit, setPrev_unit] = useState(0);
  const [isPrevUnitSet, setIsPrevUnitSet] = useState(false);
  const [billData, setBillData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setBillData(null);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customer_id) {
      fetchBillByCustomerId();
    }
  }, [customer_id]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/customers`);
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showAlertBox("Error fetching customers");
    }
  };

  const fetchBillByCustomerId = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/bills/get-bill-by-customer-id/${customer_id?.value}`
      );
      if (!res?.data?.isError) {
        const data = res?.data?.data;
        setBills(data);
        setBillData(null);
        const lastUnit = data[0]?.current_unit || 0;
        if (lastUnit) {
          setPrev_unit(lastUnit);
          setIsPrevUnitSet(true);
        }
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      showAlertBox("Error fetching bills");
    }
  };

  const generatePDF = async () => {
    try {
      const response = await axios.get(`${apiUrl}/bills/generate-pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bills.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error generating PDF:", error);
      showAlertBox("Error generating PDF");
    }
  };

  const generatePDFById = async (id) => {
    try {
      const response = await axios.get(
        `${apiUrl}/bills/generate-pdf-by-lite-bill/${id}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bills.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error generating PDF by ID:", error);
      showAlertBox("Error generating PDF by ID");
    }
  };

  useEffect(() => {
    if (billData) {
      handleShowModal(true);
    }
  }, [billData]);

  return (
    <>
      <Container>
        <div className="align-items-center justify-content-center d-flex">
          <h1 className="mt-4">Bill System</h1>
        </div>
        <Row className="mb-4">
          <Col md={{ span: 4, offset: 3 }}>
            <CustomerSelector
              customers={customers}
              setCustomerId={setCustomerId}
              customer_id={customer_id}
            />
          </Col>
          <Col md={2} style={{ marginTop: "30px" }}>
            <GeneratePDF generatePDF={generatePDF} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <Card.Header className="customer-form">
                <div className="align-items-center justify-content-center d-flex">
                  <h4>Bill Table</h4>
                </div>
              </Card.Header>
              <Card.Body>
                <BillTable
                  bills={bills}
                  generatePDFById={generatePDFById}
                  showAlertBox={showAlertBox}
                  fetchBills={fetchBillByCustomerId}
                  setBillData={setBillData}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Body className="bill-modal-body">
            <Card>
              <Card.Header className="customer-form">
                <div className="align-items-center justify-content-center d-flex">
                  <h4>Bill Form</h4>
                </div>
              </Card.Header>
              <Card.Body>
                <BillForm
                  prev_unit={prev_unit}
                  setPrev_unit={setPrev_unit}
                  isPrevUnitSet={isPrevUnitSet}
                  customer_id={customer_id}
                  showAlertBox={showAlertBox}
                  billData={billData}
                  fetchBillByCustomerId={fetchBillByCustomerId}
                  handleCloseModal={handleCloseModal}
                />
              </Card.Body>
            </Card>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default Bill;
