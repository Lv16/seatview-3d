import type { CinemaLayout, CinemaSeatData, SeatKind, SeatShape, SeatStatus } from '../types/cinema'

/**
 * Seat list transcribed from the supplied desktop map. Missing seat numbers are
 * deliberately omitted. Icon-only occupied and blocked places keep a local
 * positional key and `number: null`; those keys are not claimed as provider IDs.
 */
const rowDefinitions: Array<{ label: string; seats: string[]; shape?: SeatShape; unlabelled?: Array<{ column: number; status: SeatStatus; kind: SeatKind }> }> = [
  { label: 'A', seats: range('A', 3, 13).concat(range('A', 16, 24)) },
  { label: 'B', seats: range('B', 3, 13).concat(range('B', 16, 24)) },
  { label: 'C', seats: range('C', 3, 13).concat(range('C', 16, 24)) },
  { label: 'D', shape: 'square', seats: ['D3', 'D5', 'D6', 'D7', 'D8', 'D10', 'D11', 'D13', 'D16', 'D17', 'D19', 'D20'] },
  { label: 'E', shape: 'square', seats: ['E3', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E13', 'E16', 'E17', 'E18', 'E19', 'E20'] },
  { label: 'F', shape: 'square', seats: ['F3', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F13', 'F16', 'F17', 'F18', 'F19', 'F20'] },
  { label: 'G', seats: range('G', 3, 11).concat(range('G', 13, 13), range('G', 16, 20)), unlabelled: [{ column: 12, status: 'blocked', kind: 'standard' }] },
  { label: 'H', seats: range('H', 3, 13).concat(range('H', 16, 20)) },
  { label: 'I', seats: range('I', 3, 12).concat(range('I', 16, 20)), unlabelled: [{ column: 13, status: 'occupied', kind: 'standard' }] },
  { label: 'J', seats: range('J', 3, 11).concat(range('J', 13, 13), range('J', 16, 20)), unlabelled: [{ column: 12, status: 'blocked', kind: 'standard' }] },
  { label: 'K', seats: range('K', 3, 13).concat(range('K', 18, 20)), unlabelled: [{ column: 16, status: 'occupied', kind: 'standard' }, { column: 17, status: 'occupied', kind: 'standard' }] },
  { label: 'L', seats: range('L', 3, 13).concat(range('L', 16, 24)) },
  { label: 'M', seats: range('M', 3, 11).concat(range('M', 16, 24)), unlabelled: [{ column: 12, status: 'occupied', kind: 'standard' }, { column: 13, status: 'occupied', kind: 'standard' }] },
  { label: 'N', seats: range('N', 3, 13).concat(range('N', 16, 24)) },
  { label: 'O', seats: range('O', 3, 13).concat(range('O', 16, 24)) },
  { label: 'P', seats: range('P', 3, 13).concat(range('P', 18, 24)), unlabelled: [{ column: 16, status: 'occupied', kind: 'standard' }, { column: 17, status: 'occupied', kind: 'standard' }] },
  { label: 'Q', seats: range('Q', 1, 27) },
]

function range(row: string, start: number, end: number): string[] {
  return Array.from({ length: end - start + 1 }, (_, index) => `${row}${start + index}`)
}

const defaultSeatState: { status: SeatStatus; kind: SeatKind } = { status: 'available', kind: 'standard' }

export const cinemaLayout: CinemaLayout = {
  id: 'kinoplex-nova-america-sala-6',
  name: 'Kinoplex Nova América · Sala 6',
  roomType: 'conventional',
  aisles: [-0.23, 0.69],
  emptyPositions: rowDefinitions.flatMap((definition) => {
    const numbers = definition.seats.map((id) => Number(id.slice(1)))
    const columns = [...numbers, ...(definition.unlabelled ?? []).map((seat) => seat.column)]
    const start = Math.min(...numbers)
    const end = Math.max(...numbers)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
      .filter((number) => !columns.includes(number))
      .map((seatNumber) => ({ rowId: definition.label, seatNumber }))
  }),
  geometry: { seatSpacing: 0.46, firstRowZ: -6.8, rowSpacing: 0.95, rowRise: 0.13, centerSeatNumber: 14 },
  rows: rowDefinitions.map((definition, index) => ({
    id: definition.label,
    label: definition.label,
    logicalDepth: index,
    seats: [...definition.seats.map((id) => {
      const seatNumber = Number(id.slice(1))
      return {
        id,
        rowId: definition.label,
        number: seatNumber,
        logicalColumn: seatNumber,
        logicalX: seatNumber - 14,
        logicalDepth: index,
        ...defaultSeatState,
        shape: definition.shape ?? 'round',
      }
    }), ...(definition.unlabelled ?? []).map((unknownSeat) => ({
      id: `${definition.label}?${unknownSeat.column}`,
      rowId: definition.label,
      number: null,
      logicalColumn: unknownSeat.column,
      logicalX: unknownSeat.column - 14,
      logicalDepth: index,
      ...unknownSeat,
      shape: definition.shape ?? 'round',
    }))],
  })),
}

export interface SeatViewpoint {
  seatId: string
  seatPosition: [number, number, number]
  eyePosition: [number, number, number]
  screenTarget: [number, number, number]
  yaw: number
  pitch: number
}

export const seatedEyeHeight = 1.52
export const screenCenter: [number, number, number] = [0, 4.05, -8.05]

export function findSeatById(seatId: string): CinemaSeatData | null {
  const normalized = seatId.replace(/[-\s]/g, '').toUpperCase()
  return cinemaLayout.rows.flatMap((row) => row.seats).find((seat) => seat.id.toUpperCase() === seatId.toUpperCase() || (seat.number !== null && seat.id.toUpperCase() === normalized)) ?? null
}

export function getLogicalSeatPosition(seatId: string): { x: number; depth: number } | null {
  const seat = findSeatById(seatId)
  return seat ? { x: seat.logicalX, depth: seat.logicalDepth } : null
}

export function seatToWorldPosition(seat: CinemaSeatData): [number, number, number] {
  const { seatSpacing, firstRowZ, rowSpacing, rowRise } = cinemaLayout.geometry
  return [
    seat.logicalX * seatSpacing,
    seat.logicalDepth * rowRise,
    firstRowZ + seat.logicalDepth * rowSpacing,
  ]
}

export function rowToWorldPosition(logicalDepth: number): [number, number, number] {
  const { firstRowZ, rowSpacing, rowRise } = cinemaLayout.geometry
  return [0, logicalDepth * rowRise, firstRowZ + logicalDepth * rowSpacing]
}

export function locateSeat(seatId: string, eyeHeight = seatedEyeHeight): SeatViewpoint | null {
  const seat = findSeatById(seatId)
  if (!seat) return null
  const position = seatToWorldPosition(seat)
  const eyePosition: [number, number, number] = [position[0], position[1] + eyeHeight, position[2] + 0.74]
  const dx = screenCenter[0] - eyePosition[0]
  const dy = screenCenter[1] - eyePosition[1]
  const dz = screenCenter[2] - eyePosition[2]
  return {
    seatId: seat.id,
    seatPosition: position,
    eyePosition,
    screenTarget: screenCenter,
    yaw: Math.atan2(-dx, -dz),
    pitch: Math.atan2(dy, Math.hypot(dx, dz)),
  }
}

export function isAisleColumn(column: number): boolean {
  return column === 14 || column === 15
}

export function getMapValidationIssues(): string[] {
  const ids = cinemaLayout.rows.flatMap((row) => row.seats.map((seat) => seat.id))
  const issues: string[] = []
  if (new Set(ids).size !== ids.length) issues.push('Duplicate seat IDs found.')
  const a = cinemaLayout.rows.find((row) => row.label === 'A')
  const q = cinemaLayout.rows.find((row) => row.label === 'Q')
  if (!a || !q || a.logicalDepth >= q.logicalDepth) issues.push('Rows A–Q must progress away from the screen.')
  return issues
}
