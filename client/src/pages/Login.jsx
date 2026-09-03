import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/Common/PasswordInput/PasswordInput";
import homeBannerImage from "../assets/home-screen-banner.png";
import { IconReceiptRupee } from "@tabler/icons-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await login(form.email, form.password);
      toast.success(res?.message || "Login successful");
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg">
    <Container className="app-container auth-shell">
    <div className="auth-page">
      <div className="auth-card">
    <div className="page-hero auth-hero">
        <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconReceiptRupee size={30} stroke={1.75} />
          </div>
          <div>
            <p className="page-hero-eyebrow">
              Welcome back 👋
            </p>
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
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="email"
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <PasswordInput
              id="loginPassword"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </Form.Group>

          <div className="text-end mb-3">
            <Link to="/forgot-password" className="helper-text">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="dark"
            className="w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
    </Container>
    </div>
  );
};

export default Login;
