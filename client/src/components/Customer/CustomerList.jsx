/* eslint-disable react/prop-types */
import { Form, InputGroup, Table } from "react-bootstrap";
import axios from "axios";
import { formatDate } from "../../Utilities/Utils";
import { useState } from "react";
import { IconCheck, IconEdit, IconList, IconSearch, IconX } from "@tabler/icons-react";

const CustomerList = ({
  customers,
  fetchCustomers,
  setSelectedCustomer,
  resetForm,
  setShowLoader,
}) => {
  const [currentTab, setCurrentTab] = useState("all");
  const [search, setSearch] = useState("");
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  // const deleteCustomer = async (id) => {
  //   try {
  //     const response = await axios.delete(`${apiUrl}/customers/${id}`);
  //     if (response?.data?.isError) {
  //       toast.error(response?.data?.message);
  //     } else {
  //       fetchCustomers();
  //     }
  //   } catch (error) {
  //     console.error("Error fetching customers:", error?.data?.message);
  //     toast.error("Error deleting customers");
  //   }
  // };

  const handleActiveDeactive = async (id, item) => {
    try {
      setShowLoader(true);
      const response = await axios.patch(
        `${apiUrl}/customers/active-deactive-customer/${id}`,
        {
          isActive: !item?.isActive,
        }
      );
      if (response) {
        fetchCustomers();
        resetForm();
        setShowLoader(false);
      }
    } catch (error) {
      console.log("error", error);
      setShowLoader(false);
    }
  };

  const filterItem = () => {
    const searchTerm = search.trim().toLowerCase();
    const filterItems = customers?.filter((item) => {
      const matchesTab =
        currentTab === "all"
          ? true
          : currentTab === "active"
          ? item?.isActive
          : !item?.isActive;
      const matchesSearch =
        !searchTerm ||
        item?.name?.toLowerCase().includes(searchTerm) ||
        item?.mobile_number?.toLowerCase().includes(searchTerm);
      return matchesTab && matchesSearch;
    });

    if (filterItems?.length > 0) {
      return filterItems.map((item) => {
        return (
          <tr style={{ textAlign: "center" }} key={item?._id}>
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
                {item?.floor_no || "-"}
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
                  aria-label={`Edit ${item?.name}`}
                  onClick={() => {
                    setSelectedCustomer(item);
                  }}
                >
                  <IconEdit
                    size={22}
                    stroke={1.75}
                    style={{ color: "var(--bs-primary)" }}
                  />
                </a>
              )}
              <a
                className="fs-6 text-muted"
                href="javascript:void(0)"
                style={{ marginLeft: "16px" }}
                aria-label={
                  item?.isActive
                    ? `Deactivate ${item?.name}`
                    : `Activate ${item?.name}`
                }
                onClick={() => {
                  handleActiveDeactive(item?._id, item);
                }}
              >
                {item?.isActive ? (
                  <IconX size={22} stroke={1.75} style={{ color: "var(--color-red-600)" }} />
                ) : (
                  <IconCheck size={22} stroke={1.75} style={{ color: "var(--color-green-600)" }} />
                )}
              </a>
            </td>
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td colSpan="8" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
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
          <InputGroup className="mb-3 search-input-group">
            <InputGroup.Text>
              <IconSearch size={18} stroke={1.75} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search customers by name or mobile number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search customers"
            />
          </InputGroup>

          <ul className="filter-buttons p-3 mb-3 rounded card flex-row center-item">
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab("all");
              }}
              style={{ fontSize: "15px" }}
              className={`btn ${
                currentTab === "all" ? "active btn-dark" : "btn-outline-dark"
              }`}
              id="all-tab"
              aria-pressed={currentTab === "all"}
            >
              <IconList style={{ width: "17px" }} />{" "}
              <span className="fw-medium">All</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab("active");
              }}
              style={{ fontSize: "15px" }}
              className={`btn ${
                currentTab === "active" ? "active btn-dark" : "btn-outline-dark"
              }`}
              id="active-tab"
              aria-pressed={currentTab === "active"}
            >
              <IconCheck style={{ width: "20px", color: "var(--color-green-600)" }} />{" "}
              {/* <i className="ti ti-check fill-white"></i> */}
              <span className="fw-medium">Active</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab("de-active");
              }}
              style={{ fontSize: "15px" }}
              className={`btn ${
                currentTab === "de-active"
                  ? "active btn-dark"
                  : "btn-outline-dark"
              }`}
              id="deactive-tab"
              aria-pressed={currentTab === "de-active"}
            >
              <IconX style={{ width: "20px", color: "var(--color-red-600)" }} />{" "}
              <span className="fw-medium">Deactive</span>
            </button>
          </ul>

          <div className="table-responsive border rounded">
            <Table responsive striped bordered hover>
              <thead>
                <tr style={{ textAlign: "center" }}>
                  <th>Name</th>
                  <th>Mobile Number</th>
                  <th>Meter No</th>
                  <th>Floor No</th>
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
