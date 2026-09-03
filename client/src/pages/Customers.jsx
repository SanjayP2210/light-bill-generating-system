/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import CustomerForm from "../components/Customer/CustomerForm";
import CustomerList from "../components/Customer/CustomerList";
import { toast } from "react-toastify";
import customersBannerImage from "../assets/customers-banner.svg";

const Customers = ({ setShowLoader}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billNo, setBillNo] = useState(null);
  const [floorNo, setFloorNo] = useState(null);
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const defaultFormValue = {
    name: "",
    mobile_number: "",
    bill_no: "",
    floor_no: "",
    rent_date: "",
    default_unit_per_rate: "",
  };
  const [form, setForm] = useState(selectedCustomer || defaultFormValue);

  const resetForm = () => {
    setForm(defaultFormValue);
    setSelectedCustomer(null);
    setBillNo(null);
    setFloorNo(null);
  };

  useEffect(() => {
    setShowLoader(true);
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setShowLoader(true);
       const res = await axios.get(`${apiUrl}/customers/master-list`);
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

  return (
    <Container className="app-container">
      <div className="page-hero">
        <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconUsers size={28} stroke={1.75} />
          </div>
          <div>
            <p className="page-hero-eyebrow">Customers</p>
            <h1 className="page-hero-title">Customer Directory</h1>
            <p className="page-hero-subtitle">
              Add new customers or manage your existing customer list.
            </p>
          </div>
        </div>
        <div className="page-hero-art" aria-hidden="true">
          <img src={customersBannerImage} alt="Customers illustration" />
        </div>
      </div>
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="customer-form">
              <div className="card-title-row">
                <div className="card-title-icon">
                  <IconUserPlus size={20} stroke={1.75} />
                </div>
                <div className="card-title-text">
                  <h4 className="section-title">
                    {selectedCustomer ? "Edit Customer" : "Customer Form"}
                  </h4>
                  <span className="helper-text">
                    {selectedCustomer
                      ? "Update this customer's details"
                      : "Add a new rent person"}
                  </span>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <CustomerForm
                selectedCustomer={selectedCustomer}
                fetchCustomers={fetchCustomers}
                setSelectedCustomer={setSelectedCustomer}
                resetForm={resetForm}
                form={form}
                setForm={setForm}
                setShowLoader={setShowLoader}
                setBillNo={setBillNo}
                billNo={billNo}
                setFloorNo={setFloorNo}
                floorNo={floorNo}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} className="mt-4">
          <Card>
            <Card.Header className="customer-form">
              <div className="card-title-row">
                <div className="card-title-icon">
                  <IconUsers size={20} stroke={1.75} />
                </div>
                <div className="card-title-text">
                  <h4 className="section-title">Customer Table</h4>
                  <span className="helper-text">
                    All rent persons linked to your account
                  </span>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <CustomerList
                customers={customers}
                fetchCustomers={fetchCustomers}
                setSelectedCustomer={setSelectedCustomer}
                resetForm={resetForm}
                setShowLoader={setShowLoader}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Customers;
