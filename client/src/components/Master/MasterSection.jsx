/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { IconCheck, IconEdit, IconPlus, IconX } from "@tabler/icons-react";
import Select from "../Common/Select/Select";

const apiUrl = import.meta.env.VITE_APP_API_URL;

// `parent` (optional) makes this section dependent on another master type,
// e.g. Meter No belongs to a Floor No: { type: 'floor-no', label: 'Floor No' }
// `refreshSignal` (optional) — when this value changes, the parent option
// list is re-fetched (used so Meter No picks up Floor No add/edit/delete).
// `onItemsChange` (optional) — called after this section's own data changes,
// so a dependent section (e.g. Meter No) can refresh its parent list.
const MasterSection = ({
  type,
  title,
  subtitle,
  icon: Icon,
  placeholder,
  parent,
  refreshSignal,
  onItemsChange,
}) => {
  const [items, setItems] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [filterParent, setFilterParent] = useState(null);
  const [formParent, setFormParent] = useState(null);
  const [value, setValue] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchParentOptions = async () => {
    if (!parent) return;
    try {
      const res = await axios.get(`${apiUrl}/masters/${parent.type}`);
      const options = (res?.data?.data || []).map((item) => ({
        label: item.value,
        value: item.value,
      }));
      setParentOptions(options);
    } catch (error) {
      console.error(`Error fetching ${parent.label}:`, error);
    }
  };

  const fetchItems = async () => {
    try {
      const params = parent && filterParent?.value ? { floor_no: filterParent.value } : {};
      const res = await axios.get(`${apiUrl}/masters/${type}/master-list`, { params });
      setItems(res?.data?.data || []);
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      toast.error(`Error fetching ${title}`);
    }
  };

  useEffect(() => {
    fetchParentOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParent]);

  const resetForm = () => {
    setValue("");
    setEditingItem(null);
    setFormParent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (parent && !formParent?.value) {
      toast.warn(`Please select a ${parent.label} first`);
      return;
    }
    try {
      setSaving(true);
      const payload = {
        value,
        ...(parent ? { floor_no: formParent.value } : {}),
      };
      const res = editingItem
        ? await axios.put(`${apiUrl}/masters/${type}/${editingItem._id}`, {
            ...payload,
            isActive: editingItem.isActive,
          })
        : await axios.post(`${apiUrl}/masters/${type}`, payload);

      if (res?.data?.isError) {
        toast.error(res?.data?.message);
      } else {
        toast.success(res?.data?.message || "Saved Successfully");
        resetForm();
        fetchItems();
        onItemsChange?.();
      }
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
      toast.error(`Error saving ${title}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      const res = await axios.patch(`${apiUrl}/masters/${type}/${item._id}/status`, {
        isActive: !item.isActive,
      });
      if (res?.data?.isError) {
        toast.error(res?.data?.message);
      } else {
        fetchItems();
        onItemsChange?.();
      }
    } catch (error) {
      console.error(`Error updating ${title}:`, error);
      toast.error(`Error updating ${title}`);
    }
  };

  return (
    <Row className="g-4">
      <Col lg={5}>
        <Card>
          <Card.Header className="customer-form">
            <div className="card-title-row">
              <div className="card-title-icon">
                <Icon size={20} stroke={1.75} />
              </div>
              <div className="card-title-text">
                <h4 className="section-title">
                  {editingItem ? `Edit ${title}` : title}
                </h4>
                <span className="helper-text">{subtitle}</span>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              {parent && (
                <Form.Group controlId={`master-${type}-parent`} className="mb-3">
                  <Form.Label>{parent.label}</Form.Label>
                  <Select
                    value={formParent}
                    onChange={(val) => setFormParent(val)}
                    options={parentOptions}
                    placeholder={`Select ${parent.label.toLowerCase()}...`}
                  />
                  {parentOptions.length === 0 && (
                    <Form.Text className="text-muted">
                      No {parent.label} found yet — add one above first.
                    </Form.Text>
                  )}
                </Form.Group>
              )}
              <Form.Group controlId={`master-${type}-value`} className="mb-3">
                <Form.Label>{title}</Form.Label>
                <Form.Control
                  type="text"
                  value={value}
                  placeholder={placeholder}
                  onChange={(e) => setValue(e.target.value)}
                />
              </Form.Group>
              <div className="center-item">
                <Button
                  variant="outline-dark"
                  type="submit"
                  disabled={saving || !value.trim() || (!!parent && !formParent?.value)}
                >
                  <IconPlus style={{ width: "18px" }} />{" "}
                  {editingItem ? "Update" : "Add"} {title}
                </Button>
                {editingItem && (
                  <Button
                    variant="outline-dark"
                    type="button"
                    style={{ marginLeft: "12px" }}
                    onClick={resetForm}
                  >
                    <IconX style={{ width: "18px", color: "var(--color-red-600)" }} /> Cancel
                  </Button>
                )}
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={7}>
        <Card>
          <Card.Header className="customer-form">
            <h4 className="section-title">{title} List</h4>
          </Card.Header>
          <Card.Body>
            {parent && (
              <Form.Group controlId={`master-${type}-filter`} className="mb-3">
                <Form.Label>Filter by {parent.label}</Form.Label>
                <Select
                  value={filterParent}
                  onChange={(val) => setFilterParent(val)}
                  options={parentOptions}
                  placeholder={`All ${parent.label}s`}
                  isClearable
                />
              </Form.Group>
            )}
            <div className="table-responsive">
              <Table responsive striped bordered hover>
                <thead>
                  <tr style={{ textAlign: "center" }}>
                    {parent && <th>{parent.label}</th>}
                    <th>{title}</th>
                    <th>Status</th>
                    <th style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item._id} style={{ textAlign: "center" }}>
                        {parent && (
                          <td
                            style={{
                              textDecoration: !item.isActive ? "line-through" : "none",
                            }}
                          >
                            {item.floor_no}
                          </td>
                        )}
                        <td
                          style={{
                            textDecoration: !item.isActive ? "line-through" : "none",
                          }}
                        >
                          {item.value}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${item.isActive ? "active" : "inactive"}`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            aria-label={`Edit ${item.value}`}
                            onClick={() => {
                              setEditingItem(item);
                              setValue(item.value);
                              if (parent) {
                                setFormParent({ label: item.floor_no, value: item.floor_no });
                              }
                            }}
                          >
                            <IconEdit size={16} stroke={1.75} />
                          </Button>
                          <Button
                            variant={item.isActive ? "outline-danger" : "outline-success"}
                            size="sm"
                            aria-label={item.isActive ? `Deactivate ${item.value}` : `Activate ${item.value}`}
                            onClick={() => toggleStatus(item)}
                          >
                            {item.isActive ? (
                              <IconX size={16} stroke={1.75} />
                            ) : (
                              <IconCheck size={16} stroke={1.75} />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={parent ? "4" : "3"}
                        style={{ textAlign: "center", color: "var(--color-text-secondary)" }}
                      >
                        <p className="my-3">
                          <b>No {title} Found</b>
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default MasterSection;
