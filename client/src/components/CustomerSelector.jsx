/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";
import Select from "./Common/Select/Select";
import { useEffect, useState } from "react";

const CustomerSelector = ({ customers = [], setCustomerId, customer_id, ...rest }) => {
  const [customerList, setCustomerList] = useState([]);
  useEffect(() => {
    const convertCustomerList =
      customers &&
      customers?.map((customer) => {
        return {
          value: customer?._id,
          label: customer?.name,
          name: customer?.name,
          default_unit_per_rate: customer?.default_unit_per_rate,
          last_bill_unit: customer?.last_bill_unit,
        };
      });
    setCustomerList(convertCustomerList);
  }, [customers]);
  
  return (
    <Form.Group controlId="customerSelect">
      <Form.Label>Select Customer</Form.Label>
      <Select
        options={customerList}
        value={customer_id}
        onChange={(value) => setCustomerId(value)}
        {...rest}
      />
    </Form.Group>
  );
};

export default CustomerSelector;
