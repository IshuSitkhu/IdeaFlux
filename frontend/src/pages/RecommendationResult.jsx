import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const RecommendationResult = () => {
  const { title } = useParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`/api/blog/recommend-content/${title}`);
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [title]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center md:text-left">
        Recommendations for: <span className="text-blue-600">{decodeURIComponent(title)}</span>
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : recommendations.length === 0 ? (
        <p className="text-center text-gray-500">No recommendations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 md:h-40 lg:h-44 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold mb-2">{blog.title}</h3>
                <p className="text-sm text-gray-700 flex-1">
                  {blog.content.slice(0, 150)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationResult;
