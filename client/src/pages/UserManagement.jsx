import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Container, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { IconShield, IconUserCheck, IconUserX } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import userManagementBannerImage from "../assets/user-management-banner.svg";

const apiUrl = import.meta.env.VITE_APP_API_URL;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const UserManagement = ({ setShowLoader }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setShowLoader?.(true);
      const res = await axios.get(`${apiUrl}/users`);
      setUsers(res?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching users");
    } finally {
      setShowLoader?.(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStatus = async (targetUser) => {
    try {
      setUpdatingId(targetUser.id);
      const res = await axios.put(`${apiUrl}/users/${targetUser.id}/status`, {
        isActive: !targetUser.isActive,
      });
      toast.success(res?.data?.message || "User status updated");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRole = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${targetUser.name}'s role to "${nextRole}"?`)) {
      return;
    }
    try {
      setUpdatingId(targetUser.id);
      const res = await axios.put(`${apiUrl}/users/${targetUser.id}/role`, {
        role: nextRole,
      });
      toast.success(res?.data?.message || "User role updated");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container className="app-container">
      <div className="page-hero">
        <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconShield size={28} stroke={1.75} />
          </div>
          <div>
            <p className="page-hero-eyebrow">Administration</p>
            <h1 className="page-hero-title">User Management</h1>
            <p className="page-hero-subtitle">
              Each user only sees their own customers and bills — activating or
              promoting a user does not grant access to anyone else&apos;s data.
            </p>
          </div>
        </div>
        <div className="page-hero-art" aria-hidden="true">
          <img src={userManagementBannerImage} alt="User management illustration" />
        </div>
      </div>

      <Card>
        <Card.Header className="customer-form">
          <h4 className="section-title">All Users</h4>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table responsive striped bordered hover>
              <thead>
                <tr style={{ textAlign: "center" }}>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ width: "220px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} style={{ textAlign: "center" }}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="role-badge">{u.role}</span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${u.isActive ? "active" : "inactive"}`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td className="action-buttons">
                        <Button
                          variant={u.isActive ? "outline-danger" : "outline-success"}
                          size="sm"
                          disabled={updatingId === u.id || u.id === currentUser?.id}
                          aria-label={u.isActive ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.isActive ? (
                            <IconUserX size={16} stroke={1.75} />
                          ) : (
                            <IconUserCheck size={16} stroke={1.75} />
                          )}
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={updatingId === u.id || u.id === currentUser?.id}
                          aria-label={`Change role for ${u.name}`}
                          onClick={() => toggleRole(u)}
                        >
                          <IconShield size={16} stroke={1.75} />{" "}
                          {u.role === "admin" ? "Make User" : "Make Admin"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                      <p className="my-3">
                        <b>No Users Found</b>
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagement;
