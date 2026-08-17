export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock"
export type OrderStatus = "Pending" | "Accepted" | "Preparing" | "Packed" | "Cancelled" | "Failed"
export type PayStatus = "Paid" | "Pending" | "Failed" | "Refunded"

export type Product = {
  id: string
  name: string
  category: string
  stock: number
  lowAt: number
  price: number
  available: boolean
}

export type Order = {
  id: string
  customer: string
  phone: string
  address: string
  items: { name: string; qty: number; price: number }[]
  payStatus: PayStatus
  status: OrderStatus
  date: string
}

export type Payment = {
  id: string
  txnId: string
  orderId: string
  customer: string
  amount: number
  method: string
  status: PayStatus
  refund?: "Initiated" | "Completed" | "None"
  date: string
}

export const initialProducts: Product[] = [
  { id: "P-001", name: "Monstera Deliciosa", category: "Indoor", stock: 42, lowAt: 10, price: 649, available: true },
  { id: "P-002", name: "Snake Plant", category: "Indoor", stock: 8, lowAt: 10, price: 349, available: true },
  { id: "P-003", name: "Peace Lily", category: "Indoor", stock: 25, lowAt: 8, price: 429, available: true },
  { id: "P-004", name: "Rose Bush (Red)", category: "Outdoor", stock: 0, lowAt: 5, price: 299, available: false },
  { id: "P-005", name: "Tulsi Plant", category: "Herbal", stock: 60, lowAt: 15, price: 149, available: true },
  { id: "P-006", name: "Areca Palm", category: "Indoor", stock: 4, lowAt: 6, price: 799, available: true },
  { id: "P-007", name: "Bougainvillea", category: "Outdoor", stock: 18, lowAt: 5, price: 379, available: true },
  { id: "P-008", name: "Jade Plant", category: "Succulent", stock: 2, lowAt: 5, price: 249, available: true },
  { id: "P-009", name: "Fiddle Leaf Fig", category: "Indoor", stock: 14, lowAt: 5, price: 899, available: true },
  { id: "P-010", name: "Aloe Vera", category: "Succulent", stock: 55, lowAt: 12, price: 199, available: true },
  { id: "P-011", name: "Lavender", category: "Herbal", stock: 30, lowAt: 8, price: 249, available: true },
  { id: "P-012", name: "Bird of Paradise", category: "Indoor", stock: 7, lowAt: 5, price: 1199, available: true },
  { id: "P-013", name: "Hibiscus (Pink)", category: "Outdoor", stock: 22, lowAt: 6, price: 329, available: true },
  { id: "P-014", name: "Cactus (Mixed)", category: "Succulent", stock: 3, lowAt: 8, price: 179, available: true },
  { id: "P-015", name: "Curry Leaf Plant", category: "Herbal", stock: 40, lowAt: 10, price: 169, available: true },
  { id: "P-016", name: "Pothos (Golden)", category: "Indoor", stock: 0, lowAt: 8, price: 279, available: false },
  { id: "P-017", name: "Ficus Benjamina", category: "Indoor", stock: 11, lowAt: 5, price: 749, available: true },
  { id: "P-018", name: "Marigold (Yellow)", category: "Outdoor", stock: 75, lowAt: 20, price: 99, available: true },
  { id: "P-019", name: "Lucky Bamboo", category: "Indoor", stock: 5, lowAt: 6, price: 449, available: true },
  { id: "P-020", name: "Water Lily", category: "Aquatic", stock: 0, lowAt: 4, price: 599, available: false },
]

