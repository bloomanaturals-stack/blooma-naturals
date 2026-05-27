import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { Star, ShoppingCart, Zap, Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'
import ProductCard from '@/components/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug: slug! })
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'howtouse' | 'reviews'>('description')
  const utils = trpc.useUtils()
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate()
      toast.success('Added to cart!')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white section-padding py-10">
        <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-[#EBE5D9] rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-[#EBE5D9] rounded w-3/4" />
              <div className="h-4 bg-[#EBE5D9] rounded w-1/4" />
              <div className="h-20 bg-[#EBE5D9] rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">Product not found</p>
          <Link to="/shop" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    )
  }

  const price = selectedSize
    ? Number(product.sizes?.find(s => s.id === selectedSize)?.price ?? product.price)
    : Number(product.price)
  const originalPrice = selectedSize
    ? Number(product.sizes?.find(s => s.id === selectedSize)?.originalPrice ?? product.originalPrice)
    : Number(product.originalPrice)
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)

  const handleAddToCart = () => {
    addToCart.mutate({ productId: product.id, sizeId: selectedSize ?? undefined, quantity })
  }

  const handleBuyNow = () => {
    addToCart.mutate({ productId: product.id, sizeId: selectedSize ?? undefined, quantity }, {
      onSuccess: () => {
        window.location.href = '/checkout'
      },
    })
  }

  const ingredients = Array.isArray(product.ingredients) ? product.ingredients as string[] : []
  const howToUseSteps = product.howToUse ? product.howToUse.split('\n').filter(Boolean) : []

  // @ts-ignore
  const allImages = [product.image, product.image2, product.image3].filter(Boolean) as string[]
  const displayImage = selectedImage || (allImages[0] ?? '/images/hero-product.jpg')

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="section-padding py-4 text-xs text-[#2D2D2D]/50">
        <Link to="/" className="hover:text-[#455848]">Home</Link>
        {' / '}
        <Link to="/shop" className="hover:text-[#455848]">Shop</Link>
        {' / '}
        {product.category && (
          <>
            <Link to={`/shop/${product.category.slug}`} className="hover:text-[#455848]">{product.category.name}</Link>
            {' / '}
          </>
        )}
        <span className="text-[#2D2D2D]">{product.name}</span>
      </div>

      <div className="section-padding pb-16">
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative bg-[#EBE5D9] rounded-xl overflow-hidden aspect-square shadow-sm">
              {allImages.length > 0 ? (
                allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                      displayImage === img ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  />
                ))
              ) : (
                <img
                  src='/images/hero-product.jpg'
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                      displayImage === img 
                        ? 'ring-2 ring-offset-2 ring-[#455848] opacity-100' 
                        : 'opacity-60 hover:opacity-100 hover:ring-2 hover:ring-offset-2 hover:ring-[#455848]/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-[#EBE5D9]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.category && (
              <p className="text-[10px] font-medium text-[#455848] uppercase tracking-[0.2em]">
                {product.category.name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(Number(product.rating)) ? 'text-[#C59B53] fill-[#C59B53]' : 'text-[#E5E5E5]'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#2D2D2D]/60">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#2D2D2D]">₹{price}</span>
              <span className="text-lg text-[#2D2D2D]/40 line-through">₹{originalPrice}</span>
              {discount > 0 && (
                <span className="bg-[#C59B53]/10 text-[#C59B53] text-xs font-semibold px-3 py-1">{discount}% OFF</span>
              )}
            </div>
            <p className="text-xs text-[#2D2D2D]/50">Inclusive of all taxes</p>

            <p className="text-sm text-[#2D2D2D]/70 leading-relaxed">{product.shortDescription}</p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`text-xs px-4 py-2 border rounded transition-colors ${
                        selectedSize === size.id
                          ? 'border-2 border-[#455848] bg-[#EDF2EF]'
                          : 'border-[#E5E5E5] hover:border-[#455848]'
                      }`}
                    >
                      {size.size}
                      <span className="ml-1 text-[#2D2D2D]/50">₹{size.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2">Quantity</p>
              <div className="flex items-center gap-3 border border-[#E5E5E5] w-fit rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-[#EBE5D9]"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-[#EBE5D9]"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#2D2D2D] text-white px-8 py-3 text-sm font-semibold hover:bg-[#2C3A30] transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Pincode Check */}
            <div className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                maxLength={6}
                className="flex-1 border border-[#E5E5E5] px-4 py-2.5 text-sm outline-none focus:border-[#455848] rounded"
              />
              <button className="px-4 py-2.5 border border-[#2D2D2D] text-sm font-medium hover:bg-[#2D2D2D] hover:text-white transition-colors rounded">
                Check
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E5E5E5]">
              <div className="flex items-center gap-2 text-xs text-[#2D2D2D]/70">
                <Truck className="w-4 h-4 text-[#455848]" /> Free shipping above ₹999
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2D2D2D]/70">
                <RotateCcw className="w-4 h-4 text-[#455848]" /> Easy returns
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2D2D2D]/70">
                <ShieldCheck className="w-4 h-4 text-[#455848]" /> COD available
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2D2D2D]/70">
                <Zap className="w-4 h-4 text-[#455848]" /> 100% Natural
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="flex gap-0 border-b border-[#E5E5E5]">
            {([
              { key: 'description', label: 'Description' },
              { key: 'ingredients', label: 'Ingredients' },
              { key: 'howtouse', label: 'How to Use' },
              { key: 'reviews', label: `Reviews (${product.reviews?.length ?? 0})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#455848] text-[#455848]'
                    : 'border-transparent text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                <p className="text-sm text-[#2D2D2D]/70 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div className="max-w-3xl">
                <div className="grid sm:grid-cols-2 gap-3">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#EBE5D9] p-3 rounded-lg">
                      <div className="w-8 h-8 bg-[#455848]/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#455848]">{i + 1}</span>
                      </div>
                      <span className="text-sm font-medium">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'howtouse' && (
              <div className="max-w-3xl space-y-3">
                {howToUseSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-[#455848] text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[#2D2D2D]/70 pt-1.5">{step.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-4">
                {product.reviews?.length === 0 ? (
                  <p className="text-sm text-[#2D2D2D]/60">No reviews yet. Be the first to review!</p>
                ) : (
                  product.reviews?.map((review, i) => (
                    <div key={i} className="bg-[#EBE5D9] rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= review.rating ? 'text-[#C59B53] fill-[#C59B53]' : 'text-[#E5E5E5]'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#2D2D2D]/50">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && <p className="text-sm font-semibold mb-1">{review.title}</p>}
                      <p className="text-sm text-[#2D2D2D]/70">{review.comment}</p>
                      <p className="text-xs text-[#455848] mt-2">— {review.userName}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.related && product.related.length > 0 && (
          <div className="mt-10 max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {product.related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
