import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import CollaborativeRecommendations from "../components/CollaborativeRecommendations";
import CategoryRecommendations from "../components/CategoryRecommendations";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Calendar, Tag } from "lucide-react";

import BlogActions from "../components/BlogActions";



const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [trendingFollowed, setTrendingFollowed] = useState([]);
  const [trendingOthers, setTrendingOthers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const extraBlogsRef = useRef(null);
  const readMoreBtnRef = useRef(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 1000,       // speed of scroll in ms
  slidesToShow: 3,   // number of blogs visible
  slidesToScroll: 1, // scroll 1 slide at a time
  autoplay: true,    // enable auto scroll
  autoplaySpeed: 2000, // 2 seconds per slide
  cssEase: "linear",   // smooth continuous scrolling
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 1 } },
  ],
};



  const fetchData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const { data: latestData } = await axios.get(`${API_BASE}/blog`);
      const { data: trendingData } = await axios.get(`${API_BASE}/blog/trending`);

      let sortedBlogs = latestData;

      const getLikesCount = (b) =>
        Array.isArray(b.likes) ? b.likes.length : b.totalLikes ?? b.likeCount ?? 0;

      if (user?.id) {
        const { data: followingRes } = await axios.get(`${API_BASE}/user/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const fIds = followingRes.user.following.map((f) => f._id);
        setFollowingIds(fIds);

        // Sort blogs for logged-in user
        sortedBlogs = latestData.slice().sort((a, b) => {
          const aFollowedOrSelf =
            !!(a.author && (fIds.includes(a.author._id) || a.author._id === user.id));
          const bFollowedOrSelf =
            !!(b.author && (fIds.includes(b.author._id) || b.author._id === user.id));

          if (aFollowedOrSelf && !bFollowedOrSelf) return -1;
          if (!aFollowedOrSelf && bFollowedOrSelf) return 1;

          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setCurrentUserId(user.id);

        const followedTrending = trendingData.filter(
          (blog) => blog.author && fIds.includes(blog.author._id)
        );
        const othersTrending = trendingData.filter(
          (blog) => !(blog.author && fIds.includes(blog.author._id))
        );

        followedTrending.sort((a, b) => {
          const diff = getLikesCount(b) - getLikesCount(a);
          return diff !== 0 ? diff : new Date(b.createdAt) - new Date(a.createdAt);
        });

        othersTrending.sort((a, b) => {
          const diff = getLikesCount(b) - getLikesCount(a);
          return diff !== 0 ? diff : new Date(b.createdAt) - new Date(a.createdAt);
        });

        setTrendingFollowed(followedTrending);
        setTrendingOthers(othersTrending);
      } else {
        // Guest user
        const allSorted = trendingData.slice().sort((a, b) => {
          const diff = getLikesCount(b) - getLikesCount(a);
          return diff !== 0 ? diff : new Date(b.createdAt) - new Date(a.createdAt);
        });

        setTrendingFollowed([]);
        setTrendingOthers(allSorted);
      }

      setBlogs(sortedBlogs);
      setTrendingBlogs(trendingData);
    } catch (error) {
      console.error("Error loading blogs:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLikeChange = () => {
    setTimeout(() => {
      fetchData();
      setRefreshTrigger((prev) => prev + 1);
    }, 1000);
  };

  const handleLike = async (blogId) => {
  try {
    const res = await fetch(`/api/blogs/${blogId}/like`, {
      method: "POST",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Update UI
    setBlogs((prev) =>
      prev.map((b) =>
        b._id === blogId ? { ...b, likes: data.likes } : b
      )
    );
  } catch (err) {
    console.log(err);
  }
};

const handleCommentSubmit = async (blogId, text, resetFn) => {
  try {
    const res = await fetch(`/api/blogs/${blogId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    resetFn(); // clears input

    setBlogs((prev) =>
      prev.map((b) =>
        b._id === blogId ? { ...b, comments: data.comments } : b
      )
    );
  } catch (err) {
    console.log(err);
  }
};


  const initialBlogs = blogs.slice(0, 8);
  const extraBlogs = blogs.slice(8);

  const handleReadMore = () => {
    setShowAllBlogs(true);
    setTimeout(() => {
      extraBlogsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleShowLess = () => {
    setShowAllBlogs(false);
    setTimeout(() => {
      readMoreBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const firstOtherIndex = initialBlogs.findIndex(
    (b) =>
      !b.author ||
      (!user || (!followingIds.includes(b.author._id) && b.author._id !== user?.id))
  );

  return (
   <div
  style={{
    maxWidth: 1300,
    margin: user ? "12px auto" : "0 auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
    overflowX: "hidden",
  }}
>


    
      {user && (
  <h1 style={{ fontWeight: "300", marginBottom: 2 }}>
    Welcome, {user.name}!
  </h1>
)}



{/* --------------------- GUEST HERO + BLOG SLIDER --------------------- */}
{!user && (
  <div>
    {/* Hero Section */}
    <div style={{ position: "relative", height: "550px", overflow: "hidden" }}>
      <img
        src="/download (2).jpeg"
        alt="Hero"
        style={{
          position: "absolute",
          right: "-50px",
          top: 0,
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "60px",
          maxWidth: "700px",
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      >
        <h1 style={{ fontSize: "84px", fontWeight: 700, color: "#2274a1" }}>
          Explore Human stories & ideas
        </h1>
        <p style={{ fontSize: "24px", color: "black", fontStyle: "italic" }}>
          A place to read, write, and deepen your understanding
        </p>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#222",
            color: "#fff",
            cursor: "pointer",
            marginTop: "24px",
          }}
        >
          Start Reading
        </button>
      </div>
    </div>

    {/* Preview text */}
    <p
      style={{
        fontSize: "16px",
        color: "#666",
        textAlign: "center",
        marginTop: "32px",
      }}
    >
      Preview of latest blogs — Sign up to see all
    </p>

    {/* ---------------- ROW 1 ---------------- */}
    <div style={{ margin: "20px 0" }}>
      <Slider
        dots={false}
        infinite={true}
        speed={9000} 
        slidesToShow={3}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={0} 
        cssEase="linear"
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: 2 } },
          { breakpoint: 600, settings: { slidesToShow: 1 } },
        ]}
      >
        {blogs.slice(0, 6).map((blog) => (
          <div key={blog._id} style={{ padding: "0 10px", boxSizing: "border-box" }}>
            <div
          style={{
            margin: "0 0 10px 0", // vertical gap
          }}
        >
            <BlogCard
              blog={blog}
              currentUserId={""}
              compact={true} // SMALLER HEIGHT
              onLikeChange={() => {}}
            />
            </div>
          </div>
        ))}
      </Slider>
    </div>

    {/* ---------------- ROW 2 ---------------- */}
    <div style={{ margin: "40px 0 60px 0" }}>
      <Slider
        dots={false}
        infinite={true}
        speed={9000}
        slidesToShow={3}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={0}
        cssEase="linear"
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: 2 } },
          { breakpoint: 600, settings: { slidesToShow: 1 } },
        ]}
      >
        {blogs.slice(6, 12).map((blog) => (
          <div key={blog._id} style={{ padding: "0 10px", boxSizing: "border-box" }}>
            <div
          style={{
            margin: "0 0 10px 0", // vertical gap
          }}
        >
          <BlogCard
            blog={blog}
            currentUserId={""}
            compact={true}
            onLikeChange={() => {}}
          />
        </div>
      </div>
        ))}
      </Slider>
    </div>

    {/* Read More / Register Button */}
    {blogs.length > 0 && (
      <div style={{ textAlign: "center", marginTop: "24px", marginBottom: "60px" }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "12px 0",
            width: "200px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            background: "#222",
            color: "#fff",
          }}
        >
          Read More
        </button>
      </div>
    )}
  </div>
)}









      {/* --------------------- LATEST BLOGS (LOGGED-IN) --------------------- */}
      {user && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h2
              style={{
                fontWeight: "400",
                marginBottom: 16,
                borderBottom: "2px solid #2274a1",
                paddingBottom: 6,
                color: "#2274a1",
              }}
            >
              Latest Blogs
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {initialBlogs.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>No blogs available.</p>
              ) : (
                initialBlogs.map((blog, idx) => (
                  <React.Fragment key={blog._id}>
                    {idx === firstOtherIndex && (
                      <p
                        style={{
                          gridColumn: "1 / -1",
                          textAlign: "center",
                          fontSize: "18px",
                          color: "#666",
                          margin: "10px 0 0 0",
                        }}
                      >
                        Discover more blogs
                      </p>
                    )}
                    <BlogCard
                      blog={blog}
                      currentUserId={currentUserId}
                      onLikeChange={handleLikeChange}
                    />
                  </React.Fragment>
                ))
              )}
            </div>

            {extraBlogs.length > 0 && !showAllBlogs && (
              <div style={{ textAlign: "center", marginTop: "24px" }} ref={readMoreBtnRef}>
                <button
                  onClick={handleReadMore}
                  style={{
                    width: "200px",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: "bold",
                    background: "black",
                    color: "#fff",
                  }}
                >
                  Read More
                </button>
              </div>
            )}
          </div>

          {/* --------------------- TRENDING SECTION --------------------- */}
          <div style={{ flex: "0 0 350px", maxWidth: "100%" }}>
            <h2
              style={{
                fontWeight: "400",
                marginBottom: 16,
                borderBottom: "2px solid #ef4444",
                paddingBottom: 6,
                color: "#ef4444",
              }}
            >
              🔥 Top Trending
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                // background: "black",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {trendingFollowed.length === 0 && trendingOthers.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#141313ff" }}>No trending blogs yet.</p>
              ) : (
                <>
                  {trendingFollowed.length > 0 && (
                    <div>
                      <h3
                        style={{
                          color: "#da0c0cff",
                          margin: 0,
                          marginBottom: 8,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        🔥 Trending from People You Follow
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {trendingFollowed.slice(0, 2).map((blog) => (
                          <BlogCard
                            key={blog._id}
                            blog={blog}
                            currentUserId={currentUserId}
                            compact={true}
                            onLikeChange={handleLikeChange}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {trendingFollowed.length > 0 && trendingOthers.length > 0 && (
                    <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                  )}

                  {trendingOthers.length > 0 && (
                    <div>
                      <h3
                        style={{
                          color: "#da0c0cff",
                          margin: 0,
                          marginBottom: 8,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        🔥 Recommended Trending
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {trendingFollowed.length > 0
                          ? trendingOthers.slice(0, 3).map((blog) => (
                              <BlogCard
                                key={blog._id}
                                blog={blog}
                                currentUserId={currentUserId}
                                compact={true}
                                onLikeChange={handleLikeChange}
                              />
                            ))
                          : trendingOthers.slice(0, 5).map((blog) => (
                              <BlogCard
                                key={blog._id}
                                blog={blog}
                                currentUserId={currentUserId}
                                compact={true}
                                onLikeChange={handleLikeChange}
                              />
                            ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------- RECOMMENDATIONS (LOGGED-IN ONLY) --------------------- */}
      {user && (
        <div style={{ marginTop: "60px" }}>
          <CategoryRecommendations currentUserId={user.id} refreshTrigger={refreshTrigger} />
          <CollaborativeRecommendations userId={user.id} refreshTrigger={refreshTrigger} />
        </div>
      )}

      {/* --------------------- EXTRA BLOGS (LOGGED-IN) --------------------- */}
{user && showAllBlogs && extraBlogs.length > 0 && (
  <div ref={extraBlogsRef} style={{ marginTop: "40px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {extraBlogs.map((blog) => (
        <div
          key={blog._id}
          onClick={() => (window.location.href = `/blog/${blog._id}`)}
          style={{
            cursor: "pointer",
            background: "#fff",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            {/* LEFT — TEXT */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                {blog.title}
              </h3>

              <p style={{ fontSize: "14px", fontWeight: 600, color: "#666", margin: 0 }}>
                By {blog.author?.name || "Unknown Author"}
              </p>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Category */}
                {blog.categories?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#f3f4f6",
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      color: "#555",
                    }}
                  >
                    <Tag size={12} />
                    {blog.categories[0]}
                  </div>
                )}

                {/* Date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#777",
                  }}
                >
                  <Calendar size={12} />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Blog excerpt */}
              <p style={{ fontSize: "15px", color: "#444", lineHeight: 1.5, margin: 0 }}>
                {blog.content?.slice(0, 140)}...
              </p>

              {/* Actions */}
              <div onClick={(e) => e.stopPropagation()}>
                <BlogActions
                  blogId={blog._id}
                  currentUserId={currentUserId}
                  onLikeChange={handleLikeChange}
                  comments={blog.comments || []}
                  user={user}
                />
              </div>
            </div>

            {/* RIGHT — IMAGE */}
            {blog.image && (
              <img
                src={blog.image}
                alt="blog"
                style={{
                  width: "150px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Additional Blogs Label */}
    <p style={{ textAlign: "center", marginTop: "12px", fontSize: "18px", color: "#666" }}>
      Additional Blogs
    </p>

    {/* Show Less Button */}
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={handleShowLess}
        style={{
          width: "200px",
          padding: "10px 20px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          background: "#111827",
          color: "#fff",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
        onMouseLeave={(e) => (e.target.style.background = "#111827")}
      >
        Show Less
      </button>
    </div>
  </div>
)}




    </div>
  );
};

export default Home;
