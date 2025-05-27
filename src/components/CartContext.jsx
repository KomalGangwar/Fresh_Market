// CartContext.js
import React, { createContext, useReducer, useContext } from "react";

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD":
      // Add item or increase quantity
      const existing = state.items[action.item.id];
      return {
        ...state,
        items: {
          ...state.items,
          [action.item.id]: {
            ...action.item,
            quantity: existing ? existing.quantity + 1 : 1,
          },
        },
      };
    case "REMOVE":
      // Decrease quantity or remove
      const updated = { ...state.items };
      if (updated[action.id].quantity > 1) {
        updated[action.id].quantity -= 1;
      } else {
        delete updated[action.id];
      }
      return { ...state, items: updated };
    case "SET":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
