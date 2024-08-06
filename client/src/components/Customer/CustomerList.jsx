/* eslint-disable react/prop-types */
import { Table, Button } from "react-bootstrap";
import axios from "axios";
import { formatDate } from "../../Utilities/Utils";
import { useState } from "react";
import { IconCheck, IconEdit, IconTrash, IconX } from "@tabler/icons-react";
 const commonClass =
   "gap-6 d-flex align-items-center justify-content-center px-3 px-md-3 me-0 me-md-2";

const CustomerList = ({
  customers,
  fetchCustomers,
  setSelectedCustomer,
  showAlertBox,
  resetForm,
}) => {
  const [currentTab, setCurrentTab] = useState("all");
  const apiUrl = import.meta.env.VITE_API_URL;
  const deleteCustomer = async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/customers/${id}`);
      if (response?.data?.isError) {
        showAlertBox(response?.data?.message);
      } else {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error fetching customers:", error?.data?.message);
      showAlertBox("Error deleting customers");
    }
  };

  const handleActiveDeactive = async (id, item) => {
    try {
      const response =await axios.patch(
        `${apiUrl}/customers/active-deactive-customer/${id}`,
        {
          isActive: !item?.isActive,
        }
      );
      if (response) {
        fetchCustomers();
        resetForm();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const filterItem = () => {
    const filterItems = customers?.filter((item) => {
      return currentTab === "all"
        ? item
        : currentTab === "active"
        ? item?.isActive
        : !item?.isActive;
    });

    if (filterItems?.length > 0) {
      return filterItems.map((item, index) => {
        return (
          <tr style={{textAlign:'center'}} key={item?._id}>
            <td>
              {" "}
              <p
                style={{
                  textDecoration: !item?.isActive ? "line-through" : "none",
                }}
              >
                {item?.name}
              </p>
            </td>
            <td>
              {" "}
              <p
                style={{
                  textDecoration: !item?.isActive ? "line-through" : "none",
                }}
              >
                {item?.mobile_number}
              </p>
            </td>
            <td>
              {" "}
              <p
                style={{
                  textDecoration: !item?.isActive ? "line-through" : "none",
                }}
              >
                {item?.bill_no}
              </p>
            </td>
            <td>
              {" "}
              <p
                style={{
                  textDecoration: !item?.isActive ? "line-through" : "none",
                }}
              >
                {item?.default_unit_per_rate}
              </p>
            </td>
            <td>
              {" "}
              <p
                style={{
                  textDecoration: !item?.isActive ? "line-through" : "none",
                }}
              >
                {item?.last_bill_unit}
              </p>
            </td>
            <td>
              {" "}
              <p
                style={{
                  textDecoration: !item?.isActive ? "line-through" : "none",
                }}
              >
                {formatDate(item?.rent_date, "date")}
              </p>
            </td>
            <td style={{ width: "10%" }}>
              {item?.isActive && (
                <a
                  className="fs-6 text-muted"
                  href="javascript:void(0)"
                  onClick={() => {
                    setSelectedCustomer(item);
                  }}
                >
                  {/* <i
                    style={{ color: "var(--bs-primary)" }}
                    className="ti ti-edit"
                  ></i> */}
                  <IconEdit
                    size={24}
                    stroke={2}
                    style={{ color: "var(--bs-primary)" }}
                    color="black"
                  />
                </a>
              )}
              <a
                className="fs-6 text-muted"
                href="javascript:void(0)"
                style={{ marginLeft: "20px" }}
                onClick={() => {
                  handleActiveDeactive(item?._id, item);
                }}
              >
                {item?.isActive ? (
                  <IconX style={{ color: "red" }} />
                ) : (
                  // <i style={{ color: "red" }} className="ti ti-x"></i>
                  <IconCheck style={{ color: "green" }} />
                  // <i style={{ color: "green" }} className="ti ti-check"></i>
                )}
              </a>
            </td>
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td colSpan="2" style={{ textAlign: "center", color: "black" }}>
            <p>
              <b>No Data Found</b>
            </p>
          </td>
        </tr>
      );
    }
  };
  return (
    <>
      <div className="card">
        <div className="card-body customer-table">
          <ul className="nav nav-pills p-3 mb-3 rounded align-items-center card flex-row d-flex justify-content-center">
            <li
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab("all");
              }}
            >
              <button
                style={{ fontSize: "15px" }}
                className={`btn ${commonClass} ${
                  currentTab === "all" ? "active btn-dark" : "btn-outline-dark"
                }`}
                id="all-tab"
              >
                <i className="ti ti-list fill-white"></i>
                <span className="d-none d-md-block fw-medium">
                  All Customer
                </span>
              </button>
            </li>
            <li
              onClick={(e) => {
                setCurrentTab("active");
              }}
            >
              <button
                style={{ fontSize: "15px" }}
                className={`btn ${commonClass} ${
                  currentTab === "active"
                    ? "active btn-dark"
                    : "btn-outline-dark"
                }`}
                id="active-tab"
              >
                <i className="ti ti-check fill-white"></i>
                <span className="d-none d-md-block fw-medium">
                  Active Customer
                </span>
              </button>
            </li>
            <li
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab("de-active");
              }}
            >
              <button
                style={{ fontSize: "15px" }}
                className={`btn ${commonClass} ${
                  currentTab === "de-active"
                    ? "active btn-dark"
                    : "btn-outline-dark"
                }`}
                id="deactive-tab"
              >
                <i className="ti ti-x fill-white"></i>
                <span className="d-none d-md-block fw-medium">
                  Deactive Customer
                </span>
              </button>
            </li>
          </ul>

          <div className="table-responsive border rounded">
            <Table responsive striped bordered hover>
              <thead>
                <tr style={{ textAlign: "center" }}>
                  <th>Name</th>
                  <th>Mobile Number</th>
                  <th>Meter No</th>
                  <th>Default Rate</th>
                  <th>Last Bill</th>
                  <th>Rent Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{filterItem()}</tbody>
            </Table>
          </div>
        </div>
      </div>
      {/* <Table responsive striped bordered hover>
        <thead>
          <tr style={{ textAlign: "center" }}>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Meter No</th>
            <th>Default Rate</th>
            <th>Last Bill</th>
            <th>Rent Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers?.map((customer) => (
            <tr key={customer?._id} style={{ textAlign: "center" }}>
              <td>{customer?.name}</td>
              <td>{customer?.mobile_number}</td>
              <td>{customer?.bill_no}</td>
              <td>{customer?.default_unit_per_rate}</td>
              <td>{customer?.last_bill_unit}</td>
              <td>{formatDate(customer?.rent_date, "date")}</td>
              <td>
                <Button
                  variant="warning"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => deleteCustomer(customer._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table> */}
    </>
  );
};

export default CustomerList;
