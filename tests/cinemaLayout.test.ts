import assert from 'node:assert/strict'
import test from 'node:test'
import { cinemaGeometry, cinemaLayout, diagnoseSeatVisibility, findSeatById, getLogicalSeatPosition, getMapValidationIssues, locateSeat, seatToWorldPosition } from '../src/data/cinemaLayout.ts'
import { toggleSeatSelection } from '../src/data/seatSelection.ts'

const allSeats = cinemaLayout.rows.flatMap((row) => row.seats)

test('the reconstructed map has unique IDs and rows A through Q', () => {
  const ids = allSeats.map((seat) => seat.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(cinemaLayout.rows.map((row) => row.label), [...'ABCDEFGHIJKLMNOPQ'])
  assert.deepEqual(getMapValidationIssues(), [])
  assert.equal(ids.length, 307)
  assert.equal(allSeats.filter((seat) => seat.status === 'occupied').length, 7)
  assert.equal(allSeats.filter((seat) => seat.status === 'blocked').length, 2)
  assert.equal(allSeats.filter((seat) => seat.number === null).length, 9)
})

test('row A is closest to the screen and Q is farthest away', () => {
  const a = locateSeat('A3')
  const q = locateSeat('Q27')
  assert.ok(a && q)
  assert.ok(a.seatPosition[2] < q.seatPosition[2])
  assert.ok(Math.abs(a.seatPosition[2] - cinemaGeometry.firstRowZ) < 1e-9)
  assert.ok(Math.abs(q.seatPosition[2] - (cinemaGeometry.firstRowZ + 16 * cinemaGeometry.rowSpacing)) < 1e-9)
})

test('K6 and K7 use the same world coordinates for the seat mesh and camera', () => {
  for (const id of ['K6', 'K7']) {
    const seat = findSeatById(id)
    const viewpoint = locateSeat(id)
    assert.ok(seat && viewpoint)
    assert.deepEqual(viewpoint.seatPosition, seatToWorldPosition(seat))
    const logicalPosition = getLogicalSeatPosition(id)
    assert.ok(logicalPosition)
    assert.equal(viewpoint.seatPosition[0], logicalPosition.x * cinemaLayout.geometry.seatSpacing)
  }
  assert.notDeepEqual(locateSeat('K6')?.eyePosition, locateSeat('K7')?.eyePosition)
})

test('seat selection adds, removes, caps at two, and rejects unavailable seats', () => {
  const unavailable = [
    { ...allSeats[0]!, id: 'X1', status: 'occupied' as const },
    { ...allSeats[0]!, id: 'X2', status: 'blocked' as const },
    { ...allSeats[0]!, id: 'X3', status: 'pending' as const },
  ]
  const seats = [...allSeats, ...unavailable]
  assert.deepEqual(toggleSeatSelection([], 'K6', seats), ['K6'])
  assert.deepEqual(toggleSeatSelection(['K6'], 'K7', seats), ['K6', 'K7'])
  assert.deepEqual(toggleSeatSelection(['K6', 'K7'], 'A3', seats), ['K6', 'K7'])
  assert.deepEqual(toggleSeatSelection(['K6', 'K7'], 'K6', seats), ['K7'])
  for (const id of ['X1', 'X2', 'X3', 'missing']) assert.deepEqual(toggleSeatSelection([], id, seats), [])
})

test('the unprinted center gap remains empty on divided rows', () => {
  const rowK = cinemaLayout.rows.find((row) => row.label === 'K')
  assert.ok(rowK)
  assert.equal(rowK.seats.some((seat) => seat.number === 14 || seat.number === 15), false)
  assert.equal(findSeatById('K6')?.logicalX, -8)
})

test('the viewpoint uses platform, cushion, eye height and a rearward head offset', () => {
  const viewpoint = locateSeat('K6')
  assert.ok(viewpoint)
  assert.equal(viewpoint.eyePosition[1], viewpoint.seatPosition[1] + cinemaGeometry.seatSurfaceHeight + cinemaGeometry.eyeHeightAboveSeat)
  assert.equal(viewpoint.eyePosition[2], viewpoint.seatPosition[2] + cinemaGeometry.eyeOffsetZ)
  assert.ok(viewpoint.eyePosition[2] > viewpoint.seatPosition[2] + cinemaGeometry.backOffsetZ + cinemaGeometry.backThickness / 2)
  assert.ok(cinemaGeometry.rowRise / cinemaGeometry.rowSpacing > 0.13)
  assert.ok(cinemaGeometry.seatSpacing > cinemaGeometry.armOffsetX * 2 + cinemaGeometry.armWidth)
  assert.ok(cinemaGeometry.seatDepth < cinemaGeometry.rowSpacing)
})

test('screen and room envelope fit the configured cinema volume', () => {
  const frameTop = cinemaGeometry.screenCenterY + (cinemaGeometry.screenHeight + cinemaGeometry.screenFrameGutter) / 2
  assert.ok(frameTop < cinemaGeometry.roomCeilingHeight)
  assert.ok(cinemaGeometry.screenWidth < cinemaGeometry.roomWidth)
  assert.equal(cinemaGeometry.firstRowZ - cinemaGeometry.screenZ, 5)
})

test('visibility diagnostics cover near, middle, far and lateral real seat IDs', () => {
  const ids = ['A6', 'F6', 'N16', 'N3', 'Q1']
  const reports = ids.map((id) => diagnoseSeatVisibility(id))
  assert.ok(reports.every((report) => report !== null))
  assert.ok(reports.every((report) => typeof report?.centerVisible === 'boolean' && typeof report.lowerScreenVisible === 'boolean'))
  assert.ok(reports.every((report) => report?.cameraIntersectsOwnSeat === false))
  assert.deepEqual(reports[0]?.centerBlockers, [])
  assert.deepEqual(reports[0]?.lowerScreenBlockers, [])
  assert.equal(reports[2]?.centerVisible, true)
  assert.equal(reports[2]?.lowerScreenVisible, true)
  assert.notEqual(locateSeat('N16')?.yaw, locateSeat('N3')?.yaw)
  assert.notEqual(locateSeat('N16')?.eyePosition[0], locateSeat('N3')?.eyePosition[0])
})
