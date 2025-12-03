//Serves image optimization from netlify but also displays static image on localhost during development
export const getImageUrl = (path, width = 600) => {
    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    return isLocal
      ? path
      : `/.netlify/images?url=${path}&w=${width}&fm=webp`;
  };
  