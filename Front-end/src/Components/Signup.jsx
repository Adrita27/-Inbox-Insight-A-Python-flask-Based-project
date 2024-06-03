import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/signup",
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
        alert("Successful signup");
        navigate("/login"); // Redirect to login page
      } else {
        alert("Invalid operation");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server Error:", error.response.data);
        alert("User already registered");
      } else if (error.request) {
        console.error("Request Error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center container">
      <h2 className="font-bold  text-2xl">Sign Up</h2>
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
            value="Sign Up"
            onClick={handleSignup}
          />
        </div>
      </form>

      <p className="text-center my-2 text-green-500">
        Already have an account?{" "}
        <NavLink to="/login" className="underline">
          Login
        </NavLink>
      </p>
    </div>
  );
};

export default Signup;
