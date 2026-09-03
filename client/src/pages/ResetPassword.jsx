import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/Common/PasswordInput/PasswordInput";

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(token, form.password, form.confirmPassword);
      toast.success(res?.message || "Password reset successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Reset link is invalid or has expired"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-card-title">Reset Password</h1>
          <p className="auth-card-subtitle">Choose a new password below.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="resetPassword">
            <Form.Label>New Password</Form.Label>
            <PasswordInput
              id="resetPassword"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="resetConfirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <PasswordInput
              id="resetConfirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </Form.Group>

          <Button
            type="submit"
            variant="dark"
            className="w-100"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </Form>

        <p className="auth-footer-text">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
