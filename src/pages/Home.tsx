import { Link } from 'react-router'
import { ArrowRight, Star, MessageCircle } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import ProductCard from '@/components/ProductCard'
import {
  Zap, Clock, Scissors, Droplets, Snowflake, Sun
} from 'lucide-react'

const concernIcons: Record<string, React.ReactNode> = {
  'Zap': <Zap className="w-8 h-8" />,
  'Clock': <Clock className="w-8 h-8" />,
  'Scissors': <Scissors className="w-8 h-8" />,
  'Droplets': <Droplets className="w-8 h-8" />,
  'Snowflake': <Snowflake className="w-8 h-8" />,
  'Sun': <Sun className="w-8 h-8" />,
}

const testimonials = [
  {
    name: 'Priya Sharma',
    avatar: '/images/avatar-1.jpg',
    rating: 5,
    text: "I've been using the Kumkumadi serum for 3 months and the results are incredible! My dark spots have visibly reduced and my skin has a natural glow.",
    product: 'Kumkumadi Tailam',
  },
  {
    name: 'Rahul Verma',
    avatar: '/images/avatar-2.jpg',
    rating: 5,
    text: "The Bhringraj Hair Oil actually works! My hair fall reduced within 2 weeks. I've tried so many products but this one is genuinely effective.",
    product: 'Bhringraj Hair Oil',
  },
  {
    name: 'Ananya Patel',
    avatar: '/images/avatar-3.jpg',
    rating: 5,
    text: "Love the saffron soap! It smells divine and my skin feels so soft after every wash. Finally a natural product that delivers on its promises.",
    product: 'Kashmiri Saffron Soap',
  },
]

