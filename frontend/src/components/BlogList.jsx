import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [filter, setFilter] = useState("all"); // new state for filter

  // Fetch all blogs once
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/blog`)
      .then((res) => {
        setBlogs(res.data);
        setFilteredBlogs(res.data); // initially show all
      })
      .catch((err) => console.error(err));
  }, []);

  // Get current user id from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id = payload.id || payload._id;
        setCurrentUserId(id ? id.toString() : "");
      } catch (error) {
        console.error("Invalid token:", error);
        setCurrentUserId("");
      }
    }
  }, []);

  // Update filteredBlogs based on selected filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredBlogs(blogs);
    } else if (filter === "latest") {
      // Sort by createdAt descending
      const latest = [...blogs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setFilteredBlogs(latest);
    } else if (filter === "popular") {
      // Sort by number of likes descending
      const popular = [...blogs].sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
      setFilteredBlogs(popular);
    }
  }, [filter, blogs]);

  const handleLikeToggle = (blogId, updatedLikes) => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog._id === blogId ? { ...blog, likes: updatedLikes } : blog
      )
    );
  };

  return (
    <div>
      {/* Filter Buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            marginRight: 10,
            padding: "8px 15px",
            backgroundColor: filter === "all" ? "#4f46e5" : "#ccc",
            color: filter === "all" ? "#fff" : "#333",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Show All
        </button>
        <button
          onClick={() => setFilter("latest")}
          style={{
            marginRight: 10,
            padding: "8px 15px",
            backgroundColor: filter === "latest" ? "#4f46e5" : "#ccc",
            color: filter === "latest" ? "#fff" : "#333",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Show Latest
        </button>
        <button
          onClick={() => setFilter("popular")}
          style={{
            padding: "8px 15px",
            backgroundColor: filter === "popular" ? "#4f46e5" : "#ccc",
            color: filter === "popular" ? "#fff" : "#333",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Show Popular
        </button>
      </div>

      {/* Blog Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              currentUserId={currentUserId}
              onLikeToggle={handleLikeToggle}
            />
          ))
        ) : (
          <p>No blogs found.</p>
        )}
      </div>
    </div>
  );
};

export default BlogList;
