import { Plane, Palmtree, Mountain, Tent, Gift, Sparkles, Briefcase, MapPin, type LucideIcon } from 'lucide-react'
import type { TripIconId } from '../types'

export const TRIP_ICONS: { id: TripIconId; icon: LucideIcon }[] = [
  { id: 'plane', icon: Plane },
  { id: 'palmtree', icon: Palmtree },
  { id: 'mountain', icon: Mountain },
  { id: 'tent', icon: Tent },
  { id: 'gift', icon: Gift },
  { id: 'sparkles', icon: Sparkles },
  { id: 'briefcase', icon: Briefcase },
  { id: 'mappin', icon: MapPin },
]

export const TRIP_ICON_MAP: Record<TripIconId, LucideIcon> = TRIP_ICONS.reduce(
  (map, t) => {
    map[t.id] = t.icon
    return map
  },
  {} as Record<TripIconId, LucideIcon>,
)
