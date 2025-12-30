import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomBuilder.css';
import { getImageUrl } from '../../utilities/getImageUrl';


const GIFTS = [
  {
    id: 1,
    name: 'Lazy Susans',
    image: getImageUrl('/images/gifts/lrg_lzy_flr.jpg'),
    basePrice: 50,
    sizes: [
      { id: 1, name: '9" Small ', image: getImageUrl('/images/sizes/small.jpg', 300) },
      { id: 2, name: '11" Medium/Small', image: getImageUrl('/images/sizes/small.jpg', 300) },
      { id: 3, name: '12" Medium', image: getImageUrl('/images/sizes/small.jpg', 300) },
      { id: 4, name: '14" Medium', image: getImageUrl('/images/sizes/small.jpg', 300) },
      { id: 5, name: '15" Medium ', image: getImageUrl('/images/sizes/medium.jpg', 300) },
      { id: 6, name: '20" Large', image: getImageUrl('/images/sizes/large.jpg', 300) },
    ]
  },
  {
    id: 2,
    name: 'Cutting Boards',
    image: getImageUrl('/images/gifts/IMG_2107.jpg'),
    basePrice: 30,
    sizes: [
      { id: 1, name: 'Small 11" x 8"', image: getImageUrl('/images/sizes/small.jpg', 300) },
      { id: 2, name: ' Medium 14" x 8" ', image: getImageUrl('/images/sizes/medium.jpg', 300) },
      { id: 3, name: 'Medium/Large 19"', image: getImageUrl('/images/sizes/medium.jpg', 300) },
      { id: 4, name: 'Large 24" x 12"', image: getImageUrl('/images/sizes/large.jpg', 300) },
      { id: 5, name: 'XLarge 32" x 8.5"', image: getImageUrl('/images/sizes/large.jpg', 300) },
    ]
  },
  {
    id: 3,
    name: 'Double Sided Waveboards',
    image: getImageUrl('/images/gifts/image000000 (5).jpg'),
    basePrice: 60,
    sizes: [
      { id: 1, name: 'Medium 19.5" x 7.75" ', image: getImageUrl('/images/sizes/small.jpg', 300) },
      { id: 2, name: '14" Medium 3/4inch + thickness', image: getImageUrl('/images/sizes/medium.jpg', 300) },
      { id: 3, name: '20" Large', image: getImageUrl('/images/sizes/large.jpg', 300) },
    ]
  },
  { id: 4, name: 'Coasters', image: getImageUrl('/images/gifts/IMG_2110.jpg'), basePrice: 35 },
  { id: 5, name: 'Trinket Trays', image: getImageUrl('/images/gifts/trinketTrays.jpg'), basePrice: 25 },
  { id: 6, name: 'Table', image: getImageUrl('/images/gifts/gift6.jpg'), basePrice: 40 },
  { id: 7, name: 'Gift 7', image: getImageUrl('/images/gifts/gift7.jpg'), basePrice: 27 },
  { id: 8, name: 'Gift 8', image: getImageUrl('/images/gifts/gift8.jpg'), basePrice: 33 },
  { id: 9, name: 'Gift 9', image: getImageUrl('/images/gifts/gift9.jpg'), basePrice: 38 },
  { id: 10, name: 'Gift 10', image: getImageUrl('/images/gifts/gift10.jpg'), basePrice: 45 }
];

const WOOD = [
  { id: 1, name: 'Acacia (Finished Example)', image: getImageUrl('/images/wood/acacia.jpg') },
  { id: 2, name: 'Cherry (Finished Example)', image: getImageUrl('/images/wood/cherry.jpg') },
  { id: 3, name: 'Maple (Finished Example)', image: getImageUrl('/images/wood/maple.jpg') },
  { id: 4, name: 'Walnut (Finished Example)', image: getImageUrl('/images/wood/walnut.jpg') },
  { id: 5, name: 'Black Walnut (Finished Example)', image: getImageUrl('/images/wood/black-walnut.jpg') },
];

