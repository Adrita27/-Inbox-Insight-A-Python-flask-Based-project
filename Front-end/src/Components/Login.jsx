// import "../styles.css";

import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "OK") {
        const email = response.data.email;
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password",password) // Store email in session storage
        navigate("/"); // Redirect to index.html
      }
    } catch (error) {
      alert("Authentication error", error);
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center container">
      <h2 className="font-bold text-2xl">Login</h2>
      <form className="flex flex-col justify-center items-center w-6/12">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            className="text-white bg-sky-600 rounded-md cursor-pointer"
            type="button"
            value="Login"
            onClick={handleLogin}
          />
        </div>
      </form>

      <p className="text-center my-2 text-green-500">
        Don't have an account?{" "}
        <NavLink to="/signup" className="underline">
          Create an account
        </NavLink>
      </p>
    </div>
  );
};

export default Login;
