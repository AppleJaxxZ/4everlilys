export default function assignDynamicIds(data) {
    let idCounter = 1;
  
    for (const section of Object.values(data)) {
      for (const categoryItems of Object.values(section)) {
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
  