const HANDLE_OPTIONS = [
  { id: 'handle', name: 'With Handle', image: getImageUrl('/images/handles/with-handle.jpg') },
  { id: 'no-handle', name: 'No Handle', image: getImageUrl('/images/handles/no-handle.jpg') }
];

const HANDLE_TYPES = [
  { id: 'wide', name: 'Wide Handle', image: getImageUrl('/images/handles/wide.jpg') },
  { id: 'knob', name: 'Knob Handle', image: getImageUrl('/images/handles/knob.jpg') },
  { id: 'hook', name: 'Hook Handle', image: getImageUrl('/images/handles/hook.jpg') }
];

const DESIGN_TYPES = [
  { id: 1, name: 'Flowers and Corks', image: getImageUrl('/images/designs/flowers-corks.jpg'), priceModifier: 10 },
  { id: 2, name: 'Pressed Flowers', image: getImageUrl('/images/designs/pressed-flowers.jpg'), priceModifier: 50 },
  { id: 3, name: 'Blue Waves', image: getImageUrl('/images/designs/blue-waves.jpg'), priceModifier: 45 },
  { id: 4, name: 'Green Waves', image: getImageUrl('/images/designs/green-waves.jpg'), priceModifier: 45 },
  { id: 5, name: 'Sand, Sea Shells and Creatures', image: getImageUrl('/images/designs/sea-shells.jpg'), priceModifier: 20 },
  { id: 6, name: 'Poker/Cards', image: getImageUrl('/images/designs/poker-cards.jpg'), priceModifier: 10 },
  { id: 7, name: 'Other', image: getImageUrl('/images/designs/other.jpg'), priceModifier: 0 }
];

