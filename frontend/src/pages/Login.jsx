import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);

    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="w-100 px-3" style={{ maxWidth: "450px" }}>
        <div className="card shadow border-0">
          <div className="card-body p-4">
            {/* Title */}
            <div className="text-center mb-4">
              <h2 className="fw-bold text-danger">🍔 FoodApp</h2>
              <p className="text-muted">Welcome back! Please login</p>
            </div>

            {/* Error Message */}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
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

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              {/* ✅ Fixed — removed the comment from inside the tag */}
              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn btn-danger btn-lg"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div className="text-center mt-3">
              <p className="text-muted mb-0">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-danger fw-semibold text-decoration-none"
                >
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
