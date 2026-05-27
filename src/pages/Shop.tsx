import { useState } from 'react'
import { useSearchParams, useParams } from 'react-router'
import { SlidersHorizontal, X } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import ProductCard from '@/components/ProductCard'

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
]

const skinTypes = ['all', 'oily', 'dry', 'combination', 'sensitive']

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { category: urlCategory } = useParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const category = urlCategory || searchParams.get('category') || undefined
  const concern = searchParams.get('concern') || undefined
  const skinType = searchParams.get('skinType') || undefined
  const hairType = searchParams.get('hairType') || undefined
  const search = searchParams.get('search') || undefined
  const badge = searchParams.get('badge') || undefined
  const sort = (searchParams.get('sort') as any) || 'popular'
  const [priceRange, setPriceRange] = useState([0, 5000])

  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    category,
    concern,
    skinType,
    hairType,
    minPrice: priceRange[0] || undefined,
    maxPrice: priceRange[1] === 5000 ? undefined : priceRange[1],
    search,
    badge,
    sort,
    page: 1,
    limit: 24,
  })

  const { data: categoriesData } = trpc.category.list.useQuery()
  const { data: concernsData } = trpc.concern.list.useQuery()

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
    setPriceRange([0, 5000])
  }

  const hasFilters = category || concern || skinType || hairType || search || badge || priceRange[1] < 5000

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#EBE5D9] section-padding py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D]">
          {search ? `Search: "${search}"` : category ? categoriesData?.find(c => c.slug === category)?.name || 'Shop' : 'All Products'}
        </h1>
        <p className="text-sm text-[#2D2D2D]/60 mt-1">
          Showing {productsData?.items?.length ?? 0} of {productsData?.total ?? 0} products
        </p>
      </div>

      <div className="section-padding py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#C59B53] hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2D2D]/60 mb-3">Categories</h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateParam('category', undefined)}
                  className={`block text-sm w-full text-left ${!category ? 'text-[#455848] font-medium' : 'text-[#2D2D2D]/70 hover:text-[#455848]'}`}
                >
                  All Products
                </button>
                {categoriesData?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`block text-sm w-full text-left ${category === cat.slug ? 'text-[#455848] font-medium' : 'text-[#2D2D2D]/70 hover:text-[#455848]'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2D2D]/60 mb-3">Price Range</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">₹{priceRange[0]}</span>
                <span className="text-sm text-[#2D2D2D]/40">-</span>
                <span className="text-sm">₹{priceRange[1]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#455848]"
              />
            </div>

            {/* Concerns */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2D2D]/60 mb-3">Concerns</h4>
              <div className="space-y-2">
                {concernsData?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('concern', concern === c.slug ? undefined : c.slug)}
                    className={`block text-sm w-full text-left ${concern === c.slug ? 'text-[#455848] font-medium' : 'text-[#2D2D2D]/70 hover:text-[#455848]'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Type */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2D2D]/60 mb-3">Skin Type</h4>
              <div className="space-y-2">
                {skinTypes.map((st) => (
                  <button
                    key={st}
                    onClick={() => updateParam('skinType', skinType === st ? undefined : st)}
                    className={`block text-sm w-full text-left capitalize ${skinType === st ? 'text-[#455848] font-medium' : 'text-[#2D2D2D]/70 hover:text-[#455848]'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium border border-[#E5E5E5] px-4 py-2 rounded"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm border border-[#E5E5E5] rounded px-3 py-2 outline-none focus:border-[#455848] bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {category && (
                  <span className="text-xs bg-[#EDF2EF] px-3 py-1 rounded-full flex items-center gap-1">
                    {categoriesData?.find(c => c.slug === category)?.name}
                    <button onClick={() => updateParam('category', undefined)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {concern && (
                  <span className="text-xs bg-[#EDF2EF] px-3 py-1 rounded-full flex items-center gap-1">
                    {concernsData?.find(c => c.slug === concern)?.name}
                    <button onClick={() => updateParam('concern', undefined)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search && (
                  <span className="text-xs bg-[#EDF2EF] px-3 py-1 rounded-full flex items-center gap-1">
                    Search: {search}
                    <button onClick={() => updateParam('search', undefined)}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#EBE5D9] rounded-lg animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : productsData?.items?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-medium text-[#2D2D2D] mb-2">No products found</p>
                <p className="text-sm text-[#2D2D2D]/60 mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {productsData?.items?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setMobileFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categoriesData?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { updateParam('category', category === cat.slug ? undefined : cat.slug); setMobileFilters(false); }}
                      className={`text-sm px-3 py-1.5 rounded-full border ${category === cat.slug ? 'bg-[#455848] text-white border-[#455848]' : 'border-[#E5E5E5]'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Concerns</h4>
                <div className="flex flex-wrap gap-2">
                  {concernsData?.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { updateParam('concern', concern === c.slug ? undefined : c.slug); setMobileFilters(false); }}
                      className={`text-sm px-3 py-1.5 rounded-full border ${concern === c.slug ? 'bg-[#455848] text-white border-[#455848]' : 'border-[#E5E5E5]'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { clearFilters(); setMobileFilters(false); }} className="w-full btn-outline">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
