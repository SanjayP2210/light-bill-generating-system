/* eslint-disable react/prop-types */
import { Form, Table } from "react-bootstrap";

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
var yyyy = today.getFullYear();

let todayDate = dd + "/" + mm + "/" + yyyy;
const NewBillTableView = ({
  tableValue,
  comments,
  setComments,
  customerName,
}) => {
  const generateTableRows = () => {
    const tableData = Object.keys(tableValue);
    const fileredData = tableData?.map((row, index) => {
      const key = row;
      const value = tableValue[key];
      return (
        <tr key={index}>
          {key === "comments" && !value ? (
            <>
              <td className="text-center">Comment</td>
              <td>
                <Form.Control
                  value={comments}
                  as="textarea"
                  rows={3}
                  name="comments"
                  onChange={(e) => {
                    setComments(e.target.value);
                  }}
                />
              </td>
            </>
          ) : (
            <>
              <td className="text-center">
                {key?.toString()?.replaceAll("_", " ")}
              </td>
              <td
                className={`text-center ${
                  key === "Used_Unit"
                    ? "font-red"
                    : key === "RS"
                    ? "font-blue"
                    : ""
                }`}
              >
                {key === "Unit_Point"
                  ? `x  ${value}`
                  : key === "Previouse_Unit"
                  ? `-  ${value}`
                  : key === "Extra_Unit" && value
                  ? `+ ${value}`
                  : value}
              </td>
            </>
          )}
        </tr>
      );
    });
    return fileredData;
  };
  return (
    <div>
      <div>
        <div>
          <div
            style={{
              justifyContent: "center",
              display: "flex",
            }}
          >
            <h3 className="new-bill-title">Light Bill of {customerName}</h3>
          </div>
          <hr />
        </div>
        <Table
          responsive
          //   striped
          bordered
          hover
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontFamily: "circular",
            border: "2px solid",
          }}
        >
          <thead className="thead-dark">
            <tr>
              <th className="table-dark text-center">Date</th>
              <th className="table-dark text-center">{todayDate}</th>
            </tr>
          </thead>
          <tbody>{generateTableRows(tableValue)}</tbody>
        </Table>
        <div
          style={{
            justifyContent: "center",
            display: "flex",
          }}
        >
          <h3 className="new-bill-title mt-4">
            Total Bill:-{" "}
            <span style={{ color: "blue" }}>{tableValue.total_price || 0}</span>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default NewBillTableView;
