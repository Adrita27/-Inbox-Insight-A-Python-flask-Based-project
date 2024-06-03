import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import braclogo from "../assets/brac.png";
import "../styles.css";

export default function SavedEmails() {
  const [emails, setEmails] = useState([]);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleSavedEmailButtonClick = async () => {
      try {
        setEmails([]);
        const emailsResponse = await axios.get(
          "http://127.0.0.1:5000/get_saved_emails"
        );
        if (emailsResponse.data) {
          setEmails(emailsResponse.data);
        } else {
          console.log("No data found!");
        }
      } catch (error) {
        console.error("Error fetching saved emails:", error);
      }
    };

    handleSavedEmailButtonClick();
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredEmails = emails.filter((email) => {
    return email[6].toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };
  return (
    <div>
      <div className="flex justify-between items-center mx-6 ">
        <div className="flex">
          <div className="image-container">
            <img src={braclogo} className="w-44" alt="Brac Bank Logo" />
          </div>
        </div>

        <div className="relative flex  mt-1">
          <input
            type="search"
            className="relative m-0 -me-0.5 block flex-auto rounded-s border border-solid border-blue-600 bg-gray-100 bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-blue-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-blue-800 dark:placeholder:text-blue-900 dark:autofill:shadow-autofill dark:focus:border-primary"
            placeholder="Search"
            aria-label="Search"
            id="exampleFormControlInput3"
            aria-describedby="button-addon3"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
        </div>

        <div className="flex">
          <button
            className="text-white ml-auto mb-3 bg-blue-600 rounded-md py-1 m-4 px-2"
            id="savedEmailBtn"
            onClick={() => {
              navigate("/");
            }}
          >
            {" "}
            Home{" "}
          </button>

          <button
            className=" bg-red-400 mb-3 ml-auto text-white rounded-md py-1 m-4 px-2 "
            id="logoutBtn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container flex flex-col items-center justify-center">
        <h1 className="font-bold mb-2 text-2xl">Saved Emails</h1>

        <div className="overflow-x-auto ml-7">
          <table
            className="text-xs table-zebra table-fixed md:text-base border-collapse w-full"
            id="emailTable"
          >
            <thead>
              <tr>
                <th className="border w-[70px] border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Serial
                </th>
                <th className="border w-1/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Email Time
                </th>
                <th className="border w-1/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Sender Name
                </th>
                <th className="border w-1/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Receiver Name
                </th>
                <th className="border w-1/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Receiver CC
                </th>
                <th className="border w-2/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Subject
                </th>
                <th className="border border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Body Summary
                </th>
                <th className="border w-1/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                  Status
                </th>
                <th
                  className="border w-2/12 border-gray-300 text-center whitespace-normal overflow-wrap break-words"
                  colSpan="2"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {searchTerm
                ? filteredEmails.map((email, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[1]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[2]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[3]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[4]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[6]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[5]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        pending
                      </td>
                      <td className="border border-gray-300 text-left">
                        <button
                          onClick={() => handleSave(email, index)}
                          className="text-white rounded-md px-2 py-1 bg-green-500"
                        >
                          Save
                        </button>
                      </td>
                      <td className="border border-gray-300 text-left">
                        <button
                          onClick={() => handleDelete(email, index)}
                          className="text-white bg-yellow-400 rounded-md px-2 py-1"
                        >
                          Done
                        </button>
                      </td>
                    </tr>
                  ))
                : emails.map((email, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[1]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[2]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[3]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[4]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[6]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        {email[5]}
                      </td>
                      <td className="border border-gray-300 text-left whitespace-normal overflow-wrap break-words">
                        pending
                      </td>
                      <td className="border border-gray-300 text-left">
                        <button className="text-white rounded-md px-2 py-1 bg-green-500">
                          Edit
                        </button>
                      </td>
                      <td className="border border-gray-300 text-left">
                        <button className="text-white bg-yellow-400 rounded-md px-2 py-1">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