export const initialOrders: Order[] = [
  {
    id: "ORD-1042",
    customer: "Priya Sharma",
    phone: "+91 98765 43210",
    address: "12 MG Road, Bengaluru",
    items: [
      { name: "Monstera Deliciosa", qty: 1, price: 649 },
      { name: "Tulsi Plant", qty: 2, price: 149 },
    ],
    payStatus: "Paid",
    status: "Pending",
    date: "2026-08-16",
  },
  {
    id: "ORD-1041",
    customer: "Rahul Verma",
    phone: "+91 91234 56780",
    address: "45 Park Street, Kolkata",
    items: [{ name: "Areca Palm", qty: 1, price: 799 }],
    payStatus: "Paid",
    status: "Preparing",
    date: "2026-08-16",
  },
  {
    id: "ORD-1040",
    customer: "Anita Desai",
    phone: "+91 99887 76655",
    address: "8 Juhu Lane, Mumbai",
    items: [
      { name: "Peace Lily", qty: 2, price: 429 },
      { name: "Jade Plant", qty: 1, price: 249 },
    ],
    payStatus: "Pending",
    status: "Accepted",
    date: "2026-08-15",
  },
  {
    id: "ORD-1039",
    customer: "Vikram Singh",
    phone: "+91 90909 80807",
    address: "23 Civil Lines, Jaipur",
    items: [{ name: "Snake Plant", qty: 3, price: 349 }],
    payStatus: "Paid",
    status: "Packed",
    date: "2026-08-15",
  },
  {
    id: "ORD-1038",
    customer: "Meena Iyer",
    phone: "+91 88776 65544",
    address: "5 Anna Nagar, Chennai",
    items: [{ name: "Rose Bush (Red)", qty: 2, price: 299 }],
    payStatus: "Failed",
    status: "Failed",
    date: "2026-08-14",
  },
  {
    id: "ORD-1037",
    customer: "Arjun Nair",
    phone: "+91 97531 24680",
    address: "17 Marine Drive, Kochi",
    items: [{ name: "Bougainvillea", qty: 1, price: 379 }],
    payStatus: "Refunded",
    status: "Cancelled",
    date: "2026-08-14",
  },
  {
    id: "ORD-1043",
    customer: "Deepa Menon",
    phone: "+91 94455 66778",
    address: "3 Rajaji Nagar, Bengaluru",
    items: [
      { name: "Fiddle Leaf Fig", qty: 1, price: 899 },
      { name: "Aloe Vera", qty: 2, price: 199 },
    ],
    payStatus: "Paid",
    status: "Pending",
    date: "2026-08-17",
  },
  {
    id: "ORD-1044",
    customer: "Suresh Pillai",
    phone: "+91 98001 23456",
    address: "7 Gandhi Road, Coimbatore",
    items: [{ name: "Bird of Paradise", qty: 1, price: 1199 }],
    payStatus: "Paid",
    status: "Accepted",
    date: "2026-08-17",
  },
  {
    id: "ORD-1045",
    customer: "Nisha Kapoor",
    phone: "+91 87654 32109",
    address: "22 Vasant Vihar, New Delhi",
    items: [
      { name: "Lavender", qty: 3, price: 249 },
      { name: "Marigold (Yellow)", qty: 5, price: 99 },
    ],
    payStatus: "Paid",
    status: "Preparing",
    date: "2026-08-17",
  },
  {
    id: "ORD-1046",
    customer: "Ravi Shankar",
    phone: "+91 91111 22334",
    address: "9 Banjara Hills, Hyderabad",
    items: [{ name: "Lucky Bamboo", qty: 2, price: 449 }],
    payStatus: "Pending",
    status: "Pending",
    date: "2026-08-16",
  },
  {
    id: "ORD-1047",
    customer: "Kavitha Reddy",
    phone: "+91 99345 67890",
    address: "14 Jubilee Hills, Hyderabad",
    items: [
      { name: "Ficus Benjamina", qty: 1, price: 749 },
      { name: "Curry Leaf Plant", qty: 2, price: 169 },
    ],
    payStatus: "Paid",
    status: "Packed",
    date: "2026-08-16",
  },
  {
    id: "ORD-1048",
    customer: "Amit Joshi",
    phone: "+91 96543 21098",
    address: "55 Shivaji Nagar, Pune",
    items: [{ name: "Cactus (Mixed)", qty: 4, price: 179 }],
    payStatus: "Paid",
    status: "Packed",
    date: "2026-08-15",
  },
  {
    id: "ORD-1049",
    customer: "Sunita Rao",
    phone: "+91 93322 11445",
    address: "11 Indiranagar, Bengaluru",
    items: [
      { name: "Hibiscus (Pink)", qty: 2, price: 329 },
      { name: "Aloe Vera", qty: 1, price: 199 },
    ],
    payStatus: "Failed",
    status: "Failed",
    date: "2026-08-15",
  },
  {
    id: "ORD-1050",
    customer: "Manoj Tiwari",
    phone: "+91 90012 34567",
    address: "6 Hazratganj, Lucknow",
    items: [{ name: "Fiddle Leaf Fig", qty: 1, price: 899 }],
    payStatus: "Paid",
    status: "Preparing",
    date: "2026-08-15",
  },
  {
    id: "ORD-1051",
    customer: "Pooja Bhatt",
    phone: "+91 88990 12345",
    address: "33 Andheri West, Mumbai",
    items: [
      { name: "Lavender", qty: 2, price: 249 },
      { name: "Marigold (Yellow)", qty: 3, price: 99 },
    ],
    payStatus: "Refunded",
    status: "Cancelled",
    date: "2026-08-14",
  },
  {
    id: "ORD-1052",
    customer: "Kiran Bedi",
    phone: "+91 97878 56789",
    address: "18 Connaught Place, New Delhi",
    items: [{ name: "Bird of Paradise", qty: 1, price: 1199 }],
    payStatus: "Paid",
    status: "Accepted",
    date: "2026-08-14",
  },
  {
    id: "ORD-1053",
    customer: "Gopal Das",
    phone: "+91 95555 44333",
    address: "2 Salt Lake, Kolkata",
    items: [
      { name: "Ficus Benjamina", qty: 1, price: 749 },
      { name: "Lucky Bamboo", qty: 1, price: 449 },
    ],
    payStatus: "Paid",
    status: "Pending",
    date: "2026-08-17",
  },
  {
    id: "ORD-1054",
    customer: "Rekha Nambiar",
    phone: "+91 92233 44556",
    address: "29 Kaloor, Kochi",
    items: [{ name: "Curry Leaf Plant", qty: 3, price: 169 }],
    payStatus: "Pending",
    status: "Pending",
    date: "2026-08-17",
  },
]

