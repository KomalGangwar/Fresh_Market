import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const API_URL = "https://uxdlyqjm9i.execute-api.eu-west-1.amazonaws.com/s?category=";

function ProductList() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL + category)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [category]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section aria-label="Product search and results">
      <form className="flex flex-col md:flex-row gap-3 mb-6" role="search" aria-label="Product search form" onSubmit={e => e.preventDefault()}>
        <label htmlFor="category" className="sr-only">Category</label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Filter by category"
        >
          <option value="all">All</option>
          <option value="fruit">Fruit</option>
          <option value="drinks">Drinks</option>
          <option value="bakery">Bakery</option>
        </select>
        <label htmlFor="search" className="sr-only">Search Products</label>
        <input
          id="search"
          name="search"
          type="text"
          className="border rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search products by name"
        />
      </form>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <img src="https://www.svgrepo.com/show/276264/empty-box.svg" alt="No products" className="mx-auto w-32 mb-4" />
          <p className="text-gray-500">No products match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow"
              role="region"
              aria-label={product.name}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover mb-2 rounded transition-transform duration-300 hover:scale-110"
                />
              )}
              <h4 className="text-lg font-semibold mb-1">{product.name}</h4>
              <p className="text-gray-700 mb-2">{product.price} ₹</p>
              <p className={product.stock >= 10 ? "text-green-600" : "text-red-600"}>
                {product.stock >= 10 ? "Available" : `Only ${product.stock} left`}
              </p>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform active:scale-95 disabled:opacity-50"
                disabled={product.stock === 0}
                onClick={() => {
                  dispatch({ type: "ADD", item: product });
                  toast.success(`${product.name} added to cart!`);
                }}
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductList;
