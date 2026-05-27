import { Link } from 'react-router'
import { Instagram, Facebook, Youtube, Leaf, Heart, Shield, MapPin } from 'lucide-react'
import Newsletter from './Newsletter'

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Skincare', href: '/shop/skincare' },
    { label: 'Haircare', href: '/shop/haircare' },
    { label: 'Gift Boxes', href: '/shop/gift-boxes' },
    { label: 'Value Bundles', href: '/shop/value-bundles' },
  ],
  help: [
    { label: 'Track Order', href: '/track-order' },
    { label: 'Shipping & Returns', href: '/shipping' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact Us', href: '/contact' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/story' },
    { label: 'Ingredients', href: '/ingredients' },
    { label: 'Blog', href: '/blog' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#2C3A30] text-white">
      {/* Newsletter */}
      <Newsletter />

      {/* Trust Badges */}
      <div className="border-t border-white/10 section-padding py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-2 text-center">
            <Leaf className="w-8 h-8 text-[#455848]" />
            <span className="text-sm font-semibold">100% Natural</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Heart className="w-8 h-8 text-[#455848]" />
            <span className="text-sm font-semibold">Cruelty-Free</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="w-8 h-8 text-[#455848]" />
            <span className="text-sm font-semibold">No Sulfates or Parabens</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <MapPin className="w-8 h-8 text-[#455848]" />
            <span className="text-sm font-semibold">Made in India</span>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-padding py-12 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-semibold tracking-tight">
              Blooma <span className="text-[#C59B53]">Naturals</span>
            </Link>
            <p className="text-sm text-white/60 mt-3">Ancient Wisdom, Modern Care</p>
            <div className="flex gap-4 mt-4">
              <Instagram className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="space-y-2 text-sm text-white/60">
              <p>WhatsApp: +91 62814 38959</p>
              <p>Email: hello@bloomanaturals.com</p>
              <p>Mon-Sat, 9 AM - 7 PM IST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 section-padding py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">© 2025 Blooma Naturals. All rights reserved.</p>
          <div className="flex items-center gap-4 opacity-60">
            <span className="text-xs">UPI</span>
            <span className="text-xs">Visa</span>
            <span className="text-xs">Mastercard</span>
            <span className="text-xs">RuPay</span>
            <span className="text-xs">Net Banking</span>
            <span className="text-xs">COD</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/916281438959"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </footer>
  )
}
