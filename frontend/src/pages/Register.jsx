import { useState } from "react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", role);

    setSuccess("Account created successfully!");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="w-100 px-3" style={{ maxWidth: "500px" }}>
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-danger">🍔 FoodApp</h2>
              <p className="text-muted">Create your account</p>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            {success && (
              <div className="alert alert-success py-2">{success}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="form-text text-muted">
                  Password must be at least 6 characters
                </div>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label fw-semibold">
                  I want to
                </label>
                <select
                  id="role"
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">
                    Customer — I want to order food
                  </option>
                  <option value="restaurant">
                    Restaurant Owner — I want to sell food
                  </option>
                </select>
              </div>

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn btn-danger btn-lg"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            <div className="text-center mt-3">
              <p className="text-muted mb-0">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-danger fw-semibold text-decoration-none"
                >
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
