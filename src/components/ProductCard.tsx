import { Link } from 'react-router'
import { Star, ShoppingCart } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    price: string
    originalPrice: string
    rating: string | null
    reviewCount: number | null
    badge: string | null
    image: string | null
    category?: { name: string } | null
    sizes?: { size: string; price: string }[] | null
  }
  showBadge?: boolean
}

export default function ProductCard({ product, showBadge = true }: ProductCardProps) {
  const utils = trpc.useUtils()
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate()
      toast.success(`${product.name} added to cart`)
    },
  })

  const discount = Math.round(
    ((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100
  )

  const badgeColors: Record<string, string> = {
    sale: 'bg-[#C59B53]',
    new: 'bg-[#455848]',
    bestseller: 'bg-[#2C3A30]',
  }

  return (
    <div className="group bg-white border border-[#E5E5E5] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] bg-[#EBE5D9] overflow-hidden">
        <img
          src={product.image ?? '/images/hero-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {showBadge && product.badge && product.badge !== 'none' && (
          <span className={`absolute top-3 left-3 ${badgeColors[product.badge] ?? 'bg-[#455848]'} text-white text-[10px] font-semibold px-3 py-1 uppercase tracking-wider`}>
            {product.badge}
          </span>
        )}
        {/* Quick View on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 text-[#2D2D2D] text-xs font-medium px-4 py-2 rounded-sm">
            Quick View
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        {product.category && (
          <p className="text-[10px] font-medium text-[#455848] uppercase tracking-widest">
            {product.category.name}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[#2D2D2D] line-clamp-2 group-hover:text-[#455848] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(Number(product.rating ?? '5.0'))
                    ? 'text-[#C59B53] fill-[#C59B53]'
                    : 'text-[#E5E5E5]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#2D2D2D]/50">({product.reviewCount ?? 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#2D2D2D]">₹{product.price}</span>
          <span className="text-sm text-[#2D2D2D]/40 line-through">₹{product.originalPrice}</span>
          {discount > 0 && (
            <span className="text-[10px] font-semibold text-[#6B8259]">{discount}% off</span>
          )}
        </div>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.slice(0, 3).map((s) => (
              <span key={s.size} className="text-[10px] bg-[#EBE5D9] px-2 py-0.5 rounded">
                {s.size}
              </span>
            ))}
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
          className="w-full bg-[#C59B53] text-white py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#b37d3f] transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
