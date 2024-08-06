/* eslint-disable react/prop-types */

import axios from "axios";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import { formatDate } from "../../Utilities/Utils";

const BillTable = ({
  bills,
  generatePDFById,
  showAlertBox,
  fetchBills,
  setBillData,
}) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const deleteBill = async (id) => {
    const response = await axios.delete(`${apiUrl}/bills/${id}`);
    if (!response.isError) {
      showAlertBox(response.message);
    }
    fetchBills();
  };

  return (
    <Table responsive striped bordered hover>
      <thead>
        <tr style={{ textAlign: "center" }}>
          <th>Meter No.</th>
          <th>Customer Name</th>
          <th>Date</th>
          <th>Current Unit</th>
          <th>Previous Unit</th>
          <th>Extra Unit</th>
          <th>Used Unit</th>
          <th>Unit Per Rate</th>
          <th>Total Price</th>
          <th>Comments</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {bills?.map((bill) => {
          const {
            _id,
            current_unit,
            prev_unit,
            unit_per_rate,
            total_price,
            used_unit,
            customer_id,
            extra_unit,
            comments,
            date,
          } = bill;
          return (
            <tr key={_id} style={{ textAlign: "center" }}>
              <td>{customer_id?.bill_no}</td>
              <td>{customer_id?.name}</td>
              <th>{customer_id?.name ? formatDate(date, "date") : date}</th>
              <td>{current_unit}</td>
              <td>{prev_unit}</td>
              <td>{extra_unit}</td>
              <td>{used_unit}</td>
              <td>{unit_per_rate}</td>
              <td>{total_price}</td>
              <th>{comments}</th>
              {customer_id?.name && (
                <td>
                  <ButtonGroup size="sm">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setBillData(bill);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        generatePDFById(bill?._id);
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteBill(bill?._id);
                      }}
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default BillTable;