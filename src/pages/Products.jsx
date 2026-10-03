import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const empty = { product_name: "", description: "", price: "", quantity: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const load = async () => {
  try {
    const res = await api.get("/products");
    const list = Array.isArray(res.data) ? res.data : res.data.data || [];
    setProducts([...list].sort((a, b) => a.id - b.id));
  } catch {
    setError("Hindi ma-load ang products.");
  }
};

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const body = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editId) await api.put(`/products/${editId}`, body);
      else await api.post("/products", body);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "May error sa pag-save.");
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ product_name: p.product_name, description: p.description, price: p.price, quantity: p.quantity });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Burahin ang product na ito?")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      setError("Hindi nabura ang product.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Product Management</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input name="product_name" placeholder="Product name" value={form.product_name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        <button type="submit">{editId ? "Update" : "Add"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
      </form>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Qty</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.product_name}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>{p.quantity}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}