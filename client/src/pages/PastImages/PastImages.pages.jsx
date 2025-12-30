import React, { useState } from 'react';
import mediaFiles from '../../data/mediaList';
import './PastImages.css';

function PastImages() {
  const [selectedMedia, setSelectedMedia] = useState(null);

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
        <p>See something you want too? Email us the <strong>image number</strong> and we'll craft an original piece just for you!</p><br/>
        <p><a href="mailto:4everlilyswc@gmail.com" aria-label="4everlilys email link">4EverLilys Email</a></p>
      </div>

      <div className="photo-gallery-grid">
        {mediaFiles.map((media, index) => (
          <div 
            key={index} 
            className="gallery-image-wrapper"
            onClick={() => openLightbox({ ...media, index })}
          >
            {/* ✅ Display Index Number */}
            <div className="image-id-badge">#{index}</div>

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
                alt={`Gallery item #${index}`}
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
          
          {/* ✅ Display Index Number in Lightbox */}
          <div className="lightbox-id-badge">#{selectedMedia.index}</div>

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
              alt={`Full size view - #${selectedMedia.index}`}
              className="lightbox-image"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PastImages;