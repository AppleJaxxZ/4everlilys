export default function assignDynamicIds(data) {
  let idCounter = 1;

  // New structure: data is now { categoryName: [items], categoryName: [items], ... }
  for (const categoryItems of Object.values(data)) {
    // Check if categoryItems is actually an array
    if (Array.isArray(categoryItems)) {
      for (const item of categoryItems) {
        if (!item.id) {
          item.id = idCounter++;
        } else {
          idCounter = Math.max(idCounter, item.id + 1);
        }
      }
    }
  }

  return data;
}