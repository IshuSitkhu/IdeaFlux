import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import { toast } from "react-toastify";

const AuthorProfile = () => {
  const { userId } = useParams();
  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchAuthor = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.user;
      setAuthor(data);
      setBlogs(res.data.blogs || []);
      setFollowerCount(data.followers?.length || 0);
      setFollowingCount(data.following?.length || 0);

      const isFollowingUser = data.followers?.some(
        (f) => f._id === currentUser?.id
      );
      setIsFollowing(isFollowingUser);
    } catch (error) {
      console.error("Error fetching author profile:", error);
      toast.error("Failed to load author profile.");
    }
  };

  const toggleFollow = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/follow/${userId}`,
        { currentUserId: currentUser?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.message) toast.success(res.data.message);
      setIsFollowing((prev) => !prev);
      setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
      toast.error("Action failed.");
    }
  };

  useEffect(() => {
    if (token && userId) fetchAuthor();
  }, [userId]);

  if (!author) return <div style={{ padding: 20 }}>Loading profile...</div>;

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: "0 10px",
        width: "100%",
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 10,
          marginBottom: 30,
          background: "#f9f9f9",
        }}
      >
        <h2
          style={{
            marginBottom: 10,
            wordBreak: "break-word",
            fontSize: 24,
          }}
        >
          {author.name}
        </h2>

        {/* Followers / Following */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              color: "#4b5563",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => {
              setShowFollowers((prev) => !prev);
              setShowFollowing(false);
            }}
          >
            Followers: {followerCount}
          </p>
          <p
            style={{
              color: "#4b5563",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => {
              setShowFollowing((prev) => !prev);
              setShowFollowers(false);
            }}
          >
            Following: {followingCount}
          </p>
        </div>

        {/* Followers List */}
        {showFollowers && (
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 20,
              backgroundColor: "#fff",
            }}
          >
            {author.followers?.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              author.followers.map((follower) => (
                <p
                  key={follower._id}
                  style={{ marginBottom: 6, wordBreak: "break-word" }}
                >
                  <Link
                    to={`/user/${follower._id}`}
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                    onClick={() => setShowFollowers(false)}
                  >
                    {follower.name}
                  </Link>
                </p>
              ))
            )}
          </div>
        )}

        {/* Following List */}
        {showFollowing && (
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 20,
              backgroundColor: "#fff",
            }}
          >
            {author.following?.length === 0 ? (
              <p>Not following anyone yet.</p>
            ) : (
              author.following.map((user) => (
                <p
                  key={user._id}
                  style={{ marginBottom: 6, wordBreak: "break-word" }}
                >
                  <Link
                    to={`/user/${user._id}`}
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                    onClick={() => setShowFollowing(false)}
                  >
                    {user.name}
                  </Link>
                </p>
              ))
            )}
          </div>
        )}

        <p style={{ color: "#666", marginBottom: 8, wordBreak: "break-word" }}>
          {author.email}
        </p>
        {author.bio && (
          <p style={{ marginBottom: 10, wordBreak: "break-word" }}>{author.bio}</p>
        )}

        {currentUser?.id !== userId && (
          <button
            onClick={toggleFollow}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 6,
              backgroundColor: isFollowing ? "#f87171" : "#2274a1",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
              maxWidth: 200,
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.opacity = 0.85)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.opacity = 1)
            }
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* Blogs */}
      <h3 style={{ marginBottom: 16, fontSize: 20 }}>
        {author.name.split(" ")[0]}'s Blogs
      </h3>
      {blogs.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          No blogs published yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={{ ...blog, author }}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorProfile;
