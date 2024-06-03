import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import EmailSummarizer from "./Components/EmailSummarizer";
import Login from "./Components/Login";
import SavedEmails from "./Components/SavedEmails";
import Signup from "./Components/Signup";

export default function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/saved_emails" element={<SavedEmails />} />
            <Route path="/" element={<EmailSummarizer />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}
