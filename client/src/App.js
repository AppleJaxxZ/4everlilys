import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar.component';
import Home from './pages/Home/Home.page';
import CustomBuilder from './pages/CustomBuilder/CustomBuilder.page';
import Checkout from './pages/Checkout/Checkout.page';
import Shipping from './pages/Shipping/Shipping.page';
import Payment from './pages/Payment/Payment.page';
import Profile from './pages/Profile/Profile.page';
import Login from './pages/Login/Login.page';
import Contact from './pages/ContactUs/Contact.page';
import Gallery from './pages/Gallery-Shop/Gallery-Shop.page';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation.page';
import ItemDetail from './components/ItemDetail/ItemDetail.component';
import './App.css';

// ✅ Constants
const CART_STORAGE_KEY = '4everlilys-cart';
const CART_TIMESTAMP_KEY = '4everlilys-cart-timestamp';
const CART_EXPIRY_DAYS = 7;

function App() {
  const [user, setUser] = useState(null);
  
  // ✅ Initialize cart from localStorage with expiration check
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
      
      if (savedCart && savedTimestamp) {
        const now = Date.now();
        const cartAge = now - parseInt(savedTimestamp, 10);
        const expiryTime = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        // Check if cart has expired
        if (cartAge > expiryTime) {
          console.log('🗑️ Cart expired, clearing...');
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(CART_TIMESTAMP_KEY);
          return [];
        }
        
        const parsedCart = JSON.parse(savedCart);
        console.log('💾 Loaded cart from localStorage:', parsedCart.length, 'items');
        return parsedCart;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
      return [];
    }
  });

  // ✅ Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('👤 User logged in:', currentUser.email);
      } else {
        console.log('👤 User logged out');
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
      console.log('💾 Cart saved:', cart.length, 'items');
    } catch (error) {
      console.error('❌ Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // ✅ Add item to cart (handles duplicates)
  const addToCart = (item) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: (newCart[existingItemIndex].quantity || 1) + (item.quantity || 1)
        };
        console.log('✅ Updated item quantity:', newCart[existingItemIndex].name);
        return newCart;
      } else {
        // New item, add to cart
        console.log('✅ Added new item to cart:', item.name);
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  // ✅ Update item quantity
  const updateCartQuantity = (itemId, quantity) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        console.log('🗑️ Removing item (quantity = 0):', itemId);
        return prevCart.filter(item => item.id !== itemId);
      } else {
        console.log('🔄 Updating quantity for:', itemId, 'to', quantity);
        return prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
      }
    });
  };
  
  // ✅ Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.id === itemId);
      if (itemToRemove) {
        console.log('🗑️ Removed item from cart:', itemToRemove.name);
      }
      return prevCart.filter(item => item.id !== itemId);
    });
  };

  // ✅ Clear entire cart (use after successful payment)
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_TIMESTAMP_KEY);
    console.log('🧹 Cart cleared completely');
  };

  // ✅ Calculate cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.totalPrice || item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + (itemPrice * itemQuantity);
    }, 0);
  };

  // ✅ Get total item count (including quantities)
  const getTotalItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} cartCount={getTotalItemCount()} />
        
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route 
            path="/build-custom" 
            element={<CustomBuilder addToCart={addToCart} />} 
          />
          
          <Route 
            path="/gallery-shop" 
            element={<Gallery addToCart={addToCart} />} 
          />
          
          <Route 
            path="/item-detail" 
            element={<ItemDetail addToCart={addToCart} />}
          />
          
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cart={cart} 
                user={user}
                updateQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                getCartTotal={getCartTotal}
              />
            } 
          />
          
          <Route 
            path="/shipping" 
            element={
              <Shipping 
                cart={cart} 
                user={user}
                getCartTotal={getCartTotal}
              />
            } 
          />
          
          <Route 
            path="/payment" 
            element={
              <Payment 
                cart={cart} 
                user={user}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                getCartTotal={getCartTotal}
              />
            } 
          />
          
          <Route 
            path="/order-confirmation" 
            element={<OrderConfirmation clearCart={clearCart} />} 
          />
          
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;