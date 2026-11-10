export type SeatStatus = 'available' | 'occupied' | 'blocked' | 'pending'
export type SeatKind = 'standard' | 'accessible' | 'companion'
export type SeatShape = 'round' | 'square'

export interface CinemaSeatData {
  id: string
  rowId: string
  number: number | null
  logicalColumn: number
  logicalX: number
  logicalDepth: number
  status: SeatStatus
  kind: SeatKind
  shape: SeatShape
}

export interface CinemaRow {
  id: string
  label: string
  logicalDepth: number
  seats: CinemaSeatData[]
}

export interface CinemaLayout {
  id: string
  name: string
  roomType: 'conventional' | 'imax'
  rows: CinemaRow[]
  aisles: number[]
  emptyPositions: Array<{ rowId: string; seatNumber: number }>
  geometry: {
    seatSpacing: number
    firstRowZ: number
    rowSpacing: number
    rowRise: number
    centerSeatNumber: number
  }
}
