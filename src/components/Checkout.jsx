import React from "react";
import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function applyOffers(items) {
  let newItems = { ...items };
  let offers = [];

  // Coca-Cola offer: Buy 6 get 1 free
  const coke = Object.values(newItems).find(
    i => i.name.toLowerCase().includes("coca-cola")
  );
  if (coke) {
    const freeCoke = Math.floor(coke.quantity / 6);
    if (freeCoke > 0) {
      offers.push(`${freeCoke} free Coca-Cola`);
      newItems[`free-coke`] = {
        ...coke,
        id: "free-coke",
        name: "Coca-Cola (Free)",
        price: 0,
        quantity: freeCoke,
      };
    } else {
      delete newItems["free-coke"];
    }
  }

  // Croissant + Coffee offer: Buy 3 croissants, get 1 coffee
  const croissant = Object.values(newItems).find(
    i => i.name.toLowerCase().includes("croissant")
  );
  if (croissant) {
    const freeCoffee = Math.floor(croissant.quantity / 3);
    if (freeCoffee > 0) {
      offers.push(`${freeCoffee} free Coffee`);
      newItems[`free-coffee`] = {
        id: "free-coffee",
        name: "Coffee (Free)",
        price: 0,
        quantity: freeCoffee,
      };
    } else {
      delete newItems["free-coffee"];
    }
  }

  return { newItems, offers };
}

function Checkout() {
  const { state, dispatch } = useCart();
  const { newItems, offers } = applyOffers(state.items);

  const subtotal = Object.values(state.items)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const total = Object.values(newItems)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discount = subtotal - total;

  return (
    <section aria-label="Checkout cart">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <AnimatePresence>
          {Object.values(newItems).length === 0 && (
            <motion.p
              className="text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Your cart is empty.
            </motion.p>
          )}
          {Object.values(newItems).map(item => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between border-b py-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <span>
                {item.name} <span className="text-gray-500">x {item.quantity}</span>
                {item.price === 0 && <span className="ml-2 text-green-600 font-semibold">(Free)</span>}
              </span>
              {item.price > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => {
                      dispatch({ type: "ADD", item });
                      toast.success(`Increased ${item.name}`);
                    }}
                    aria-label={`Increase quantity of ${item.name}`}
                  >+</button>
                  <button
                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => {
                      dispatch({ type: "REMOVE", id: item.id });
                      toast(`Removed one ${item.name}`);
                    }}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >-</button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mb-6">
        <p className="text-lg">Subtotal: <span className="font-semibold">{subtotal} ₹</span></p>
        <p className="text-lg">Discount: <span className="font-semibold text-green-600">{discount} ₹</span></p>
        <p className="text-xl font-bold">Total: <span className="text-blue-700">{total} ₹</span></p>
      </div>
      <AnimatePresence>
        {offers.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-green-100 to-blue-100 border-l-4 border-green-400 p-4 rounded mb-4 animate-pulse"
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="font-semibold mb-1 text-green-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              Offers Applied:
            </h4>
            <ul className="list-disc list-inside">
              {offers.map((o, idx) => <li key={idx}>{o}</li>)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Checkout;
