/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "../Common/Select/Select";
import { formatDateForInput, getMaxDate } from "../../Utilities/Utils";
import { IconPlus, IconX } from "@tabler/icons-react";
import { toast } from "react-toastify";
const apiUrl = import.meta.env.VITE_APP_API_URL;

const CustomerForm = ({
  selectedCustomer,
  fetchCustomers,
  setSelectedCustomer,
  resetForm,
  setForm,
  form,
  setShowLoader,
  billNo,
  setBillNo,
  floorNo,
  setFloorNo,
}) => {
  // State hooks
  const maxDate = getMaxDate(); // Holds the maximum allowed date for the date input
  const [rentDate, setRentDate] = useState(""); // Holds the currently selected date
  const [meterNoOptions, setMeterNoOptions] = useState([]);
  const [floorNoOptions, setFloorNoOptions] = useState([]);

  // Load the Floor No master list (managed on the Masters page)
  useEffect(() => {
    const fetchFloorNoOptions = async () => {
      try {
        const res = await axios.get(`${apiUrl}/masters/floor-no`);
        const options = (res?.data?.data || []).map((item) => ({
          label: item.value,
          value: item.value,
        }));
        setFloorNoOptions(options);
      } catch (error) {
        console.error("Error fetching floor-no:", error);
      }
    };
    fetchFloorNoOptions();
  }, []);

  // Meter No depends on the selected Floor No — only the meters that belong
  // to that floor are shown (e.g. 1st Floor has 2 meters, 2nd Floor has 3).
  useEffect(() => {
    if (!floorNo?.value) {
      setMeterNoOptions([]);
      return;
    }
    const fetchMeterNoOptions = async () => {
      try {
        const res = await axios.get(`${apiUrl}/masters/meter-no`, {
          params: { floor_no: floorNo.value },
        });
        const options = (res?.data?.data || []).map((item) => ({
          label: item.value,
          value: item.value,
        }));
        setMeterNoOptions(options);
      } catch (error) {
        console.error("Error fetching meter-no:", error);
      }
    };
    fetchMeterNoOptions();
  }, [floorNo?.value]);

  // Changing the floor clears the previously selected meter, since it may
  // not belong to the newly selected floor.
  const handleFloorNoChange = (value) => {
    setFloorNo(value);
    setBillNo(null);
  };
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
        floor_no,
        default_unit_per_rate,
      } = selectedCustomer;
      setForm({
        ...form,
        name,
        mobile_number,
        rent_date,
        bill_no,
        floor_no,
        default_unit_per_rate,
      });
      setRentDate(formatDateForInput(rent_date));
      setBillNo({ label: bill_no, value: bill_no });
      setFloorNo(floor_no ? { label: floor_no, value: floor_no } : null);
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
        floor_no: floorNo?.value,
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
      <div className="mb-3 text-end">
        <Link to="/masters" className="helper-text">
          Manage Meter No / Floor No lists
        </Link>
      </div>
      <Row className="g-3">
        <Col md="6">
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter name"
            />
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group controlId="formFloorNo">
            <Form.Label>Floor No</Form.Label>
            <Select
              value={floorNo}
              onChange={handleFloorNoChange}
              options={floorNoOptions}
              placeholder="Select floor no..."
            />
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group controlId="formMeterNo">
            <Form.Label>Meter No</Form.Label>
            <Select
              value={billNo}
              onChange={(value) => setBillNo(value)}
              options={meterNoOptions}
              placeholder={floorNo?.value ? "Select meter no..." : "Select floor no first"}
              isDisabled={!floorNo?.value}
            />
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group controlId="formMobileNumber">
            <Form.Label>Mobile Number</Form.Label>
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
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group controlId="formRate">
            <Form.Label>Unit Rate</Form.Label>
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
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group controlId="formRentDate">
            <Form.Label>Rent Date</Form.Label>
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
          </Form.Group>
        </Col>
      </Row>
      <div className="mt-3 center-item">
        <Button
          variant="outline-dark"
          type="submit"
          className="center-item"
          disabled={
            !form.name ||
            !rentDate ||
            !form.mobile_number ||
            !floorNo?.value ||
            !billNo?.value ||
            !form.default_unit_per_rate
          }
        >
          <IconPlus style={{ width: "20px" }} />
          {"  "}
          {selectedCustomer ? "Update" : "Add"} Customer
        </Button>
        <Button
          variant="outline-dark"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            resetForm();
            setBillNo(null);
            setFloorNo(null);
          }}
          className="center-item"
          style={{ marginLeft: "20px" }}
        >
          <IconX style={{ width: "20px", color: "var(--color-red-600)" }} />
          {"   "} Cancel
        </Button>
      </div>
    </Form>
  );
};

export default CustomerForm;
