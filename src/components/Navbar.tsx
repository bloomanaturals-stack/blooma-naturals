import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import CartDrawer from './CartDrawer'

interface NavbarProps {
  scrollY: number
}

const navLinks = [
  { label: 'Skincare', href: '/shop/skincare' },
  { label: 'Haircare', href: '/shop/haircare' },
  { label: 'Gift Boxes', href: '/shop/gift-boxes' },
  { label: 'Value Bundles', href: '/shop/value-bundles' },
  { label: 'New Arrivals', href: '/shop?badge=new' },
  { label: 'Sale', href: '/shop?badge=sale' },
]

export default function Navbar({ scrollY }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data: cartData } = trpc.cart.get.useQuery()

  const isScrolled = scrollY > 50

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#455848] text-white text-xs font-medium py-2 text-center tracking-wide">
        Free shipping on orders above ₹999 | Use code FIRST15 for 15% off
      </div>

      {/* Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#EDF2EF]/95 backdrop-blur-md shadow-sm'
            : 'bg-[#EDF2EF]'
        }`}
      >
        <div className="section-padding">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold tracking-tight text-[#2D2D2D]">
                Blooma <span className="text-[#455848]">Naturals</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-medium tracking-widest uppercase transition-colors ${
                    location.pathname === link.href
                      ? 'text-[#455848] border-b-2 border-[#455848] pb-0.5'
                      : 'text-[#2D2D2D] hover:text-[#455848]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1 hover:text-[#455848] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="relative group">
                <Link
                  to={user ? '/account' : '/login'}
                  className="p-1 hover:text-[#455848] transition-colors block"
                >
                  <User className="w-5 h-5" />
                </Link>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[150px]">
                  <div className="bg-white shadow-lg border border-[#E5E5E5] rounded-md py-2 flex flex-col">
                    {user ? (
                      <>
                        <Link to="/account" className="px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#EBE5D9] hover:text-[#455848] transition-colors">Profile</Link>
                        <Link to="/account/orders" className="px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#EBE5D9] hover:text-[#455848] transition-colors">Orders</Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#EBE5D9] hover:text-[#455848] transition-colors">Admin</Link>
                        )}
                        <button onClick={() => logout()} className="px-4 py-2 text-sm text-left text-red-600 hover:bg-[#EBE5D9] transition-colors border-t border-[#E5E5E5] mt-1 pt-2">Logout</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#EBE5D9] hover:text-[#455848] transition-colors">Login</Link>
                        <Link to="/register" className="px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#EBE5D9] hover:text-[#455848] transition-colors">Register</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="p-1 hover:text-[#455848] transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartData?.itemCount ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C59B53] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartData.itemCount}
                  </span>
                ) : null}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-1"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#EBE5D9] border-b border-[#E5E5E5] shadow-lg z-50">
            <div className="section-padding py-6">
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent border-b-2 border-[#2D2D2D] py-3 text-lg outline-none focus:border-[#455848] transition-colors placeholder:text-[#2D2D2D]/40"
                  autoFocus
                />
                <div className="flex gap-3 mt-4 flex-wrap">
                  <span className="text-xs text-[#2D2D2D]/50 uppercase tracking-wider">Popular:</span>
                  {['Face Wash', 'Hair Oil', 'Serum', 'Shampoo'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        navigate(`/shop?search=${encodeURIComponent(tag)}`)
                        setSearchOpen(false)
                      }}
                      className="text-xs text-[#455848] hover:text-[#2C3A30] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-[57px] bg-[#455848] z-40">
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link, i) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-white text-lg font-medium tracking-wide"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/quiz"
                onClick={() => setMobileOpen(false)}
                className="text-white text-lg font-medium tracking-wide mt-4 border-t border-white/20 pt-6"
              >
                AI Skin/Hair Quiz
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
