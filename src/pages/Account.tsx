import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Package, MapPin, Heart, User, LogOut } from 'lucide-react'
import { Link } from 'react-router'

const tabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Account() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const { data: ordersData } = trpc.order.list.useQuery(undefined, { enabled: activeTab === 'orders' })
  const { data: addressesData } = trpc.address.list.useQuery(undefined, { enabled: activeTab === 'addresses' })
  const { data: wishlistData } = trpc.wishlist.list.useQuery(undefined, { enabled: activeTab === 'wishlist' })
  const utils = trpc.useUtils()
  const removeFromWishlist = trpc.wishlist.toggle.useMutation({ onSuccess: () => utils.wishlist.list.invalidate() })

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">Please sign in to view your account</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#EBE5D9] section-padding py-8">
        <h1 className="text-2xl md:text-3xl font-semibold">My Account</h1>
        <p className="text-sm text-[#2D2D2D]/60 mt-1">Welcome back, {user.name}</p>
      </div>

      <div className="section-padding py-8">
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-[#EBE5D9] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#455848] rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-[#2D2D2D]/50">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id ? 'bg-white text-[#455848] font-medium' : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#C75B4E] hover:bg-white rounded-lg transition-colors mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">My Orders</h2>
                {!ordersData?.length ? (
                  <div className="bg-[#EBE5D9] rounded-xl p-8 text-center">
                    <Package className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
                    <p className="text-sm text-[#2D2D2D]/60">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersData.map((order) => (
                      <div key={order.id} className="bg-[#EBE5D9] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold">{order.orderNumber}</p>
                            <p className="text-xs text-[#2D2D2D]/50">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            order.status === 'delivered' ? 'bg-[#6B8259]/10 text-[#6B8259]' :
                            order.status === 'shipped' ? 'bg-[#455848]/10 text-[#455848]' :
                            'bg-[#C59B53]/10 text-[#C59B53]'
                          }`}>
                            {(order.status ?? 'pending').charAt(0).toUpperCase() + (order.status ?? 'pending').slice(1)}
                          </span>
                        </div>
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span className="text-[#2D2D2D]/70">{item.productName} x{item.quantity}</span>
                            <span>₹{item.total}</span>
                          </div>
                        ))}
                        <div className="border-t border-[#E5E5E5] mt-3 pt-3 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{order.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">My Wishlist</h2>
                {!wishlistData?.length ? (
                  <div className="bg-[#EBE5D9] rounded-xl p-8 text-center">
                    <Heart className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
                    <p className="text-sm text-[#2D2D2D]/60">Your wishlist is empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistData.map((product) => (
                      <div key={product.id} className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden group">
                        <Link to={`/product/${product.slug}`} className="block aspect-[3/4] bg-[#EBE5D9] overflow-hidden">
                          <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <div className="p-3">
                          <Link to={`/product/${product.slug}`}>
                            <p className="text-xs font-semibold line-clamp-1 hover:text-[#455848]">{product.name}</p>
                          </Link>
                          <p className="text-sm font-bold mt-1">₹{product.price}</p>
                          <button
                            onClick={() => removeFromWishlist.mutate({ productId: product.id })}
                            className="text-xs text-[#C75B4E] mt-2 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Saved Addresses</h2>
                {!addressesData?.length ? (
                  <div className="bg-[#EBE5D9] rounded-xl p-8 text-center">
                    <MapPin className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
                    <p className="text-sm text-[#2D2D2D]/60">No saved addresses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addressesData.map((addr) => (
                      <div key={addr.id} className="bg-[#EBE5D9] rounded-xl p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{addr.name}</p>
                            <p className="text-sm text-[#2D2D2D]/70 mt-1">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p className="text-sm text-[#2D2D2D]/70">{addr.addressLine2}</p>}
                            <p className="text-sm text-[#2D2D2D]/70">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-sm text-[#2D2D2D]/70 mt-1">{addr.phone}</p>
                          </div>
                          {addr.isDefault && (
                            <span className="text-xs bg-[#455848]/10 text-[#455848] px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Profile</h2>
                <div className="bg-[#EBE5D9] rounded-xl p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-[#2D2D2D]/60">Name</label>
                    <p className="text-sm font-medium mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-[#2D2D2D]/60">Email</label>
                    <p className="text-sm font-medium mt-1">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
