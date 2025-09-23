import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;
  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cats = Array.isArray(res.data) ? res.data : res.data.categories || [];
      cats.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(cats);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch categories");
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return toast.error("❌ Enter a category name");
    try {
      await axios.post(
        "http://localhost:8000/api/admin/categories",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Category added!");
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add category");
    }
  };

  const handleUpdate = async (id) => {
    if (!editCategory.name.trim()) return toast.error("❌ Enter a category name");
    try {
      await axios.put(
        `http://localhost:8000/api/admin/categories/${id}`,
        { name: editCategory.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Category updated!");
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Category deleted!");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete category");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalPages = Math.ceil(categories.length / categoriesPerPage);
  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirst, indexOfLast);

  const paginationBtnStyle = (disabled) => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? "#d1d5db" : "#2274a1",
    color: "#fff",
    fontWeight: "bold",
    width:"100px",
  });

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: 20,
          color: "#1f2937",
        }}
      >
        Admin Panel - Manage Categories
      </h1>

      {/* Add Category Form */}
      <div style={{ maxWidth: "400px", marginBottom: "20px" }}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter new category name"
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "15px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
            outline: "none",
            transition: "all 0.3s ease",
            marginBottom: "12px",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.06)")
          }
        />
        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            padding: "14px 0",
            backgroundColor: "#2274a1",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "15px",
            transition: "all 0.3s ease",
            boxShadow: "0 3px 8px rgba(37,99,235,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2274a1")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2274a1d8")}
        >
          ➕ Add New Category
        </button>
      </div>

      {/* Responsive Table */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderRadius: 8,
      overflow: "hidden",
    }}
  >
    <thead
      style={{
      backgroundColor: "#f1f5f9",
        fontSize: 18,
        fontWeight: 700,
        borderBottom: "2px solid #e5e7eb",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
      }}
    >
      <tr>
        <th style={{ padding: 14, textAlign: "center" }}>SN</th>
        <th style={{ padding: 14, textAlign: "left" }}>Category Name</th>
        <th style={{ padding: 14, textAlign: "center" }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentCategories.length === 0 ? (
        <tr>
          <td
            colSpan="3"
            style={{
              textAlign: "center",
              padding: 20,
              color: "#6b7280",
              fontSize: 16,
            }}
          >
            No categories available
          </td>
        </tr>
      ) : (
        currentCategories.map((cat, idx) => (
          <tr
            key={cat._id}
            style={{
              borderBottom: "1px solid #e5e7eb",
              transition: "background-color 0.2s",
              cursor: "default",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            <td style={{ padding: 12, textAlign: "center", fontSize: 15 }}>
              {indexOfFirst + idx + 1}
            </td>
            <td style={{ padding: 12, fontSize: 15 }}>
              {editCategory?._id === cat._id ? (
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                />
              ) : (
                cat.name
              )}
            </td>
            <td style={{ padding: 12, textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "nowrap",
                  alignItems: "center",
                }}
              >
                {editCategory?._id === cat._id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(cat._id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        backgroundColor: "#16a34a",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        minWidth: 70,
                        transition: "background-color 0.2s",
                        border: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#059669")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#16a34a")
                      }
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditCategory(null)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        minWidth: 80,
                        transition: "background-color 0.2s",
                        border: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#b91c1c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc2626")
                      }
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditCategory(cat)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        backgroundColor: "#2274a1",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        minWidth: 70,
                        transition: "background-color 0.2s",
                        border: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1d5e82")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#2274a1")
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        minWidth: 80,
                        transition: "background-color 0.2s",
                        border: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#b91c1c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc2626")
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


      {/* Pagination */}
      {categories.length > categoriesPerPage && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1)}
          >
            Previous
          </button>
          <span style={{ fontWeight: "bold", color: "#374151" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle(currentPage === totalPages)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
