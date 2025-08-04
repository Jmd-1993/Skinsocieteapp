// Complete Medik8 Product Catalog - ALL 77 Products with 15% Loss Leader Pricing

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  sku: string;
  stockQuantity: number;
  categoryId: string;
  brandId: string;
  tags: string[];
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  status: string;
  trackInventory: boolean;
  images: string[];
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
}

export const allMedik8Products: Product[] = [
  // ============ CLEANSERS & TONERS (11 products) ============
  {
    id: "101", name: "Eyes & Lips Micellar Cleanse", slug: "eyes-lips-micellar-cleanse",
    description: "Gentle yet effective micellar cleansing water specifically formulated for the delicate eye and lip areas. Removes all traces of makeup, including waterproof formulas, without irritation.",
    shortDescription: "Gentle micellar water for eyes & lips", price: 31.45, compareAtPrice: 37.00, costPrice: 15.73, sku: "MDK101", stockQuantity: 45,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["micellar-water", "gentle", "eye-makeup-removal", "sensitive"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.7, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-micellar-cleanse.jpg"], featuredImage: "/products/medik8-micellar-cleanse.jpg",
    metaTitle: "Eyes & Lips Micellar Cleanse - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Eyes & Lips Micellar Cleanse. Gentle makeup removal for sensitive areas."
  },
  {
    id: "102", name: "Lipid-Balance Cleansing Oil", slug: "lipid-balance-cleansing-oil",
    description: "Luxurious cleansing oil that effortlessly dissolves makeup and impurities while maintaining the skin's natural lipid barrier. Leaves skin feeling soft, balanced and thoroughly cleansed.",
    shortDescription: "Nourishing oil cleanser for all skin types", price: 52.70, compareAtPrice: 62.00, costPrice: 26.35, sku: "MDK102", stockQuantity: 35,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["oil-cleanser", "makeup-removal", "nourishing", "barrier-repair"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.8, reviewCount: 456, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-lipid-balance.jpg"], featuredImage: "/products/medik8-lipid-balance.jpg",
    metaTitle: "Lipid-Balance Cleansing Oil - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Lipid-Balance Cleansing Oil. Nourishing oil cleanser for all skin types."
  },
  {
    id: "103", name: "Cream Cleanse", slug: "cream-cleanse",
    description: "Rich, creamy cleanser that gently removes makeup and impurities while nourishing dry and sensitive skin. Formulated with soothing ingredients for a comfortable cleansing experience.",
    shortDescription: "Gentle cream cleanser for dry/sensitive skin", price: 44.20, compareAtPrice: 52.00, costPrice: 22.10, sku: "MDK103", stockQuantity: 50,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["cream-cleanser", "gentle", "dry-skin", "sensitive-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.6, reviewCount: 187, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-cream-cleanse.jpg"], featuredImage: "/products/medik8-cream-cleanse.jpg",
    metaTitle: "Cream Cleanse - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Cream Cleanse. Gentle cream cleanser perfect for dry and sensitive skin."
  },
  {
    id: "104", name: "Gentle Cleanse", slug: "gentle-cleanse",
    description: "Ultra-gentle daily cleanser perfect for sensitive and reactive skin. Formulated with soothing botanicals to cleanse without stripping the skin's natural barrier.",
    shortDescription: "Ultra-gentle daily cleanser for sensitive skin", price: 44.20, compareAtPrice: 52.00, costPrice: 22.10, sku: "MDK104", stockQuantity: 45,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["gentle", "sensitive-skin", "daily-cleanser", "soothing"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.6, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-gentle-cleanse.jpg"], featuredImage: "/products/medik8-gentle-cleanse.jpg",
    metaTitle: "Gentle Cleanse - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Gentle Cleanse. Ultra-gentle daily cleanser for sensitive skin."
  },
  {
    id: "105", name: "Surface Radiance Cleanse", slug: "surface-radiance-cleanse",
    description: "AHA-powered gel cleanser that gently exfoliates while cleansing, revealing brighter, smoother skin. Perfect for dull, congested skin types seeking gentle daily exfoliation.",
    shortDescription: "AHA gel cleanser for brighter skin", price: 44.20, compareAtPrice: 52.00, costPrice: 22.10, sku: "MDK105", stockQuantity: 40,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["aha", "exfoliating", "brightening", "gel-cleanser"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.7, reviewCount: 189, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-surface-radiance.jpg"], featuredImage: "/products/medik8-surface-radiance.jpg",
    metaTitle: "Surface Radiance Cleanse - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Surface Radiance Cleanse. AHA gel cleanser for brighter, smoother skin."
  },
  {
    id: "106", name: "Micellar Mousse", slug: "micellar-mousse",
    description: "Lightweight foaming micellar cleanser that removes makeup and impurities without disrupting the skin's natural balance. Perfect for all skin types seeking effortless cleansing.",
    shortDescription: "Lightweight foaming micellar cleanser", price: 46.75, compareAtPrice: 55.00, costPrice: 23.38, sku: "MDK106", stockQuantity: 38,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["micellar", "foaming", "lightweight", "makeup-removal"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.5, reviewCount: 156, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-micellar-mousse.jpg"], featuredImage: "/products/medik8-micellar-mousse.jpg",
    metaTitle: "Micellar Mousse - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Micellar Mousse. Lightweight foaming cleanser for all skin types."
  },
  {
    id: "107", name: "Clarifying Foam", slug: "clarifying-foam",
    description: "Deep cleansing foam specifically formulated for oily and combination skin. Contains purifying ingredients to remove excess oil and unclog pores while maintaining skin balance.",
    shortDescription: "Deep cleansing foam for oily/combination skin", price: 52.70, compareAtPrice: 62.00, costPrice: 26.35, sku: "MDK107", stockQuantity: 42,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["deep-cleansing", "foam", "oily-skin", "combination-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.7, reviewCount: 298, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-clarifying-foam.jpg"], featuredImage: "/products/medik8-clarifying-foam.jpg",
    metaTitle: "Clarifying Foam - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Clarifying Foam. Deep cleansing foam for oily and combination skin."
  },
  {
    id: "108", name: "Pore Minimising Tonic", slug: "pore-minimising-tonic",
    description: "Pore-refining tonic with niacinamide that helps minimize the appearance of pores while balancing oil production. Leaves skin looking smoother and more refined.",
    shortDescription: "Pore-refining tonic with niacinamide", price: 48.45, compareAtPrice: 57.00, costPrice: 24.23, sku: "MDK108", stockQuantity: 55,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["pore-minimizing", "niacinamide", "tonic", "oil-control"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.6, reviewCount: 312, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-pore-tonic.jpg"], featuredImage: "/products/medik8-pore-tonic.jpg",
    metaTitle: "Pore Minimising Tonic - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Pore Minimising Tonic. Niacinamide tonic for refined, balanced skin."
  },
  {
    id: "109", name: "Balance Moisturiser", slug: "balance-moisturiser",
    description: "Lightweight moisturizer specifically designed for combination skin. Hydrates dry areas while controlling oil in the T-zone for perfectly balanced skin.",
    shortDescription: "Lightweight moisturizer for combination skin", price: 63.75, compareAtPrice: 75.00, costPrice: 31.88, sku: "MDK109", stockQuantity: 30,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["lightweight", "combination-skin", "balance", "oil-control"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.5, reviewCount: 189, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-balance-moisturiser.jpg"], featuredImage: "/products/medik8-balance-moisturiser.jpg",
    metaTitle: "Balance Moisturiser - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Balance Moisturiser. Lightweight formula for combination skin."
  },
  {
    id: "110", name: "Sensitive Recovery Cream", slug: "sensitive-recovery-cream",
    description: "Soothing cream specially formulated for reactive and sensitive skin. Contains calming ingredients to reduce redness and strengthen the skin barrier.",
    shortDescription: "Soothing cream for reactive skin", price: 59.50, compareAtPrice: 70.00, costPrice: 29.75, sku: "MDK110", stockQuantity: 25,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["sensitive", "soothing", "recovery", "barrier-repair"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.8, reviewCount: 267, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-sensitive-recovery.jpg"], featuredImage: "/products/medik8-sensitive-recovery.jpg",
    metaTitle: "Sensitive Recovery Cream - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Sensitive Recovery Cream. Soothing care for reactive skin."
  },
  {
    id: "111", name: "Prebiotic Cleanser", slug: "prebiotic-cleanser",
    description: "Innovative cleanser that supports the skin's microbiome with prebiotic ingredients. Gently cleanses while maintaining the skin's natural protective barrier.",
    shortDescription: "Microbiome-supporting gentle cleanser", price: 48.45, compareAtPrice: 57.00, costPrice: 24.23, sku: "MDK111", stockQuantity: 35,
    categoryId: "cleansers-toners", brandId: "medik8", tags: ["prebiotic", "microbiome", "gentle", "barrier-support"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "cleansers-toners", name: "Cleansers & Toners", slug: "cleansers-toners" },
    rating: 4.7, reviewCount: 198, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-prebiotic-cleanser.jpg"], featuredImage: "/products/medik8-prebiotic-cleanser.jpg",
    metaTitle: "Prebiotic Cleanser - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Prebiotic Cleanser. Microbiome-supporting gentle cleanser."
  },

  // ============ VITAMIN C SERUMS (12 products) ============
  {
    id: "112", name: "C-Tetra", slug: "c-tetra",
    description: "Revolutionary vitamin C serum featuring 14% stable vitamin C in an oil-based formula. Provides powerful antioxidant protection while brightening skin and reducing signs of aging. Perfect introduction to vitamin C skincare.",
    shortDescription: "14% stable vitamin C serum in oil base", price: 73.10, compareAtPrice: 86.00, costPrice: 36.55, sku: "MDK112", stockQuantity: 60,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "antioxidant", "brightening", "oil-based", "beginner-friendly"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 1234, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-c-tetra.jpg"], featuredImage: "/products/medik8-c-tetra.jpg",
    metaTitle: "C-Tetra Vitamin C Serum - Medik8 | Skin Societe", metaDescription: "Shop Medik8 C-Tetra. Revolutionary 14% vitamin C serum for brighter, protected skin."
  },
  {
    id: "113", name: "C-Tetra Cream", slug: "c-tetra-cream",
    description: "Antioxidant moisturizer combining 14% stable vitamin C with hydrating ingredients. Perfect for those who prefer a cream texture while getting vitamin C benefits.",
    shortDescription: "14% vitamin C in nourishing cream", price: 90.10, compareAtPrice: 106.00, costPrice: 45.05, sku: "MDK113", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "moisturizer", "antioxidant", "nourishing"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 456, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-c-tetra-cream.jpg"], featuredImage: "/products/medik8-c-tetra-cream.jpg",
    metaTitle: "C-Tetra Cream - Medik8 | Skin Societe", metaDescription: "Shop Medik8 C-Tetra Cream. 14% vitamin C in a nourishing cream formula."
  },
  {
    id: "114", name: "Daily Radiance Vitamin C", slug: "daily-radiance-vitamin-c",
    description: "Advanced 15% L-Ascorbic Acid serum for experienced vitamin C users. Delivers maximum brightening and antioxidant benefits for radiant, protected skin.",
    shortDescription: "Advanced 15% L-Ascorbic Acid serum", price: 100.30, compareAtPrice: 118.00, costPrice: 50.15, sku: "MDK114", stockQuantity: 40,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "l-ascorbic-acid", "advanced", "brightening"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 678, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-daily-radiance.jpg"], featuredImage: "/products/medik8-daily-radiance.jpg",
    metaTitle: "Daily Radiance Vitamin C - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Daily Radiance. Advanced 15% L-Ascorbic Acid serum."
  },
  {
    id: "115", name: "Super C Ferulic", slug: "super-c-ferulic",
    description: "Premium vitamin C serum with ferulic acid for enhanced stability and potency. This advanced formula provides superior antioxidant protection and anti-aging benefits.",
    shortDescription: "Premium vitamin C with ferulic acid", price: 121.55, compareAtPrice: 143.00, costPrice: 60.78, sku: "MDK115", stockQuantity: 20,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "ferulic-acid", "premium", "antioxidant"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 567, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-super-c-ferulic.jpg"], featuredImage: "/products/medik8-super-c-ferulic.jpg",
    metaTitle: "Super C Ferulic - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Super C Ferulic. Premium vitamin C serum with ferulic acid."
  },
  {
    id: "116", name: "C-Tetra Luxe", slug: "c-tetra-luxe",
    description: "Ultra-stable 14% vitamin C serum enhanced with vitamin E for superior antioxidant protection. The luxury formulation provides exceptional skin benefits and stability.",
    shortDescription: "Ultra-stable 14% vitamin C with vitamin E", price: 127.50, compareAtPrice: 150.00, costPrice: 63.75, sku: "MDK116", stockQuantity: 15,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "stable", "luxury", "vitamin-e"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 234, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-c-tetra-luxe.jpg"], featuredImage: "/products/medik8-c-tetra-luxe.jpg",
    metaTitle: "C-Tetra Luxe - Medik8 | Skin Societe", metaDescription: "Shop Medik8 C-Tetra Luxe. Ultra-stable luxury vitamin C serum."
  },
  {
    id: "117", name: "Vitamin C Fix", slug: "vitamin-c-fix",
    description: "12% vitamin C serum enhanced with smoothing peptides for comprehensive anti-aging benefits. Combines brightening and firming effects in one powerful formula.",
    shortDescription: "12% vitamin C with smoothing peptides", price: 85.00, compareAtPrice: 100.00, costPrice: 42.50, sku: "MDK117", stockQuantity: 35,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "peptides", "smoothing", "anti-aging"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 345, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-vitamin-c-fix.jpg"], featuredImage: "/products/medik8-vitamin-c-fix.jpg",
    metaTitle: "Vitamin C Fix - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Vitamin C Fix. 12% vitamin C with smoothing peptides."
  },
  {
    id: "118", name: "C-Tetra Intense", slug: "c-tetra-intense",
    description: "High-potency 20% vitamin C serum for maximum brightening and antioxidant benefits. Designed for experienced users seeking intensive vitamin C therapy.",
    shortDescription: "High-potency 20% vitamin C serum", price: 102.00, compareAtPrice: 120.00, costPrice: 51.00, sku: "MDK118", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "high-potency", "intense", "experienced"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 289, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-c-tetra-intense.jpg"], featuredImage: "/products/medik8-c-tetra-intense.jpg",
    metaTitle: "C-Tetra Intense - Medik8 | Skin Societe", metaDescription: "Shop Medik8 C-Tetra Intense. High-potency 20% vitamin C serum."
  },
  {
    id: "119", name: "Oxy-R Peptides", slug: "oxy-r-peptides",
    description: "Innovative oxygen-infused vitamin C serum with peptides for enhanced cellular renewal. This unique formula delivers active ingredients deeper into the skin.",
    shortDescription: "Oxygen-infused vitamin C with peptides", price: 93.50, compareAtPrice: 110.00, costPrice: 46.75, sku: "MDK119", stockQuantity: 30,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "oxygen", "peptides", "cellular-renewal"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.6, reviewCount: 156, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-oxy-r-peptides.jpg"], featuredImage: "/products/medik8-oxy-r-peptides.jpg",
    metaTitle: "Oxy-R Peptides - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Oxy-R Peptides. Oxygen-infused vitamin C with peptides."
  },
  {
    id: "120", name: "Vitamin C Fix Concentrate", slug: "vitamin-c-fix-concentrate",
    description: "Concentrated 25% vitamin C treatment for intensive brightening and anti-aging therapy. Use 2-3 times weekly for maximum results.",
    shortDescription: "Concentrated 25% vitamin C treatment", price: 76.50, compareAtPrice: 90.00, costPrice: 38.25, sku: "MDK120", stockQuantity: 20,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "concentrated", "treatment", "intensive"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 198, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-vitamin-c-concentrate.jpg"], featuredImage: "/products/medik8-vitamin-c-concentrate.jpg",
    metaTitle: "Vitamin C Fix Concentrate - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Vitamin C Fix Concentrate. 25% vitamin C treatment."
  },
  {
    id: "121", name: "C-Tetra Eye", slug: "c-tetra-eye",
    description: "Gentle 7% vitamin C eye serum specifically formulated for the delicate eye area. Brightens dark circles and provides antioxidant protection without irritation.",
    shortDescription: "Gentle 7% vitamin C eye serum", price: 41.65, compareAtPrice: 49.00, costPrice: 20.83, sku: "MDK121", stockQuantity: 40,
    categoryId: "eye-care", brandId: "medik8", tags: ["vitamin-c", "eye-care", "gentle", "dark-circles"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.5, reviewCount: 167, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-c-tetra-eye.jpg"], featuredImage: "/products/medik8-c-tetra-eye.jpg",
    metaTitle: "C-Tetra Eye - Medik8 | Skin Societe", metaDescription: "Shop Medik8 C-Tetra Eye. Gentle vitamin C serum for eyes."
  },
  {
    id: "122", name: "CE-Thione", slug: "ce-thione",
    description: "Advanced vitamin C, E and glutathione complex for ultimate antioxidant protection. This powerful combination provides comprehensive environmental defense and anti-aging benefits.",
    shortDescription: "Advanced vitamin C, E and glutathione complex", price: 110.50, compareAtPrice: 130.00, costPrice: 55.25, sku: "MDK122", stockQuantity: 18,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "vitamin-e", "glutathione", "antioxidant"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 245, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-ce-thione.jpg"], featuredImage: "/products/medik8-ce-thione.jpg",
    metaTitle: "CE-Thione - Medik8 | Skin Societe", metaDescription: "Shop Medik8 CE-Thione. Advanced antioxidant complex."
  },
  {
    id: "123", name: "Powder Vitamin C", slug: "powder-vitamin-c",
    description: "Pure L-Ascorbic Acid powder for mixing with serums or moisturizers. Allows for customizable vitamin C concentration and maximum freshness.",
    shortDescription: "Pure L-Ascorbic Acid powder for mixing", price: 68.00, compareAtPrice: 80.00, costPrice: 34.00, sku: "MDK123", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-c", "powder", "pure", "customizable"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.6, reviewCount: 134, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-powder-vitamin-c.jpg"], featuredImage: "/products/medik8-powder-vitamin-c.jpg",
    metaTitle: "Powder Vitamin C - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Powder Vitamin C. Pure L-Ascorbic Acid powder."
  },

  // ============ CRYSTAL RETINAL SERIES (6 products) ============
  {
    id: "124", name: "Crystal Retinal 1", slug: "crystal-retinal-1",
    description: "Gentle introduction to vitamin A with 0.01% retinaldehyde. This next-generation vitamin A is 11x faster acting than retinol, providing visible results with minimal irritation. Perfect for vitamin A beginners.",
    shortDescription: "Gentle 0.01% retinaldehyde for beginners", price: 75.65, compareAtPrice: 89.00, costPrice: 37.83, sku: "MDK124", stockQuantity: 40,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-a", "retinaldehyde", "anti-aging", "beginner", "gentle"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 892, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-crystal-retinal-1.jpg"], featuredImage: "/products/medik8-crystal-retinal-1.jpg",
    metaTitle: "Crystal Retinal 1 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Crystal Retinal 1. Gentle introduction to vitamin A with retinaldehyde."
  },
  {
    id: "125", name: "Crystal Retinal 3", slug: "crystal-retinal-3",
    description: "Intermediate strength vitamin A with 0.03% retinaldehyde. Perfect progression from Crystal Retinal 1, providing enhanced anti-aging benefits with continued gentle tolerance.",
    shortDescription: "Intermediate 0.03% retinaldehyde", price: 84.15, compareAtPrice: 99.00, costPrice: 42.08, sku: "MDK125", stockQuantity: 35,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-a", "retinaldehyde", "intermediate", "anti-aging"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 567, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-crystal-retinal-3.jpg"], featuredImage: "/products/medik8-crystal-retinal-3.jpg",
    metaTitle: "Crystal Retinal 3 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Crystal Retinal 3. Intermediate strength 0.03% retinaldehyde."
  },
  {
    id: "126", name: "Crystal Retinal 6", slug: "crystal-retinal-6",
    description: "High-strength 0.06% retinaldehyde for experienced vitamin A users. Delivers advanced anti-aging results with improved skin texture, tone and firmness.",
    shortDescription: "High-strength 0.06% retinaldehyde", price: 114.75, compareAtPrice: 135.00, costPrice: 57.38, sku: "MDK126", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-a", "retinaldehyde", "advanced", "high-strength"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 456, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-crystal-retinal-6.jpg"], featuredImage: "/products/medik8-crystal-retinal-6.jpg",
    metaTitle: "Crystal Retinal 6 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Crystal Retinal 6. High-strength 0.06% retinaldehyde."
  },
  {
    id: "127", name: "Crystal Retinal 10", slug: "crystal-retinal-10",
    description: "Maximum strength 0.1% retinaldehyde for expert vitamin A users. The highest concentration available, delivering professional-level anti-aging results.",
    shortDescription: "Maximum strength 0.1% retinaldehyde", price: 149.60, compareAtPrice: 176.00, costPrice: 74.80, sku: "MDK127", stockQuantity: 15,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-a", "retinaldehyde", "expert", "maximum-strength"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 234, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-crystal-retinal-10.jpg"], featuredImage: "/products/medik8-crystal-retinal-10.jpg",
    metaTitle: "Crystal Retinal 10 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Crystal Retinal 10. Maximum strength 0.1% retinaldehyde."
  },
  {
    id: "128", name: "Crystal Retinal Ceramide Eye", slug: "crystal-retinal-ceramide-eye",
    description: "Gentle retinaldehyde eye cream enhanced with ceramides for the delicate eye area. Reduces fine lines and improves skin texture without irritation.",
    shortDescription: "Gentle retinaldehyde eye cream with ceramides", price: 59.50, compareAtPrice: 70.00, costPrice: 29.75, sku: "MDK128", stockQuantity: 30,
    categoryId: "eye-care", brandId: "medik8", tags: ["vitamin-a", "eye-care", "ceramides", "gentle"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.7, reviewCount: 198, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-retinal-ceramide-eye.jpg"], featuredImage: "/products/medik8-retinal-ceramide-eye.jpg",
    metaTitle: "Crystal Retinal Ceramide Eye - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Crystal Retinal Ceramide Eye. Gentle retinaldehyde eye cream."
  },
  {
    id: "129", name: "Retinal Intense 0.5%", slug: "retinal-intense-05",
    description: "Professional-strength 0.5% retinaldehyde for the most experienced users. Delivers clinical-level results for advanced anti-aging concerns.",
    shortDescription: "Professional-strength 0.5% retinaldehyde", price: 178.50, compareAtPrice: 210.00, costPrice: 89.25, sku: "MDK129", stockQuantity: 10,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["vitamin-a", "professional", "intense", "clinical"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.9, reviewCount: 89, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-retinal-intense.jpg"], featuredImage: "/products/medik8-retinal-intense.jpg",
    metaTitle: "Retinal Intense 0.5% - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Retinal Intense. Professional-strength 0.5% retinaldehyde."
  },

  // ============ MOISTURIZERS (10 products) ============
  {
    id: "130", name: "Advanced Day Total Protect", slug: "advanced-day-total-protect",
    description: "Revolutionary daily moisturizer with SPF 30 and pollution protection. Features peptides, antioxidants and environmental defense technology for comprehensive skin protection and anti-aging benefits.",
    shortDescription: "Daily moisturizer with SPF 30 & pollution protection", price: 106.25, compareAtPrice: 125.00, costPrice: 53.13, sku: "MDK130", stockQuantity: 30,
    categoryId: "moisturizers", brandId: "medik8", tags: ["spf-30", "pollution-protection", "peptides", "antioxidants", "daily-moisturizer"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.8, reviewCount: 567, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-advanced-day-total.jpg"], featuredImage: "/products/medik8-advanced-day-total.jpg",
    metaTitle: "Advanced Day Total Protect - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Advanced Day Total Protect. Daily moisturizer with SPF 30 and pollution protection."
  },
  {
    id: "131", name: "Advanced Night Restore", slug: "advanced-night-restore",
    description: "Luxurious night moisturizer that works while you sleep to repair, restore and rejuvenate skin. Formulated with peptides, growth factors and stem cells for maximum overnight recovery.",
    shortDescription: "Luxurious night moisturizer with peptides", price: 117.30, compareAtPrice: 138.00, costPrice: 58.65, sku: "MDK131", stockQuantity: 25,
    categoryId: "moisturizers", brandId: "medik8", tags: ["night-cream", "peptides", "growth-factors", "repair", "anti-aging"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.9, reviewCount: 432, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-advanced-night.jpg"], featuredImage: "/products/medik8-advanced-night.jpg",
    metaTitle: "Advanced Night Restore - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Advanced Night Restore. Luxurious night moisturizer with peptides and growth factors."
  },
  {
    id: "132", name: "Hydr8 Day", slug: "hydr8-day",
    description: "Lightweight hydrating day moisturizer with hyaluronic acid and vitamin B5. Provides all-day hydration without heaviness, perfect for normal to oily skin types.",
    shortDescription: "Lightweight hydrating day moisturizer", price: 63.75, compareAtPrice: 75.00, costPrice: 31.88, sku: "MDK132", stockQuantity: 45,
    categoryId: "moisturizers", brandId: "medik8", tags: ["day-cream", "hydrating", "lightweight", "hyaluronic-acid"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.6, reviewCount: 345, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-hydr8-day.jpg"], featuredImage: "/products/medik8-hydr8-day.jpg",
    metaTitle: "Hydr8 Day - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Hydr8 Day. Lightweight hydrating day moisturizer."
  },
  {
    id: "133", name: "Night Ritual Vitamin A", slug: "night-ritual-vitamin-a",
    description: "Anti-aging night cream infused with vitamin A complex for overnight skin renewal. Combines moisturizing benefits with vitamin A therapy for comprehensive nighttime care.",
    shortDescription: "Anti-aging night cream with vitamin A", price: 144.50, compareAtPrice: 170.00, costPrice: 72.25, sku: "MDK133", stockQuantity: 20,
    categoryId: "moisturizers", brandId: "medik8", tags: ["night-cream", "vitamin-a", "anti-aging", "renewal"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.8, reviewCount: 234, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-night-ritual-vitamin-a.jpg"], featuredImage: "/products/medik8-night-ritual-vitamin-a.jpg",
    metaTitle: "Night Ritual Vitamin A - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Night Ritual Vitamin A. Anti-aging night cream with vitamin A."
  },
  {
    id: "134", name: "Calmwise Colour Correct", slug: "calmwise-colour-correct",
    description: "Color-correcting moisturizer specifically designed for sensitive and reactive skin. Neutralizes redness while providing gentle hydration and protection.",
    shortDescription: "Color-correcting moisturizer for sensitive skin", price: 80.75, compareAtPrice: 95.00, costPrice: 40.38, sku: "MDK134", stockQuantity: 25,
    categoryId: "moisturizers", brandId: "medik8", tags: ["color-correcting", "sensitive", "moisturizer", "redness"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.5, reviewCount: 167, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-calmwise-colour-correct.jpg"], featuredImage: "/products/medik8-calmwise-colour-correct.jpg",
    metaTitle: "Calmwise Colour Correct - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Calmwise Colour Correct. Color-correcting moisturizer for sensitive skin."
  },
  {
    id: "135", name: "Ultimate Recovery", slug: "ultimate-recovery",
    description: "Intensive repair cream for severely damaged or compromised skin. Formulated with advanced peptides and growth factors to restore skin health and barrier function.",
    shortDescription: "Intensive repair cream for damaged skin", price: 127.50, compareAtPrice: 150.00, costPrice: 63.75, sku: "MDK135", stockQuantity: 15,
    categoryId: "moisturizers", brandId: "medik8", tags: ["repair", "intensive", "recovery", "damaged-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.7, reviewCount: 123, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-ultimate-recovery.jpg"], featuredImage: "/products/medik8-ultimate-recovery.jpg",
    metaTitle: "Ultimate Recovery - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Ultimate Recovery. Intensive repair cream for damaged skin."
  },
  {
    id: "136", name: "Mutiny", slug: "mutiny",
    description: "Advanced peptide day moisturizer that targets signs of aging while providing comprehensive daily protection. Features cutting-edge peptide technology for firmer, smoother skin.",
    shortDescription: "Advanced peptide day moisturizer", price: 136.00, compareAtPrice: 160.00, costPrice: 68.00, sku: "MDK136", stockQuantity: 18,
    categoryId: "moisturizers", brandId: "medik8", tags: ["peptides", "advanced", "day-cream", "anti-aging"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.8, reviewCount: 198, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-mutiny.jpg"], featuredImage: "/products/medik8-mutiny.jpg",
    metaTitle: "Mutiny - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Mutiny. Advanced peptide day moisturizer."
  },
  {
    id: "137", name: "Clarity", slug: "clarity",
    description: "Oil-free moisturizer specifically formulated for blemish-prone and oily skin. Provides essential hydration while helping to control oil production and prevent breakouts.",
    shortDescription: "Oil-free moisturizer for blemish-prone skin", price: 59.50, compareAtPrice: 70.00, costPrice: 29.75, sku: "MDK137", stockQuantity: 40,
    categoryId: "moisturizers", brandId: "medik8", tags: ["oil-free", "blemish", "clarity", "oily-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.6, reviewCount: 289, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-clarity.jpg"], featuredImage: "/products/medik8-clarity.jpg",
    metaTitle: "Clarity - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Clarity. Oil-free moisturizer for blemish-prone skin."
  },
  {
    id: "138", name: "Rich Restore", slug: "rich-restore",
    description: "Nourishing cream specifically designed for dry and mature skin types. Provides deep hydration and anti-aging benefits with a rich, luxurious texture.",
    shortDescription: "Nourishing cream for dry/mature skin", price: 72.25, compareAtPrice: 85.00, costPrice: 36.13, sku: "MDK138", stockQuantity: 30,
    categoryId: "moisturizers", brandId: "medik8", tags: ["nourishing", "dry-skin", "mature", "rich-texture"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.7, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-rich-restore.jpg"], featuredImage: "/products/medik8-rich-restore.jpg",
    metaTitle: "Rich Restore - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Rich Restore. Nourishing cream for dry and mature skin."
  },
  {
    id: "139", name: "Intelligent Retinol", slug: "intelligent-retinol",
    description: "Smart-release retinol moisturizer that delivers vitamin A gradually for optimal results with minimal irritation. Perfect for those wanting retinol benefits in a moisturizer.",
    shortDescription: "Smart-release retinol moisturizer", price: 93.50, compareAtPrice: 110.00, costPrice: 46.75, sku: "MDK139", stockQuantity: 25,
    categoryId: "moisturizers", brandId: "medik8", tags: ["retinol", "smart-release", "moisturizer", "vitamin-a"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "moisturizers", name: "Moisturizers", slug: "moisturizers" },
    rating: 4.7, reviewCount: 156, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-intelligent-retinol.jpg"], featuredImage: "/products/medik8-intelligent-retinol.jpg",
    metaTitle: "Intelligent Retinol - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Intelligent Retinol. Smart-release retinol moisturizer."
  },

  // ============ SERUMS & TREATMENTS (15 products) ============
  {
    id: "140", name: "Hydr8 B5", slug: "hydr8-b5",
    description: "Intense hydration serum combining multiple molecular weights of hyaluronic acid with vitamin B5. Provides deep, long-lasting moisture for plump, healthy-looking skin.",
    shortDescription: "Intense hydration with hyaluronic acid & B5", price: 76.50, compareAtPrice: 90.00, costPrice: 38.25, sku: "MDK140", stockQuantity: 50,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["hyaluronic-acid", "vitamin-b5", "hydrating", "plumping"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 567, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-hydr8-b5.jpg"], featuredImage: "/products/medik8-hydr8-b5.jpg",
    metaTitle: "Hydr8 B5 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Hydr8 B5. Intense hydration serum with hyaluronic acid."
  },
  {
    id: "141", name: "Liquid Peptides", slug: "liquid-peptides",
    description: "Advanced peptide serum that targets multiple signs of aging including fine lines, wrinkles and loss of firmness. Features a powerful blend of firming peptides.",
    shortDescription: "Advanced peptide serum for firming", price: 93.50, compareAtPrice: 110.00, costPrice: 46.75, sku: "MDK141", stockQuantity: 35,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["peptides", "firming", "advanced", "anti-aging"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 234, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-liquid-peptides.jpg"], featuredImage: "/products/medik8-liquid-peptides.jpg",
    metaTitle: "Liquid Peptides - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Liquid Peptides. Advanced firming peptide serum."
  },
  {
    id: "142", name: "Clarity Peptides", slug: "clarity-peptides",
    description: "Blemish-fighting peptide serum that combines clarifying ingredients with skin-smoothing peptides. Perfect for acne-prone skin seeking anti-aging benefits.",
    shortDescription: "Blemish-fighting peptide serum", price: 85.85, compareAtPrice: 101.00, costPrice: 42.93, sku: "MDK142", stockQuantity: 30,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["peptides", "blemish", "clarity", "acne-prone"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.6, reviewCount: 189, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-clarity-peptides.jpg"], featuredImage: "/products/medik8-clarity-peptides.jpg",
    metaTitle: "Clarity Peptides - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Clarity Peptides. Blemish-fighting peptide serum."
  },
  {
    id: "143", name: "Bakuchiol Peptides", slug: "bakuchiol-peptides",
    description: "Plant-based retinol alternative featuring bakuchiol with firming peptides. Provides anti-aging benefits without irritation, perfect for sensitive skin or pregnancy.",
    shortDescription: "Plant-based retinol alternative", price: 93.50, compareAtPrice: 110.00, costPrice: 46.75, sku: "MDK143", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["bakuchiol", "natural", "peptides", "sensitive-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.5, reviewCount: 145, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-bakuchiol-peptides.jpg"], featuredImage: "/products/medik8-bakuchiol-peptides.jpg",
    metaTitle: "Bakuchiol Peptides - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Bakuchiol Peptides. Plant-based retinol alternative."
  },
  {
    id: "144", name: "Firewall", slug: "firewall",
    description: "Powerful antioxidant defense serum featuring resveratrol and other protective ingredients. Creates a barrier against environmental damage and free radicals.",
    shortDescription: "Antioxidant defense serum with resveratrol", price: 119.00, compareAtPrice: 140.00, costPrice: 59.50, sku: "MDK144", stockQuantity: 20,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["antioxidant", "resveratrol", "defense", "environmental"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 178, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-firewall.jpg"], featuredImage: "/products/medik8-firewall.jpg",
    metaTitle: "Firewall - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Firewall. Antioxidant defense serum with resveratrol."
  },
  {
    id: "145", name: "White Balance", slug: "white-balance",
    description: "Advanced brightening serum that targets hyperpigmentation and uneven skin tone. Contains powerful brightening ingredients for a more radiant, even complexion.",
    shortDescription: "Brightening serum for even skin tone", price: 102.00, compareAtPrice: 120.00, costPrice: 51.00, sku: "MDK145", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["brightening", "even-tone", "pigmentation", "radiance"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.6, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-white-balance.jpg"], featuredImage: "/products/medik8-white-balance.jpg",
    metaTitle: "White Balance - Medik8 | Skin Societe", metaDescription: "Shop Medik8 White Balance. Brightening serum for even skin tone."
  },
  {
    id: "146", name: "Pore Refining Serum", slug: "pore-refining-serum",
    description: "Concentrated niacinamide serum that minimizes the appearance of pores while regulating oil production. Perfect for oily and combination skin types.",
    shortDescription: "Niacinamide serum for minimized pores", price: 68.00, compareAtPrice: 80.00, costPrice: 34.00, sku: "MDK146", stockQuantity: 40,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["niacinamide", "pore-refining", "serum", "oil-control"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.5, reviewCount: 345, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-pore-refining-serum.jpg"], featuredImage: "/products/medik8-pore-refining-serum.jpg",
    metaTitle: "Pore Refining Serum - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Pore Refining Serum. Niacinamide serum for minimized pores."
  },
  {
    id: "147", name: "Growth Factor Serum", slug: "growth-factor-serum",
    description: "Advanced growth factor anti-aging serum that stimulates cellular renewal and collagen production. Delivers professional-level results for mature skin concerns.",
    shortDescription: "Advanced growth factor anti-aging serum", price: 153.00, compareAtPrice: 180.00, costPrice: 76.50, sku: "MDK147", stockQuantity: 15,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["growth-factors", "anti-aging", "advanced", "collagen"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.8, reviewCount: 98, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-growth-factor-serum.jpg"], featuredImage: "/products/medik8-growth-factor-serum.jpg",
    metaTitle: "Growth Factor Serum - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Growth Factor Serum. Advanced anti-aging growth factor serum."
  },
  {
    id: "148", name: "Calming Copper", slug: "calming-copper",
    description: "Soothing copper peptide serum specifically formulated for sensitive and reactive skin. Reduces inflammation while promoting healing and skin repair.",
    shortDescription: "Copper peptide serum for sensitive skin", price: 85.00, compareAtPrice: 100.00, costPrice: 42.50, sku: "MDK148", stockQuantity: 20,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["copper-peptides", "calming", "sensitive", "healing"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.6, reviewCount: 156, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-calming-copper.jpg"], featuredImage: "/products/medik8-calming-copper.jpg",
    metaTitle: "Calming Copper - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Calming Copper. Soothing copper peptide serum."
  },
  {
    id: "149", name: "Stem Cell Renewal", slug: "stem-cell-renewal",
    description: "Plant stem cell regenerating serum that promotes cellular renewal and skin repair. Contains powerful plant-derived stem cells for youthful, healthy skin.",
    shortDescription: "Plant stem cell regenerating serum", price: 127.50, compareAtPrice: 150.00, costPrice: 63.75, sku: "MDK149", stockQuantity: 18,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["stem-cells", "regenerating", "renewal", "plant-derived"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 123, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-stem-cell-renewal.jpg"], featuredImage: "/products/medik8-stem-cell-renewal.jpg",
    metaTitle: "Stem Cell Renewal - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Stem Cell Renewal. Plant stem cell regenerating serum."
  },
  {
    id: "150", name: "Alpha-H Complex", slug: "alpha-h-complex",
    description: "Multi-acid exfoliating serum combining different alpha hydroxy acids for comprehensive skin renewal. Improves texture, tone and radiance.",
    shortDescription: "Multi-acid exfoliating serum", price: 76.50, compareAtPrice: 90.00, costPrice: 38.25, sku: "MDK150", stockQuantity: 30,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["alpha-hydroxy", "exfoliating", "complex", "renewal"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.6, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-alpha-h-complex.jpg"], featuredImage: "/products/medik8-alpha-h-complex.jpg",
    metaTitle: "Alpha-H Complex - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Alpha-H Complex. Multi-acid exfoliating serum."
  },
  {
    id: "151", name: "Collagen Boost", slug: "collagen-boost",
    description: "Collagen-stimulating peptide serum that promotes natural collagen production for firmer, more youthful-looking skin. Features advanced peptide technology.",
    shortDescription: "Collagen-stimulating peptide serum", price: 110.50, compareAtPrice: 130.00, costPrice: 55.25, sku: "MDK151", stockQuantity: 22,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["collagen", "peptides", "boost", "firming"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 189, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-collagen-boost.jpg"], featuredImage: "/products/medik8-collagen-boost.jpg",
    metaTitle: "Collagen Boost - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Collagen Boost. Collagen-stimulating peptide serum."
  },
  {
    id: "152", name: "Barrier Defense", slug: "barrier-defense",
    description: "Skin barrier strengthening serum that repairs and protects the skin's natural protective barrier. Essential for compromised or sensitive skin.",
    shortDescription: "Skin barrier strengthening serum", price: 89.25, compareAtPrice: 105.00, costPrice: 44.63, sku: "MDK152", stockQuantity: 25,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["barrier-repair", "strengthening", "defense", "sensitive"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.6, reviewCount: 167, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-barrier-defense.jpg"], featuredImage: "/products/medik8-barrier-defense.jpg",
    metaTitle: "Barrier Defense - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Barrier Defense. Barrier strengthening serum."
  },
  {
    id: "153", name: "Elastin Support", slug: "elastin-support",
    description: "Elastin-boosting firming serum that improves skin elasticity and firmness. Helps restore youthful bounce and resilience to mature skin.",
    shortDescription: "Elastin-boosting firming serum", price: 102.00, compareAtPrice: 120.00, costPrice: 51.00, sku: "MDK153", stockQuantity: 20,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["elastin", "firming", "support", "bounce"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.5, reviewCount: 134, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-elastin-support.jpg"], featuredImage: "/products/medik8-elastin-support.jpg",
    metaTitle: "Elastin Support - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Elastin Support. Elastin-boosting firming serum."
  },
  {
    id: "154", name: "Hydra-Matrix", slug: "hydra-matrix",
    description: "Multi-molecular weight hyaluronic acid serum providing instant and long-lasting hydration. Different sizes of hyaluronic acid penetrate various skin layers.",
    shortDescription: "Multi-molecular weight hyaluronic acid", price: 93.50, compareAtPrice: 110.00, costPrice: 46.75, sku: "MDK154", stockQuantity: 35,
    categoryId: "serums-treatments", brandId: "medik8", tags: ["hyaluronic-acid", "multi-weight", "hydration", "plumping"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "serums-treatments", name: "Serums & Treatments", slug: "serums-treatments" },
    rating: 4.7, reviewCount: 298, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-hydra-matrix.jpg"], featuredImage: "/products/medik8-hydra-matrix.jpg",
    metaTitle: "Hydra-Matrix - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Hydra-Matrix. Multi-molecular weight hyaluronic acid serum."
  },

  // ============ EYE CARE (8 products) ============
  {
    id: "155", name: "Advanced Day Eye Protect", slug: "advanced-day-eye-protect",
    description: "Comprehensive eye cream with SPF 15 and peptides for daytime protection. Shields the delicate eye area from UV damage while providing anti-aging benefits.",
    shortDescription: "Eye cream with SPF 15 & peptides", price: 77.35, compareAtPrice: 91.00, costPrice: 38.68, sku: "MDK155", stockQuantity: 30,
    categoryId: "eye-care", brandId: "medik8", tags: ["spf-15", "peptides", "eye-protection", "daytime"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.6, reviewCount: 234, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-advanced-day-eye.jpg"], featuredImage: "/products/medik8-advanced-day-eye.jpg",
    metaTitle: "Advanced Day Eye Protect - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Advanced Day Eye Protect. SPF 15 eye cream with peptides."
  },
  {
    id: "156", name: "Advanced Night Eye", slug: "advanced-night-eye",
    description: "Intensive anti-aging night eye cream that works while you sleep to reduce fine lines, wrinkles and signs of fatigue around the delicate eye area.",
    shortDescription: "Anti-aging night eye cream", price: 85.00, compareAtPrice: 100.00, costPrice: 42.50, sku: "MDK156", stockQuantity: 25,
    categoryId: "eye-care", brandId: "medik8", tags: ["night-cream", "anti-aging", "eye-care", "intensive"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.7, reviewCount: 189, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-advanced-night-eye.jpg"], featuredImage: "/products/medik8-advanced-night-eye.jpg",
    metaTitle: "Advanced Night Eye - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Advanced Night Eye. Anti-aging night eye cream."
  },
  {
    id: "157", name: "Hydr8 Eye", slug: "hydr8-eye",
    description: "Lightweight hydrating eye gel infused with hyaluronic acid and vitamin B5. Provides instant moisture and plumpness to the delicate eye area.",
    shortDescription: "Hydrating eye gel with B5", price: 59.50, compareAtPrice: 70.00, costPrice: 29.75, sku: "MDK157", stockQuantity: 40,
    categoryId: "eye-care", brandId: "medik8", tags: ["hydrating", "eye-gel", "vitamin-b5", "lightweight"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.5, reviewCount: 298, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-hydr8-eye.jpg"], featuredImage: "/products/medik8-hydr8-eye.jpg",
    metaTitle: "Hydr8 Eye - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Hydr8 Eye. Hydrating eye gel with vitamin B5."
  },
  {
    id: "158", name: "Peptides Eye Gel", slug: "peptides-eye-gel",
    description: "Firming peptide eye gel that targets fine lines and improves skin elasticity around the eyes. Lightweight formula perfect for all skin types.",
    shortDescription: "Firming peptide eye gel", price: 68.00, compareAtPrice: 80.00, costPrice: 34.00, sku: "MDK158", stockQuantity: 35,
    categoryId: "eye-care", brandId: "medik8", tags: ["peptides", "firming", "eye-gel", "fine-lines"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.6, reviewCount: 167, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-peptides-eye-gel.jpg"], featuredImage: "/products/medik8-peptides-eye-gel.jpg",
    metaTitle: "Peptides Eye Gel - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Peptides Eye Gel. Firming peptide treatment for eyes."
  },
  {
    id: "159", name: "Vitamin K Eye Cream", slug: "vitamin-k-eye-cream",
    description: "Specialized eye cream with vitamin K that helps reduce the appearance of dark circles and under-eye discoloration. Gentle yet effective formula.",
    shortDescription: "Dark circle reducing eye cream", price: 72.25, compareAtPrice: 85.00, costPrice: 36.13, sku: "MDK159", stockQuantity: 25,
    categoryId: "eye-care", brandId: "medik8", tags: ["vitamin-k", "dark-circles", "eye-cream", "discoloration"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.4, reviewCount: 145, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-vitamin-k-eye.jpg"], featuredImage: "/products/medik8-vitamin-k-eye.jpg",
    metaTitle: "Vitamin K Eye Cream - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Vitamin K Eye Cream. Reduces dark circles and discoloration."
  },
  {
    id: "160", name: "Caffeine Eye Patches", slug: "caffeine-eye-patches",
    description: "Energizing caffeine-infused eye patches that instantly reduce puffiness and brighten tired-looking eyes. Perfect for a quick pick-me-up treatment.",
    shortDescription: "Energizing caffeine eye patches", price: 51.00, compareAtPrice: 60.00, costPrice: 25.50, sku: "MDK160", stockQuantity: 50,
    categoryId: "eye-care", brandId: "medik8", tags: ["caffeine", "eye-patches", "energizing", "puffiness"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.3, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-caffeine-eye-patches.jpg"], featuredImage: "/products/medik8-caffeine-eye-patches.jpg",
    metaTitle: "Caffeine Eye Patches - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Caffeine Eye Patches. Energizing treatment for tired eyes."
  },
  {
    id: "161", name: "Retinal Eye Complex", slug: "retinal-eye-complex",
    description: "Gentle retinal eye treatment that provides vitamin A benefits specifically formulated for the delicate eye area. Reduces fine lines without irritation.",
    shortDescription: "Gentle retinal eye treatment", price: 93.50, compareAtPrice: 110.00, costPrice: 46.75, sku: "MDK161", stockQuantity: 20,
    categoryId: "eye-care", brandId: "medik8", tags: ["retinal", "eye-treatment", "gentle", "vitamin-a"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.7, reviewCount: 123, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-retinal-eye-complex.jpg"], featuredImage: "/products/medik8-retinal-eye-complex.jpg",
    metaTitle: "Retinal Eye Complex - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Retinal Eye Complex. Gentle vitamin A treatment for eyes."
  },
  {
    id: "162", name: "Brightening Eye Serum", slug: "brightening-eye-serum",
    description: "Vitamin C brightening eye serum that illuminates and energizes the eye area. Reduces dullness and provides antioxidant protection for brighter, more youthful eyes.",
    shortDescription: "Vitamin C brightening eye serum", price: 80.75, compareAtPrice: 95.00, costPrice: 40.38, sku: "MDK162", stockQuantity: 28,
    categoryId: "eye-care", brandId: "medik8", tags: ["vitamin-c", "brightening", "eye-serum", "antioxidant"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "eye-care", name: "Eye Care", slug: "eye-care" },
    rating: 4.5, reviewCount: 178, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-brightening-eye-serum.jpg"], featuredImage: "/products/medik8-brightening-eye-serum.jpg",
    metaTitle: "Brightening Eye Serum - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Brightening Eye Serum. Vitamin C treatment for brighter eyes."
  },

  // ============ SUN PROTECTION (5 products) ============
  {
    id: "163", name: "Physical Sunscreen SPF 50", slug: "physical-sunscreen-spf-50",
    description: "Broad-spectrum mineral sunscreen with SPF 50 providing superior protection against UVA and UVB rays. Gentle formula suitable for sensitive skin.",
    shortDescription: "Broad-spectrum mineral SPF 50", price: 63.75, compareAtPrice: 75.00, costPrice: 31.88, sku: "MDK163", stockQuantity: 40,
    categoryId: "sun-protection", brandId: "medik8", tags: ["spf-50", "mineral", "broad-spectrum", "sensitive-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "sun-protection", name: "Sun Protection", slug: "sun-protection" },
    rating: 4.6, reviewCount: 345, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-physical-sunscreen-50.jpg"], featuredImage: "/products/medik8-physical-sunscreen-50.jpg",
    metaTitle: "Physical Sunscreen SPF 50 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Physical Sunscreen SPF 50. Mineral broad-spectrum protection."
  },
  {
    id: "164", name: "Invisible Sunscreen SPF 30", slug: "invisible-sunscreen-spf-30",
    description: "Lightweight invisible chemical sunscreen that provides excellent protection without leaving any white residue. Perfect for daily use under makeup.",
    shortDescription: "Lightweight invisible chemical SPF", price: 55.25, compareAtPrice: 65.00, costPrice: 27.63, sku: "MDK164", stockQuantity: 50,
    categoryId: "sun-protection", brandId: "medik8", tags: ["spf-30", "invisible", "lightweight", "makeup-friendly"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "sun-protection", name: "Sun Protection", slug: "sun-protection" },
    rating: 4.5, reviewCount: 456, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-invisible-sunscreen-30.jpg"], featuredImage: "/products/medik8-invisible-sunscreen-30.jpg",
    metaTitle: "Invisible Sunscreen SPF 30 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Invisible Sunscreen SPF 30. Lightweight daily protection."
  },
  {
    id: "165", name: "Tinted Sunscreen SPF 25", slug: "tinted-sunscreen-spf-25",
    description: "Color-adapting tinted sunscreen that provides protection while evening out skin tone. Adapts to multiple skin tones for a natural, healthy glow.",
    shortDescription: "Color-adapting tinted sunscreen", price: 59.50, compareAtPrice: 70.00, costPrice: 29.75, sku: "MDK165", stockQuantity: 35,
    categoryId: "sun-protection", brandId: "medik8", tags: ["spf-25", "tinted", "color-adapting", "even-tone"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "sun-protection", name: "Sun Protection", slug: "sun-protection" },
    rating: 4.4, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-tinted-sunscreen-25.jpg"], featuredImage: "/products/medik8-tinted-sunscreen-25.jpg",
    metaTitle: "Tinted Sunscreen SPF 25 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Tinted Sunscreen SPF 25. Color-adapting protection."
  },
  {
    id: "166", name: "Kids Sunscreen SPF 50", slug: "kids-sunscreen-spf-50",
    description: "Gentle mineral sunscreen specifically formulated for children's delicate skin. Provides maximum protection with ingredients safe for the whole family.",
    shortDescription: "Gentle mineral sunscreen for children", price: 46.75, compareAtPrice: 55.00, costPrice: 23.38, sku: "MDK166", stockQuantity: 30,
    categoryId: "sun-protection", brandId: "medik8", tags: ["spf-50", "kids", "mineral", "family-safe"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "sun-protection", name: "Sun Protection", slug: "sun-protection" },
    rating: 4.7, reviewCount: 189, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-kids-sunscreen-50.jpg"], featuredImage: "/products/medik8-kids-sunscreen-50.jpg",
    metaTitle: "Kids Sunscreen SPF 50 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Kids Sunscreen SPF 50. Gentle protection for children."
  },
  {
    id: "167", name: "Sport Sunscreen SPF 50", slug: "sport-sunscreen-spf-50",
    description: "Water-resistant sport sunscreen designed for active lifestyles. Provides long-lasting protection during exercise and outdoor activities.",
    shortDescription: "Water-resistant sport sunscreen", price: 68.00, compareAtPrice: 80.00, costPrice: 34.00, sku: "MDK167", stockQuantity: 25,
    categoryId: "sun-protection", brandId: "medik8", tags: ["spf-50", "sport", "water-resistant", "active"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "sun-protection", name: "Sun Protection", slug: "sun-protection" },
    rating: 4.6, reviewCount: 167, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-sport-sunscreen-50.jpg"], featuredImage: "/products/medik8-sport-sunscreen-50.jpg",
    metaTitle: "Sport Sunscreen SPF 50 - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Sport Sunscreen SPF 50. Water-resistant active protection."
  },

  // ============ EXFOLIANTS & ACIDS (10 products) ============
  {
    id: "168", name: "Press & Glow", slug: "press-glow",
    description: "Daily 1% lactic acid tonic that gently exfoliates and brightens skin. Perfect introduction to chemical exfoliation with gentle yet effective results.",
    shortDescription: "Daily 1% lactic acid tonic", price: 55.25, compareAtPrice: 65.00, costPrice: 27.63, sku: "MDK168", stockQuantity: 45,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["lactic-acid", "daily", "exfoliant", "gentle"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.7, reviewCount: 567, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-press-glow.jpg"], featuredImage: "/products/medik8-press-glow.jpg",
    metaTitle: "Press & Glow - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Press & Glow. Daily 1% lactic acid tonic for gentle exfoliation."
  },
  {
    id: "169", name: "Sleep Glycolic", slug: "sleep-glycolic",
    description: "Overnight 14% glycolic acid treatment that resurfaces skin while you sleep. Delivers professional-strength exfoliation for smoother, brighter skin.",
    shortDescription: "Overnight 14% glycolic acid treatment", price: 66.30, compareAtPrice: 78.00, costPrice: 33.15, sku: "MDK169", stockQuantity: 30,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["glycolic-acid", "overnight", "treatment", "professional"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.8, reviewCount: 345, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-sleep-glycolic.jpg"], featuredImage: "/products/medik8-sleep-glycolic.jpg",
    metaTitle: "Sleep Glycolic - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Sleep Glycolic. Overnight 14% glycolic acid treatment."
  },
  {
    id: "170", name: "Mandelic Acid Serum", slug: "mandelic-acid-serum",
    description: "Gentle 10% mandelic acid serum suitable for sensitive skin. This large-molecule acid provides effective exfoliation with minimal irritation.",
    shortDescription: "Gentle 10% mandelic acid serum", price: 59.50, compareAtPrice: 70.00, costPrice: 29.75, sku: "MDK170", stockQuantity: 35,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["mandelic-acid", "gentle", "serum", "sensitive-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.5, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-mandelic-acid-serum.jpg"], featuredImage: "/products/medik8-mandelic-acid-serum.jpg",
    metaTitle: "Mandelic Acid Serum - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Mandelic Acid Serum. Gentle 10% exfoliation for sensitive skin."
  },
  {
    id: "171", name: "Salicylic Cleanser", slug: "salicylic-cleanser",
    description: "2% salicylic acid daily cleanser that unclogs pores and prevents breakouts. Perfect for oily and acne-prone skin types seeking clarifying benefits.",
    shortDescription: "2% salicylic acid daily cleanser", price: 48.45, compareAtPrice: 57.00, costPrice: 24.23, sku: "MDK171", stockQuantity: 40,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["salicylic-acid", "cleanser", "daily", "acne-prone"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.6, reviewCount: 298, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-salicylic-cleanser.jpg"], featuredImage: "/products/medik8-salicylic-cleanser.jpg",
    metaTitle: "Salicylic Cleanser - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Salicylic Cleanser. 2% BHA daily cleanser for oily skin."
  },
  {
    id: "172", name: "Enzyme Powder", slug: "enzyme-powder",
    description: "Gentle enzyme exfoliating powder that can be mixed with water for customizable exfoliation. Perfect for sensitive skin needing gentle renewal.",
    shortDescription: "Gentle enzyme exfoliating powder", price: 63.75, compareAtPrice: 75.00, costPrice: 31.88, sku: "MDK172", stockQuantity: 25,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["enzyme", "powder", "exfoliating", "customizable"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.4, reviewCount: 156, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-enzyme-powder.jpg"], featuredImage: "/products/medik8-enzyme-powder.jpg",
    metaTitle: "Enzyme Powder - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Enzyme Powder. Gentle customizable exfoliation."
  },
  {
    id: "173", name: "AHA/BHA Complex", slug: "aha-bha-complex",
    description: "Multi-acid exfoliating serum combining alpha and beta hydroxy acids for comprehensive skin renewal. Addresses multiple skin concerns simultaneously.",
    shortDescription: "Multi-acid exfoliating serum", price: 72.25, compareAtPrice: 85.00, costPrice: 36.13, sku: "MDK173", stockQuantity: 28,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["aha", "bha", "multi-acid", "comprehensive"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.7, reviewCount: 189, inStock: true, featured: true, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-aha-bha-complex.jpg"], featuredImage: "/products/medik8-aha-bha-complex.jpg",
    metaTitle: "AHA/BHA Complex - Medik8 | Skin Societe", metaDescription: "Shop Medik8 AHA/BHA Complex. Multi-acid exfoliating serum."
  },
  {
    id: "174", name: "Retexturing Peel", slug: "retexturing-peel",
    description: "Professional-strength retexturing peel for advanced users. Delivers intensive exfoliation for dramatically improved skin texture and tone.",
    shortDescription: "Professional retexturing peel", price: 85.00, compareAtPrice: 100.00, costPrice: 42.50, sku: "MDK174", stockQuantity: 15,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["retexturing", "peel", "professional", "intensive"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.8, reviewCount: 123, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-retexturing-peel.jpg"], featuredImage: "/products/medik8-retexturing-peel.jpg",
    metaTitle: "Retexturing Peel - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Retexturing Peel. Professional-strength exfoliation treatment."
  },
  {
    id: "175", name: "Micro Exfoliant", slug: "micro-exfoliant",
    description: "Physical micro-bead exfoliant that gently buffs away dead skin cells. Provides immediate smoothing results for softer, more radiant skin.",
    shortDescription: "Physical micro-bead exfoliant", price: 51.00, compareAtPrice: 60.00, costPrice: 25.50, sku: "MDK175", stockQuantity: 35,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["physical", "micro-exfoliant", "beads", "immediate"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.3, reviewCount: 167, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-micro-exfoliant.jpg"], featuredImage: "/products/medik8-micro-exfoliant.jpg",
    metaTitle: "Micro Exfoliant - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Micro Exfoliant. Physical micro-bead exfoliation."
  },
  {
    id: "176", name: "Gentle Acid Toner", slug: "gentle-acid-toner",
    description: "Mild exfoliating toner specifically formulated for sensitive skin. Provides gentle renewal without irritation, perfect for acid-sensitive individuals.",
    shortDescription: "Mild exfoliating toner for sensitive skin", price: 42.50, compareAtPrice: 50.00, costPrice: 21.25, sku: "MDK176", stockQuantity: 40,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["gentle", "acid", "toner", "sensitive-skin"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.4, reviewCount: 234, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-gentle-acid-toner.jpg"], featuredImage: "/products/medik8-gentle-acid-toner.jpg",
    metaTitle: "Gentle Acid Toner - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Gentle Acid Toner. Mild exfoliation for sensitive skin."
  },
  {
    id: "177", name: "Weekly Resurfacing", slug: "weekly-resurfacing",
    description: "Intensive weekly resurfacing treatment that dramatically improves skin texture and radiance. Use once weekly for professional-level results at home.",
    shortDescription: "Intensive weekly resurfacing treatment", price: 76.50, compareAtPrice: 90.00, costPrice: 38.25, sku: "MDK177", stockQuantity: 20,
    categoryId: "exfoliants-acids", brandId: "medik8", tags: ["weekly", "resurfacing", "intensive", "professional-level"],
    brand: { id: "medik8", name: "Medik8", slug: "medik8" }, category: { id: "exfoliants-acids", name: "Exfoliants & Acids", slug: "exfoliants-acids" },
    rating: 4.6, reviewCount: 145, inStock: true, featured: false, status: "ACTIVE", trackInventory: true,
    images: ["/products/medik8-weekly-resurfacing.jpg"], featuredImage: "/products/medik8-weekly-resurfacing.jpg",
    metaTitle: "Weekly Resurfacing - Medik8 | Skin Societe", metaDescription: "Shop Medik8 Weekly Resurfacing. Intensive weekly treatment for dramatic results."
  }
];

// Extract featured products for homepage
export const featuredMedik8Products = allMedik8Products.filter(product => product.featured);

// Products by category for filtering
export const medik8ByCategory = {
  'cleansers-toners': allMedik8Products.filter(p => p.categoryId === 'cleansers-toners'),
  'serums-treatments': allMedik8Products.filter(p => p.categoryId === 'serums-treatments'),
  'moisturizers': allMedik8Products.filter(p => p.categoryId === 'moisturizers'),
  'eye-care': allMedik8Products.filter(p => p.categoryId === 'eye-care'),
  'sun-protection': allMedik8Products.filter(p => p.categoryId === 'sun-protection'),
  'exfoliants-acids': allMedik8Products.filter(p => p.categoryId === 'exfoliants-acids'),
};

// Category mapping for display names
export const categoryDisplayNames = {
  'cleansers-toners': 'Cleansers & Toners',
  'serums-treatments': 'Serums & Treatments',
  'moisturizers': 'Moisturizers',
  'eye-care': 'Eye Care',
  'sun-protection': 'Sun Protection',
  'exfoliants-acids': 'Exfoliants & Acids'
};

// Get products by price range
export const getProductsByPriceRange = (min: number, max: number) => {
  return allMedik8Products.filter(product => product.price >= min && product.price <= max);
};

// Get top-rated products
export const getTopRatedProducts = (minRating: number = 4.7) => {
  return allMedik8Products.filter(product => product.rating >= minRating);
};

// Search products by name or description
export const searchProducts = (query: string) => {
  const searchTerm = query.toLowerCase();
  return allMedik8Products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.shortDescription.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};