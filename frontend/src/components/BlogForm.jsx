import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BlogForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    image: null,
    content: "",
    categories: "",
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/categories`);
        console.log("Categories API response:", res.data);

        setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err.response || err.message);
        toast.error("❌ Failed to fetch categories");
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

      if (file) {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let imageUrl = "";

    try {
      if (form.image) {
        const imgData = new FormData();
        imgData.append("image", form.image);

        const uploadRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/upload`,
          imgData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/blog`,
        {
          title: form.title,
          image: imageUrl,
          content: form.content,
          categories: [form.categories],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Blog published successfully!");
      navigate("/profile");

      setForm({ title: "", image: null, content: "", categories: "" });
      setPreview(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("❌ Something went wrong while publishing!");
    }
  };

  // Styles
  const styles = {
    formContainer: {
      maxWidth: 950,
      margin: "auto",
      padding: "28px",
      borderRadius: "20px",
      background: "linear-gradient(145deg, #ffffff 60%, #f1f5f9)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.6)",
      fontFamily: "'Inter', sans-serif",
    },
    flexRow: {
      display: "flex",
      gap: "32px",
      alignItems: "flex-start",
      flexWrap: "wrap", // allow wrapping
    },
    leftSide: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "15px",
      background: "rgba(255,255,255,0.9)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
    },
    textarea: {
      width: "100%",
      height: 220,
      padding: "14px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      resize: "none",
      fontSize: "15px",
      background: "rgba(255,255,255,0.9)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
    },
    button: {
      padding: "14px 0",
      background: "linear-gradient(135deg, #2274a1 0%, #1e40af 100%)",
      color: "#fff",
      fontSize: "17px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      letterSpacing: "0.5px",
      boxShadow: "0 6px 16px rgba(37,99,235,0.35)",
      transition: "all 0.3s ease",
    },
    previewWrapper: {
      width: 260,
      height: 220,
      borderRadius: "16px",
      padding: 10,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
    },
    previewImage: {
      maxWidth: "100%",
      maxHeight: "100%",
      borderRadius: "12px",
      objectFit: "cover",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    previewText: {
      color: "#64748b",
      fontStyle: "italic",
      textAlign: "center",
      fontSize: 14,
    },
  };

  return (
    <>
      <form style={styles.formContainer} onSubmit={handleSubmit}>
        <div style={styles.flexRow} className="blog-flex">
          <div style={styles.leftSide}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
              style={styles.input}
              className="blog-input"
            />

            <select
              name="categories"
              value={form.categories}
              onChange={handleChange}
              required
              className="blog-select"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "16px",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                color: "#1f2937",
              }}
            >
              <option value="" disabled>
                Select a category
              </option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
            </select>

            <textarea
              name="content"
              placeholder="Write your blog content here..."
              value={form.content}
              onChange={handleChange}
              required
              style={styles.textarea}
              className="blog-textarea"
            />

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              style={styles.input}
              className="blog-input"
              required
            />

            <button
              type="submit"
              style={styles.button}
              className="blog-button"
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2274a1")}
            >
              Publish Blog
            </button>
          </div>

          <div style={styles.previewWrapper} className="blog-preview">
            {preview ? (
              <img src={preview} alt="Selected preview" style={styles.previewImage} />
            ) : (
              <p style={styles.previewText}>Image preview will appear here</p>
            )}
          </div>
        </div>
      </form>

      {/* Responsive media queries */}
      <style>
        {`
          @media (max-width: 768px) {
            .blog-flex {
              flex-direction: column !important;
              gap: 20px !important;
            }
            .blog-preview {
              width: 100% !important;
              height: auto !important;
            }
            .blog-input,
            .blog-textarea,
            .blog-select,
            .blog-button {
              width: 100% !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default BlogForm;
