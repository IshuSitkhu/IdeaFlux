import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminBlogForm from "../components/AdminBlogForm";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Failed to fetch blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Delete blog
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

  // Edit blog
  const handleEdit = (id) => {
    const blogToEdit = blogs.find((b) => b._id === id);
    if (blogToEdit) {
      // normalize categories for form (always array)
      blogToEdit.categories =
        Array.isArray(blogToEdit.categories) && blogToEdit.categories.length
          ? blogToEdit.categories
          : [];
      setEditingBlog(blogToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Blogs</h2>

      {/* Blog Form */}
      <AdminBlogForm
        blog={editingBlog}
        onSuccess={() => {
          setEditingBlog(null);
          fetchBlogs();
        }}
        onCancelEdit={() => setEditingBlog(null)}
      />

      {/* Blog Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <thead style={{ backgroundColor: "#f9fafb" }}>
          <tr>
            <th style={{ padding: 12 }}>SN</th>
            <th style={{ padding: 12 }}>Image</th>
            <th style={{ padding: 12 }}>Title</th>
            <th style={{ padding: 12 }}>Author</th>
            <th style={{ padding: 12 }}>Date</th>
            <th style={{ padding: 12 }}>Categories</th>
            <th style={{ padding: 12 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                No blogs found
              </td>
            </tr>
          ) : (
            blogs.map((blog, idx) => (
              <tr key={blog._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12 }}>{idx + 1}</td>
                <td style={{ padding: 12 }}>
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        cursor: "pointer",
                        borderRadius: 6,
                      }}
                      onClick={() => navigate(`/blog/${blog._id}`)}
                    />
                  )}
                </td>
                <td style={{ padding: 12 }}>{blog.title}</td>
                <td style={{ padding: 12 }}>
                  {blog.author?.name || blog.author || "Unknown"}
                </td>
                <td style={{ padding: 12 }}>
                  {new Date(blog.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: 12 }}>
                  {(blog.categories || []).join(", ")}
                </td>
                <td style={{ padding: 12 }}>
                  <button
                    onClick={() => handleEdit(blog._id)}
                    style={{
                      marginRight: 6,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#dc2626",
                      color: "#fff",
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
  );
};

export default AdminBlogs;
