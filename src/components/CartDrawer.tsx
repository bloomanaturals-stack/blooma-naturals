import { Link } from 'react-router'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const utils = trpc.useUtils()
  const { data: cartData } = trpc.cart.get.useQuery()
  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  })
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate()
      toast.success('Item removed')
    },
  })

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-semibold">Shopping Cart ({cartData?.itemCount ?? 0})</h2>
          <button onClick={onClose} className="p-1 hover:text-[#455848]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {!cartData?.items?.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[#E5E5E5] mb-4" />
              <p className="text-lg font-medium text-[#2D2D2D] mb-2">Your cart is empty</p>
              <p className="text-sm text-[#2D2D2D]/60 mb-6">Discover our natural products</p>
              <Link
                to="/shop"
                onClick={onClose}
                className="btn-primary"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartData.items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-[#EBE5D9] rounded-lg p-3">
                  <img
                    src={item.product?.image ?? '/images/hero-product.jpg'}
                    alt={item.product?.name ?? ''}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-[#455848] uppercase tracking-wider mt-0.5">
                      {item.product?.category?.name}
                    </p>
                    <p className="text-sm font-semibold mt-1">₹{item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center border border-[#E5E5E5] rounded hover:bg-[#EDF2EF]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        className="w-6 h-6 flex items-center justify-center border border-[#E5E5E5] rounded hover:bg-[#EDF2EF]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeMutation.mutate({ itemId: item.id })}
                        className="ml-auto text-xs text-[#C75B4E] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartData?.items?.length ? (
          <div className="border-t border-[#E5E5E5] p-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#2D2D2D]/60">Subtotal</span>
              <span className="font-semibold">₹{cartData.subtotal}</span>
            </div>
            <div className="text-xs text-[#2D2D2D]/50">
              Shipping calculated at checkout. Free shipping above ₹999.
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full btn-primary text-center"
            >
              Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full btn-outline text-center"
            >
              Continue Shopping
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}
