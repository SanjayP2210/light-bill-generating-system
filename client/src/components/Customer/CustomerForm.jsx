/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import Select from "../Common/Select/Select";
import { formatDateForInput, getMaxDate } from "../../Utilities/Utils";
import { IconPlus, IconX } from "@tabler/icons-react";
import { toast } from "react-toastify";
const apiUrl = import.meta.env.VITE_APP_API_URL;

const billNumberOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
];

const CustomerForm = ({
  selectedCustomer,
  fetchCustomers,
  setSelectedCustomer,
  resetForm,
  setForm,
  form,
  setShowLoader,
}) => {
  // State hooks
  const maxDate = getMaxDate(); // Holds the maximum allowed date for the date input
  const [rentDate, setRentDate] = useState(""); // Holds the currently selected date
  const [billNo, setBillNo] = useState(null);
  // Handle change in date input
  const handleDateChange = (event) => {
    const dateValue = event.target.value;
    event.preventDefault(); // Prevent default behavior (though not necessary for date input)

    // Validate selected date against maxDate
    if (dateValue > maxDate) {
      toast.warn("Selected date cannot be in the future."); // Set error if the date is invalid
      setRentDate(""); // Clear the selected date
    } else {
      setRentDate(dateValue); // Update selected date
    }
  };

  // Effect to update customer details when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      const {
        name,
        mobile_number,
        rent_date,
        bill_no = "1",
        default_unit_per_rate,
      } = selectedCustomer;
      setForm({
        ...form,
        name,
        mobile_number,
        rent_date,
        bill_no,
        default_unit_per_rate,
      });
      setRentDate(formatDateForInput(rent_date));
      setBillNo({ label: bill_no, value: bill_no });
    } else {
      // Clear name and mobile number if no customer is selected
      setRentDate(maxDate);
    }
  }, [selectedCustomer]); // Dependency array to re-run this effect when selectedCustomer changes

  // Handle form submission
  const handleSubmit = async (e) => {
    try {
      e.preventDefault(); // Prevent default form submission
      const { name, mobile_number, default_unit_per_rate } = form;
      if (mobile_number && mobile_number?.length < 10) {
        toast.warn("Mobile Number must be 10 digits", "danger");
        return;
      }
      const formData = {
        name,
        mobile_number,
        rent_date: rentDate,
        bill_no: billNo?.value,
        default_unit_per_rate,
      };
      setShowLoader(true);
      const response = selectedCustomer
        ? await axios.put(
            `${apiUrl}/customers/${selectedCustomer._id}`,
            formData
          )
        : await axios.post(`${apiUrl}/customers`, formData);

      if (response?.data?.isError) {
        toast.error(response?.data?.message);
        setShowLoader(false);
      } else {
        fetchCustomers();
        resetForm();
        setRentDate(maxDate);
        setSelectedCustomer(null);
        toast.success("Customer Save Successfully");
        setShowLoader(false);
      }
    } catch (error) {
      toast.error(error, "danger");
      setShowLoader(false);
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group as={Row} className="mb-3" controlId="formName">
        <Form.Label column sm="4">
          Name
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Enter name"
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formName">
        <Form.Label column sm="4">
          Meter No:-
        </Form.Label>
        <Col sm="8">
          <Select
            value={billNo}
            onChange={(value) => setBillNo(value)}
            options={billNumberOptions}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formMobileNumber">
        <Form.Label column sm="4">
          Mobile Number
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            name="mobile_number"
            value={form.mobile_number}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              handleInputChange(e);
            }}
            placeholder="Enter mobile number"
            maxLength={10}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formRate">
        <Form.Label column sm="4">
          Unit Rate
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            name="default_unit_per_rate"
            value={form.default_unit_per_rate}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              handleInputChange(e);
            }}
            placeholder="Enter unit rate"
            maxLength={10}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="formRentDate">
        <Form.Label column sm="4">
          Rent Date
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="date"
            value={rentDate}
            placeholder="Enter Date"
            max={maxDate}
            onChange={(event) => {
              const dateValue = event.target.value;
              setRentDate(dateValue);
            }}
            onBlur={handleDateChange}
            onPaste={(event) => {
              const paste = (
                event.clipboardData || window.clipboardData
              ).getData("text");
              let value;
              // Check if the pasted data matches the DD/MM/YYYY format
              const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
              if (datePattern.test(paste)) {
                const [day, month, year] = paste.split("/");
                const formattedDate = `${year}-${month.padStart(
                  2,
                  "0"
                )}-${day.padStart(2, "0")}`;
                value = formattedDate;
              } else {
                // If the format is already YYYY-MM-DD or invalid, paste it as it is
                value = paste;
              }
              setRentDate(value);
            }}
          />
        </Col>
      </Form.Group>
      <div className="mt-2 center-item">
        <Button
          variant="outline-dark"
          type="submit"
          className="center-item"
          disabled={
            !form.name ||
            !rentDate ||
            !form.mobile_number ||
            !billNo?.value ||
            !form.default_unit_per_rate
          }
        >
          <IconPlus style={{ width: "20px" }} />{" "}
          {selectedCustomer ? "Update" : "Add"} Customer
        </Button>
        <Button
          variant="outline-dark"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            resetForm();
            setBillNo(null);
          }}
          className="center-item"
          style={{ marginLeft: "20px" }}
        >
          <IconX style={{ width: "20px", color: "red" }} /> Cancel
        </Button>
      </div>
    </Form>
  );
};

export default CustomerForm;
