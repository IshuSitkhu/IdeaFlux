import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminLikes = () => {
  const [likes, setLikes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const likesPerPage = 10;
  const token = localStorage.getItem("token");

  const fetchLikes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/likes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikes(res.data.likes || []);
    } catch (err) {
      console.error("Fetch likes error:", err);
      toast.error("Failed to fetch likes");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this like?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/admin/likes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Like deleted successfully!");
      fetchLikes(); // Refresh list
    } catch (err) {
      console.error("Delete like error:", err);
      toast.error("Failed to delete like");
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  const totalPages = Math.ceil(likes.length / likesPerPage);
  const indexOfLast = currentPage * likesPerPage;
  const indexOfFirst = indexOfLast - likesPerPage;
  const currentLikes = likes.slice(indexOfFirst, indexOfLast);

  const paginationBtnStyle = (disabled) => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? "#d1d5db" : "#2274a1",
    color: "#fff",
    fontWeight: "bold",
    width: "100px",
  });

  return (
    <div style={{ padding: 20, minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 20 }}>
        Admin Panel - Manage Likes
      </h1>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f1f5f9", fontWeight: 700 }}>
            <tr>
              <th style={{ padding: 12 }}>SN</th>
              <th style={{ padding: 12 }}>User</th>
              <th style={{ padding: 12 }}>Blog</th>
              <th style={{ padding: 12, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLikes.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                  No likes found
                </td>
              </tr>
            ) : (
              currentLikes.map((like, idx) => (
                <tr key={like._id}>
                  <td style={{ padding: 12 }}>{indexOfFirst + idx + 1}</td>
                  <td style={{ padding: 12 }}>
                    {like.user?.name || "Unknown"}
                  </td>
                  <td style={{ padding: 12 }}>
                    {like.blog?.title || "Deleted Blog"}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(like._id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {likes.length > likesPerPage && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 20 }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle(currentPage === totalPages)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLikes;
