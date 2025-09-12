import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const AdminUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    categories: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing blog data to prefill form
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/blog/${id}`)
      .then((res) => {
        const blog = res.data;
        setBlogData({
          title: blog.title || "",
          content: blog.content || "",
          categories: (blog.categories || []).join(", "),
          image: blog.image || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to fetch blog data.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setBlogData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Please login to update blog.");
        navigate("/login");
        return;
      }

      // Prepare categories as array, trim spaces
      const categoriesArray = blogData.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/blog/${id}/admin`,
        {
          title: blogData.title,
          content: blogData.content,
          categories: categoriesArray,
          image: blogData.image,
        }
      );

      toast.success("Blog updated successfully!");
      navigate(`/blog/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update blog.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div
        style={{
          maxWidth: "600px",
          margin: "2rem auto",
          padding: "1rem",
          marginTop: "88px",
        }}
      >
        <h2>Update Blog</h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={blogData.title}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>

          <label>
            Content:
            <textarea
              name="content"
              value={blogData.content}
              onChange={handleChange}
              rows={8}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>

          <label>
            Categories (comma separated):
            <input
              type="text"
              name="categories"
              value={blogData.categories}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
              placeholder="e.g. tech, coding, javascript"
            />
          </label>

          <label>
            Image URL:
            <input
              type="text"
              name="image"
              value={blogData.image}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
              placeholder="Optional"
            />
          </label>

          <button
            type="submit"
            style={{
              padding: "0.75rem",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Update Blog
          </button>
        </form>
      </div>
    </>
  );
};

export default AdminUpdate;
