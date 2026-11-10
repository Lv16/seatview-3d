import type { CinemaSeatData } from '../types/cinema'

export function toggleSeatSelection(
  selected: string[],
  seatId: string,
  seats: CinemaSeatData[],
  maxSeats = 2,
): string[] {
  if (selected.includes(seatId)) return selected.filter((id) => id !== seatId)
  const seat = seats.find((item) => item.id === seatId)
  if (!seat || seat.status !== 'available' || selected.length >= maxSeats) return selected
  return [...selected, seatId]
}
