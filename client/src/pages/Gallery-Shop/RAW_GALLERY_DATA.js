import { getImageUrl } from '../../utilities/getImageUrl';

export const RAW_GALLERY_DATA = {
    'available-order': {
      'lazy-susans': [
        { name: 'Acacia Lazy Susan 9"', price: 50, image: getImageUrl('/images/gallery/lazy1.jpg') },
        { name: 'Acacia Lazy Susan 11"', price: 120, image: getImageUrl('/images/gallery/lazy2.jpg') },
        { name: 'Acacia Lazy Susan 12"', price: 150, image: getImageUrl('/images/gallery/lazy3.jpg') },
        { name: 'Lazy Susan 14"', price: 120, image: getImageUrl('/images/gallery/lazy2.jpg') },
        { name: 'Lazy Susan 15"', price: 150, image: getImageUrl('/images/gallery/lazy3.jpg') },
        { name: 'Lazy Susan 20"', price: 120, image: getImageUrl('/images/gallery/lazy2.jpg') },
      ],
      'wave-cutting-boards': [
        {
          name: 'Black Walnut 11" x 8 " ',
          price: 65,
          image: getImageUrl('/images/gallery/board1.jpg'),
          images: [
            getImageUrl('/images/gallery/river1.jpg'),
            getImageUrl('/images/gallery/river1-angle1.jpg'),
            getImageUrl('/images/gallery/river1-angle2.jpg'),
            getImageUrl('/images/gallery/river1-detail.jpg')
          ],
          description: 'Dimensions: 0.57" H x 19.45" W x 7.78" D HEY Material: Acacia Wood \n\n Care & Safety: Food Safe; Hand Wash Only' 
        },
        { name: 'Black Walnut 14" x 8"', price: 95, image: getImageUrl('/images/gallery/board2.jpg') },
        { name: 'Black Walnut 19" x 10" ', price: 75, image: getImageUrl('/images/gallery/board3.jpg') },
        { name: 'Black Walnut 24" x 12"', price: 95, image: getImageUrl('/images/gallery/board2.jpg') },
        { name: 'Black Walnut 32" x 8.5" ', price: 75, image: getImageUrl('/images/gallery/board3.jpg') },
        { name: 'Maple Walnut 11" x 8 " ', price: 65, image: getImageUrl('/images/gallery/board1.jpg') },
        { name: 'Maple Walnut 14" x 8"', price: 95, image: getImageUrl('/images/gallery/board2.jpg') },
        { name: 'Maple Walnut 19" x 10" ', price: 75, image: getImageUrl('/images/gallery/board3.jpg') },
        { name: 'Maple Walnut 24" x 12"', price: 95, image: getImageUrl('/images/gallery/board2.jpg') },
        { name: 'Maple Walnut 32" x 8.5" ', price: 75, image: getImageUrl('/images/gallery/board3.jpg') },
      ],
      'floral': [
        { name: 'Black Walnut Floral Cutting Board 26"x12"x1.5" ', price: 275, image: getImageUrl('/images/gallery/forSale/BlackWalnut_Cuttingboard.png') },
        { name: 'Acacia Floral Cutting Board 19.5"x7.75"x.625" ', price: 75, image: getImageUrl('/images/gallery/byOrder/flower-board/arcadia_cuttingboard.jpeg') },
        
        
      ],
      'scene-boards': [
        { name: 'Serving Tray Large', price: 55, image: getImageUrl('/images/gallery/tray1.jpg') },
        { name: 'Breakfast Tray', price: 45, image: getImageUrl('/images/gallery/tray2.jpg') },
      ],
      'river-boards': [
        { name: 'Blue River Board', price: 180, image: getImageUrl('/images/gallery/river1.jpg') },
        { name: 'Green Wave Board', price: 165, image: getImageUrl('/images/gallery/river2.jpg') },
      ],
      'tables': [
        { name: 'Ocean River Table', price: 1200, image: getImageUrl('/images/gallery/IMG_1692.jpg') },
        { name: 'Lake River Table', price: 950, image: getImageUrl('/images/gallery/rivertable2.jpg') },
      ],
      'skulls': [
        { name: 'Xtra Large Epoxy Skull', price: 20, image: getImageUrl('/images/gallery/skull1.jpg') },
        { name: 'Large Epoxy Skull ', price: 110, image: getImageUrl('/images/gallery/skull2.jpg') },
        { name: 'Medium Epoxy Skull', price: 85, image: getImageUrl('/images/gallery/skull1.jpg') },
        { name: 'Small Epoxy Skull', price: 110, image: getImageUrl('/images/gallery/skull2.jpg') },
      ],
      'animals': [
        { name: 'Large Epoxy Cat', price: 95, image: getImageUrl('/images/gallery/animal1.jpg') },
        { name: 'Medium Epoxy Cat', price: 135, image: getImageUrl('/images/gallery/animal2.jpg') },
        { name: 'Small Epoxy Cat', price: 135, image: getImageUrl('/images/gallery/animal2.jpg') },
        { name: 'Large Epoxy Dog', price: 95, image: getImageUrl('/images/gallery/animal1.jpg') },
        { name: 'Medium Epoxy Dog', price: 135, image: getImageUrl('/images/gallery/animal2.jpg') },
        { name: 'Small Epoxy Dog', price: 135, image: getImageUrl('/images/gallery/animal2.jpg') },
      ],
      'coasters': [
        { name: '4 Count Fence And Flower Coasters Set With Holder', price: 40, image: getImageUrl('/images/gallery/byOrder/coasters/IMG_2158.jpg') },
        { name: 'Hexagon Wave Coaster', price: 120, image: getImageUrl('/images/gallery/other2.jpg') },
        { name: 'Square Fence Coaster', price: 40, image: getImageUrl('/images/gallery/other1.jpg') },
      ],
      'bathroom-set': [
        { name: 'Custom Coaster Set', price: 40, image: getImageUrl('/images/gallery/other1.jpg') },
        { name: 'Wine Rack', price: 120, image: getImageUrl('/images/gallery/other2.jpg') },
        { name: 'Wine Rack', price: 120, image: getImageUrl('/images/gallery/other2.jpg') },
      ],
      'holidays': [
        { name: 'Custom Coaster Set', price: 40, image: getImageUrl('/images/gallery/other1.jpg') },
        { name: 'Wine Rack', price: 120, image: getImageUrl('/images/gallery/other2.jpg') },
        { name: 'Wine Rack', price: 120, image: getImageUrl('/images/gallery/other2.jpg') },
      ],
      'other': [
       
        
      ],
    },
    //FOR SALE
    'for-sale': {
      'lazy-susans': [
        { name: 'Acacia Flower Lazy Susan 9" x .625"', price: 50, image: getImageUrl('/images/gallery/forSale/lzySu9-1.jpg') },
        { name: 'Acacia Flower Lazy Susan 11" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/lzysu11-2.jpg') },
        { name: 'Acacia Flower Lazy Susan 11" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/lzySu11-3.jpg') },
        { name: 'Black Cherry Wave N Shell Lazy Susan 20"', price: 300, image: getImageUrl('/images/gallery/forSale/lzysu20-4.jpg') },
      ],
      'wave-cutting-boards': [
        { name: 'Acacia Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152728.jpg') },
        { name: 'Acacia Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152602.jpg') },
        { name: 'Acacia Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/acWaveBoard5.jpg') },
        { name: 'Acacia Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152241.jpg') },
        { name: 'Acacia Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152345.jpg') },
        { name: 'Acacia Dark Blue Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152517.jpg') },
        { name: 'Acacia Turquoise Wave N Shell 19.5" x 8" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152433.jpg') },
        { name: 'Black Walnut Wave N Shell 32" x 8.5"', price: 165, image: getImageUrl('/images/gallery/forSale/20251126_145901.jpg') },
        { name: 'Black Walnut Wave N Shell 32" x 8.5"', price: 165, image: getImageUrl('/images/gallery/forSale/20251126_150154.jpg') },
        {name: 'Cherry Double Sided Wave Board 21" x 9.5" x 1"', price: 145, image: getImageUrl('/images/gallery/forSale/20251126_151110.jpg') },
      ],
      'floral': [
        { name: 'Black Walnut Cork N Flower 23" x 10" x 1"', price: 135, image: getImageUrl('/images/gallery/forSale/bwflr.jpg'),
            images: getImageUrl(['/images/gallery/forSale/bwflr.jpg', '/images/gallery/forSale/20251126_150600.jpg'])
         },
        { name: 'Black Walnut Flower Board 25.5" x 9" x 1"', price: 135, image: getImageUrl('/images/gallery/forSale/bwflr1.jpg') },
        { name: 'Acacia Flower Board 19.5" x 7.75" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/20251126_152117.jpg') },
        { name: 'Acacia Flower Board 19.5" x 7.75" x .625"', price: 75, image: getImageUrl('/images/gallery/forSale/bwflr1.jpg') },
        {name: 'Maple Cork N Flower Board 22" x 7.25" x 1"', price: 135, image: getImageUrl('/images/gallery/forSale/20251126_150822.jpg'), images: getImageUrl(['/images/gallery/forSale/20251126_150822.jpg','/images/gallery/forSale/20251126_150853.jpg'])},
        {name: 'Maple Flower Board 20" x 8.5" x 1"', price: 115, image: getImageUrl('/images/gallery/forSale/20251126_151016.jpg')},
        {name: 'Black Walnut Flower Board 22.5" x 7" x 1"', price: 115, image: getImageUrl('/images/gallery/forSale/20251126_151238.jpg')},
        {name: 'Black Cherry Flower Board 21" x 8" x 1"', price: 115, image: getImageUrl('/images/gallery/forSale/20251126_151907.jpg')},
      ],
      'scene-boards': [
        { name: 'Acacia Fence N Flower Board 19.5" x 8" x .625"', price: 80, image: getImageUrl('/images/gallery/forSale/20251126_152641.jpg') },
        { name: 'Acacia Poker Board 19.5" x 8" x .625"', price: 80, image: getImageUrl('/images/gallery/forSale/acaciapoker.jpg') },
        { name: 'Black Walnut Bison Cutting Board 31.5" x 7.5" x 1"', price: 80, image: getImageUrl('/images/gallery/forSale/20251126_151636.jpg') },
        { name: 'Acacia Cards N Money Board 19.5" x 8" x .625"', price: 60, image: getImageUrl('/images/gallery/forSale/20251126_153009.jpg') },
      ],
      'river-boards': [
        { name: 'Turquoise River Board', price: 115, image: getImageUrl('/images/gallery/river3.jpg') },
      ],
      'tables': [
        { name: 'Sky River Table', price: 1100, image: getImageUrl('/images/gallery/rivertable3.jpg') },
      ],
      'skulls': [
        { name: 'Wooden Skull', price: 90, image: getImageUrl('/images/gallery/skull3.jpg') },
      ],
      'animals': [
        { name: 'Wolf Carving', price: 105, image: getImageUrl('/images/gallery/animal3.jpg') },
      ],
      'coasters': [
        
      ],
      'bathroom-set': [
        
      ],
      'holidays': [
       
        
      ],
      'other': [
       
        
      ],
    },
  };
  
