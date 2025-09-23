import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import CollaborativeRecommendations from "../components/CollaborativeRecommendations";
import CategoryRecommendations from "../components/CategoryRecommendations";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [trendingFollowed, setTrendingFollowed] = useState([]);
  const [trendingOthers, setTrendingOthers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const extraBlogsRef = useRef(null);
  const readMoreBtnRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

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

        // sortedBlogs = latestData.slice().sort((a, b) => {
        //   const aFollowed = !!(a.author && fIds.includes(a.author._id));
        //   const bFollowed = !!(b.author && fIds.includes(b.author._id));

        //   if (aFollowed && !bFollowed) return -1;
        //   if (!aFollowed && bFollowed) return 1;

        //   return new Date(b.createdAt) - new Date(a.createdAt);
        // });

        sortedBlogs = latestData.slice().sort((a, b) => {
  // Treat followed authors OR current user as "priority"
  const aFollowedOrSelf =
    !!(a.author && (fIds.includes(a.author._id) || a.author._id === user.id));
  const bFollowedOrSelf =
    !!(b.author && (fIds.includes(b.author._id) || b.author._id === user.id));

  if (aFollowedOrSelf && !bFollowedOrSelf) return -1;
  if (!aFollowedOrSelf && bFollowedOrSelf) return 1;

  // If both are same priority, sort by newest first
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Split for "Read More"
  const initialBlogs = blogs.slice(0, 8);
  const extraBlogs = blogs.slice(4);

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

  // Determine index where first "others" blog starts
  // const firstOtherIndex = initialBlogs.findIndex(
  //   (b) => !b.author || (user && !followingIds.includes(b.author._id))
  // );
  // Determine index where first "others" blog starts
// Exclude blogs by the current user from "others"
const firstOtherIndex = initialBlogs.findIndex(
  (b) =>
    !b.author || 
    (user && !followingIds.includes(b.author._id) && b.author._id !== user.id)
);


  return (
    <div
      style={{
        maxWidth: 1300,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
        overflowX: "hidden",
      }}
    >
      <h1 style={{ fontWeight: "300", marginBottom: 8 }}>
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
        {/* Latest Blogs Section */}
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
              gridColumn: "1 / -1", // ✅ keeps "Discover more blogs" full row
              textAlign: "center",
              fontSize: "18px",
              color: "#666",
              margin: "10px 0 0 0",
            }}
          >
            Discover more blogs
          </p>
        )}
        <BlogCard blog={blog} currentUserId={currentUserId} />
      </React.Fragment>
    ))
  )}
</div>


  {/* Read More Button */}
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


        {/* Trending Section */}
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
              background: "black",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {trendingFollowed.length === 0 && trendingOthers.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "#666" }}>No trending blogs yet.</p>
            ) : (
              <>
                {/* If user has followings, show 2 + 3 */}
                {trendingFollowed.length > 0 && (
                  <div>
                    <h3
                      style={{
                        color: "#fff",
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
                        color: "#fff",
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
                            />
                          ))
                        : trendingOthers.slice(0, 5).map((blog) => (
                            <BlogCard
                              key={blog._id}
                              blog={blog}
                              currentUserId={currentUserId}
                              compact={true}
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

      {/* Recommendations Section */}
      {user && (
        <div style={{ marginTop: "60px" }}>
          <CategoryRecommendations currentUserId={user.id} />
          <CollaborativeRecommendations userId={user.id} />
        </div>
      )}

      {/* Extra Blogs + Show Less */}
      {showAllBlogs && extraBlogs.length > 0 && (
        <div ref={extraBlogsRef}>
          <div
            style={{
              marginTop: "30px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {extraBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} currentUserId={currentUserId} />
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: "8px", fontSize: "18px", color: "#666" }}>
            Additional Blogs
          </p>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              onClick={handleShowLess}
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
              Show Less
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

