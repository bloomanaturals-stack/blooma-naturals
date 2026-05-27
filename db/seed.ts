// @ts-nocheck
import { sql } from "drizzle-orm";
import { closeDb, getDb } from "../api/queries/connection";
import {
  categories,
  concerns,
  products,
  productSizes,
  reviews,
  coupons,
  banners,
  settings,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existingProducts = await db.select({ count: sql<number>`count(*)` }).from(products);
  if ((existingProducts[0]?.count ?? 0) > 0) {
    console.log("Products already exist; skipping seed.");
    return;
  }

  // ─── Categories ──────────────────────────────────────────
  await db.insert(categories).values([
    { name: "Skincare", slug: "skincare", description: "Natural skincare products crafted with Ayurvedic ingredients", image: "/images/collection-skincare.jpg", sortOrder: 1 },
    { name: "Haircare", slug: "haircare", description: "Herbal haircare solutions for strong, healthy hair", image: "/images/collection-haircare.jpg", sortOrder: 2 },
    { name: "Gift Boxes", slug: "gift-boxes", description: "Curated gift sets for your loved ones", image: "/images/collection-gift.jpg", sortOrder: 3 },
    { name: "Value Bundles", slug: "value-bundles", description: "Save more with our combo packs", image: "/images/collection-skincare.jpg", sortOrder: 4 },
  ]);
  console.log("✓ Categories seeded");

  // ─── Concerns ────────────────────────────────────────────
  await db.insert(concerns).values([
    { name: "Acne & Pimples", slug: "acne-pimples", icon: "Zap", description: "Products to fight acne and prevent breakouts" },
    { name: "Anti-Aging", slug: "anti-aging", icon: "Clock", description: "Reduce fine lines and wrinkles naturally" },
    { name: "Hair Fall", slug: "hair-fall", icon: "Scissors", description: "Strengthen roots and reduce hair fall" },
    { name: "Dry Skin", slug: "dry-skin", icon: "Droplets", description: "Deep hydration for dry and flaky skin" },
    { name: "Dandruff", slug: "dandruff", icon: "Snowflake", description: "Combat dandruff with herbal solutions" },
    { name: "Glowing Skin", slug: "glowing-skin", icon: "Sun", description: "Achieve radiant, glowing complexion" },
  ]);
  console.log("✓ Concerns seeded");

  // ─── Products ────────────────────────────────────────────
  const productData = [
    {
      name: "Kumkumadi Tailam Face Serum",
      slug: "kumkumadi-tailam-face-serum",
      description: "An ancient Ayurvedic formulation with pure Kashmiri saffron and 24 precious herbs. This luxurious face serum brightens complexion, reduces dark spots, pigmentation, and imparts a natural golden glow. Kumkumadi Tailam is mentioned in the ancient Ayurvedic text Ashtanga Hridaya as a remedy for dull, uneven skin tone.\n\nKey Benefits:\n• Brightens and illuminates skin\n• Reduces dark spots and pigmentation\n• Improves skin texture and elasticity\n• Fights signs of aging\n• Deeply nourishes and hydrates",
      shortDescription: "Ancient Ayurvedic face serum with saffron & 24 herbs for bright, glowing skin.",
      price: "649.00",
      originalPrice: "899.00",
      categoryId: 1,
      concernId: 6,
      skinType: "all",
      ingredients: ["Saffron (Kesar)", "Sandalwood", "Turmeric", "Manjistha", "Lodhra", "Padmaka"],
      howToUse: "1. Cleanse your face thoroughly.\n2. Take 3-4 drops of Kumkumadi Tailam.\n3. Gently massage in upward circular motions.\n4. Leave overnight for best results.\n5. Use daily before bedtime.",
      stock: 150,
      rating: "4.8",
      reviewCount: 2847,
      badge: "bestseller",
      isActive: true,
      image: "/images/hero-product.jpg",
    },
    {
      name: "Bhringraj Hair Oil",
      slug: "bhringraj-hair-oil",
      description: "Strengthens roots, prevents hair fall, and promotes lush hair growth. Enriched with the trinity of Ayurvedic hair care — Bhringraj, Amla, and Brahmi. This potent herbal oil penetrates deep into the scalp, nourishing hair follicles from within.\n\nKey Benefits:\n• Reduces hair fall by up to 80%\n• Promotes new hair growth\n• Prevents premature greying\n• Deep conditions and adds shine\n• Strengthens hair from root to tip",
      shortDescription: "Strengthens roots, prevents hair fall with Bhringraj, Amla & Brahmi.",
      price: "449.00",
      originalPrice: "599.00",
      categoryId: 2,
      concernId: 3,
      skinType: "all",
      hairType: "all",
      ingredients: ["Bhringraj", "Amla", "Brahmi", "Neem", "Hibiscus", "Coconut Oil"],
      howToUse: "1. Warm the oil slightly.\n2. Part your hair into sections.\n3. Apply directly to scalp using fingertips.\n4. Massage gently for 10-15 minutes.\n5. Leave for at least 2 hours or overnight.\n6. Wash with a mild herbal shampoo.",
      stock: 200,
      rating: "4.7",
      reviewCount: 1923,
      badge: "bestseller",
      isActive: true,
      image: "/images/product-bhringraj.jpg",
    },
    {
      name: "Kashmiri Saffron Soap",
      slug: "kashmiri-saffron-soap",
      description: "Handcrafted cold-processed soap infused with pure Kashmiri saffron strands. This luxurious bathing bar gently cleanses while imparting a natural radiance to your skin. Free from SLS, SLES, and artificial fragrances.\n\nKey Benefits:\n• Natural skin brightening\n• Deep cleansing without drying\n• Rich, creamy lather\n• Suitable for daily use\n• Handcrafted in small batches",
      shortDescription: "Handcrafted soap with pure Kashmiri saffron for radiant skin.",
      price: "249.00",
      originalPrice: "349.00",
      categoryId: 1,
      concernId: 6,
      skinType: "all",
      ingredients: ["Saffron", "Coconut Oil", "Olive Oil", "Shea Butter", "Vitamin E"],
      howToUse: "1. Wet your face and body.\n2. Lather the soap between palms.\n3. Apply gently in circular motions.\n4. Rinse thoroughly with normal water.",
      stock: 300,
      rating: "4.6",
      reviewCount: 1456,
      badge: "none",
      isActive: true,
      image: "/images/product-saffron-soap.jpg",
    },
    {
      name: "Damask Rose Water Toner",
      slug: "damask-rose-water-toner",
      description: "Pure steam-distilled rose water from Damask roses. This gentle, alcohol-free toner balances skin pH, tightens pores, and preps skin for better absorption of serums and moisturizers.\n\nKey Benefits:\n• Hydrates and refreshes skin\n• Balances skin pH level\n• Tightens open pores\n• Soothes irritated skin\n• Sets makeup naturally",
      shortDescription: "Pure steam-distilled rose water toner for hydrated, refreshed skin.",
      price: "349.00",
      originalPrice: "449.00",
      categoryId: 1,
      concernId: 4,
      skinType: "all",
      ingredients: ["Damask Rose Petals", "Distilled Water"],
      howToUse: "1. Cleanse your face.\n2. Spray directly or apply with cotton pad.\n3. Pat gently until absorbed.\n4. Follow with serum or moisturizer.",
      stock: 250,
      rating: "4.7",
      reviewCount: 2134,
      badge: "bestseller",
      isActive: true,
      image: "/images/product-rose-water.jpg",
    },
    {
      name: "Aloe Vera Hydrating Gel",
      slug: "aloe-vera-hydrating-gel",
      description: "99% pure aloe vera gel extracted from organically grown aloe plants. This lightweight, non-sticky gel provides intense hydration while soothing irritated, sunburned, or acne-prone skin.\n\nKey Benefits:\n• Instant cooling and hydration\n• Soothes sunburn and irritation\n• Reduces acne and inflammation\n• Lightweight, non-greasy formula\n• Can be used as a primer",
      shortDescription: "99% pure aloe vera gel for instant hydration and soothing.",
      price: "299.00",
      originalPrice: "399.00",
      categoryId: 1,
      concernId: 1,
      skinType: "all",
      ingredients: ["Aloe Vera Extract", "Cucumber Extract", "Green Tea", "Vitamin E"],
      howToUse: "1. Cleanse your face.\n2. Apply a thin layer of gel.\n3. Massage gently until absorbed.\n4. Use morning and night.",
      stock: 180,
      rating: "4.5",
      reviewCount: 987,
      badge: "new",
      isActive: true,
      image: "/images/product-aloe-gel.jpg",
    },
    {
      name: "Neem Face Pack Powder",
      slug: "neem-face-pack-powder",
      description: "A traditional Ayurvedic face pack made from pure neem leaves, turmeric, and multani mitti. This powerful powder fights acne, controls excess oil, and detoxifies skin deeply.\n\nKey Benefits:\n• Fights acne and prevents breakouts\n• Controls excess oil production\n• Deep cleanses and detoxifies\n• Reduces acne scars\n• Tightens and firms skin",
      shortDescription: "Pure neem face pack powder for acne-free, clear skin.",
      price: "199.00",
      originalPrice: "279.00",
      categoryId: 1,
      concernId: 1,
      skinType: "oily",
      ingredients: ["Neem Leaves", "Turmeric", "Multani Mitti", "Tulsi", "Sandalwood"],
      howToUse: "1. Mix 2 tbsp powder with rose water.\n2. Apply evenly on cleansed face and neck.\n3. Let dry for 15-20 minutes.\n4. Rinse with normal water.\n5. Use twice a week.",
      stock: 220,
      rating: "4.4",
      reviewCount: 756,
      badge: "none",
      isActive: true,
      image: "/images/product-neem-pack.jpg",
    },
    {
      name: "Turmeric Brightening Cream",
      slug: "turmeric-brightening-cream",
      description: "A rich, nourishing night cream infused with wild turmeric (Kasturi Manjal) and saffron. Works overnight to repair, brighten, and rejuvenate tired, dull skin.\n\nKey Benefits:\n• Brightens and evens skin tone\n• Reduces dark spots and blemishes\n• Deep overnight nourishment\n• Anti-aging properties\n• Wake up to glowing skin",
      shortDescription: "Overnight brightening cream with wild turmeric and saffron.",
      price: "549.00",
      originalPrice: "749.00",
      categoryId: 1,
      concernId: 6,
      skinType: "all",
      ingredients: ["Wild Turmeric", "Saffron", "Almond Oil", "Shea Butter", "Licorice"],
      howToUse: "1. Cleanse and tone your face.\n2. Take a small amount of cream.\n3. Dot on forehead, cheeks, nose, and chin.\n4. Massage gently in upward strokes.\n5. Use every night before bed.",
      stock: 130,
      rating: "4.6",
      reviewCount: 1123,
      badge: "sale",
      isActive: true,
      image: "/images/product-turmeric-cream.jpg",
    },
    {
      name: "Sandalwood Face Cleanser",
      slug: "sandalwood-face-cleanser",
      description: "A gentle, soap-free face cleanser with pure sandalwood oil and turmeric. Removes dirt, impurities, and light makeup without stripping skin's natural moisture barrier.\n\nKey Benefits:\n• Gentle yet effective cleansing\n• Maintains skin moisture balance\n• Soothes and calms skin\n• Natural antibacterial properties\n• Suitable for sensitive skin",
      shortDescription: "Gentle sandalwood cleanser for clean, balanced skin.",
      price: "399.00",
      originalPrice: "499.00",
      categoryId: 1,
      concernId: 4,
      skinType: "sensitive",
      ingredients: ["Sandalwood Oil", "Turmeric", "Aloe Vera", "Glycerin", "Rose Extract"],
      howToUse: "1. Wet your face with lukewarm water.\n2. Pump a small amount onto palms.\n3. Massage gently for 30 seconds.\n4. Rinse thoroughly and pat dry.",
      stock: 160,
      rating: "4.5",
      reviewCount: 876,
      badge: "new",
      isActive: true,
      image: "/images/product-sandalwood.jpg",
    },
    {
      name: "Anti-Hair Fall Shampoo",
      slug: "anti-hair-fall-shampoo",
      description: "A sulphate-free, gentle shampoo enriched with Bhringraj, Amla, and onion extract. Cleanses scalp effectively while strengthening hair roots and reducing hair fall with every wash.\n\nKey Benefits:\n• Reduces hair fall from first wash\n• Sulphate and paraben free\n• Strengthens hair roots\n• Adds natural shine\n• Suitable for daily use",
      shortDescription: "Sulphate-free shampoo with Bhringraj for stronger hair.",
      price: "349.00",
      originalPrice: "449.00",
      categoryId: 2,
      concernId: 3,
      skinType: "all",
      hairType: "all",
      ingredients: ["Bhringraj", "Amla", "Onion Extract", "Shikakai", "Reetha"],
      howToUse: "1. Wet hair thoroughly.\n2. Apply shampoo to scalp and hair.\n3. Massage gently for 2-3 minutes.\n4. Rinse well.\n5. Follow with conditioner.",
      stock: 190,
      rating: "4.6",
      reviewCount: 1545,
      badge: "bestseller",
      isActive: true,
      image: "/images/product-bhringraj.jpg",
    },
    {
      name: "Herbal Hair Mask",
      slug: "herbal-hair-mask",
      description: "A deep conditioning hair mask with Hibiscus, Brahmi, and Fenugreek. Repairs damaged hair, restores moisture, and adds a salon-like smoothness to frizzy, dry hair.\n\nKey Benefits:\n• Deep conditions and repairs\n• Tames frizz and flyaways\n• Restores natural shine\n• Strengthens weak hair\n• Adds volume and bounce",
      shortDescription: "Deep conditioning mask with Hibiscus and Brahmi.",
      price: "399.00",
      originalPrice: "549.00",
      categoryId: 2,
      concernId: 3,
      skinType: "all",
      hairType: "all",
      ingredients: ["Hibiscus", "Brahmi", "Fenugreek", "Coconut Milk", "Argan Oil"],
      howToUse: "1. Apply to damp hair after shampooing.\n2. Focus on lengths and ends.\n3. Leave for 15-20 minutes.\n4. Rinse with normal water.\n5. Use once or twice a week.",
      stock: 140,
      rating: "4.4",
      reviewCount: 678,
      badge: "none",
      isActive: true,
      image: "/images/collection-haircare.jpg",
    },
  ];

  for (const p of productData) {
    await db.insert(products).values(p);
  }
  console.log("✓ Products seeded");

  // ─── Product Sizes ───────────────────────────────────────
  const sizesData = [
    { productId: 1, size: "15ml", price: "349.00", originalPrice: "499.00", stock: 80 },
    { productId: 1, size: "30ml", price: "649.00", originalPrice: "899.00", stock: 100 },
    { productId: 1, size: "50ml", price: "999.00", originalPrice: "1399.00", stock: 60 },
    { productId: 2, size: "100ml", price: "449.00", originalPrice: "599.00", stock: 120 },
    { productId: 2, size: "200ml", price: "799.00", originalPrice: "1099.00", stock: 80 },
    { productId: 3, size: "100g", price: "249.00", originalPrice: "349.00", stock: 200 },
    { productId: 3, size: "200g", price: "449.00", originalPrice: "649.00", stock: 150 },
    { productId: 4, size: "100ml", price: "349.00", originalPrice: "449.00", stock: 180 },
    { productId: 4, size: "200ml", price: "549.00", originalPrice: "749.00", stock: 120 },
    { productId: 5, size: "50ml", price: "299.00", originalPrice: "399.00", stock: 150 },
    { productId: 5, size: "100ml", price: "499.00", originalPrice: "699.00", stock: 100 },
    { productId: 6, size: "50g", price: "199.00", originalPrice: "279.00", stock: 200 },
    { productId: 6, size: "100g", price: "349.00", originalPrice: "499.00", stock: 150 },
    { productId: 7, size: "30ml", price: "549.00", originalPrice: "749.00", stock: 100 },
    { productId: 7, size: "50ml", price: "849.00", originalPrice: "1199.00", stock: 60 },
    { productId: 8, size: "100ml", price: "399.00", originalPrice: "499.00", stock: 130 },
    { productId: 8, size: "200ml", price: "699.00", originalPrice: "949.00", stock: 80 },
    { productId: 9, size: "200ml", price: "349.00", originalPrice: "449.00", stock: 160 },
    { productId: 9, size: "500ml", price: "749.00", originalPrice: "999.00", stock: 100 },
    { productId: 10, size: "100g", price: "399.00", originalPrice: "549.00", stock: 120 },
    { productId: 10, size: "200g", price: "699.00", originalPrice: "999.00", stock: 80 },
  ];

  await db.insert(productSizes).values(sizesData);
  console.log("✓ Product sizes seeded");

  // ─── Reviews ─────────────────────────────────────────────
  const reviewData = [
    { productId: 1, userName: "Priya Sharma", rating: 5, title: "Holy Grail Serum!", comment: "I've been using this for 3 months and the results are amazing. My dark spots have visibly reduced and my skin has this natural glow. Worth every penny!", isVerified: true, helpful: 45 },
    { productId: 1, userName: "Ankit Patel", rating: 5, title: "Best purchase ever", comment: "Bought this for my wife and she absolutely loves it. Her skin looks radiant and the texture has improved so much. Will definitely repurchase.", isVerified: true, helpful: 32 },
    { productId: 1, userName: "Meera Reddy", rating: 4, title: "Great but takes time", comment: "Good product but you need to be patient. Saw visible results after 6 weeks of regular use. The smell is very herbal and pleasant.", isVerified: true, helpful: 18 },
    { productId: 2, userName: "Rahul Kumar", rating: 5, title: "Hair fall reduced drastically", comment: "I've tried so many hair oils but this one actually works. My hair fall reduced within 2 weeks. The oil is non-sticky and smells great.", isVerified: true, helpful: 56 },
    { productId: 2, userName: "Sneha Gupta", rating: 5, title: "Amazing for hair growth", comment: "Can see baby hairs growing along my hairline! This oil is magic. Massage it in properly and leave overnight for best results.", isVerified: true, helpful: 41 },
    { productId: 3, userName: "Divya Nair", rating: 4, title: "Luxurious bathing experience", comment: "The soap smells divine and lathers beautifully. Skin feels soft and smooth after every wash. Only wish it lasted longer.", isVerified: true, helpful: 22 },
    { productId: 4, userName: "Kavita Joshi", rating: 5, title: "Perfect toner", comment: "This rose water is so refreshing! I use it every morning and night. My skin feels instantly hydrated. Love the natural rose fragrance.", isVerified: true, helpful: 38 },
    { productId: 5, userName: "Arjun Malhotra", rating: 4, title: "Great for summer", comment: "Very light and non-sticky. Perfect for hot Indian summers. Soothes my skin after being out in the sun. Good value for money.", isVerified: true, helpful: 15 },
    { productId: 7, userName: "Lakshmi Iyer", rating: 5, title: "Waking up to glowing skin!", comment: "This night cream is incredible. I wake up with such soft, glowing skin. The turmeric smell is very mild and pleasant. Highly recommend!", isVerified: true, helpful: 29 },
    { productId: 9, userName: "Vikram Singh", rating: 4, title: "Good sulphate-free option", comment: "Finally a sulphate-free shampoo that actually cleanses well. My scalp feels fresh and hair feels stronger. Will buy again.", isVerified: true, helpful: 20 },
  ];

  await db.insert(reviews).values(reviewData);
  console.log("✓ Reviews seeded");

  // ─── Coupons ─────────────────────────────────────────────
  await db.insert(coupons).values([
    { code: "FIRST15", type: "percentage", value: "15.00", minOrder: "499.00", maxDiscount: "200.00", usageLimit: 1000, startDate: new Date("2026-01-01"), endDate: new Date("2027-12-31") },
    { code: "BLOOMA20", type: "percentage", value: "20.00", minOrder: "999.00", maxDiscount: "500.00", usageLimit: 500, startDate: new Date("2026-01-01"), endDate: new Date("2027-12-31") },
    { code: "SKINCARE50", type: "fixed", value: "50.00", minOrder: "699.00", usageLimit: 2000, startDate: new Date("2026-01-01"), endDate: new Date("2027-12-31") },
    { code: "FREESHIP", type: "fixed", value: "99.00", minOrder: "999.00", maxDiscount: "99.00", usageLimit: 5000, startDate: new Date("2026-01-01"), endDate: new Date("2027-12-31") },
  ]);
  console.log("✓ Coupons seeded");

  // ─── Banners ─────────────────────────────────────────────
  await db.insert(banners).values([
    { title: "Summer Glow Collection", subtitle: "Get 20% off on all skincare products. Limited time offer!", image: "/images/collection-skincare.jpg", link: "/shop/skincare", position: "hero", sortOrder: 1, isActive: true, startDate: new Date(), endDate: new Date("2027-12-31") },
    { title: "Haircare Rituals", subtitle: "Ancient Ayurvedic formulas for luscious hair", image: "/images/collection-haircare.jpg", link: "/shop/haircare", position: "hero", sortOrder: 2, isActive: true, startDate: new Date(), endDate: new Date("2027-12-31") },
    { title: "Free Shipping", subtitle: "On all orders above ₹999", image: "/images/collection-gift.jpg", link: "/shop", position: "promo", sortOrder: 1, isActive: true },
    { title: "Gift Boxes", subtitle: "Perfect gifts for your loved ones", image: "/images/collection-gift.jpg", link: "/shop/gift-boxes", position: "featured", sortOrder: 1, isActive: true },
  ]);
  console.log("✓ Banners seeded");

  // ─── Settings ────────────────────────────────────────────
  await db.insert(settings).values([
    { key: "siteName", value: "Blooma Naturals" },
    { key: "siteTagline", value: "Ancient Wisdom, Modern Care" },
    { key: "freeShippingThreshold", value: "999" },
    { key: "codEnabled", value: "true" },
    { key: "whatsappNumber", value: "+919876543210" },
    { key: "supportEmail", value: "hello@bloomanaturals.com" },
    { key: "currency", value: "INR" },
    { key: "currencySymbol", value: "₹" },
  ]);
  console.log("✓ Settings seeded");

  console.log("\n✅ Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
