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
    setCart([...cart, item]);
  };

  const updateCartQuantity = (index, quantity) => {
    const newCart = [...cart];
    if (quantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = quantity;
    }
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
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
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cart={cart} 
                user={user}
                updateQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
              />
            } 
          />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;