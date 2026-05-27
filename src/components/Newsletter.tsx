import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      setEmail('')
    },
    onError: () => toast.error('Something went wrong'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    subscribe.mutate({ email })
  }

  return (
    <div className="bg-[#455848] section-padding py-16">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">
          Join the Blooma Naturals Family
        </h3>
        <p className="text-white/85 text-sm md:text-base mb-6">
          Subscribe for exclusive offers, Ayurvedic beauty tips, and early access to new products. Get 15% off your first order!
        </p>
        <form onSubmit={handleSubmit} className="flex gap-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-white/15 border-0 text-white placeholder:text-white/50 px-5 py-3.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-[#C59B53] text-white px-6 py-3.5 text-sm font-semibold hover:bg-white hover:text-[#C59B53] transition-colors"
          >
            Subscribe
          </button>
        </form>
        <p className="text-white/50 text-xs mt-3">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}
