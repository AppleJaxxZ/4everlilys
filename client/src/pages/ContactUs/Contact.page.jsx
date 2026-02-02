import React from 'react';
import { Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  // You can update these with your actual contact information
  const contactInfo = {
    phone: '+1 (835)-204-2961',
    email: '4everlilyswc@gmail.com',
    facebook: 'facebook.com/4everlilys',
    instagram: '@yourcompany',
    
  };

  return (
    <div className="contact-page">
      <div className="container">
        {/* Header */}
        <h1 className="page-title">Contact Us</h1>

        {/* Custom Project Message */}
        <div className="message-card">
          <div className="message-content">
            <MessageCircle className="message-icon" />
            <p className="message-text">
              Have a customized project you'd like to build?  Please email us your projects ideas and we'll come help you create a customized creation we know you'll love! 
               <br/>Include the size, shape, colors, styles, wood type, and any other details you can think of. Average response time is 24 hours. <br/> Text or call us.  If we do not answer your call please leave a detailed voicemail!
            </p>
          </div>
        </div>

        {/* Contact Information Grid */}
        <div className="contact-grid">
          {/* Phone */}
          <div className="contact-card">
            <div className="contact-item">
              <div className="icon-wrapper phone-icon">
                <Phone size={24} />
              </div>
              <div className="contact-details">
                <h3>Phone</h3>
                <a href={`tel:${contactInfo.phone}`}>
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="contact-card">
            <div className="contact-item">
              <div className="icon-wrapper email-icon">
                <Mail size={24} />
              </div>
              <div className="contact-details">
                <h3>Email</h3>
                <a href={`mailto:${contactInfo.email}`}>
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Facebook */}
          <div className="contact-card">
            <div className="contact-item">
              <div className="icon-wrapper facebook-icon">
                <Facebook size={24} />
              </div>
              <div className="contact-details">
                <h3>Facebook</h3>
                <a 
                  href={`https://${contactInfo.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contactInfo.facebook}
                </a>
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="contact-card">
            <div className="contact-item">
              <div className="icon-wrapper instagram-icon">
                <Instagram size={24} />
              </div>
              <div className="contact-details">
                <h3>Instagram</h3>
                <a 
                  href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contactInfo.instagram}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section
        <div className="location-card">
          <div className="location-content">
            <div className="icon-wrapper location-icon">
              <MapPin size={24} />
            </div>
            <div className="location-details">
              <h3>Visit Us</h3>
              <p>{contactInfo.address}</p>
            </div>
          </div>
        </div> */}

        {/* Call to Action */}
        <div className="cta-section">
          <h2>We'd Love to Hear From You!</h2>
          <p>
            Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;