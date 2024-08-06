/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import CustomerForm from "../components/Customer/CustomerForm";
import CustomerList from "../components/Customer/CustomerList";

const Customers = ({ showAlertBox }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
   const defaultFormValue = {
     name: "",
     mobile_number: "",
     bill_no: "",
     rent_date: "",
     default_unit_per_rate: "",
   };
   const [form, setForm] = useState(selectedCustomer || defaultFormValue);

   const resetForm = () => {
     setForm(defaultFormValue);
   };
  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get(`${apiUrl}/customers/master-list`);
    setCustomers(res.data);
  };

  return (
    <Container className="mt-3">
      <Row>
        <br />
        <Col md={{ span: 6, offset: 3 }}>
          <Card>
            <Card.Header className="customer-form">
              <div className="align-items-center justify-content-center d-flex">
                <h4>Customer Form</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <CustomerForm
                selectedCustomer={selectedCustomer}
                fetchCustomers={fetchCustomers}
                setSelectedCustomer={setSelectedCustomer}
                showAlertBox={showAlertBox}
                resetForm={resetForm}
                form={form}
                setForm={setForm}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={{ span: 10, offset: 1 }} className="mt-3">
          <Card>
            <Card.Header className="customer-form">
              <div className="align-items-center justify-content-center d-flex">
                <h4>Customer Table</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <CustomerList
                customers={customers}
                fetchCustomers={fetchCustomers}
                setSelectedCustomer={setSelectedCustomer}
                showAlertBox={showAlertBox}
                resetForm={resetForm}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Customers;