export default function Home() {
  const { data: newArrivals } = trpc.product.getNewArrivals.useQuery()
  const { data: concernsData } = trpc.concern.list.useQuery()
  const { data: bestsellers } = trpc.product.getBestsellers.useQuery()
  const { data: publishedReviews } = trpc.product.getPublishedReviews.useQuery()

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[85vh] flex items-center bg-[#EBE5D9]">
        <div className="w-full section-padding">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1 space-y-6 py-8 lg:py-0">
              <p className="text-xs font-medium text-[#455848] uppercase tracking-[0.2em]">
                Ayurvedic Skincare & Haircare
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-[#2D2D2D]">
                Discover the Rare Secrets of{' '}
                <span className="text-[#455848]">Nature</span>
              </h1>
              <p className="text-base md:text-lg text-[#2D2D2D]/70 max-w-lg leading-relaxed">
                Handcrafted with 100% natural ingredients. No sulfates, no parabens, no silicones. Just pure botanical goodness for your skin and hair.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="btn-primary">
                  Shop Now
                </Link>
                <Link to="/quiz" className="btn-outline flex items-center gap-2">
                  Take AI Quiz
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                <img
                  src="/images/hero-product.jpg"
                  alt="Kumkumadi Tailam Face Serum"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 text-[#C59B53] fill-[#C59B53]" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                  <p className="text-xs text-[#2D2D2D]/60 mt-1">2,847 happy customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Collections ─── */}
      <section className="section-padding py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Skincare Essentials', image: '/images/collection-skincare.jpg', link: '/shop/skincare' },
            { title: 'Haircare Rituals', image: '/images/collection-haircare.jpg', link: '/shop/haircare' },
            { title: 'Gift Boxes', image: '/images/collection-gift.jpg', link: '/shop/gift-boxes' },
          ].map((col) => (
            <Link
              key={col.title}
              to={col.link}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden"
            >
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{col.title}</h3>
                <span className="text-sm text-white/80 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Best Sellers ─── */}
      <section className="section-padding py-16 bg-white">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D]">Best Sellers</h2>
            <p className="text-sm text-[#2D2D2D]/60 mt-1">Our most loved products by the Blooma Naturals family</p>
          </div>
          <Link to="/shop?sort=popular" className="text-sm font-medium text-[#455848] hover:underline hidden md:block">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {bestsellers?.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── Featured Product ─── */}
      <section className="bg-[#455848] section-padding py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <p className="text-xs font-medium text-white/70 uppercase tracking-[0.2em]">Featured Product</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Kumkumadi Tailam</h2>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-md">
              An ancient Ayurvedic formulation with saffron and 24 herbs. Brightens complexion, reduces dark spots, and imparts a natural golden glow.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">₹649</span>
              <span className="text-lg text-white/50 line-through">₹899</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1">28% OFF</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-[#C59B53] fill-[#C59B53]" />
              ))}
              <span className="text-sm text-white/80 ml-2">4.8 (2,847 reviews)</span>
            </div>
            <Link to="/product/kumkumadi-tailam-face-serum" className="inline-block btn-primary bg-[#C59B53]">
              Add to Cart
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="/images/hero-product.jpg"
              alt="Kumkumadi Tailam"
              className="w-full max-w-md mx-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* ─── Shop by Concern ─── */}
      <section className="section-padding py-16 md:py-24">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D]">Shop by Concern</h2>
          <p className="text-sm text-[#2D2D2D]/60 mt-1">Find the perfect solution for your needs</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {concernsData?.map((concern) => (
            <Link
              key={concern.id}
              to={`/shop?concern=${concern.slug}`}
              className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col items-center gap-3 hover:border-[#455848] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-[#455848] group-hover:text-[#2C3A30] transition-colors">
                {concernIcons[concern.icon ?? ''] ?? <Sun className="w-8 h-8" />}
              </div>
              <span className="text-sm font-semibold text-[#2D2D2D] text-center">{concern.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── New Arrivals ─── */}
      <section className="section-padding py-16 bg-white">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D]">New Arrivals</h2>
            <p className="text-sm text-[#2D2D2D]/60 mt-1">Discover our latest botanical innovations</p>
          </div>
          <Link to="/shop?badge=new" className="text-sm font-medium text-[#455848] hover:underline hidden md:block">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals?.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── Haircare Feature ─── */}
      <section className="bg-[#2C3A30] section-padding py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <img
              src="/images/product-bhringraj.jpg"
              alt="Bhringraj Hair Oil"
              className="w-full max-w-md mx-auto rounded-2xl"
            />
          </div>
          <div className="space-y-6">
            <p className="text-xs font-medium text-white/70 uppercase tracking-[0.2em]">Haircare Ritual</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Bhringraj Hair Oil</h2>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-md">
              Strengthens roots, prevents hair fall, and promotes lush growth. Enriched with Bhringraj, Amla, and Brahmi — the trinity of Ayurvedic hair care.
            </p>
            <span className="text-2xl font-bold text-white block">₹449</span>
            <div className="flex flex-wrap gap-2">
              {['Bhringraj', 'Amla', 'Brahmi'].map((herb) => (
                <span key={herb} className="bg-white/15 text-white text-xs px-4 py-1.5 rounded-full">
                  {herb}
                </span>
              ))}
            </div>
            <Link to="/product/bhringraj-hair-oil" className="inline-block btn-primary bg-[#C59B53]">
              Shop Haircare
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Ingredient Story ─── */}
      <section className="section-padding py-20 md:py-28 bg-[#EBE5D9]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-xs font-medium text-[#455848] uppercase tracking-[0.2em]">Our Philosophy</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2D2D2D] tracking-tight">
            Only the Goodness of Nature
          </h2>
          <p className="text-base md:text-lg text-[#2D2D2D]/70 leading-relaxed">
            Every Blooma Naturals product is crafted with handpicked botanical ingredients, sourced sustainably from across India. We believe in transparency — what you see on our label is exactly what goes into your skin and hair. No hidden chemicals, no synthetic fragrances. Just pure, effective Ayurveda.
          </p>
          <div className="flex justify-center gap-8 md:gap-12 pt-6">
            {[
              { name: 'Saffron', img: '/images/hero-product.jpg' },
              { name: 'Aloe Vera', img: '/images/product-aloe-gel.jpg' },
              { name: 'Turmeric', img: '/images/product-turmeric-cream.jpg' },
              { name: 'Rose', img: '/images/product-rose-water.jpg' },
              { name: 'Neem', img: '/images/product-neem-pack.jpg' },
            ].map((ing) => (
              <div key={ing.name} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#455848]">
                  <img src={ing.img} alt={ing.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-[#2D2D2D]">{ing.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="section-padding py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D]">What Our Customers Say</h2>
          <p className="text-sm text-[#2D2D2D]/60 mt-1">Join 50,000+ happy customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {publishedReviews && publishedReviews.length > 0 ? (
            publishedReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-[#EBE5D9] rounded-xl p-6 md:p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#C59B53] fill-[#C59B53]" />
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gray-300 fill-gray-300" />
                  ))}
                </div>
                <p className="text-sm text-[#2D2D2D] leading-relaxed mb-6 italic">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#455848] text-white flex items-center justify-center font-bold text-lg">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.userName}</p>
                    <div className="flex flex-col gap-0.5">
                      {review.isVerified && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-[#455848]" />
                          <span className="text-[10px] text-[#455848]">Verified Purchase</span>
                        </div>
                      )}
                      {review.product && (
                        <Link to={`/product/${review.product.slug}`} className="text-[10px] text-[#2D2D2D]/70 hover:underline">
                          {review.product.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            testimonials.map((t, i) => (
              <div key={i} className="bg-[#EBE5D9] rounded-xl p-6 md:p-8">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-[#C59B53] fill-[#C59B53]" />
                  ))}
                </div>
                <p className="text-sm text-[#2D2D2D] leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-[#455848]" />
                        <span className="text-[10px] text-[#455848]">Verified Purchase</span>
                      </div>
                      <span className="text-[10px] text-[#2D2D2D]/70">{t.product}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="section-padding py-16 md:py-20">
        <div className="bg-[#455848] rounded-2xl p-8 md:p-16 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-white mb-4">
            Not Sure What's Right for You?
          </h2>
          <p className="text-white/85 text-sm md:text-base max-w-xl mx-auto mb-8">
            Take our AI-powered skin and hair quiz to get personalized product recommendations based on your unique needs.
          </p>
          <Link to="/quiz" className="inline-block bg-white text-[#455848] px-8 py-3 text-sm font-semibold hover:bg-[#EBE5D9] transition-colors">
            Take the AI Quiz
          </Link>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="section-padding py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Are your products really 100% natural?', a: 'Yes! All Blooma Naturals products are made with 100% natural and organic ingredients. We do not use any sulfates, parabens, silicones, artificial fragrances, or synthetic colors.' },
              { q: 'How long does shipping take?', a: 'We deliver within 3-7 business days across India. Metro cities typically receive orders within 3-4 days.' },
              { q: 'Do you offer Cash on Delivery?', a: 'Yes, we offer COD on all orders above ₹499. A small ₹50 fee applies for COD orders.' },
              { q: 'Are your products suitable for sensitive skin?', a: 'Our products are formulated to be gentle. However, we recommend doing a patch test before full application, especially if you have sensitive skin.' },
            ].map((faq, i) => (
              <div key={i} className="border border-[#E5E5E5] rounded-lg p-5">
                <h3 className="font-semibold text-sm text-[#2D2D2D] mb-2">{faq.q}</h3>
                <p className="text-sm text-[#2D2D2D]/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
