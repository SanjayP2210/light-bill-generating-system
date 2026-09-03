/* eslint-disable react/prop-types */
// InputBoxes.js
import { useEffect, useMemo, useRef, useState } from "react";
import "./InputBoxes.css"; // Ensure you create this CSS file for styling
import { Button, Card, Col, Row } from "react-bootstrap";
import CustomerSelector from "../../CustomerSelector";
import axios from "axios";
import TableModal from "../../TableModal/TableModal";
import NewBillTableView from "../../Bill/NewBillTableView";
import {
  IconCash,
  IconEye,
  IconFileInvoice,
  IconGauge,
  IconPlus,
  IconReceipt2,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const InputBoxes = ({ setShowLoader }) => {
  const defaultFormValue = {
    current_unit: 0,
    prev_unit: 0,
    used_unit: 0,
    unit_per_rate: 8,
    total_price: 0,
    comments: "",
  };
  const navigate = useNavigate();
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
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [isClickOnPdfBtn, setIsClickOnPdfBtn] = useState(false);

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
    setValues(Array(6).fill(""));
    setForm(defaultFormValue);
    setNewValue(0);
    setTotalValue(0);
    if (customer_id) {
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
          if (numberWithDecimal && unit_per_rate) {
            const calUnit = parseFloat(numberWithDecimal) - prev_unit;
            price = parseFloat(calUnit * unit_per_rate).toFixed(2);
            setForm({
              ...form,
              used_unit: parseFloat(calUnit).toFixed(2),
              prev_unit,
              unit_per_rate,
            });
            if (prev_unit > numberWithDecimal) {
              toast.warn("New unit is not greater than previous unit");
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
      handleInput(index, e);
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
      if (res?.data?.isError) {
        toast.error("Error fetching customers");
      } else {
        const data = res?.data?.data;
        setCustomers(data);
        if (data?.length == 0) {
          navigate("/customer");
        }
      }
      setShowLoader(false);
    } catch (error) {
      setShowLoader(false);
      setCustomers([]);
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers");
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
        toast.error(res?.data?.message);
      } else {
        setForm({
          ...form,
          comments,
        });
        setIsNewBillGenerated(true);
        setLastBillData(res.data?.data);
        toast.success("New Bill Added Successfully");
        setShowLoader(false);
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Error adding bill:", error);
      toast.error("Error adding bill");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const bodyContainer = useMemo(() => {
    return (
      <>
        <NewBillTableView
          handleCloseModal={handleCloseModal}
          tableValue={form}
          comments={comments}
          customerName={customerName}
          setComments={setComments}
          isNewBillGenerated={isNewBillGenerated}
        />
      </>
    );
  }, [comments, form, customerName, isNewBillGenerated]);

  const newBillButton = (
    <>
      <Button
        variant="outline-dark"
        style={{ marginRight: "10px" }}
        disabled={isNewBillGenerated}
        type="submit"
        onClick={addBill}
      >
        <IconPlus /> Add Bil
      </Button>
    </>
  );

  const showTotal = form?.prev_unit != null && newValue?.length > 6;

  return (
    <>
      <Card className="mx-auto home-bill-card">
        <Card.Header className="customer-form">
          <div className="card-title-row">
            <div className="card-title-icon">
              <IconFileInvoice size={20} stroke={1.75} />
            </div>
            <div className="card-title-text">
              <h2 className="section-title new-bill-title">
                Add Your New Bill
              </h2>
              <span className="helper-text">
                Create a new electricity bill
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <Row className="justify-content-center mb-4 customer-select-row">
            <Col md={10} sm={12}>
              <CustomerSelector
                customers={customers || []}
                setCustomerId={setCustomerId}
                customer_id={customer_id}
              />
            </Col>
          </Row>
          <Col md={12} sm={12}>
            <span className="meter-reading-label text-center">
              Meter Reading
            </span>
            <div className="input-group input-group-sm input-box">
              {Array.from({ length: 6 }).map((_, index) => {
                const isLast = index === 5;
                return (
                  <div className="otp-box-wrap" key={index}>
                    {isLast && (
                      <span className="otp-separator" aria-hidden="true">
                        .
                      </span>
                    )}
                    <input
                      type="text"
                      className={`textbox ${isLast ? "red-input-box" : ""} ${
                        values[index] ? "otp-filled" : ""
                      }`}
                      maxLength="1"
                      value={values[index]}
                      dir="rtl"
                      id={`meter-input-${index}`}
                      aria-label={`Meter digit ${index + 1}`}
                      ref={(el) => (textboxesRef.current[index] = el)}
                      onInput={(e) => handleInput(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                  </div>
                );
              })}
            </div>
          </Col>

          {customer_id && form?.prev_unit != null && (
            <>
              <hr className="my-4" />
              <p className="section-title mb-3">Bill Summary</p>
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-card-icon">
                    <IconReceipt2 size={22} stroke={1.75} />
                  </div>
                  <div>
                    <p className="summary-card-label">Previous Bill</p>
                    <p className="summary-card-value">{form?.prev_unit}</p>
                  </div>
                </div>
                <div className="summary-card accent">
                  <div className="summary-card-icon">
                    <IconGauge size={22} stroke={1.75} />
                  </div>
                  <div>
                    <p className="summary-card-label">Unit Rate</p>
                    <p className="summary-card-value">
                      {customer_id?.default_unit_per_rate}
                    </p>
                  </div>
                </div>
                {showTotal && (
                  <div className="summary-card total">
                    <div className="summary-card-icon">
                      <IconCash size={22} stroke={1.75} />
                    </div>
                    <div>
                      <p className="summary-card-label">Total Bill</p>
                      <p className="summary-card-value">
                        {totalValue || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {showTotal && (
                <div className="center-item mt-4">
                  <Button
                    variant="dark"
                    type="button"
                    className="btn-preview-bill px-4"
                    onClick={handleShowModal}
                  >
                    <IconEye size={18} stroke={1.75} className="me-2" />
                    Preview Bill
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      <TableModal
        isClickOnPdfBtn={isClickOnPdfBtn}
        setIsClickOnPdfBtn={setIsClickOnPdfBtn}
        bodyContainer={bodyContainer}
        newBillButton={newBillButton}
        disablePdfButton={!isNewBillGenerated}
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        setShowLoader={setShowLoader}
        customer_id={customer_id}
        style={{ margin: "20px" }}
      />
    </>
  );
};

export default InputBoxes;
