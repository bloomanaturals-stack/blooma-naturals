import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Link } from 'react-router'
import {
  Package, ShoppingCart, Users, Mail, TrendingUp,
  Search, ChevronLeft, ChevronRight, Eye, Plus, Trash2, Pencil
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
]

const statusColors: Record<string, string> = {
  pending: 'bg-[#C59B53]/10 text-[#C59B53]',
  processing: 'bg-[#455848]/10 text-[#455848]',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-[#6B8259]/10 text-[#6B8259]',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [productPage, setProductPage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [customerPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const { data: dashboard } = trpc.admin.getDashboard.useQuery(undefined, { enabled: activeTab === 'dashboard' })
  const { data: productsData } = trpc.admin.getProducts.useQuery(
    { page: productPage, limit: 10, search: productSearch || undefined },
    { enabled: activeTab === 'products' }
  )
  const { data: ordersData } = trpc.admin.getOrders.useQuery(
    { page: orderPage, limit: 10, status: orderStatus || undefined },
    { enabled: activeTab === 'orders' }
  )
  const { data: customersData } = trpc.admin.getCustomers.useQuery(
    { page: customerPage, limit: 10 },
    { enabled: activeTab === 'customers' }
  )
  const { data: newsletterData } = { data: { total: 0, items: [] } }

  const utils = trpc.useUtils()
  const updateOrderStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.getOrders.invalidate()
      toast.success('Order status updated')
    },
  })

  const createProductMutation = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      utils.admin.getProducts.invalidate()
      toast.success('Product created')
      setIsAddProductOpen(false)
    }
  })

  const updateProductMutation = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      utils.admin.getProducts.invalidate()
      toast.success('Product updated')
      setEditingProduct(null)
    }
  })

  const deleteProductMutation = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      utils.admin.getProducts.invalidate()
      toast.success('Product deleted')
    }
  })

  const uploadToCloudinary = async (file: File) => {
    if (!file || file.size === 0) return ''
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary config missing in .env')
    const uploadData = new FormData()
    uploadData.append("file", file)
    uploadData.append("upload_preset", uploadPreset)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: uploadData })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error?.message || "Failed to upload")
    }
    const data = await res.json()
    return data.secure_url
  }

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    let imageUrl = ''
    let imageUrl2 = ''
    let imageUrl3 = ''

    try {
      toast.info('Uploading images...')
      const file1 = formData.get('imageFile') as File
      const file2 = formData.get('imageFile2') as File
      const file3 = formData.get('imageFile3') as File
      if (file1?.size > 0) imageUrl = await uploadToCloudinary(file1)
      if (file2?.size > 0) imageUrl2 = await uploadToCloudinary(file2)
      if (file3?.size > 0) imageUrl3 = await uploadToCloudinary(file3)
    } catch (error: any) {
      console.error("Cloudinary upload error:", error)
      toast.error(`Failed to upload image: ${error.message}`)
      return
    }

    createProductMutation.mutate({
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      shortDescription: formData.get('shortDescription') as string,
      price: formData.get('price') as string,
      originalPrice: formData.get('originalPrice') as string,
      categoryId: Number(formData.get('categoryId')),
      stock: Number(formData.get('stock')),
      badge: (formData.get('badge') as any) || 'none',
      image: imageUrl || undefined,
      image2: imageUrl2 || undefined,
      image3: imageUrl3 || undefined,
    })
  }

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingProduct) return
    const formData = new FormData(e.currentTarget)
    
    let imageUrl = editingProduct.image
    let imageUrl2 = editingProduct.image2
    let imageUrl3 = editingProduct.image3

    try {
      const file1 = formData.get('imageFile') as File
      const file2 = formData.get('imageFile2') as File
      const file3 = formData.get('imageFile3') as File
      if (file1?.size > 0 || file2?.size > 0 || file3?.size > 0) {
        toast.info('Uploading new images...')
        if (file1?.size > 0) imageUrl = await uploadToCloudinary(file1)
        if (file2?.size > 0) imageUrl2 = await uploadToCloudinary(file2)
        if (file3?.size > 0) imageUrl3 = await uploadToCloudinary(file3)
      }
    } catch (error: any) {
      console.error("Cloudinary upload error:", error)
      toast.error(`Failed to upload image: ${error.message}`)
      return
    }

    updateProductMutation.mutate({
      id: editingProduct.id,
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      shortDescription: formData.get('shortDescription') as string,
      price: formData.get('price') as string,
      originalPrice: formData.get('originalPrice') as string,
      categoryId: Number(formData.get('categoryId')),
      stock: Number(formData.get('stock')),
      badge: (formData.get('badge') as any) || 'none',
      image: imageUrl || undefined,
      image2: imageUrl2 || undefined,
      image3: imageUrl3 || undefined,
    })
  }

  /*
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Please <Link to="/login" className="text-[#455848] underline">sign in</Link> to access admin</p>
      </div>
    )
  }
  */

  // For demo, allow all users to see admin
  // In production, check user.role === 'admin'

  return (
    <div className="min-h-screen bg-[#EBE5D9]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#2C3A30] min-h-screen text-white flex-shrink-0">
          <div className="p-6">
            <Link to="/" className="text-xl font-semibold">
              Blooma <span className="text-[#C59B53]">Naturals</span>
              <span className="text-xs font-normal ml-2 text-white/60">Admin</span>
            </Link>
          </div>
          <nav className="px-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${activeTab === item.id ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto p-6 border-t border-white/10">
            <Link to="/" className="text-sm text-white/60 hover:text-white flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Store
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && dashboard && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: 'Products', value: dashboard.totalProducts, icon: Package, color: 'bg-[#455848]', tab: 'products' },
                  { label: 'Orders', value: dashboard.totalOrders, icon: ShoppingCart, color: 'bg-[#C59B53]', tab: 'orders' },
                  { label: 'Revenue', value: `₹${(dashboard.totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'bg-[#6B8259]', tab: 'dashboard' },
                  { label: 'Customers', value: dashboard.totalUsers, icon: Users, color: 'bg-[#2C3A30]', tab: 'customers' },
                  { label: 'Subscribers', value: dashboard.totalSubscribers, icon: Mail, color: 'bg-[#455848]', tab: 'newsletter' },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => setActiveTab(stat.tab)}
                    className="bg-white rounded-xl p-5 text-left hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 w-full"
                  >
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-[#2D2D2D]/60 mt-1">{stat.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Products</h1>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/40" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                      placeholder="Search products..."
                      className="pl-9 pr-4 py-2 border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#455848] w-64"
                    />
                  </div>
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 bg-[#455848] hover:bg-[#6D8A7C] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input name="slug" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Price (₹)</Label>
                            <Input name="price" type="number" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Original Price (₹)</Label>
                            <Input name="originalPrice" type="number" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Category ID</Label>
                            <Input name="categoryId" type="number" defaultValue="1" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input name="stock" type="number" defaultValue="100" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Badge</Label>
                            <select name="badge" className="w-full border rounded-md p-2 text-sm">
                              <option value="none">None</option>
                              <option value="new">New</option>
                              <option value="bestseller">Bestseller</option>
                              <option value="sale">Sale</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Product Image 1 (Main)</Label>
                            <Input name="imageFile" type="file" accept="image/*" />
                          </div>
                          <div className="space-y-2">
                            <Label>Product Image 2</Label>
                            <Input name="imageFile2" type="file" accept="image/*" />
                          </div>
                          <div className="space-y-2">
                            <Label>Product Image 3</Label>
                            <Input name="imageFile3" type="file" accept="image/*" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Short Description</Label>
                          <Input name="shortDescription" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Full Description</Label>
                          <textarea name="description" className="w-full border rounded-md p-2 text-sm h-24" required></textarea>
                        </div>
                        <button type="submit" disabled={createProductMutation.isPending} className="w-full bg-[#455848] text-white p-2 rounded-md hover:bg-[#6D8A7C]">
                          {createProductMutation.isPending ? 'Saving...' : 'Save Product'}
                        </button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Product Dialog */}
                  <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                      </DialogHeader>
                      {editingProduct && (
                        <form onSubmit={handleEditProduct} className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Product Name</Label>
                              <Input name="name" defaultValue={editingProduct.name} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Slug</Label>
                              <Input name="slug" defaultValue={editingProduct.slug} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Price (₹)</Label>
                              <Input name="price" type="number" defaultValue={editingProduct.price} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Original Price (₹)</Label>
                              <Input name="originalPrice" type="number" defaultValue={editingProduct.originalPrice} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Category ID</Label>
                              <Input name="categoryId" type="number" defaultValue={editingProduct.categoryId} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Stock</Label>
                              <Input name="stock" type="number" defaultValue={editingProduct.stock} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Badge</Label>
                              <select name="badge" defaultValue={editingProduct.badge || 'none'} className="w-full border rounded-md p-2 text-sm">
                                <option value="none">None</option>
                                <option value="new">New</option>
                                <option value="bestseller">Bestseller</option>
                                <option value="sale">Sale</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label>Product Image 1 (Main)</Label>
                              <Input name="imageFile" type="file" accept="image/*" />
                              <p className="text-xs text-gray-500">Leave blank to keep current</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Product Image 2</Label>
                              <Input name="imageFile2" type="file" accept="image/*" />
                              <p className="text-xs text-gray-500">Leave blank to keep current</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Product Image 3</Label>
                              <Input name="imageFile3" type="file" accept="image/*" />
                              <p className="text-xs text-gray-500">Leave blank to keep current</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Short Description</Label>
                            <Input name="shortDescription" defaultValue={editingProduct.shortDescription} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Full Description</Label>
                            <textarea name="description" defaultValue={editingProduct.description} className="w-full border rounded-md p-2 text-sm h-24" required></textarea>
                          </div>
                          <button type="submit" disabled={updateProductMutation.isPending} className="w-full bg-[#455848] text-white p-2 rounded-md hover:bg-[#6D8A7C]">
                            {updateProductMutation.isPending ? 'Saving...' : 'Update Product'}
                          </button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5E5]">
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Product</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Category</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Price</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Stock</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Status</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData?.items?.map((product) => (
                      <tr key={product.id} className="border-b border-[#EBE5D9] hover:bg-[#EBE5D9]/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image ?? ''} alt={product.name} className="w-10 h-10 object-cover rounded" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">{product.category?.name}</td>
                        <td className="px-5 py-3">₹{product.price}</td>
                        <td className="px-5 py-3">{product.stock}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${product.isActive ? 'bg-[#6B8259]/10 text-[#6B8259]' : 'bg-red-100 text-red-700'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <Link to={`/product/${product.slug}`} className="p-1 hover:text-[#455848]"><Eye className="w-4 h-4" /></Link>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-1 text-blue-500 hover:text-blue-700"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                  deleteProductMutation.mutate({ id: product.id })
                                }
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productsData && productsData.total > 10 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E5E5]">
                    <button
                      onClick={() => setProductPage(Math.max(1, productPage - 1))}
                      disabled={productPage === 1}
                      className="text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-xs text-[#2D2D2D]/50">Page {productPage} of {Math.ceil(productsData.total / 10)}</span>
                    <button
                      onClick={() => setProductPage(productPage + 1)}
                      disabled={productPage * 10 >= productsData.total}
                      className="text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <select
                  value={orderStatus}
                  onChange={(e) => { setOrderStatus(e.target.value || ''); setOrderPage(1); }}
                  className="border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#455848]"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5E5]">
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Order</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Items</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Total</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Status</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Date</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData?.items?.map((order) => (
                      <tr key={order.id} className="border-b border-[#EBE5D9] hover:bg-[#EBE5D9]/50">
                        <td className="px-5 py-3 font-medium">{order.orderNumber}</td>
                        <td className="px-5 py-3">{order.items?.length ?? 0} items</td>
                        <td className="px-5 py-3">₹{order.total}</td>
                        <td className="px-5 py-3">
                          <select
                            value={order.status ?? 'pending'}
                            onChange={(e) => updateOrderStatus.mutate({ id: order.id, status: e.target.value as any })}
                            className={`text-xs px-2 py-1 rounded-full border-0 outline-none ${statusColors[order.status ?? 'pending'] || ''}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#2D2D2D]/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => setSelectedOrder(order)} className="p-1 hover:text-[#455848]"><Eye className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print-area">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between pr-6">
                      <span>Order Details - {selectedOrder?.orderNumber}</span>
                      <button onClick={() => window.print()} className="print-hidden text-sm bg-[#455848] hover:bg-[#6D8A7C] text-white px-4 py-1.5 rounded-md transition-colors font-normal flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                      </button>
                    </DialogTitle>
                  </DialogHeader>
                  {selectedOrder && (
                    <div className="space-y-6 mt-4">
                      <div className="flex justify-between items-start bg-[#EBE5D9] p-4 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold">Customer</p>
                          <p className="text-sm text-[#2D2D2D]/70">{selectedOrder.shippingAddress?.name}</p>
                          <p className="text-sm text-[#2D2D2D]/70">{selectedOrder.shippingAddress?.phone}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 border-b pb-2">Items</h3>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-xs text-[#2D2D2D]/50">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                              </div>
                              <p className="font-semibold">₹{item.total}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-[#2D2D2D]/60"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                        <div className="flex justify-between text-[#2D2D2D]/60"><span>Discount</span><span>-₹{selectedOrder.discount}</span></div>
                        <div className="flex justify-between text-[#2D2D2D]/60"><span>Shipping</span><span>₹{selectedOrder.shipping}</span></div>
                        <div className="flex justify-between font-semibold text-base pt-2 border-t"><span>Total</span><span>₹{selectedOrder.total}</span></div>
                      </div>

                      <div className="bg-[#FAFAFA] p-4 rounded-lg text-sm border">
                        <p className="font-semibold mb-2">Shipping Address</p>
                        <p className="text-[#2D2D2D]/70">{selectedOrder.shippingAddress?.addressLine1}</p>
                        {selectedOrder.shippingAddress?.addressLine2 && <p className="text-[#2D2D2D]/70">{selectedOrder.shippingAddress?.addressLine2}</p>}
                        <p className="text-[#2D2D2D]/70">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                        <p className="mt-3 font-semibold">Payment Method: <span className="font-normal text-[#2D2D2D]/70 uppercase">{selectedOrder.paymentMethod}</span></p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">Customers</h1>
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5E5]">
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Name</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Email</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Role</th>
                      <th className="text-left px-5 py-3 font-medium text-[#2D2D2D]/60">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersData?.items?.map((customer) => (
                      <tr key={customer.id} className="border-b border-[#EBE5D9]">
                        <td className="px-5 py-3 font-medium">{customer.name || '—'}</td>
                        <td className="px-5 py-3">{customer.email || '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${customer.role === 'admin' ? 'bg-[#C59B53]/10 text-[#C59B53]' : 'bg-[#455848]/10 text-[#455848]'}`}>
                            {customer.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#2D2D2D]/50">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Newsletter */}
          {activeTab === 'newsletter' && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">Newsletter Subscribers</h1>
              <div className="bg-white rounded-xl p-6">
                <p className="text-sm text-[#2D2D2D]/60">
                  Total subscribers: {newsletterData?.total ?? 0}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
