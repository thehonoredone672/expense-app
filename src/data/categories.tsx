import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  ShoppingCart,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '../types'

export interface CategoryDef {
  id: CategoryId
  label: string
  icon: LucideIcon
  color: string
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'food', label: 'Food', icon: Utensils, color: '#f97316' },
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart, color: '#22c55e' },
  { id: 'transport', label: 'Transport', icon: Car, color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
  { id: 'bills', label: 'Bills', icon: Receipt, color: '#eab308' },
  { id: 'entertainment', label: 'Fun', icon: Film, color: '#a855f7' },
  { id: 'health', label: 'Health', icon: HeartPulse, color: '#ef4444' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: '#64748b' },
]

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = CATEGORIES.reduce(
  (map, cat) => {
    map[cat.id] = cat
    return map
  },
  {} as Record<CategoryId, CategoryDef>,
)
