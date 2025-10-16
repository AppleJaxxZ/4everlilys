import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Profile.css';

function Profile({ user }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfileData({
            displayName: user.displayName || '',
            email: user.email || '',
            ...docSnap.data()
          });
        } else {
          setProfileData({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Update display name in Firebase Auth
      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName
        });
      }

      // Save additional profile data to Firestore
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(user, passwordData.newPassword);
      setMessage('Password updated successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage('Error updating password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>My Profile</h1>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="profile-section">
          <div className="section-header">
            <h2>Account Information</h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="edit-btn"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="displayName"
                value={profileData.displayName}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={profileData.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="button-group">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>

            <button 
              type="submit"
              className="save-btn"
              disabled={loading || !passwordData.newPassword}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Saved Information Benefits</h2>
          <ul className="benefits-list">
            <li>✓ Faster checkout process</li>
            <li>✓ Shipping information saved</li>
            <li>✓ Order history tracking</li>
            <li>✓ Easy reordering of favorites</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile;