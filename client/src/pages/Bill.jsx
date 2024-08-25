/* eslint-disable react/prop-types */
import BillForm from "../components/Bill/BillForm";
import BillTable from "../components/Bill/BillTable";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import GeneratePDF from "../components/GeneratePDF/GeneratePDF";
import GenerateExcel from "../components/GenerateExcel/GenerateExcel";
import { Container, Row, Col, Card } from "react-bootstrap";
import CustomerSelector from "../components/CustomerSelector";
import TableModal from "../components/TableModal/TableModal";
import NewBillTableView from "../components/Bill/NewBillTableView";
import { formatDate, formatDateForTable } from "../Utilities/Utils";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const Bill = ({ setShowLoader }) => {
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [customer_id, setCustomerId] = useState(null);
  const [billData, setBillData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeOfModal, setTypeOfModal] = useState("form");
  const [showFooter, setShowFooter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState({ label: 10, value: 10 });
  const handleCloseModal = () => {
    setShowModal(false);
    setBillData(null);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };

  const apiUrl = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    setShowLoader(true);
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customer_id === null) {
      setBills([]);
      setBillData(null);
      setTotalPages(0);
    } else {
      fetchBillByCustomerId();
    }
  }, [customer_id, page, limit]);

  const fetchCustomers = async () => {
    try {
      setShowLoader(true);
      const res = await axios.get(`${apiUrl}/customers`);
      if (res?.data?.isError) {
        toast.error("Error fetching customers");
      } else {
        const data = res?.data?.data;
        setCustomers(data);
      }
      setShowLoader(false);
    } catch (error) {
      setShowLoader(false);
      setCustomers([]);
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers");
    }
  };

  const fetchBillByCustomerId = async () => {
    try {
      setShowLoader(true);
      const params = new URLSearchParams({
        page,
        limit: limit?.value || 10,
        customer_id: customer_id?.value,
      });
      const res = await axios.get(
        `${apiUrl}/bills/get-bill-by-customer-id?${params.toString()}`
      );
      if (!res?.data?.isError) {
        const data = res?.data?.data;
        setBills(data);
        setTotalPages(res?.data?.totalPages);
        setBillData(null);
      }
      setShowLoader(false);
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching bills:", error);
      toast.error("Error fetching bills");
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const customerName = customer_id.name;

      // Add some basic text
      doc.text(`Bill Report of ${customerName}`, 75, 20);

      // Define the table columns and rows
      const columns = [
        "Meter No.",
        "Customer",
        "Current Unit",
        "Previous Unit",
        "Used Unit",
        "Unit Per Rate",
        "Total Price",
        "Date",
        "Comments",
      ];
      const rows = bills.map((bill) => {
        const {
          bill_no,
          current_unit,
          customer_id,
          prev_unit,
          used_unit,
          unit_per_rate,
          total_price,
          comments,
          date,
        } = bill;
        return [
          bill_no,
          customer_id.name,
          current_unit,
          prev_unit,
          used_unit,
          unit_per_rate,
          total_price,
          formatDate(date, "date"),
          comments,
        ];
      });

      // Use autoTable to add the table to the PDF
      doc.autoTable({
        theme: "grid",
        headStyles: {
          fillColor: "black",
          textColor: "white",
          // fontStyle: headerStyles.fontStyle,
          fontSize: 10, // Adjust the font size as needed
          font: "circular", // Set the font family
          halign: "center",
        },
        head: [columns],
        body: rows,
        startY: 30, // Position where the table should start
      });

      // Save the PDF
      doc.save(`bill_report_${customerName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast("Error generating PDF");
    }
  };

  const generatePDFById = async () => {
    setTypeOfModal("table");
    setShowFooter(true);
    setShowModal(true);
  };

  const generateExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    const rows = bills.map((bill) => {
      const {
        bill_no,
        current_unit,
        customer_id,
        prev_unit,
        used_unit,
        unit_per_rate,
        total_price,
        comments,
        date,
      } = bill;
      return {
        "Meter No.": bill_no,
        "Customer": customer_id.name,
        "Current Unit": current_unit,
        "Previous Unit": prev_unit,
        "Used Unit": used_unit,
        "Unit Per Rate": unit_per_rate,
        "Total Price": total_price,
        Date: formatDate(date, "date"),
        Comments: comments,
      };
    });
    console.log("rows", rows);
    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Create a buffer for the workbook
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create a Blob from the buffer
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    // Create a link element for downloading the file
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    const customerName = customer_id?.name;
    const fileName = `Bill Report of ${customerName}`;
    link.download = `${fileName}.xlsx`;

    // Append the link to the body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (billData) {
      handleShowModal(true);
    }
  }, [billData]);

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
      return (
        <>
          <Card>
            <Card.Header className="customer-form">
              <div className="center-item">
                <h4>Bill Form</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <BillForm
                customer_id={customer_id}
                billData={billData}
                fetchBillByCustomerId={fetchBillByCustomerId}
                handleCloseModal={handleCloseModal}
                setShowLoader={setShowLoader}
              />
            </Card.Body>
          </Card>
        </>
      );
    }
  }, [customer_id, billData, setShowLoader, typeOfModal]);

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
          <Col md={2} style={{ marginTop: "30px" }}>
            <GenerateExcel
              disabled={!customer_id?.value && bills.length === 0}
              generateExcel={generateExcel}
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
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                  setTotalPages={setTotalPages}
                  generatePDFById={generatePDFById}
                  fetchBills={fetchBillByCustomerId}
                  setBillData={setBillData}
                  setShowLoader={setShowLoader}
                  limit={limit}
                  setLimit={setLimit}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <TableModal
          bodyContainer={bodyContainer}
          disablePdfButton={typeOfModal != "table"}
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
