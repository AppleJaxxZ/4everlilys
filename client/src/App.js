import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from './firebase'
import Navbar from './components/Navbar.component';
import Home from './pages/Home/Home.page';
import CustomBuilder from './pages/CustomBuilder/CustomBuilder.page';
import Checkout from './pages/Checkout/Checkout.page';
import Profile from './pages/Profile/Profile.page';
import Login from './pages/Login/Login.page';
import Contact from './pages/ContactUs/Contact.page';
import Gallery from './pages/Gallery-Shop/Gallery-Shop.page';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation.page';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
        return newCart;
      } else {
        // New item, add to cart
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const updateCartQuantity = (itemId, quantity) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      } else {
        return prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
      }
    });
  };
  
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} cartCount={cart.length} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/build-custom" 
            element={<CustomBuilder addToCart={addToCart} />} 
          />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          
          <Route path="/contact" element={<Contact/>} />
          <Route 
  path="/checkout" 
  element={
    <Checkout 
      cart={cart} 
      user={user}
      updateQuantity={updateCartQuantity}  // This matches now
      removeFromCart={removeFromCart}
    />
  } 
/>
          <Route path="/gallery-shop" element={<Gallery addToCart={addToCart} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;