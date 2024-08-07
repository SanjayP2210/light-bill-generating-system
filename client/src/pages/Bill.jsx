/* eslint-disable react/prop-types */
import BillForm from "../components/Bill/BillForm";
import BillTable from "../components/Bill/BillTable";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import GeneratePDF from "../components/GeneratePDF/GeneratePDF";
import { Container, Row, Col, Card, Modal } from "react-bootstrap";
import CustomerSelector from "../components/CustomerSelector";
import TableModal from "../components/TableModal/TableModal";
import NewBillTableView from "../components/Bill/NewBillTableView";
import { formatDate, formatDateForInput, formatDateForTable } from "../Utilities/Utils";

const Bill = ({ showAlertBox, setShowLoader }) => {
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [customer_id, setCustomerId] = useState(null);
  const [billData, setBillData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeOfModal, setTypeOfModal] = useState('form');
  const [showFooter, setShowFooter] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
    setBillData(null);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setShowLoader(true);
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customer_id === null) {
      setBills([]);
      setBillData(null);
    } else {
      fetchBillByCustomerId();
    }
  }, [customer_id]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/customers`);
      setCustomers(res.data);
      setShowLoader(false);
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching customers:", error);
      showAlertBox("Error fetching customers");
    }
  };

  const fetchBillByCustomerId = async () => {
    try {
      setShowLoader(true);
      const res = await axios.get(
        `${apiUrl}/bills/get-bill-by-customer-id/${customer_id?.value}`
      );
      if (!res?.data?.isError) {
        const data = res?.data?.data;
        setBills(data);
        setBillData(null);
      }
      setShowLoader(false);
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching bills:", error);
      showAlertBox("Error fetching bills");
    }
  };

  // const generatePDF = async () => {
  //   try {
  //     const response = await axios.get(`${apiUrl}/bills/generate-pdf`, {
  //       responseType: "blob",
  //     });
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "bills.pdf");
  //     document.body.appendChild(link);
  //     link.click();
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     showAlertBox("Error generating PDF");
  //   }
  // };

  const generatePDFById = async (id) => {
    setTypeOfModal("table");
    setShowFooter(true);
    setShowModal(true);
    // try {
    //   const response = await axios.get(
    //     `${apiUrl}/bills/generate-pdf-by-lite-bill/${id}`,
    //     {
    //       responseType: "blob",
    //     }
    //   );
    //   const url = window.URL.createObjectURL(new Blob([response.data]));
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.setAttribute("download", "bills.pdf");
    //   document.body.appendChild(link);
    //   link.click();
    // } catch (error) {
    //   console.error("Error generating PDF by ID:", error);
    //   showAlertBox("Error generating PDF by ID");
    // }
  };

  useEffect(() => {
    if (billData) {
      handleShowModal(true);
    }
  }, [billData]);

  const generatePDF = () => {
    setTypeOfModal('table');
  }

  const bodyContainer = useMemo(() => {
    const form = {
      current_unit: billData?.current_unit,
      prev_unit: billData?.prev_unit,
      used_unit: billData?.used_unit,
      unit_per_rate: billData?.unit_per_rate,
      total_price: billData?.total_price,
      comments: billData?.comments,
    };
    if (typeOfModal === "table") {
      return (
        <>
          <NewBillTableView
            titleDate={formatDateForTable(billData?.date)}
            handleCloseModal={handleCloseModal}
            tableValue={form}
            customerName={customer_id?.name}
            isNewBillGenerated={true}
          />
        </>
      );
    } else {
      return <>
        <Card>
          <Card.Header className="customer-form">
            <div className="center-item">
              <h4>Bill Form</h4>
            </div>
          </Card.Header>
          <Card.Body>
            <BillForm
              customer_id={customer_id}
              showAlertBox={showAlertBox}
              billData={billData}
              fetchBillByCustomerId={fetchBillByCustomerId}
              handleCloseModal={handleCloseModal}
              setShowLoader={setShowLoader}
            />
          </Card.Body>
        </Card>
      </>;
    }
  }, [
    customer_id,
    showAlertBox,
    billData,
    fetchBillByCustomerId,
    handleCloseModal,
    setShowLoader,
    typeOfModal
  ]);

  return (
    <>
      <Container>
        <div className="center-item">
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
            <GeneratePDF
              disabled={!customer_id?.value && bills.length === 0}
              generatePDF={generatePDF}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <Card.Header className="customer-form">
                <div className="center-item">
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
                  setShowLoader={setShowLoader}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <TableModal
          bodyContainer={bodyContainer}
          disablePdfButton={typeOfModal != 'table'}
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          setShowLoader={setShowLoader}
          customer_id={customer_id}
          showFooter={showFooter}
        />
      </Container>
    </>
  );
};

export default Bill;
