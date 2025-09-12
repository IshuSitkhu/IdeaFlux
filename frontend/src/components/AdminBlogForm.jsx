import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminBlogForm = ({ blog = null, onSuccess, onCancelEdit }) => {
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

  // fetch authors for dropdown
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersList = res.data?.users || [];
        setUsers(usersList);

        // default author = current user if available
        if (!blog && usersList.length) {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          const cur =
            usersList.find((u) => u._id === currentUser?._id) || usersList[0];
          setForm((f) => ({ ...f, author: cur?._id || "" }));
        }
      } catch (err) {
        console.error("Failed fetching users:", err.response?.data || err.message);
        toast.error("Failed to load authors (check console).");
      }
    };

    fetchUsers();
  }, [token, blog]);

  // when editing, populate form
  useEffect(() => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
    }

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

  // cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files?.[0] || null;

      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        setPreviewObjectUrl(null);
      }

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

  // Unified error parser
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
    if (!token) return toast.error("You must be logged in (missing token)");

    setLoading(true);

    try {
      // upload new image if selected
      let imageUrl = blog?.image || "";
      if (imageFile) {
        const imgData = new FormData();
        imgData.append("image", imageFile);

        const uploadRes = await axios.post(
          "http://localhost:8000/api/upload",
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

        if (!imageUrl) {
          throw new Error("Upload succeeded but no image URL returned");
        }
      }

      // payload
      const payload = {
        title: form.title,
        image: imageUrl,
        content: form.content,
        categories: [form.categories],
        author: form.author,
      };

      if (blog) {
        await axios.patch(
          `http://localhost:8000/api/admin/blogs/${blog._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Blog updated");
      } else {
        await axios.post("http://localhost:8000/api/admin/blogs", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blog created");
      }

      // reset form
      setForm({ title: "", content: "", categories: "", author: "" });
      setImageFile(null);
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        setPreviewObjectUrl(null);
      }
      setPreview(null);

      onSuccess?.();
    } catch (err) {
      parseAndShowError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
    }
    setImageFile(null);
    setPreview(null);
    setForm({ title: "", content: "", categories: "", author: "" });
    onCancelEdit?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          style={{ flex: "1 1 300px", padding: 8 }}
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <select
          style={{ width: 200, padding: 8 }}
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
          style={{ width: 300, padding: 8 }}
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
        style={{ width: "100%", minHeight: 160, marginTop: 12, padding: 8 }}
        name="content"
        placeholder="Content"
        value={form.content}
        onChange={handleChange}
        required
      />

      <div
        style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}
      >
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            width={120}
            style={{ display: "block", marginLeft: 8, borderRadius: 6 }}
          />
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Saving..." : blog ? "Update Blog" : "Create Blog"}
        </button>

        {blog && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{
              padding: "8px 12px",
              background: "#e5e7eb",
              border: "none",
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminBlogForm;
