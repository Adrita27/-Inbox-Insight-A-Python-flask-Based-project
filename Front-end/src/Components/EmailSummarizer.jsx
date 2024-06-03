import axios from "axios";
import { useEffect, useState } from "react";
import braclogo from "../assets/brac.png";
import "../styles.css";

import { useNavigate } from "react-router-dom";

const EmailSummarizer = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password");
    setIsLoggedIn(!!email);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSummarize = async () => {
    try {
      setIsLoading(true); // Set loading state to true
      setSearchTerm("");
      const email = sessionStorage.getItem("email");
      const password = sessionStorage.getItem("password");
      if (email) {
        const response = await axios.post(
          "http://127.0.0.1:5000/summarize_emails",
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
          console.log("Summary Done");
          const emailsResponse = await axios.get(
            "http://127.0.0.1:5000/get_emails"
          );
          setEmails(emailsResponse.data);
        }
      } else {
        console.log("No email found in session storage");
        alert("Invalid entry. Please log in again.");
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      console.error("Error in summarizing emails:", error);
    } finally {
      setIsLoading(false);
      console.log(emails);
      // Set loading state to false
    }
  };

  const handleSavedEmailButtonClick = () => {
    navigate("/saved_emails");
  };

  const handleSave = async (email, index) => {
    try {
      const rowData = {
        Index: index + 1,
        "Email Time": email[1],
        "Sender Name": email[2],
        "Receiver Name": email[3],
        "Receiver CC": email[4],
        "Body Summary": email[5],
        Subject: email[6],
      };
      const response = await axios.post(
        "http://127.0.0.1:5000/save_email",
        rowData
      );
      if (response.data.message === "Email saved successfully") {
        alert("Data Successfully Saved!");
      } else {
        alert("Failed to save data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // const handleDelete = (email, index) => {
  //   event.preventDefault(); // Your save logic here
  //   const rowData = {
  //     Index: index + 1,
  //     "Email Time": email["Email Time"],
  //     "Sender Name": email["Sender Name"],
  //     "Receiver Name": email["Receiver Name"],
  //     "Receiver CC": email["Receiver CC"],
  //     Subject: email["Subject"],
  //   };
  //   const jsonString = JSON.stringify(rowData);

  //   fetch("http://127.0.0.1:5000/delete_email", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: jsonString,
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data && data.message === "OK") {
  //         alert("Data Deleted Successfully");
  //         // You can add further logic here if needed
  //       } else {
  //         alert("Failed to delete data. Please try again.");
  //         // You can handle other response scenarios here
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error saving data:", error);
  //       // You can handle errors here
  //     });
  // };

  const handleDelete = (email, index) => {
    event.preventDefault(); // Your save logic here
    const rowData = {
      Index: index + 1,
      "Email Time": email[1],
      "Sender Name": email[2],
      "Subject": email[6],
    };
    const jsonString = JSON.stringify(rowData);
  
    axios.post("http://127.0.0.1:5000/delete_email", rowData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.data && response.data.message === "OK") {
          setEmails(prevEmails => prevEmails.filter((_, i) => i !== index));
          alert("Data Deleted Successfully");                   
          
        } else {
          alert("Failed to delete data. Please try again.");
          
        }
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        // You can handle errors here
      });
  };
  

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // const filteredEmails = emails.filter((email) => {
  //   return email[6].toLowerCase().includes(searchTerm.toLowerCase());
  // });
  const filteredEmails = emails.filter((email) => {
    return Object.values(email).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  

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
            onClick={handleSavedEmailButtonClick}
          >
            {" "}
            Saved Emails{" "}
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
        <h1 className="font-bold mb-2 text-2xl">Email Summarizer</h1>
        <button
          className="text-white mb-3 bg-blue-600 rounded-md px-2 py-1"
          id="summaryBtn"
          onClick={handleSummarize}
        >
          Summary
        </button>

        {/* {!searchTerm && !isLoading && <p>No emails found.</p>} */}

        {isLoading && (
          <p className="loading loading-spinner text-primary">Loading...</p>
        )}

        {!isLoading && (
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
                  <th className="border  border-gray-300 text-center whitespace-normal overflow-wrap break-words">
                    Body Summary
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
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSummarizer;
