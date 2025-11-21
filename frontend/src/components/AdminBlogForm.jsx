import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminBlogForm = ({ blog = null, onSuccess, onCancelEdit, showForm = false }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    content: "",
    categories: "",
    author: "",
  });

  const [users, setUsers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // fetch authors
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersList = res.data?.users || [];
        setUsers(usersList);

        if (!blog && usersList.length) {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          const cur =
            usersList.find((u) => u._id === currentUser?._id) || usersList[0];
          setForm((f) => ({ ...f, author: cur?._id || "" }));
        }
      } catch (err) {
        console.error("Failed fetching users:", err.response?.data || err.message);
        toast.error("Failed to load authors.");
      }
    };
    fetchUsers();
  }, [token, blog]);

  // populate form when editing
  useEffect(() => {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

    setForm({
      title: blog?.title || "",
      content: blog?.content || "",
      categories:
        Array.isArray(blog?.categories) && blog.categories.length
          ? blog.categories[0]
          : "",
      author:
        typeof blog?.author === "object"
          ? blog.author?._id
          : blog?.author || "",
    });

    setImageFile(null);
    setPreview(blog?.image || null);
  }, [blog]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files?.[0] || null;

      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

      if (file) {
        const objUrl = URL.createObjectURL(file);
        setPreview(objUrl);
        setPreviewObjectUrl(objUrl);
        setImageFile(file);
      } else {
        setPreview(blog?.image || null);
        setImageFile(null);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const parseAndShowError = (err) => {
    console.error("Request error:", err);
    const data = err?.response?.data;
    if (!data) return toast.error(err.message || "Unknown error");

    if (Array.isArray(data.errors)) {
      return toast.error(
        data.errors.map((e) => e.message || JSON.stringify(e)).join("\n")
      );
    }

    if (typeof data.message === "object") {
      return toast.error(Object.values(data.message).flat().join("\n"));
    }

    if (typeof data.message === "string") {
      return toast.error(data.message);
    }

    toast.error(JSON.stringify(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title?.trim()) return toast.error("Title is required");
    if (!form.content?.trim()) return toast.error("Content is required");
    if (!form.categories) return toast.error("Category is required");
    if (!form.author) return toast.error("Author is required");
    if (!token) return toast.error("You must be logged in");

    setLoading(true);

    try {
      let imageUrl = blog?.image || "";
      if (imageFile) {
        const imgData = new FormData();
        imgData.append("image", imageFile);

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

        imageUrl =
          uploadRes.data?.imageUrl ||
          uploadRes.data?.url ||
          uploadRes.data?.secure_url ||
          uploadRes.data?.path ||
          uploadRes.data?.image ||
          "";

        if (!imageUrl) throw new Error("Upload succeeded but no image URL returned");
      }

      const payload = {
        title: form.title,
        image: imageUrl,
        content: form.content,
        categories: [form.categories],
        author: form.author,
      };

      if (blog) {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/admin/blogs/${blog._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/blogs`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blog created successfully!");
      }

      setForm({ title: "", content: "", categories: "", author: "" });
      setImageFile(null);
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
      setPreview(null);

      onSuccess?.();
    } catch (err) {
      parseAndShowError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setImageFile(null);
    setPreview(null);
    setForm({ title: "", content: "", categories: "", author: "" });
    onCancelEdit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 30,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          style={{
            flex: "1 1 300px",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
          }}
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <select
          style={{
            width: 200,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
          }}
          name="categories"
          value={form.categories}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {[
            "Technology",
            "Programming",
            "Lifestyle",
            "Entertainment",
            "Music",
            "Movies",
            "Sports",
            "Travel",
            "Food",
            "Nature",
            "Health",
            "Education",
            "Bollywood",
            "Fashion",
            "Personal",
            "News",
          ].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          style={{
            width: 300,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
          }}
          name="author"
          value={form.author}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select an author
          </option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <textarea
        style={{
          width: "100%",
          minHeight: 160,
          marginTop: 8,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #d1d5db",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
        }}
        name="content"
        placeholder="Content"
        value={form.content}
        onChange={handleChange}
        required
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            width={120}
            style={{
              display: "block",
              marginLeft: 8,
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          {loading ? "Saving..." : blog ? "Update Blog" : "Create Blog"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#e5e7eb",
            color: "#374151",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d1d5db")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminBlogForm;
