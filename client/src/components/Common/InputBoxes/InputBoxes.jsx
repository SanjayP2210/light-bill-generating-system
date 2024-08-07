/* eslint-disable react/prop-types */
// InputBoxes.js
import { useEffect, useRef, useState } from "react";
import "./InputBoxes.css"; // Ensure you create this CSS file for styling
import { Button, Card, Col, Modal } from "react-bootstrap";
import CustomerSelector from "../../CustomerSelector";
import axios from "axios";
import NewBillTableView from "../../Bill/NewBillTableView";
import { IconDownload, IconPlus, IconX } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const InputBoxes = ({ showAlertBox, setShowLoader }) => {
  const defaultFormValue = {
    current_unit: 0,
    prev_unit: 0,
    used_unit: 0,
    unit_per_rate: 8,
    total_price: 0,
    comments: "",
  };
  const textboxesRef = useRef([]);
  const [values, setValues] = useState(Array(6).fill(""));
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customer_id, setCustomerId] = useState("");
  const [lastBillData, setLastBillData] = useState(null);
  const [form, setForm] = useState(defaultFormValue);
  const [newValue, setNewValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState("");
  const [isNewBillGenerated, setIsNewBillGenerated] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const tableRef = useRef(null);
  const handleCloseModal = () => {
    setShowModal(false);
    if (isNewBillGenerated && lastBillData) {
      setIsNewBillGenerated(false);
      setValues(Array(6).fill(""));
      setForm({
        ...form,
        current_unit: 0,
        prev_unit: form?.current_unit || 0,
        total_price: 0,
        comments: "",
      });
      setNewValue(0);
    }
  };

  const handleShowModal = () => {
    setComments("");
    setShowModal(true);
  };

  useEffect(() => {
    if (customer_id) {
      setValues(Array(6).fill(""));
      // fetchLastBill();
      setCustomerName(customer_id?.name);
      setForm({
        ...form,
        prev_unit: parseFloat(customer_id.last_bill_unit) || 0,
        unit_per_rate: customer_id?.default_unit_per_rate,
      });
    }
  }, [customer_id]);

  useEffect(() => {
    if (totalValue) {
      setForm({
        ...form,
        current_unit: newValue,
        total_price: totalValue,
        comments: "",
      });
    }
  }, [totalValue]);

  const handleInput = (index, e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "");
    const value = e.target.value;
    const newValues = [...values];
    newValues[index] = value;
    if (customer_id) {
      let price = 0;
      const stringValue = newValues?.join("");

      const numberWithDecimal =
        stringValue.slice(0, -1) + "." + stringValue.slice(-1);
      if (isNaN(numberWithDecimal)) {
        price = numberWithDecimal;
        setNewValue(0);
      } else {
        if (numberWithDecimal?.length > 6) {
          const { prev_unit, unit_per_rate } = form;
          if (numberWithDecimal && prev_unit && unit_per_rate) {
            const calUnit = parseFloat(numberWithDecimal) - prev_unit;
            price = parseFloat(calUnit * unit_per_rate).toFixed(2);
            setForm({
              ...form,
              used_unit: parseFloat(calUnit).toFixed(2),
              prev_unit,
              unit_per_rate,
            });
            if (prev_unit > numberWithDecimal) {
              showAlertBox("New unit is not greater than previous unit");
              price = 0;
              e.target.value = null;
              e.target.focus();
              newValues[index] = null;
              setNewValue(0);
              setValues(newValues);
            } else {
              setValues(newValues);
              if (
                e.target.value.length > 0 &&
                index < textboxesRef.current.length - 1
              ) {
                textboxesRef.current[index + 1].focus();
              }
            }
          }
          setTotalValue(price);
        } else {
          setTotalValue(price);
          price = numberWithDecimal;
          setValues(newValues);
          if (
            e.target.value.length > 0 &&
            index < textboxesRef.current.length - 1
          ) {
            textboxesRef.current[index + 1].focus();
          }
        }
        setNewValue(numberWithDecimal);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      textboxesRef.current[index].value = "";
      const newValues = [...values];
      newValues[index] = "";
      setValues(newValues);
      if (index > 0) {
        const prevIndex = index === 0 ? index : index - 1;
        textboxesRef.current[prevIndex].focus();
        textboxesRef.current[prevIndex].select();
        e.preventDefault(); // Prevent cursor move
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault(); // Prevent cursor move
      textboxesRef.current[index - 1].focus();
      textboxesRef.current[index - 1].select();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault(); // Prevent cursor move
      const nextIndex = index === 5 ? index : index + 1;
      textboxesRef.current[nextIndex].focus();
      textboxesRef.current[nextIndex].select();
    }
    if (e.key === "Tab" || e.key === " ") {
      e.preventDefault();
    }
  };

  const fetchCustomers = async () => {
    try {
      setShowLoader(true);
      const res = await axios.get(`${apiUrl}/customers`);
      setCustomers(res.data);
      setShowLoader(false);
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching customers:", error);
      showAlertBox("Error fetching customers");
    }
  };

  // const fetchLastBill = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${apiUrl}/bills/get-last-bill/${customer_id?.value}`
  //     );
  //     if (res?.data?.isError) {
  //       setLastBillData(null);
  //       showAlertBox(res?.data?.message);
  //     } else {
  //       setLastBillData(res.data?.data);
  //       const lastBill = res?.data?.data;
  //       const {current_unit= 0, unit_per_rate= 8 } = lastBill;
  //       setForm({
  //         ...form,
  //         prev_unit: current_unit,
  //         unit_per_rate,

  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching customers:", error);
  //     showAlertBox("Error fetching customers",);
  //   }
  // };

  const handleDownloadPDF = () => {
    var today = new Date();
    setShowLoader(true);
    if (tableRef.current) {
      html2canvas(tableRef.current, { scale: 1.5 }).then((canvas) => {
        // Increased scale for better quality
        // Create a new jsPDF instance
        const pdf = new jsPDF({
          orientation: "p", // Portrait orientation
          unit: "mm", // Unit of measurement
          format: "a4", // A4 paper size
        });

        // Convert the canvas to an image
        const imgData = canvas.toDataURL("image/png");

        // Calculate the PDF dimensions based on A4 size
        const imgWidth = 130; // Image width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Adjust the height to make the table appear smaller
        const scaleFactor = 1; // Adjust this factor to scale the image
        const scaledImgHeight = imgHeight * scaleFactor;

        // Add the image to the PDF with scaled height
        pdf.addImage(imgData, "PNG", 40, 10, imgWidth, scaledImgHeight);

        // Save the PDF
        pdf.save(`bill_${customer_id?.name}_${today.getTime()}.pdf`);
        setShowLoader(false);
      });
    }
  };

  const addBill = async () => {
    try {
      const formData = {
        ...form,
        customer_id: customer_id?.value,
        comments,
      };
      setShowLoader(true);
      const res = await axios.post(`${apiUrl}/bills`, formData);
      if (res?.data?.isError) {
        setLastBillData(null);
        setIsNewBillGenerated(false);
        showAlertBox(res?.data?.message);
      } else {
        setForm({
          ...form,
          comments,
        });
        setIsNewBillGenerated(true);
        setLastBillData(res.data?.data);
        showAlertBox("New Bill Added Successfully", "success");
        setShowLoader(false);
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Error adding bill:", error);
      showAlertBox("Error adding bill");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <>
      <Col className="center-item mt-5" sm={12}>
        <div>
          <div className="center-item mb-3">
            <h2 className="new-bill-title">Add Your New Bill</h2>
          </div>
          <Col
            className="text-center mb-5"
            md={{ span: 8, offset: 2 }}
            sm={{ span: 8, offset: 2 }}
          >
            <CustomerSelector
              customers={customers}
              setCustomerId={setCustomerId}
              customer_id={customer_id}
            />
            {/* <Form.Control.Feedback
              style={{
                display: lastBillData === null ? "block" : "none",
                fontSize: "14px",
                fontWeight: "bold",
                fontFamily: "sans-serif",
              }}
              type="invalid"
            >
              No Bill Found For This Customer. Please Create New Bill
            </Form.Control.Feedback> */}
          </Col>
          <Col md={12} sm={12}>
            <div className="input-group input-group-sm input-box">
              {Array.from({ length: 6 }).map((_, index) => {
                const isLast = index === 5;
                return (
                  <>
                    <input
                      key={index}
                      type="text"
                      className={`textbox ${isLast ? "red-input-box" : ""}`}
                      maxLength="1"
                      value={values[index]}
                      dir="rtl"
                      id={`meter-input-${index}`}
                      ref={(el) => (textboxesRef.current[index] = el)}
                      onInput={(e) => handleInput(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                  </>
                );
              })}
            </div>
          </Col>

          {customer_id && form?.prev_unit && (
            <>
              <div className="center-item mt-3">
                <h4 className="new-bill-title">
                  Previous Bill :-{" "}
                  <span style={{ color: "blue" }}> {form?.prev_unit}</span>
                </h4>
              </div>
              <div className="center-item mt-3">
                <h4 className="new-bill-title">
                  Unit Rate :-{" "}
                  <span style={{ color: "blue" }}>
                    {" "}
                    {customer_id?.default_unit_per_rate}
                  </span>
                </h4>
              </div>
              {totalValue > 6 && (
                <div className="center-item mt-3">
                  <h4 className="new-bill-title">
                    Total Bill is :-{" "}
                    <span style={{ color: "blue" }}>{totalValue || 0}</span>
                  </h4>
                </div>
              )}
              <br />
              {form?.prev_unit && newValue?.length > 6 && (
                <div className="center-item mt-3">
                  <Button
                    variant="outline-dark"
                    type="button"
                    onClick={handleShowModal}
                  >
                    Preview Bill
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Col>
      <Modal
        className="bill-modal-body"
        show={showModal}
        onHide={handleCloseModal}
        centered
      >
        <Modal.Body>
          <Card>
            <Card.Body ref={tableRef} style={{ margin: "20px" }}>
              <NewBillTableView
                handleCloseModal={handleCloseModal}
                tableValue={form}
                comments={comments}
                customerName={customerName}
                setComments={setComments}
                isNewBillGenerated={isNewBillGenerated}
              />
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer className="m-2 center-item align-items-center">
          <div>
            <Button
              variant="outline-dark"
              style={{ marginRight: "10px" }}
              disabled={isNewBillGenerated}
              type="submit"
              onClick={addBill}
            >
              <IconPlus /> Add Bil
            </Button>
            <Button
              variant="outline-primary"
              type="button"
              disabled={!isNewBillGenerated}
              style={{ marginRight: "10px" }}
              onClick={handleDownloadPDF}
            >
              <IconDownload /> PDF
            </Button>
            <Button
              variant="outline-danger"
              type="button"
              onClick={handleCloseModal}
            >
              <IconX /> Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InputBoxes;
