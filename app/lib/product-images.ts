// Sample product images for Medik8 products
export const getProductImage = (productName: string, category: string): string | undefined => {
  // Use Unsplash for high-quality skincare product images
  const baseUrl = 'https://images.unsplash.com';
  
  // Map product categories to appropriate Unsplash images
  const categoryImages: Record<string, string> = {
    'Cleansers & Toners': `${baseUrl}/400x400/?face,cleanser,skincare&auto=format&fit=crop`,
    'Serums & Treatments': `${baseUrl}/400x400/?serum,skincare,bottle&auto=format&fit=crop`,
    'Moisturizers': `${baseUrl}/400x400/?moisturizer,cream,skincare&auto=format&fit=crop`,
    'Eye Care': `${baseUrl}/400x400/?eye,cream,skincare&auto=format&fit=crop`,
    'Sun Protection': `${baseUrl}/400x400/?sunscreen,spf,skincare&auto=format&fit=crop`,
    'Exfoliants & Acids': `${baseUrl}/400x400/?skincare,treatment,bottle&auto=format&fit=crop`,
    'Masks & Treatments': `${baseUrl}/400x400/?face,mask,skincare&auto=format&fit=crop`,
    'Body Care': `${baseUrl}/400x400/?body,lotion,skincare&auto=format&fit=crop`,
    'Sets & Kits': `${baseUrl}/400x400/?gift,set,skincare&auto=format&fit=crop`
  };

  // Special cases for specific product names
  if (productName.toLowerCase().includes('vitamin c')) {
    return `${baseUrl}/400x400/?vitamin,c,serum,orange&auto=format&fit=crop&sig=1`;
  }
  
  if (productName.toLowerCase().includes('retinal')) {
    return `${baseUrl}/400x400/?retinol,serum,night,skincare&auto=format&fit=crop&sig=2`;
  }
  
  if (productName.toLowerCase().includes('hydr8')) {
    return `${baseUrl}/400x400/?hydration,moisturizer,blue&auto=format&fit=crop&sig=3`;
  }
  
  if (productName.toLowerCase().includes('clarity')) {
    return `${baseUrl}/400x400/?clear,skin,treatment&auto=format&fit=crop&sig=4`;
  }
  
  if (productName.toLowerCase().includes('enzyme')) {
    return `${baseUrl}/400x400/?exfoliant,cleanser,green&auto=format&fit=crop&sig=5`;
  }

  // Default to category image
  return categoryImages[category] || `${baseUrl}/400x400/?skincare,beauty,bottle&auto=format&fit=crop&sig=6`;
};

// Enhanced product data with images
export const enhanceProductWithImage = (product: any) => {
  return {
    ...product,
    featuredImage: product.featuredImage || getProductImage(product.name, product.category)
  };
};