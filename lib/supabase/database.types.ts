// lib/supabase/database.types.ts
// TypeScript types matching the PostgreSQL schema in supabase/migrations/001_init.sql
// Keep this in sync whenever you modify the DB schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          stock: number
          low_at: number
          available: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          stock?: number
          low_at?: number
          available?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          stock?: number
          low_at?: number
          available?: boolean
          image_url?: string | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer: string
          phone: string | null
          address: string | null
          pay_status: "Paid" | "Pending" | "Failed" | "Refunded"
          status: "Pending" | "Accepted" | "Preparing" | "Packed" | "Cancelled" | "Failed"
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer: string
          phone?: string | null
          address?: string | null
          pay_status?: "Paid" | "Pending" | "Failed" | "Refunded"
          status?: "Pending" | "Accepted" | "Preparing" | "Packed" | "Cancelled" | "Failed"
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          customer?: string
          phone?: string | null
          address?: string | null
          pay_status?: "Paid" | "Pending" | "Failed" | "Refunded"
          status?: "Pending" | "Accepted" | "Preparing" | "Packed" | "Cancelled" | "Failed"
          date?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_name: string
          qty: number
          price: number
        }
        Insert: {
          id?: number
          order_id: string
          product_name: string
          qty: number
          price: number
        }
        Update: {
          product_name?: string
          qty?: number
          price?: number
        }
      }
      payments: {
        Row: {
          id: string
          txn_id: string
          order_id: string | null
          customer: string
          amount: number
          method: string
          status: "Paid" | "Pending" | "Failed" | "Refunded"
          refund: "None" | "Initiated" | "Completed"
          date: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          txn_id: string
          order_id?: string | null
          customer: string
          amount: number
          method?: string
          status?: "Paid" | "Pending" | "Failed" | "Refunded"
          refund?: "None" | "Initiated" | "Completed"
          date?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
        }
        Update: {
          status?: "Paid" | "Pending" | "Failed" | "Refunded"
          refund?: "None" | "Initiated" | "Completed"
          razorpay_payment_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}

// Convenience row types
export type ProductRow = Database["public"]["Tables"]["products"]["Row"]
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"]
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"]

// Order with items joined
export type OrderWithItems = OrderRow & { items: OrderItemRow[] }
