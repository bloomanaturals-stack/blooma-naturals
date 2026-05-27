import { Link } from 'react-router'
import { Plus, Minus, X, ShoppingBag, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'

export default function Cart() {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const utils = trpc.useUtils()
  const { data: cartData } = trpc.cart.get.useQuery()
  const updateMutation = trpc.cart.update.useMutation({ onSuccess: () => utils.cart.get.invalidate() })
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast.success('Item removed') },
  })
  const applyCouponMutation = trpc.cart.applyCoupon.useMutation({
    onSuccess: (data) => {
      if (data.valid && data.discount) {
        setAppliedCoupon({ code: data.coupon!.code, discount: data.discount })
        toast.success(`Coupon applied! Save ₹${data.discount}`)
      } else {
        toast.error(data.message || 'Invalid coupon')
      }
    },
  })

  const subtotal = cartData?.subtotal ?? 0
  const shipping = subtotal >= 999 ? 0 : 99
  const discount = appliedCoupon?.discount ?? 0
  const total = subtotal + shipping - discount
  const freeShippingProgress = Math.min(100, (subtotal / 999) * 100)

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#EBE5D9] section-padding py-8">
        <h1 className="text-2xl md:text-3xl font-semibold">Shopping Cart</h1>
        <p className="text-sm text-[#2D2D2D]/60 mt-1">{cartData?.itemCount ?? 0} items</p>
      </div>

      <div className="section-padding py-8">
        {!cartData?.items?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-20 h-20 text-[#E5E5E5] mb-6" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-sm text-[#2D2D2D]/60 mb-8">Discover our natural products</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Progress */}
              <div className="bg-[#EDF2EF] rounded-lg p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#2D2D2D]/70">
                    {subtotal >= 999 ? 'You qualify for free shipping!' : `Add ₹${(999 - subtotal).toFixed(0)} more for free shipping`}
                  </span>
                  <Truck className="w-4 h-4 text-[#455848]" />
                </div>
                <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#455848] transition-all" style={{ width: `${freeShippingProgress}%` }} />
                </div>
              </div>

              {cartData.items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-[#EBE5D9] rounded-lg p-4">
                  <Link to={`/product/${item.product?.slug}`} className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.product?.image ?? '/images/hero-product.jpg'}
                      alt={item.product?.name ?? ''}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.product?.slug}`} className="text-sm font-semibold hover:text-[#455848]">
                          {item.product?.name}
                        </Link>
                        <p className="text-xs text-[#455848] uppercase tracking-wider mt-0.5">
                          {item.product?.category?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMutation.mutate({ itemId: item.id })}
                        className="p-1 hover:text-[#C75B4E]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 border border-[#E5E5E5] rounded">
                        <button
                          onClick={() => item.quantity > 1 && updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                          className="px-2 py-1 hover:bg-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          className="px-2 py-1 hover:bg-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold">₹{item.total}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon */}
              <div className="border border-[#E5E5E5] rounded-lg p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2">Have a coupon?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#455848] rounded"
                  />
                  <button
                    onClick={() => applyCouponMutation.mutate({ code: couponCode, subtotal })}
                    className="px-4 py-2 border border-[#2D2D2D] text-sm font-medium hover:bg-[#2D2D2D] hover:text-white transition-colors rounded"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-[#6B8259] mt-2">
                    Coupon "{appliedCoupon.code}" applied! You save ₹{appliedCoupon.discount}
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#EBE5D9] rounded-xl p-6 h-fit lg:sticky lg:top-24">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#2D2D2D]/60">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2D2D2D]/60">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#6B8259]">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-[#E5E5E5] pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full btn-primary text-center mt-6"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 space-y-2 text-xs text-[#2D2D2D]/50">
                <div className="flex items-center gap-2"><Truck className="w-3 h-3" /> Free shipping above ₹999</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Secure checkout</div>
                <div className="flex items-center gap-2"><RotateCcw className="w-3 h-3" /> Easy returns</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
