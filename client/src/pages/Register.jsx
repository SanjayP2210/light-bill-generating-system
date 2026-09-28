import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/Common/PasswordInput/PasswordInput";
import { IconReceiptRupee } from "@tabler/icons-react";
import homeBannerImage from "../assets/home-screen-banner.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!emailRegex.test(form.email)) return "Enter a valid email address";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    try {
      setLoading(true);
      const res = await register(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );
      toast.success(res?.message || "Registration successful");
      navigate("/", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* <div className="auth-card-header">
          <h1 className="auth-card-title">Create Account</h1>
          <p className="auth-card-subtitle">
            Start managing your customers and bills.
          </p>
        </div> */}
        <div className="page-hero auth-hero">
        <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconReceiptRupee size={30} stroke={1.75} />
          </div>
          <div>
            <h6 className="page-hero-title">Bill Generating System</h6>
            <p className="page-hero-subtitle">
              Manage your customers and bills efficiently.
            </p>
          </div>
        </div>
        <div className="page-hero-art" aria-hidden="true">
        <img src={homeBannerImage} alt="Bill illustration" />
        </div>
      </div>
        {error && <div className="auth-error">{error}</div>}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="registerName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>Password</Form.Label>
            <PasswordInput
              id="registerPassword"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <Form.Text className="helper-text">
              Use at least 8 characters.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <PasswordInput
              id="registerConfirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </Form.Group>

          <Button
            type="submit"
            variant="dark"
            className="w-100"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </Form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
