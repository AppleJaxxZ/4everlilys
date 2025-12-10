import React, { useState } from 'react';
import mediaFiles from '../../data/mediaList'; // ← Import the list
import './PastImages.css';

function PastImages() {
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Now using imported mediaFiles instead of hardcoding

  const openLightbox = (media) => {
    setSelectedMedia(media);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    document.body.style.overflow = 'auto';
  };

  const handleBackgroundClick = (e) => {
    if (e.target.className === 'lightbox') {
      closeLightbox();
    }
  };

  return (
    <div className="photo-gallery-container">
      <div className="gallery-header">
        <h1>Masterpieces Of The Past</h1>
        <p>See something you want too?  Email us the image and well craft an original piece just for you! </p><br/>
        <p><a href={`mailto: 4everlilyswc@gmail.com`}></a></p>
        
      </div>

      <div className="photo-gallery-grid">
        {mediaFiles.map((media, index) => (
          <div 
            key={index} 
            className="gallery-image-wrapper"
            onClick={() => openLightbox(media)}
          >
            {media.type === 'video' ? (
              <>
                <video 
                  src={media.src}
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="video-indicator">
                  <span className="play-icon">▶</span>
                </div>
              </>
            ) : (
              <img 
                src={media.src} 
                alt={`Gallery item ${index + 1}`}
                loading="lazy"
              />
            )}
            <div className="image-overlay">
              <span className="view-icon">
                {media.type === 'video' ? '▶' : '🔍'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div className="lightbox" onClick={handleBackgroundClick}>
          <button className="lightbox-close" onClick={closeLightbox}>
            ✕
          </button>
          {selectedMedia.type === 'video' ? (
            <video 
              src={selectedMedia.src} 
              controls
              autoPlay
              className="lightbox-video"
            />
          ) : (
            <img 
              src={selectedMedia.src} 
              alt="Full size view" 
              className="lightbox-image"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PastImages;