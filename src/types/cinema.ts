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
    seatWidth: number
    seatDepth: number
    seatThickness: number
    seatSurfaceHeight: number
    backWidth: number
    backHeight: number
    backThickness: number
    backOffsetY: number
    backOffsetZ: number
    armWidth: number
    armSupportWidth: number
    armSupportDepth: number
    armPadHeight: number
    armDepth: number
    armHeight: number
    armOffsetX: number
    armCenterY: number
    baseColumnRadius: number
    baseColumnHeight: number
    baseColumnZOffset: number
    baseFootWidth: number
    baseFootHeight: number
    baseFootDepth: number
    baseFootZOffset: number
    eyeHeightAboveSeat: number
    eyeOffsetZ: number
    screenCenterY: number
    screenZ: number
    screenWidth: number
    screenHeight: number
    screenFrameGutter: number
    screenFrameDepth: number
    screenFaceOffsetZ: number
    screenGlowInset: number
    screenLightOffsetZ: number
    roomWidth: number
    roomFrontZ: number
    roomBackMargin: number
    roomFloorThickness: number
    roomCeilingHeight: number
    roomWallThickness: number
    aisleMarkerWidth: number
    aisleMarkerHeight: number
    aisleMarkerInset: number
  }
}
