// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const ActivateAccount = () => {
//   const { token } = useParams();
//   const [message, setMessage] = useState("Activating your account...");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const activate = async () => {
//       try {
//         const res = await axios.post(
//           "http://localhost:8000/api/auth/activate",
//           { token }
//         );
//         setMessage(res.data.message);
//       } catch (err) {
//         setError(err.response?.data?.message || "Activation failed.");
//       }
//     };
//     activate();
//   }, [token]);

//   return (
//     <div className="activation-container">
//       <h2>Account Activation</h2>
//       {error ? <p style={{ color: "red" }}>{error}</p> : <p>{message}</p>}
//     </div>
//   );
// };

// export default ActivateAccount;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Activating your account...");

  useEffect(() => {
    const activate = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/activate/${token}`);
        setMessage("✅ Account activated successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000); // Redirect after 3 sec
      } catch (err) {
        setMessage("❌ Activation failed. Token may be expired or invalid.");
      }
    };

    activate();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default ActivateAccount;
