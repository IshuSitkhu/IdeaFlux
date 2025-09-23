import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminBlogForm from "../components/AdminBlogForm";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedBlogs = (res.data.blogs || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBlogs(sortedBlogs);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Failed to fetch blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blog deleted successfully!");
      fetchBlogs();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Failed to delete blog");
    }
  };

  const handleEdit = (id) => {
    const blogToEdit = blogs.find((b) => b._id === id);
    if (blogToEdit) {
      blogToEdit.categories =
        Array.isArray(blogToEdit.categories) && blogToEdit.categories.length
          ? blogToEdit.categories
          : [];
      setEditingBlog(blogToEdit);
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const paginationBtnStyle = (disabled) => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? "#d1d5db" : "#2274a1",
    color: "#fff",
    fontWeight: "bold",
    width:"100px",
  });

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: 20,
          color: "#1f2937",
        }}
      >
        Admin Panel - Manage Blogs
      </h1>

      {!showForm && !editingBlog && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: "14px 0",
            backgroundColor: "#2274a1",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "15px",
            transition: "all 0.3s ease",
            boxShadow: "0 3px 8px rgba(37,99,235,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2274a1")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2274a1d9")}
        >
          ➕ Add New Blog
        </button>
      )}

      {(showForm || editingBlog) && (
        <AdminBlogForm
          blog={editingBlog || null}
          onSuccess={() => {
            setEditingBlog(null);
            setShowForm(false);
            fetchBlogs();
          }}
          onCancelEdit={() => {
            setEditingBlog(null);
            setShowForm(false);
          }}
        />
      )}

      {/* Responsive Table Wrapper */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderRadius: 8,
      overflow: "hidden",
    }}
  >
    <thead
      style={{
        backgroundColor: "#f1f5f9",
        fontSize: 18,
        fontWeight: 700,
        borderBottom: "2px solid #e5e7eb",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
      }}
    >
      <tr>
        <th style={{ padding: 14, textAlign: "left" }}>SN</th>
        <th style={{ padding: 14, textAlign: "left" }}>Image</th>
        <th style={{ padding: 14, textAlign: "left" }}>Title</th>
        <th style={{ padding: 14, textAlign: "left" }}>Author</th>
        <th style={{ padding: 14, textAlign: "left" }}>Date</th>
        <th style={{ padding: 14, textAlign: "left" }}>Categories</th>
        <th style={{ padding: 14, textAlign: "center" }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentBlogs.length === 0 ? (
        <tr>
          <td
            colSpan="7"
            style={{
              textAlign: "center",
              padding: 20,
              color: "#6b7280",
              fontSize: 16,
            }}
          >
            No blogs found
          </td>
        </tr>
      ) : (
        currentBlogs.map((blog, idx) => (
          <tr
            key={blog._id}
            style={{
              borderBottom: "1px solid #e5e7eb",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            <td style={{ padding: 12, fontSize: 16 }}>
              {indexOfFirstBlog + idx + 1}
            </td>
            <td style={{ padding: 12 }}>
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    cursor: "pointer",
                    borderRadius: 6,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                  onClick={() => navigate(`/blog/${blog._id}`)}
                />
              )}
            </td>
            <td style={{ padding: 12, fontSize: 16 }}>{blog.title}</td>
            <td style={{ padding: 12, fontSize: 16 }}>
              {blog.author?.name || blog.author || "Unknown"}
            </td>
            <td style={{ padding: 12, fontSize: 15, color: "#374151" }}>
              {new Date(blog.createdAt).toLocaleDateString()}
            </td>
            <td style={{ padding: 12, fontSize: 15 }}>
              {(blog.categories || []).join(", ")}
            </td>
            <td style={{ padding: 12, textAlign: "center" }}>
              <button
                onClick={() => handleEdit(blog._id)}
                style={{
                  marginRight: 8,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#2274a1",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#1d5e82")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#2274a1")
                }
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(blog._id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#b91c1c")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#dc2626")
                }
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


      {blogs.length > blogsPerPage && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1)}
          >
            Previous
          </button>
          <span style={{ fontWeight: "bold", color: "#374151" }}>
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

export default AdminBlogs;
