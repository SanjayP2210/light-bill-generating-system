/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Form, Button, Badge, Col, Row } from "react-bootstrap";
import axios from "axios";
import { getMaxDate, formatDateForInput } from '../../Utilities/Utils.js';

const BillForm = ({
  prev_unit,
  setPrev_unit,
  fetchBillByCustomerId,
  customer_id,
  handleCloseModal,
  showAlertBox,
  billData,
}) => {
  const defaultFormValue = {
    customer_id: "",
    current_unit: 0,
    unit_per_rate: 8,
    total_price: 0,
    prev_unit:0,
    used_unit: 0,
    extra_unit: 0,
    comments: "",
    billDate: "",
  };
  const [form, setForm] = useState(billData || defaultFormValue);
  const maxDate = getMaxDate();
  const [billDate, setBillDate] = useState(""); // Holds the currently selected date
  const apiUrl = import.meta.env.VITE_API_URL;

  const calculateBil = (formValue, name, value) => {
    const { current_unit, unit_per_rate, prev_unit } = formValue;
    let price = 0;
    if (prev_unit && current_unit && unit_per_rate) {
      const calUnit = parseFloat(current_unit) - parseFloat(prev_unit);
      price = parseFloat(calUnit * unit_per_rate).toFixed(2);
    }
    setForm({
      ...form,
      [name]: value,
      total_price: parseFloat(price).toFixed(2),
    });
  };

  useEffect(() => {
    if (billData?.date) {
      setBillDate(formatDateForInput(billData?.date));
    }
  }, [billData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (customer_id) {
      const formData = {
        ...form,
        customer_id,
      };
      const response = billData?._id
        ? await axios.put(`${apiUrl}/bills/${billData?._id}`, formData)
        : await axios.post(`${apiUrl}/bills`, formData);

      if (response?.data?.isError) {
        showAlertBox(response?.data?.message);
      } else {
        showAlertBox("Bill Updated Succesfully", "success");
        setPrev_unit(0);
        setForm(defaultFormValue);
        handleCloseModal();
        fetchBillByCustomerId();
      }
    } else {
      showAlertBox("Select Customer");
      return false;
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formValue = {
      ...form,
      [name]: value,
    };
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    calculateBil(formValue, name, value);
  };

  // Handle change in date input
  const handleDateChange = (event) => {
    const dateValue = event.target.value;
    event.preventDefault(); // Prevent default behavior (though not necessary for date input)

    // Validate selected date against maxDate
    if (dateValue > maxDate) {
      showAlertBox("Selected date cannot be in the future."); // Set error if the date is invalid
      setBillDate(""); // Clear the selected date
    } else {
      setBillDate(dateValue); // Update selected date
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group as={Row} className="mb-3" controlId="currentUnit">
        <Form.Label column sm="4">
          Current Unit
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            name="current_unit"
            value={form.current_unit}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              handleInputChange(e);
            }}
            // onBlur={(e) => {
            //   e.target.value = e.target.value.replace(/[^0-9.]/g, "");
            //   if (
            //     e.target.value &&
            //     parseFloat(e.target.value) <= parseFloat(prev_unit)
            //   ) {
            //     setForm({ ...form, current_unit: e.target.value });
            //     showAlertBox(
            //       "Current Unit Not Less Then or Equal to Previouse Unit",
            //       "danger"
            //     );
            //     return;
            //   } else {
            //     handleInputChange(e);
            //   }
            // }}
            min={0}
            max={prev_unit}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="prevUnit">
        <Form.Label column sm="4">
          Previous Unit
        </Form.Label>
        <Col sm="8">
          <Form.Control
            type="text"
            name="prev_unit"
            value={form?.prev_unit}
            // readOnly={isPrevUnitSet}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              handleInputChange(e);
            }}
            // onBlur={(e) => {
            //   if (
            //     e.target.value &&
            //     parseFloat(e.target.value) >= parseFloat(form.current_unit)
            //   ) {
            //     showAlertBox(
            //       "Previouse Unit Not Greater Then  or Equal to Current Unit"
            //     );
            //      setForm({ ...form, prev_unit: 0 });
            //     return;
            //   } else {
            //     handleInputChange(e);
            //   }
            // }}
            min={form.current_unit}
          />
        </Col>
        </Form.Group>
      
        <Form.Group as={Row} className="mb-3" controlId="unit_per_rate">
          <Form.Label column sm="4">
            Unit Per Rate
          </Form.Label>
          <Col sm="8">
            <Form.Control value={form.unit_per_rate} readOnly={true} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="billDate">
          <Form.Label column sm="4">
            Date
          </Form.Label>
          <Col sm="8">
            <Form.Control
              type="date"
              value={billDate}
              name="billDate"
              placeholder="Enter Date"
              max={maxDate}
              onChange={(event) => {
                const dateValue = event.target.value;
                setBillDate(dateValue);
              }}
              onBlur={handleDateChange}
              onPaste={(event) => {
                const paste = (
                  event.clipboardData || window.clipboardData
                ).getData("text");
                let value;
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
                setBillDate(value);
              }}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="comments">
          <Form.Label column sm="4">
            Comment
          </Form.Label>
          <Col sm="8">
            <Form.Control
              value={form?.comments}
              as="textarea"
              rows={3}
              name="comments"
              onChange={handleInputChange}
            />
          </Col>
        </Form.Group>
      <div className="m-2 center-item">
        <Button variant="dark" style={{ marginRight: "10px" }}>
          Total Price <Badge bg="secondary">{form.total_price}</Badge>
        </Button>
        <Button
          variant="outline-dark"
          style={{ marginRight: "10px" }}
          type="submit"
          disabled={form.total_price <= 0}
        >
          {billData?._id ? "Update" : "Add"} Bill
        </Button>
        <Button
          variant="outline-danger"
          type="button"
          onClick={handleCloseModal}
        >
          close
        </Button>
      </div>
    </Form>
  );
};

export default BillForm;
