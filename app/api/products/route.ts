import { NextRequest, NextResponse } from 'next/server';
import { allMedik8Products } from '../../lib/all-medik8-products';

// Skin Societé Product Catalog - Only Medik8 Products We Actually Sell
const products = allMedik8Products;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (category && category !== 'All Products') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.name === category
      );
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.name.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by featured
    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(product => product.featured);
    }
    
    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}