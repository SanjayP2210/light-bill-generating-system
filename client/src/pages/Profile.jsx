import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { IconCamera, IconLogout, IconTrash } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/Common/PasswordInput/PasswordInput";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const apiOrigin = (import.meta.env.VITE_APP_API_URL || "").replace(/\/api\/?$/, "");

const Profile = () => {
  const { user, updateProfile, updateAvatar, changePassword, deactivateAccount, logout } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deactivating, setDeactivating] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setProfileSaving(true);
      const res = await updateProfile(profileForm);
      toast.success(res?.message || "Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }
    try {
      setAvatarUploading(true);
      await updateAvatar(file);
      toast.success("Avatar updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not upload avatar");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setPasswordSaving(true);
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      toast.success(res?.message || "Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Deactivate your account? You will be logged out and won't be able to log back in until it's reactivated.")) {
      return;
    }
    try {
      setDeactivating(true);
      await deactivateAccount();
      toast.success("Your account has been deactivated");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not deactivate account");
    } finally {
      setDeactivating(false);
    }
  };

  const avatarSrc = user?.avatar ? `${apiOrigin}${user.avatar}` : null;

  return (
    <Container className="app-container">
      <div className="mb-4">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information and security.</p>
      </div>

      <Row className="g-4">
        <Col lg={5}>
          <Card>
            <Card.Header className="customer-form">
              <h4 className="section-title">Profile Information</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column align-items-center mb-4">
                <div className="avatar-circle lg mb-3">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user?.name} />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline-dark"
                  size="sm"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <IconCamera size={16} stroke={1.75} className="me-2" />
                  {avatarUploading ? "Uploading..." : "Change Photo"}
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                  aria-label="Upload profile photo"
                />
              </div>

              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3" controlId="profileName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="profileEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={user?.email || ""} disabled readOnly />
                  <Form.Text className="helper-text">
                    Email cannot be changed.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="profilePhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
                <Button type="submit" variant="dark" disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save Changes"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="mb-4">
            <Card.Header className="customer-form">
              <h4 className="section-title">Change Password</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <PasswordInput
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmNewPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <PasswordInput
                    id="confirmNewPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                  />
                </Form.Group>
                <Button type="submit" variant="dark" disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Change Password"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="customer-form">
              <h4 className="section-title">Account</h4>
            </Card.Header>
            <Card.Body className="d-flex flex-wrap gap-2">
              <Button variant="outline-dark" onClick={handleLogout}>
                <IconLogout size={18} stroke={1.75} className="me-2" />
                Logout
              </Button>
              {user?.role !== "admin" && (
                <Button
                  variant="outline-danger"
                  onClick={handleDeactivate}
                  disabled={deactivating}
                >
                  <IconTrash size={18} stroke={1.75} className="me-2" />
                  {deactivating ? "Deactivating..." : "Deactivate Account"}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
