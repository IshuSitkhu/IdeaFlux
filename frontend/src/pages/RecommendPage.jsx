import React, { useState } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import { toast } from "react-toastify";

const RecommendPage = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [categoryRecs, setCategoryRecs] = useState([]); // 🆕 Category-based blogs
  const [loading, setLoading] = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  // Fetch blogs based on title/keyword
  // replace the existing fetchRecommendations in RecommendPage.jsx with this
const fetchRecommendations = async (title) => {
  if (!title?.trim()) return;
  try {
    setLoading(true);
    setRecommendations([]);
    setCategoryRecs([]);

    const API_BASE = "http://localhost:8000/api"; // or use import.meta.env.VITE_API_BASE_URL
    const encodedTitle = encodeURIComponent(title.trim());

    console.log("[recommend] Requesting content recs for:", title);

    // 1) Content-based recommendations (TF-IDF)
    const contentRes = await axios.get(`${API_BASE}/blog/recommend-content/${encodedTitle}`, {
      timeout: 10000,
    });

    console.log("[recommend] contentRes status:", contentRes.status, contentRes.data);

    const blogs = contentRes.data?.recommendations || [];
    setRecommendations(blogs);

    // If no content results, don't fail — try category-based fallback using the search term as category
    if (blogs.length === 0) {
      console.warn("[recommend] No content-based results. Trying category fallback...");
      // try category endpoint using input as category (best-effort)
      try {
        const catFallback = await axios.get(`${API_BASE}/blog/category/${encodeURIComponent(title.trim())}`);
        setCategoryRecs(catFallback.data || []);
        return;
      } catch (fallbackErr) {
        console.warn("[recommend] category fallback failed:", fallbackErr?.response?.data || fallbackErr.message);
        return;
      }
    }

    // 2) Build category list from top content results (top 3 categories)
    const categories = blogs
      .flatMap((b) => b.categories || [])
      .map((c) => (typeof c === "string" ? c.toLowerCase().trim() : c))
      .filter(Boolean);

    // pick most frequent categories (top 3)
    const freq = {};
    categories.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
    const mainCategories = Object.keys(freq)
      .sort((a, b) => freq[b] - freq[a])
      .slice(0, 3);

    console.log("[recommend] derived categories:", mainCategories);

    if (mainCategories.length === 0) {
      console.warn("[recommend] no categories found in content results");
      setCategoryRecs([]);
      return;
    }

    // Exclude already shown blog ids
    const excludeIds = blogs.map((b) => b._id).join(",");

    // call your new merged-by-categories endpoint
    const catsQuery = mainCategories.join(",");
    const catRes = await axios.get(
      `${API_BASE}/blog/by-categories?cats=${encodeURIComponent(catsQuery)}&excludeIds=${encodeURIComponent(excludeIds)}&limit=6`,
      { timeout: 10000 }
    );

    console.log("[recommend] categoryRes status:", catRes.status, catRes.data);

    // Your backend returns { recommendations: [...] } per the controller above
    setCategoryRecs(catRes.data?.recommendations || []);
  } catch (err) {
    // show better diagnostic info
    console.error("❌ Recommendation fetch failed:", err);

    // If axios error: print response if exists
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
      toast.error(`Server error: ${err.response.status} — ${err.response.data?.message || JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error("No response (request sent):", err.request);
      toast.error("No response from server. Is backend running?");
    } else {
      console.error("Request setup error:", err.message);
      toast.error("Error preparing request: " + err.message);
    }

    // keep UI usable (clear lists)
    setRecommendations([]);
    setCategoryRecs([]);
  } finally {
    setLoading(false);
  }
};


  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchRecommendations(inputTitle);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          color: "#D97706",
          textAlign: "center",
        }}
      >
        Blog Recommendations
      </h1>

      {/* Search Input */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter blog title or keyword"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "0.6rem 1rem",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "1rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.2)")
          }
          onBlur={(e) =>
            (e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)")
          }
        />
        <button
          onClick={() => fetchRecommendations(inputTitle)}
          disabled={loading}
          style={{
            backgroundColor: "#2274a1",
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "12px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "1rem",
            minWidth: "160px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#2274a1e7";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#2274a1";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)";
          }}
        >
          {loading ? "Searching..." : "Recommend"}
        </button>
      </div>

      {/* 🔹 Content-based results */}
      {recommendations.length > 0 ? (
        <>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#374151",
            }}
          >
            Blogs related to “{inputTitle}”
          </h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem",
    justifyContent: "center",
    alignItems: "start",
    marginBottom: "3rem",
    maxWidth: "1000px",
    marginInline: "auto",
  }}
>


            {recommendations.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                currentUserId={currentUserId}
                compact={true}
              />
            ))}
          </div>
        </>
      ) : (
        !loading && (
          <p
            style={{
              color: "#6B7280",
              textAlign: "center",
              marginTop: "3rem",
              fontSize: "1.1rem",
            }}
          >
            No recommendations found. Try searching again.
          </p>
        )
      )}

      {/* 🆕 Category-based Recommendations */}
      {categoryRecs.length > 0 && (
        <>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#D97706",
            }}
          >
            More from related categories
          </h2>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem",
    justifyContent: "center",
    alignItems: "start",
    marginBottom: "3rem",
    maxWidth: "1000px",
    marginInline: "auto",
  }}
>


            {categoryRecs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                currentUserId={currentUserId}
                compact={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendPage;
