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

const steps = ['Contact', 'Address', 'Payment', 'Review']

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

  const utils = trpc.useUtils()
  const { data: cartData } = trpc.cart.get.useQuery()
  const clearCart = trpc.cart.clear.useMutation()

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
      clearCart.mutate()
      utils.cart.get.invalidate()
      setStep(4)
    },
    onError: () => {
      toast.error('Something went wrong')
      setIsProcessing(false)
    },
  })

  const subtotal = cartData?.subtotal ?? 0
  const shipping = subtotal >= 999 ? 0 : 99
  const codCharge = paymentMethod === 'cod' ? 50 : 0
  const total = subtotal + shipping + codCharge

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
      discount: 0,
      shipping: shipping + codCharge,
    })
  }

  if (!cartData?.items?.length) {
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
              />
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (10 digits)" maxLength={10}
                className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              {(['name', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode'] as const).map((field) => (
                <input
                  key={field}
                  type="text"
                  value={address[field]}
                  onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                  placeholder={field === 'addressLine2' ? 'Apartment, suite, etc. (optional)' : field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full border-b-2 border-[#E5E5E5] py-3 outline-none focus:border-[#455848] transition-colors"
                />
              ))}
            </div>
          )}

          {step === 2 && (
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
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Order Review</h2>
              <div className="bg-[#EBE5D9] rounded-lg p-5 space-y-3">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span>₹{item.total}</span>
                  </div>
                ))}
                <div className="border-t border-[#E5E5E5] pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-[#2D2D2D]/60">Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between"><span className="text-[#2D2D2D]/60">Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                  {codCharge > 0 && <div className="flex justify-between"><span className="text-[#2D2D2D]/60">COD Fee</span><span>₹{codCharge}</span></div>}
                  <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>₹{total}</span></div>
                </div>
              </div>
              <div className="bg-[#EDF2EF] rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">Shipping to:</p>
                <p className="text-[#2D2D2D]/70">{address.name}, {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} - {address.pincode}</p>
                <p className="mt-2 font-medium">Payment: {paymentMethods.find(p => p.id === paymentMethod)?.label}</p>
              </div>
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
                  onClick={() => setStep(step + 1)}
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
