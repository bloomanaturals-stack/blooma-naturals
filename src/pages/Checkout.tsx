import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'

const paymentMethods = [
  { id: 'upi', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', sub: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', sub: 'All major banks' },
  { id: 'wallet', label: 'Wallet', sub: 'Paytm, Mobikwik' },
  { id: 'cod', label: 'Cash on Delivery', sub: '+₹50 additional charge' },
]

const steps = ['Review', 'Contact', 'Address', 'Payment']

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [placedOrder, setPlacedOrder] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState({ name: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null)

  const utils = trpc.useUtils()
  const { data: cartData } = trpc.cart.get.useQuery()
  const clearCart = trpc.cart.clear.useMutation()

  const applyCoupon = trpc.cart.applyCoupon.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon({ code: data.coupon!.code, discount: data.discount! })
        toast.success(`Coupon applied! You saved ₹${data.discount}`)
      } else {
        toast.error(data.message)
      }
    }
  })

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      toast.success('Order placed successfully!')
      setPlacedOrder({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        total: data.total,
        items: cartData?.items || [],
        address,
        paymentMethod: paymentMethods.find(p => p.id === paymentMethod)?.label,
      })
      clearCart.mutate(undefined, {
        onSuccess: () => utils.cart.get.invalidate()
      })
      setStep(4)
    },
    onError: () => {
      toast.error('Something went wrong')
      setIsProcessing(false)
    },
  })

  const subtotal = cartData?.subtotal ?? 0
  const discount = appliedCoupon?.discount ?? 0
  const shipping = subtotal >= 999 ? 0 : 99
  const codCharge = paymentMethod === 'cod' ? 50 : 0
  const total = subtotal - discount + shipping + codCharge

  const handlePlaceOrder = () => {
    if (!cartData?.items?.length) return
    setIsProcessing(true)
    createOrder.mutate({
      items: cartData.items.map(i => ({
        productId: i.productId,
        productName: i.product?.name ?? 'Product',
        size: i.product?.sizes?.find(s => s.id === i.sizeId)?.size,
        price: Number(i.price),
        quantity: i.quantity,
      })),
      shippingAddress: { ...address, phone },
      paymentMethod: paymentMethod as any,
      discount,
      couponCode: appliedCoupon?.code,
      shipping: shipping + codCharge,
    })
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!email || !phone) {
        toast.error("Please fill in all contact details")
        return
      }
      if (phone.length !== 10) {
        toast.error("Phone number must be 10 digits")
        return
      }
    }
    if (step === 2) {
      if (!address.name || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
        toast.error("Please fill in all mandatory address details")
        return
      }
      if (address.pincode.length !== 6) {
        toast.error("Pincode must be 6 digits")
        return
      }
    }
    setStep(step + 1)
  }

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setAddress({ ...address, pincode: val })
    
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`)
        const data = await res.json()
        if (data && data[0] && data[0].Status === 'Success') {
          const po = data[0].PostOffice[0]
          setAddress(prev => ({ ...prev, city: po.District, state: po.State, pincode: val }))
        } else {
          toast.error("Invalid pincode")
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err)
      }
    }
  }

  if (!cartData?.items?.length && !placedOrder) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">Your cart is empty</p>
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#EBE5D9] section-padding py-8">
        <h1 className="text-2xl md:text-3xl font-semibold">Checkout</h1>
      </div>

      <div className="section-padding py-8">
        <div className="max-w-3xl mx-auto">
          {/* Steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i <= step ? 'bg-[#455848] text-white' : 'bg-[#E5E5E5] text-[#2D2D2D]/40'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs ml-2 hidden sm:block ${i <= step ? 'text-[#2D2D2D]' : 'text-[#2D2D2D]/40'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-[#455848]' : 'bg-[#E5E5E5]'}`} />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Order Review</h2>
              <div className="bg-[#EBE5D9] rounded-lg p-5 space-y-3">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span>₹{item.total}</span>
                  </div>
                ))}
                
                <div className="border-t border-[#E5E5E5] pt-3 pb-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#455848]"
                  />
                  <button
                    onClick={() => applyCoupon.mutate({ code: couponCode, subtotal })}
                    disabled={!couponCode || applyCoupon.isPending}
                    className="bg-[#455848] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6D8A7C] disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-[#6B8259]">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs underline ml-2">Remove</button>
                  </div>
                )}

                <div className="border-t border-[#E5E5E5] pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-[#2D2D2D]/60">Subtotal</span><span>₹{subtotal}</span></div>
                  {appliedCoupon && <div className="flex justify-between text-[#6B8259]"><span className="text-[#2D2D2D]/60">Discount</span><span>-₹{discount}</span></div>}
                  <div className="flex justify-between"><span className="text-[#2D2D2D]/60">Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                  <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>₹{subtotal - discount + shipping}</span></div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email *" className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                required
              />
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Phone number (10 digits) *" maxLength={10}
                className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <input
                type="text"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                placeholder="Full Name *"
                className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                required
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  placeholder="Address Line 1 *"
                  className="flex-1 border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                  required
                />
                <input
                  type="text"
                  value={address.pincode}
                  onChange={handlePincodeChange}
                  placeholder="Pincode (6 digits) *"
                  maxLength={6}
                  className="w-1/3 border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                  required
                />
              </div>
              <input
                type="text"
                value={address.addressLine2}
                onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City *"
                  className="flex-1 border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                  required
                />
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State *"
                  className="flex-1 border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === pm.id ? 'border-[#455848] bg-[#EDF2EF]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === pm.id ? 'border-[#455848]' : 'border-[#E5E5E5]'
                  }`}>
                    {paymentMethod === pm.id && <div className="w-2.5 h-2.5 bg-[#455848] rounded-full" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{pm.label}</p>
                    <p className="text-xs text-[#2D2D2D]/50">{pm.sub}</p>
                  </div>
                </button>
              ))}
              
              {codCharge > 0 && (
                <div className="mt-4 p-4 bg-[#EDF2EF] rounded-lg text-sm flex justify-between">
                  <span className="font-medium text-[#455848]">COD Fee applied</span>
                  <span className="font-semibold">+₹{codCharge}</span>
                </div>
              )}
            </div>
          )}

          {step === 4 && placedOrder && (
            <div className="space-y-6 max-w-2xl mx-auto py-8">
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-[#455848] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-[#2D2D2D]">Order placed, thanks!</h2>
                <p className="text-[#2D2D2D]/70">
                  Confirmation will be sent to your email.
                </p>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#EBE5D9] px-6 py-4 border-b border-[#E5E5E5] flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-[#2D2D2D]/60 uppercase text-xs font-semibold mb-1">Order Placed</p>
                    <p className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[#2D2D2D]/60 uppercase text-xs font-semibold mb-1">Total</p>
                    <p className="font-medium">₹{placedOrder.total}</p>
                  </div>
                  <div>
                    <p className="text-[#2D2D2D]/60 uppercase text-xs font-semibold mb-1">Dispatch To</p>
                    <p className="font-medium text-[#455848]">{placedOrder.address.name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[#2D2D2D]/60 uppercase text-xs font-semibold mb-1">Order #</p>
                    <p className="font-medium">{placedOrder.orderNumber}</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4 text-[#455848]">Arriving {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                  <div className="space-y-4">
                    {placedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-[#EBE5D9] rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#2D2D2D]/20">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#2D2D2D] line-clamp-2">{item.product?.name}</p>
                          <p className="text-sm text-[#2D2D2D]/60 mt-1">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold mt-1">₹{item.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 py-4">
                  <p className="text-sm text-[#2D2D2D]/70"><span className="font-semibold">Payment Method:</span> {placedOrder.paymentMethod}</p>
                  <p className="text-sm text-[#2D2D2D]/70 mt-1"><span className="font-semibold">Shipping Address:</span> {placedOrder.address.addressLine1}{placedOrder.address.addressLine2 ? `, ${placedOrder.address.addressLine2}` : ''}, {placedOrder.address.city}, {placedOrder.address.state} - {placedOrder.address.pincode}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                {user ? (
                  <Link to={`/account?order=${placedOrder.orderId}`} className="btn-outline text-center px-6">
                    Review or edit your recent orders
                  </Link>
                ) : null}
                <Link to="/shop" className="btn-primary text-center px-6">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn-outline">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : `Place Order • ₹${total}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