function CustomBuilder({ addToCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedWood, setSelectedWood] = useState(null);
  const [selectedHandle, setSelectedHandle] = useState(null);
  const [selectedHandleType, setSelectedHandleType] = useState(null);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showAddedModal, setShowAddedModal] = useState(false);

  // Check if Acacia-only restriction applies
  const isAcaciaOnly = () => {
    if (!selectedGift || !selectedSize) return false;
    return selectedGift.id === 1 && [1, 2, 3, 5].includes(selectedSize.id);
  };

  // Check if handle steps should appear
  const shouldShowHandleSteps = () => {
    if (!selectedGift || !selectedSize) return false;
    return (selectedGift.id === 2 || selectedGift.id === 3) && selectedSize.id !== 1;
  };

  // Get available wood types based on selection
  const getAvailableWood = () => {
    if (isAcaciaOnly()) {
      return WOOD.filter(wood => wood.id === 1);
    }
    return WOOD;
  };

  // Get available design types based on selection
  const getAvailableDesigns = () => {
    // Lazy Susan with 9" Small size
    if (selectedGift.id === 1 && selectedSize.id === 1) {
      // Exclude: Flowers and Corks (1), Sand (5), Sea Shells (6), Poker/Cards (7)
      return DESIGN_TYPES.filter(design => ![1, 5, 6, 7].includes(design.id));
    }
    
    // Lazy Susan with other restricted sizes (11" Medium/Small, 12" Medium, 15" Medium)
    if (selectedGift.id === 1 && [2, 3, 5].includes(selectedSize.id)) {
      // Only exclude: Flowers and Corks (1)
      return DESIGN_TYPES.filter(design => design.id !== 1);
    }
    
    // Cutting Boards (2) or Double Sided Waveboards (3) - allow ALL designs
    if (selectedGift.id === 2 || selectedGift.id === 3) {
      return DESIGN_TYPES; // All designs available
    }
    
    // Default: all designs available
    return DESIGN_TYPES;
  };

  const handleGiftSelect = (gift) => {
    setSelectedGift(gift);
    setStep(2);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    
    const willBeAcaciaOnly = selectedGift.id === 1 && [1, 2].includes(size.id);
    
    if (willBeAcaciaOnly) {
      setSelectedWood(WOOD.find(w => w.id === 1));
    }
  
    // Clear restricted designs based on new selection
    if (selectedGift.id === 1 && size.id === 1) {
      // Remove designs 1, 5, 6, 7 for Lazy Susan 9" Small
      setSelectedDesigns(prev => prev.filter(d => ![1, 5, 6, 7].includes(d.id)));
    } else if (selectedGift.id === 1 && [2, 3, 5].includes(size.id)) {
      // Remove design 1 for other restricted Lazy Susan sizes
      setSelectedDesigns(prev => prev.filter(d => d.id !== 1));
    }
  
    const willShowHandles = (selectedGift.id === 2 || selectedGift.id === 3) && size.id !== 1;
    if (!willShowHandles) {
      setSelectedHandle(null);
      setSelectedHandleType(null);
    }
    
    setStep(3);
  };

  const handleWoodSelect = (wood) => {
    setSelectedWood(wood);
    
    // Auto-advance to next step after selection
    if (shouldShowHandleSteps()) {
      setStep(4); // Go to handle options
    } else {
      setStep(6); // Skip to design selection
    }
  };

  // const handleContinueFromWood = () => {
  //   if (selectedWood) {
  //     if (shouldShowHandleSteps()) {
  //       setStep(4);
  //     } else {
  //       setStep(6);
  //     }
  //   } else {
  //     alert('Please select a wood type');
  //   }
  // };

  const handleHandleOptionSelect = (handleOption) => {
    setSelectedHandle(handleOption);
    
    if (handleOption.id === 'no-handle') {
      setSelectedHandleType(null);
      setStep(6);
    } else {
      setStep(5);
    }
  };

  const handleHandleTypeSelect = (handleType) => {
    setSelectedHandleType(handleType);
    setStep(6);
  };

  const handleDesignToggle = (design) => {
    // If "Other" is clicked, open in new tab
    if (design.id === 8) {
      window.open('/contact', '_blank');
      return;
    }
  
    // Single selection - replace current selection with new one
    setSelectedDesigns([design]);
  };

  const handleContinueToReview = () => {
    if (selectedDesigns.length > 0) {
      setStep(7);
    } else {
      alert('Please select a design type');
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedGift) return 0;
    
    let total = selectedGift.basePrice;
    
    // Add design price modifier
    if (selectedDesigns.length > 0) {
      total += selectedDesigns.reduce((sum, design) => sum + (design.priceModifier || 0), 0);
    }
    
    return total * quantity;
  };

  const goToStep = (targetStep) => {
    setStep(targetStep);
  };

  // ENHANCED: Add to cart with image data
  const handleAddToCart = () => {
    // Build the custom item name
    const itemName = `Custom ${selectedGift.name} - ${selectedSize.name}`;
    
    // Build detailed description for Square
    const itemDescription = [
      `Type: ${selectedGift.name}`,
      `Size: ${selectedSize.name}`,
      `Wood: ${selectedWood.name}`,
      selectedHandle && `Handle: ${selectedHandle.name}`,
      selectedHandleType && `Handle Type: ${selectedHandleType.name}`,
      selectedDesigns.length > 0 && `Design: ${selectedDesigns[0].name}`,
    ].filter(Boolean).join(' | ');

    // Create the cart item with all image data
    const customItem = {
      id: `custom-${Date.now()}`,
      name: itemName,
      isCustom: true, // Flag to identify custom items for Square
      
      // Configuration details
      gift: selectedGift,
      size: selectedSize,
      wood: selectedWood,
      handle: selectedHandle,
      handleType: selectedHandleType,
      designs: selectedDesigns,
      
      // Pricing
      quantity: quantity,
      price: calculateTotalPrice() / quantity, // Price per item
      totalPrice: calculateTotalPrice() / quantity, // Use same for consistency
      
      // Images for Square
      imageUrl: selectedGift.image, // Primary image for Square catalog
      image: selectedGift.image, // Fallback for display
      
      // All component images for reference (optional - for detailed tracking)
      componentImages: {
        gift: selectedGift.image,
        size: selectedSize?.image,
        wood: selectedWood?.image,
        handle: selectedHandle?.image,
        handleType: selectedHandleType?.image,
        design: selectedDesigns[0]?.image,
      },
      
      // Metadata for Square
      description: itemDescription,
      category: 'Custom Order',
      type: 'order',
    };

    // Add to cart
    addToCart(customItem);
    
    // Show success modal
    setShowAddedModal(true);
  };

  const handleContinueShopping = () => {
    setShowAddedModal(false);
    setStep(1); // Reset to beginning
    // Reset all selections
    setSelectedGift(null);
    setSelectedSize(null);
    setSelectedWood(null);
    setSelectedHandle(null);
    setSelectedHandleType(null);
    setSelectedDesigns([]);
    setQuantity(1);
  };

  const handleCheckoutNow = () => {
    navigate('/checkout');
  };

  return (
    <div className="custom-builder-page">
      <div className="custom-builder-container">
        <h1 className="builder-title">Build Your Custom Woodcrafted Gift</h1>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }}></div>
        </div>

        {/* STEP 1: Choose Gift */}
        {step === 1 && (
          <div className="step-container">
            <h2 className="step-title">Step 1: Choose Your Gift</h2>
            <div className="gifts-grid">
              {GIFTS.map(gift => (
                <div 
                  key={gift.id} 
                  className="gift-card"
                  onClick={() => handleGiftSelect(gift)}
                >
                  <div className="gift-image-container">
                    <img 
                      src={gift.image} 
                      loading='lazy'
                      alt={gift.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + gift.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>{gift.name}</h3>
                  <p className="price">Starting at ${gift.basePrice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Size */}
        {step === 2 && selectedGift && (
          <div className="step-container">
            <h2 className="step-title">Step 2: Choose Your Size</h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
            </div>
            {selectedGift.sizes ? (
              <div className="sizes-grid">
                {selectedGift.sizes.map(size => (
                  <div 
                    key={size.id} 
                    className="size-card"
                    onClick={() => handleSizeSelect(size)}
                  >
                    <div className="size-image-container">
                      <img 
                        src={size.image} 
                        loading='lazy'
                        alt={size.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + size.name + '%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <h3>{size.name}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-sizes-message">
                <p>This item comes in one standard size.</p>
                <button 
                  className="continue-button"
                  onClick={() => handleSizeSelect({ id: 0, name: 'Standard' })}
                >
                  Continue →
                </button>
              </div>
            )}
            <button className="back-button" onClick={() => goToStep(1)}>
              ← Back to Gifts
            </button>
          </div>
        )}

        {/* STEP 3: Choose Wood */}
        {step === 3 && (
          <div className="step-container">
            <h2 className="step-title">
              Step 3: Select Wood Type
              {isAcaciaOnly() && (
                <span style={{ color: '#e67e22', fontSize: '0.9rem', marginLeft: '10px' }}>
                  (Acacia Only for this selection)
                </span>
              )}
            </h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
              <p>Selected Size: <strong>{selectedSize.name}</strong></p>
            </div>
            <div className="wood-grid">
              {getAvailableWood().map(wood => (
                <div 
                  key={wood.id} 
                  className={`wood-card ${selectedWood?.id === wood.id ? 'selected' : ''}`}
                  onClick={() => handleWoodSelect(wood)}
                >
                  <div className="wood-image-container">
                    <img 
                      src={wood.image} 
                      loading='lazy'
                      alt={wood.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + wood.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>{wood.name}</h3>
                  {selectedWood?.id === wood.id && (
                    <div className="checkmark">✓</div>
                  )}
                </div>
              ))}
            </div>
            <div className="button-group">
              <button className="back-button" onClick={() => goToStep(2)}>
                ← Back to Size
              </button>
             
            </div>
          </div>
        )}

        {/* STEP 4: Handle Option (Conditional) */}
        {step === 4 && shouldShowHandleSteps() && (
          <div className="step-container">
            <h2 className="step-title">Step 4: Choose Handle Option</h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
              <p>Selected Size: <strong>{selectedSize.name}</strong></p>
              <p>Selected Wood: <strong>{selectedWood.name}</strong></p>
            </div>
            <div className="handle-options-grid">
              {HANDLE_OPTIONS.map(option => (
                <div 
                  key={option.id} 
                  className="handle-option-card"
                  onClick={() => handleHandleOptionSelect(option)}
                >
                  <div className="size-image-container">
                    <img 
                      src={option.image} 
                      alt={option.name}
                      loading='lazy'
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + option.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>{option.name}</h3>
                </div>
              ))}
            </div>
            <button className="back-button" onClick={() => goToStep(3)}>
              ← Back to Wood Type
            </button>
          </div>
        )}

        {/* STEP 5: Handle Type (Conditional) */}
        {step === 5 && selectedHandle && selectedHandle.id === 'handle' && (
          <div className="step-container">
            <h2 className="step-title">Step 5: Select Handle Type</h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
              <p>Selected Size: <strong>{selectedSize.name}</strong></p>
              <p>Selected Wood: <strong>{selectedWood.name}</strong></p>
              <p>Handle Option: <strong>{selectedHandle.name}</strong></p>
            </div>
            <div className="sizes-grid">
              {HANDLE_TYPES.map(handleType => (
                <div 
                  key={handleType.id} 
                  className="size-card"
                  onClick={() => handleHandleTypeSelect(handleType)}
                >
                  <div className="size-image-container">
                    <img 
                      src={handleType.image} 
                      alt={handleType.name}
                      loading='lazy'
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + handleType.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>{handleType.name}</h3>
                </div>
              ))}
            </div>
            <button className="back-button" onClick={() => goToStep(4)}>
              ← Back to Handle Option
            </button>
          </div>
        )}

        {/* STEP 6: Choose Design Type */}
        {step === 6 && (
          <div className="step-container">
            <h2 className="step-title">
              Step {shouldShowHandleSteps() ? '6' : '4'}: Select Design Type (Choose one)
              {selectedGift.id === 1 && selectedSize.id === 1 && (
                <span style={{ color: '#e67e22', fontSize: '0.9rem', marginLeft: '10px' }}>
                  (Limited Designs for Small Size)
                </span>
              )}
              {selectedGift.id === 1 && [2, 3, 5].includes(selectedSize.id) && (
                <span style={{ color: '#e67e22', fontSize: '0.9rem', marginLeft: '10px' }}>
                  (Flowers and Corks Not Available)
                </span>
              )}
            </h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
              <p>Selected Size: <strong>{selectedSize.name}</strong></p>
              <p>Selected Wood: <strong>{selectedWood.name}</strong></p>
              {selectedHandle && <p>Handle: <strong>{selectedHandle.name}</strong></p>}
              {selectedHandleType && <p>Handle Type: <strong>{selectedHandleType.name}</strong></p>}
              
              {/* Warning messages */}
              {selectedGift.id === 1 && selectedSize.id === 1 && (
                <p style={{ color: '#e67e22', fontWeight: 'bold', marginTop: '10px' }}>
                  ⚠️ "Flowers and Corks", "Sand", "Sea Shells and Creatures", and "Poker/Cards" are not available for this size
                </p>
              )}
              {selectedGift.id === 1 && [2, 3, 5].includes(selectedSize.id) && (
                <p style={{ color: '#e67e22', fontWeight: 'bold', marginTop: '10px' }}>
                  ⚠️ "Flowers and Corks" design is not available for this size
                </p>
              )}
            </div>
            <div className="colors-grid">
              {getAvailableDesigns().map(design => (
                <div 
                  key={design.id} 
                  className={`color-card ${
                    design.id === 8 ? 'link-card' : 
                    selectedDesigns.find(d => d.id === design.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleDesignToggle(design)}
                >
                  <div className="size-image-container">
                    <img 
                      src={design.image} 
                      alt={design.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + design.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>
                    {design.name}
                    {design.id === 8 && <span style={{ marginLeft: '5px' }}>→</span>}
                  </h3>
                  <p className="price">
                    {design.id === 8 ? 'Custom Designs Contact Us' : 
                     design.priceModifier > 0 ? `+$${design.priceModifier}` : 'Included'}
                  </p>
                  {design.id !== 8 && selectedDesigns.find(d => d.id === design.id) && (
                    <div className="checkmark">✓</div>
                  )}
                </div>
              ))}
            </div>
            <div className="button-group">
              <button className="back-button" onClick={() => goToStep(shouldShowHandleSteps() ? 
                (selectedHandle && selectedHandle.id === 'handle' ? 5 : 4) : 3)}>
                ← Back
              </button>
              <button className="continue-button" onClick={handleContinueToReview}>
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Review and Quantity */}
        {step === 7 && (
          <div className="step-container review-container">
            <h2 className="step-title">Step {shouldShowHandleSteps() ? '7' : '5'}: Review Your Selection</h2>
            
            {/* Visual Preview */}
            <div className="preview-section">
              <h3>Product Preview</h3>
              <div className="preview-images">
                <div className="main-preview">
                  <img 
                    src={selectedGift.image} 
                    alt={selectedGift.name}
                    loading='lazy'
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23e8e8e8" width="300" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <p className="preview-label">Base Product: {selectedGift.name}</p>
                </div>
                <div className="component-previews">
                  {selectedWood && (
                    <div className="component-preview">
                      <img src={selectedWood.image} alt={selectedWood.name} loading='lazy' />
                      <p>{selectedWood.name}</p>
                    </div>
                  )}
                  {selectedDesigns[0] && (
                    <div className="component-preview">
                      <img src={selectedDesigns[0].image} alt={selectedDesigns[0].name} loading='lazy' />
                      <p>{selectedDesigns[0].name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="review-summary">
              <div className="review-section">
                <h3>Gift</h3>
                <p><strong>{selectedGift.name}</strong></p>
                <p className="price-detail">Base Price: ${selectedGift.basePrice}</p>
                <button className="edit-button" onClick={() => goToStep(1)}>
                  Edit
                </button>
              </div>

              <div className="review-section">
                <h3>Size</h3>
                <p><strong>{selectedSize.name}</strong></p>
                <button className="edit-button" onClick={() => goToStep(2)}>
                  Edit
                </button>
              </div>

              <div className="review-section">
                <h3>Wood</h3>
                <p><strong>{selectedWood.name}</strong></p>
                <button className="edit-button" onClick={() => goToStep(3)}>
                  Edit
                </button>
              </div>

              {selectedHandle && (
                <div className="review-section">
                  <h3>Handle</h3>
                  <p><strong>{selectedHandle.name}</strong></p>
                  {selectedHandleType && <p>Type: <strong>{selectedHandleType.name}</strong></p>}
                  <button className="edit-button" onClick={() => goToStep(4)}>
                    Edit
                  </button>
                </div>
              )}

              <div className="review-section">
                <h3>Design Type</h3>
                {selectedDesigns.length > 0 ? (
                  <>
                    <p><strong>{selectedDesigns[0].name}</strong></p>
                    <p className="price-detail">
                      {selectedDesigns[0].priceModifier > 0 ? `+$${selectedDesigns[0].priceModifier}` : 'Included'}
                    </p>
                  </>
                ) : (
                  <p>No design selected</p>
                )}
                <button className="edit-button" onClick={() => goToStep(6)}>
                  Edit
                </button>
              </div>

              <div className="review-section quantity-section">
                <h3>Quantity</h3>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="total-price-section">
                <h2>Total Price: ${calculateTotalPrice()}</h2>
              </div>
            </div>

            <div className="button-group">
              <button className="back-button" onClick={() => navigate('/')}>
                ← Back to Home
              </button>
              <button className="add-to-cart-button" onClick={handleAddToCart}>
                Add to Cart & Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showAddedModal && (
          <div className="modal-overlay" onClick={handleContinueShopping}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">✔</div>
              <h2>Item Added to Shopping Cart</h2>
              <p className="modal-item-name">
                Custom {selectedGift?.name} - ${(calculateTotalPrice() / quantity).toFixed(2)} each
              </p>
              <div className="modal-buttons">
                <button className="continue-btn" onClick={handleContinueShopping}>
                  Build Another Item
                </button>
                <button className="checkout-btn" onClick={handleCheckoutNow}>
                  Checkout Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomBuilder;