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

/**
 * Illustrative conventional-auditorium dimensions in metres. World axes:
 * +X is the viewer's right, +Y is up, and +Z points from screen to rear.
 * Each seat origin is the top of its row platform at floor level. The screen
 * faces the seats at negative Z. Row rise/spacing gives an ~8 degree rake.
 */
export const cinemaGeometry: CinemaLayout['geometry'] = {
  seatSpacing: 0.56,
  firstRowZ: -3.1,
  rowSpacing: 1.12,
  rowRise: 0.16,
  centerSeatNumber: 14,
  seatWidth: 0.43,
  seatDepth: 0.54,
  seatThickness: 0.14,
  seatSurfaceHeight: 0.55,
  // The rendered back is 0.46 m wide before bevels and ~0.80 m tall
  // including its upholstery. Keep the layout bounds aligned with that mesh.
  backWidth: 0.51,
  backHeight: 0.80,
  backThickness: 0.14,
  backOffsetY: 0.93,
  backOffsetZ: 0.22,
  armWidth: 0.09,
  armSupportWidth: 0.065,
  armSupportDepth: 0.1,
  armPadHeight: 0.07,
  armDepth: 0.52,
  armHeight: 0.24,
  armOffsetX: 0.215,
  armCenterY: 0.68,
  baseColumnRadius: 0.055,
  baseColumnHeight: 0.41,
  baseColumnZOffset: -0.04,
  baseFootWidth: 0.34,
  baseFootHeight: 0.07,
  baseFootDepth: 0.34,
  baseFootZOffset: -0.04,
  // Seated eye position: slightly above the cushion and just behind the
  // upholstered back, leaving realistic clearance without lifting the camera.
  eyeHeightAboveSeat: 0.84,
  eyeOffsetZ: 0.34,
  screenCenterY: 3.65,
  screenZ: -8.1,
  screenWidth: 13.5,
  screenHeight: 5.65,
  screenFrameGutter: 0.34,
  screenFrameDepth: 0.3,
  screenFaceOffsetZ: 0.17,
  screenGlowInset: 0.26,
  screenLightOffsetZ: 1.1,
  roomWidth: 19.2,
  roomFrontZ: -8.65,
  roomBackMargin: 0.8,
  roomFloorThickness: 0.36,
  roomCeilingHeight: 7.3,
  roomWallThickness: 0.3,
  aisleMarkerWidth: 0.025,
  aisleMarkerHeight: 0.012,
  aisleMarkerInset: 0.06,
}

export const cinemaLayout: CinemaLayout = {
  id: 'kinoplex-nova-america-sala-6',
  name: 'Kinoplex Nova América · Sala 6',
  roomType: 'conventional',
  aisles: [
    (13.5 - cinemaGeometry.centerSeatNumber) * cinemaGeometry.seatSpacing,
    (15.5 - cinemaGeometry.centerSeatNumber) * cinemaGeometry.seatSpacing,
  ],
  emptyPositions: rowDefinitions.flatMap((definition) => {
    const numbers = definition.seats.map((id) => Number(id.slice(1)))
    const columns = [...numbers, ...(definition.unlabelled ?? []).map((seat) => seat.column)]
    const start = Math.min(...numbers)
    const end = Math.max(...numbers)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
      .filter((number) => !columns.includes(number))
      .map((seatNumber) => ({ rowId: definition.label, seatNumber }))
  }),
  geometry: cinemaGeometry,
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

// Height is measured above the cushion's upper surface, not above the floor.
export const seatedEyeHeight = cinemaLayout.geometry.eyeHeightAboveSeat
export const screenCenter: [number, number, number] = [
  0,
  cinemaLayout.geometry.screenCenterY,
  cinemaLayout.geometry.screenZ,
]

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

export function rowPlatformTop(logicalDepth: number): number {
  return logicalDepth * cinemaLayout.geometry.rowRise
}

export function rowToWorldPosition(logicalDepth: number): [number, number, number] {
  const { firstRowZ, rowSpacing } = cinemaLayout.geometry
  return [0, rowPlatformTop(logicalDepth), firstRowZ + logicalDepth * rowSpacing]
}

export function locateSeat(seatId: string, eyeHeightAboveSeat = seatedEyeHeight): SeatViewpoint | null {
  const seat = findSeatById(seatId)
  if (!seat) return null
  const position = seatToWorldPosition(seat)
  const { seatSurfaceHeight, eyeOffsetZ } = cinemaLayout.geometry
  const eyePosition: [number, number, number] = [
    position[0],
    position[1] + seatSurfaceHeight + eyeHeightAboveSeat,
    position[2] + eyeOffsetZ,
  ]
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

export interface SeatVisibilityDiagnostics {
  seatId: string
  cameraIntersectsOwnSeat: boolean
  centerVisible: boolean
  lowerScreenVisible: boolean
  centerBlockers: string[]
  lowerScreenBlockers: string[]
}

/** Approximate sightline test against modeled chair backs and the selected chair. */
export function diagnoseSeatVisibility(seatId: string): SeatVisibilityDiagnostics | null {
  const seat = findSeatById(seatId)
  const viewpoint = locateSeat(seatId)
  if (!seat || !viewpoint) return null
  const { screenHeight, screenCenterY, screenZ, backWidth, backHeight, backThickness, backOffsetY, backOffsetZ } = cinemaLayout.geometry
  const lowerTargetY = screenCenterY - screenHeight / 2
  const ownBack = {
    min: [viewpoint.seatPosition[0] - backWidth / 2, viewpoint.seatPosition[1] + backOffsetY - backHeight / 2, viewpoint.seatPosition[2] + backOffsetZ - backThickness / 2] as [number, number, number],
    max: [viewpoint.seatPosition[0] + backWidth / 2, viewpoint.seatPosition[1] + backOffsetY + backHeight / 2, viewpoint.seatPosition[2] + backOffsetZ + backThickness / 2] as [number, number, number],
  }
  const ownCushion = {
    min: [viewpoint.seatPosition[0] - cinemaGeometry.seatWidth * 1.04 / 2, viewpoint.seatPosition[1] + cinemaGeometry.seatSurfaceHeight - cinemaGeometry.seatThickness * 1.12, viewpoint.seatPosition[2] - cinemaGeometry.seatDepth * 0.96 / 2] as [number, number, number],
    max: [viewpoint.seatPosition[0] + cinemaGeometry.seatWidth * 1.04 / 2, viewpoint.seatPosition[1] + cinemaGeometry.seatSurfaceHeight, viewpoint.seatPosition[2] + cinemaGeometry.seatDepth * 0.96 / 2] as [number, number, number],
  }
  const armTop = cinemaGeometry.armCenterY + cinemaGeometry.armHeight / 2 + cinemaGeometry.armPadHeight
  const ownArms = [-1, 1].map((side) => ({
    min: [viewpoint.seatPosition[0] + side * cinemaGeometry.armOffsetX - cinemaGeometry.armWidth / 2, viewpoint.seatPosition[1] + cinemaGeometry.seatSurfaceHeight, viewpoint.seatPosition[2] - cinemaGeometry.armDepth * 0.9 / 2] as [number, number, number],
    max: [viewpoint.seatPosition[0] + side * cinemaGeometry.armOffsetX + cinemaGeometry.armWidth / 2, viewpoint.seatPosition[1] + armTop, viewpoint.seatPosition[2] + cinemaGeometry.armDepth * 0.9 / 2] as [number, number, number],
  }))
  const blockersFor = (target: [number, number, number]) => cinemaLayout.rows
    .filter((row) => row.logicalDepth < seat.logicalDepth)
    .flatMap((row) => row.seats
      .filter((candidate) => {
        const [x, y, z] = seatToWorldPosition(candidate)
        return segmentIntersectsBox(viewpoint.eyePosition, target, {
          min: [x - backWidth / 2, y + backOffsetY - backHeight / 2, z + backOffsetZ - backThickness / 2],
          max: [x + backWidth / 2, y + backOffsetY + backHeight / 2, z + backOffsetZ + backThickness / 2],
        })
      })
      .map((candidate) => candidate.id))
  const centerBlockers = blockersFor([0, screenCenterY, screenZ])
  const lowerScreenBlockers = blockersFor([0, lowerTargetY, screenZ])
  return {
    seatId: seat.id,
    cameraIntersectsOwnSeat: [ownBack, ownCushion, ...ownArms].some((box) => pointInsideBox(viewpoint.eyePosition, box)),
    centerVisible: centerBlockers.length === 0,
    lowerScreenVisible: lowerScreenBlockers.length === 0,
    centerBlockers,
    lowerScreenBlockers,
  }
}

function pointInsideBox(point: [number, number, number], box: { min: [number, number, number]; max: [number, number, number] }): boolean {
  return point.every((value, axis) => value >= box.min[axis]! && value <= box.max[axis]!)
}

function segmentIntersectsBox(
  start: [number, number, number],
  end: [number, number, number],
  box: { min: [number, number, number]; max: [number, number, number] },
): boolean {
  let tMin = 0
  let tMax = 1
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = end[axis]! - start[axis]!
    if (Math.abs(delta) < 1e-9) {
      if (start[axis]! < box.min[axis]! || start[axis]! > box.max[axis]!) return false
      continue
    }
    const inverse = 1 / delta
    let near = (box.min[axis]! - start[axis]!) * inverse
    let far = (box.max[axis]! - start[axis]!) * inverse
    if (near > far) [near, far] = [far, near]
    tMin = Math.max(tMin, near)
    tMax = Math.min(tMax, far)
    if (tMin > tMax) return false
  }
  return tMax >= 0 && tMin <= 1
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