export const initialPayments: Payment[] = [
  { id: "PAY-501", txnId: "TXN9F3K2L8A", orderId: "ORD-1042", customer: "Priya Sharma", amount: 947, method: "UPI", status: "Paid", refund: "None", date: "2026-08-16" },
  { id: "PAY-500", txnId: "TXN7D2M1X4B", orderId: "ORD-1041", customer: "Rahul Verma", amount: 799, method: "Card", status: "Paid", refund: "None", date: "2026-08-16" },
  { id: "PAY-499", txnId: "TXN5C8N6V2C", orderId: "ORD-1040", customer: "Anita Desai", amount: 1107, method: "COD", status: "Pending", refund: "None", date: "2026-08-15" },
  { id: "PAY-498", txnId: "TXN3B4Q9W7D", orderId: "ORD-1039", customer: "Vikram Singh", amount: 1047, method: "UPI", status: "Paid", refund: "None", date: "2026-08-15" },
  { id: "PAY-497", txnId: "TXN1A6R5Y3E", orderId: "ORD-1038", customer: "Meena Iyer", amount: 598, method: "Card", status: "Failed", refund: "None", date: "2026-08-14" },
  { id: "PAY-496", txnId: "TXN8E7T4U1F", orderId: "ORD-1037", customer: "Arjun Nair", amount: 379, method: "UPI", status: "Refunded", refund: "Completed", date: "2026-08-14" },
  { id: "PAY-502", txnId: "TXNA1B2C3D4E", orderId: "ORD-1043", customer: "Deepa Menon", amount: 1297, method: "UPI", status: "Paid", refund: "None", date: "2026-08-17" },
  { id: "PAY-503", txnId: "TXNB5C6D7E8F", orderId: "ORD-1044", customer: "Suresh Pillai", amount: 1199, method: "Card", status: "Paid", refund: "None", date: "2026-08-17" },
  { id: "PAY-504", txnId: "TXNC9D0E1F2G", orderId: "ORD-1045", customer: "Nisha Kapoor", amount: 1242, method: "UPI", status: "Paid", refund: "None", date: "2026-08-17" },
  { id: "PAY-505", txnId: "TXND3E4F5G6H", orderId: "ORD-1046", customer: "Ravi Shankar", amount: 898, method: "COD", status: "Pending", refund: "None", date: "2026-08-16" },
  { id: "PAY-506", txnId: "TXNE7F8G9H0I", orderId: "ORD-1047", customer: "Kavitha Reddy", amount: 1087, method: "Card", status: "Paid", refund: "None", date: "2026-08-16" },
  { id: "PAY-507", txnId: "TXNF1G2H3I4J", orderId: "ORD-1048", customer: "Amit Joshi", amount: 716, method: "UPI", status: "Paid", refund: "None", date: "2026-08-15" },
  { id: "PAY-508", txnId: "TXNG5H6I7J8K", orderId: "ORD-1049", customer: "Sunita Rao", amount: 857, method: "Card", status: "Failed", refund: "None", date: "2026-08-15" },
  { id: "PAY-509", txnId: "TXNH9I0J1K2L", orderId: "ORD-1050", customer: "Manoj Tiwari", amount: 899, method: "UPI", status: "Paid", refund: "None", date: "2026-08-15" },
  { id: "PAY-510", txnId: "TXNI3J4K5L6M", orderId: "ORD-1051", customer: "Pooja Bhatt", amount: 795, method: "Card", status: "Refunded", refund: "Completed", date: "2026-08-14" },
  { id: "PAY-511", txnId: "TXNJ7K8L9M0N", orderId: "ORD-1052", customer: "Kiran Bedi", amount: 1199, method: "UPI", status: "Paid", refund: "None", date: "2026-08-14" },
  { id: "PAY-512", txnId: "TXNK1L2M3N4O", orderId: "ORD-1053", customer: "Gopal Das", amount: 1198, method: "COD", status: "Paid", refund: "None", date: "2026-08-17" },
  { id: "PAY-513", txnId: "TXNL5M6N7O8P", orderId: "ORD-1054", customer: "Rekha Nambiar", amount: 507, method: "UPI", status: "Pending", refund: "None", date: "2026-08-17" },
]

export function stockStatus(p: Product | { stock: number; lowAt: number }): StockStatus {
  if (p.stock === 0) return "Out of Stock"
  if (p.stock <= p.lowAt) return "Low Stock"
  return "In Stock"
}
