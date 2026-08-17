"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Plus, Download, Search, Trash2, X } from "lucide-react"

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock"

export type Product = {
  id: string
  name: string
  category: string
  stock: number
  lowAt: number
  price: number
  available: boolean
  imageUrl?: string
}

export function stockStatusFromProduct(p: Product): StockStatus {
  if (p.stock === 0) return "Out of Stock"
  if (p.stock <= p.lowAt) return "Low Stock"
  return "In Stock"
}

const badge: Record<StockStatus, string> = {
  "In Stock": "bg-primary/15 text-primary",
  "Low Stock": "bg-accent/20 text-accent",
  "Out of Stock": "bg-destructive/15 text-destructive",
}

function ImageUploadCell({
  product,
  onUpdate,
}: {
  product: Product
  onUpdate: (id: string, patch: Partial<Product>) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("product_id", product.id)
      const res = await fetch("/api/storage/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.url) onUpdate(product.id, { imageUrl: json.url })
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-10 w-10 rounded-lg object-cover border border-border"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border bg-secondary text-muted-foreground text-xs">
          🪴
        </div>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <ImagePlus className="size-3" />
        )}
        {uploading ? "Uploading…" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

export function Inventory({
  products,
  onUpdate,
  onAddProduct,
  onDeleteProduct,
  autoOpenAddModal = false,
}: {
  products: Product[]
  onUpdate: (id: string, patch: Partial<Product>) => void
  onAddProduct?: (product: Omit<Product, "id">) => void
  onDeleteProduct?: (id: string) => void
  autoOpenAddModal?: boolean
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [showAddModal, setShowAddModal] = useState(autoOpenAddModal)

  // Form state for new product modal
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("Indoor")
  const [newPrice, setNewPrice] = useState("")
  const [newStock, setNewStock] = useState("")
  const [newLowAt, setNewLowAt] = useState("5")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ["All", "Indoor", "Outdoor", "Succulent", "Herbal", "Aquatic"]

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "All" || p.category === category
    return matchesSearch && matchesCategory
  })

  const lowItems = products.filter((p) => stockStatusFromProduct(p) !== "In Stock")

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID,Name,Category,Price (INR),Stock,Status,Available"]
    const rows = products.map(
      (p) => `"${p.id}","${p.name}","${p.category}",${p.price},${p.stock},"${stockStatusFromProduct(p)}",${p.available}`
    )
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `gogreen_inventory_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle Add Form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newPrice || !newStock) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          category: newCategory,
          price: Number(newPrice),
          stock: Number(newStock),
          low_at: Number(newLowAt) || 5,
        }),
      })
      const data = await res.json()
      if (data && onAddProduct) {
        onAddProduct({
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          lowAt: data.low_at ?? 5,
          available: true,
        })
      }
      setShowAddModal(false)
      setNewName("")
      setNewPrice("")
      setNewStock("")
    } catch (err) {
      console.error("Failed to create product", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plant from the inventory?")) return
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (onDeleteProduct) onDeleteProduct(id)
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plant or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Download className="size-3.5 text-primary" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="size-3.5" />
            Add New Plant
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary text-foreground hover:bg-primary/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Low Stock Alerts Banner */}
      {lowItems.length > 0 && (
        <div className="tilt-card rounded-xl border border-accent/30 bg-accent/10 p-4">
          <h3 className="mb-2 text-sm font-semibold text-accent">Low Stock Alerts ({lowItems.length})</h3>
          <div className="flex flex-wrap gap-2">
            {lowItems.map((p) => (
              <span key={p.id} className={`rounded-full px-3 py-1 text-xs font-medium ${badge[stockStatusFromProduct(p)]}`}>
                {p.name} — {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="tilt-card overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-4">Image</th>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock Update</th>
              <th className="p-4">Stock Status</th>
              <th className="p-4">Availability</th>
              <th className="p-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const s = stockStatusFromProduct(p)
              return (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <ImageUploadCell product={p} onUpdate={onUpdate} />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">{p.category}</td>
                  <td className="p-4 font-semibold text-foreground">{"Rs. "}{p.price}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease stock of ${p.name}`}
                        onClick={() => onUpdate(p.id, { stock: Math.max(0, p.stock - 1) })}
                        className="h-7 w-7 rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground font-semibold"
                      >
                        {"-"}
                      </button>
                      <span className="w-10 text-center font-semibold text-foreground">{p.stock}</span>
                      <button
                        type="button"
                        aria-label={`Increase stock of ${p.name}`}
                        onClick={() => onUpdate(p.id, { stock: p.stock + 1 })}
                        className="h-7 w-7 rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground font-semibold"
                      >
                        {"+"}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[s]}`}>{s}</span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => onUpdate(p.id, { available: !p.available })}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        p.available ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.available ? "Available" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      title="Delete plant"
                      onClick={() => handleDelete(p.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No plants found matching &quot;{search}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-bold text-foreground">Add New Plant to Catalog</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ficus Elastica"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="399"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="25"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low Alert Limit</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5"
                    value={newLowAt}
                    onChange={(e) => setNewLowAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  Create Plant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
