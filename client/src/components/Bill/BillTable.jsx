/* eslint-disable react/prop-types */

import axios from "axios";
import { Button, Pagination, Table, Col,Row } from "react-bootstrap";
import { formatDate } from "../../Utilities/Utils";
import { IconDownload, IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "react-toastify";
import Select from "../Common/Select/Select";

const BillTable = ({
  bills,
  generatePDFById,
  fetchBills,
  setBillData,
  setShowLoader,
  page,
  setPage,
  totalPages,
  limit,
  setLimit
}) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const deleteBill = async (id) => {
    try {
      setShowLoader(true);
      const response = await axios.delete(`${apiUrl}/bills/${id}`);
      if (!response.isError) {
        toast.success("Bill Deleted Successfully");
        fetchBills();
        setShowLoader(false);
      } else {
        setShowLoader(false);
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Error Bill Deleted:", error);
      toast.error("Error Bill Deleted");
    }
  };

  return (
    <>
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
            <th style={{ width: "160px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {bills?.length > 0 ? (
            <>
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
                    <th>
                      {customer_id?.name ? formatDate(date, "date") : date}
                    </th>
                    <td>{current_unit}</td>
                    <td>{prev_unit}</td>
                    <td>{extra_unit}</td>
                    <td>{used_unit}</td>
                    <td>{unit_per_rate}</td>
                    <td>{total_price}</td>
                    <th>{comments}</th>
                    {customer_id?.name && (
                      <td className="action-buttons">
                        <Button
                          variant="outline-primary"
                          className="btn"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setBillData(bill);
                          }}
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          variant="outline-success"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setBillData(bill);
                            generatePDFById(bill?._id);
                          }}
                        >
                          <IconDownload />
                        </Button>
                        <Button
                          variant="outline-danger"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            deleteBill(bill?._id);
                          }}
                        >
                          <IconTrash />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </>
          ) : (
            <>
              {" "}
              <tr>
                <td
                  colSpan="11"
                  style={{ textAlign: "center", color: "black" }}
                >
                  <p>
                    <b>No Data Found</b>
                  </p>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </Table>
      {bills?.length > 0 && (
        <Row>
          <Col md={2} style={{ width: "105px" }}>
            <Select
              options={[
                { label: 5, value: 5 },
                { label: 10, value: 10 },
                { label: 20, value: 20 },
              ]}
              value={limit}
              onChange={setLimit}
              isClearable={false}
            />
          </Col>
          <Col md={11} className="d-flex justify-content-end">
            <Pagination>
              <Pagination.First
                onClick={() => setPage(1)}
                disabled={page === 1}
              />
              <Pagination.Prev
                onClick={() =>
                  setPage((prev) => {
                    return Math.max(prev - 1, 1);
                  })
                }
              />
              {Array(totalPages)
                .fill(0)
                .map((x, i) => {
                  const text = i + 1;
                  return (
                    <Pagination.Item
                      active={text === page}
                      onClick={() => setPage(text)}
                      key={text}
                    >
                      {text}
                    </Pagination.Item>
                  );
                })}
              <Pagination.Next
                onClick={() =>
                  setPage((prev) => {
                    return Math.min(prev + 1, totalPages);
                  })
                }
                disabled={page === totalPages}
              />
              <Pagination.Last
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}
    </>
  );
};

export default BillTable;
