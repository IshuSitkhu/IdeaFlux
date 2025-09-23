import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./SearchUser.css";

const SearchUser = ({ isMobileMenuOpen = false }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  const fetchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `http://localhost:8000/api/user/search?query=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data.users.slice(0, 4));
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchUsers(value), 300);
  };

  const handleSelect = (userId) => {
    setQuery("");
    setResults([]);
    navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`search-wrapper ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
    >
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search users..."
        />
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelect(user._id)}
              className="search-result-item"
            >
              <div className="search-result-avatar">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="search-result-name">{user.name}</p>
                <p className="search-result-email">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUser;
