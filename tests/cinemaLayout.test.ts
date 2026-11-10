import assert from 'node:assert/strict'
import test from 'node:test'
import { cinemaLayout, findSeatById, getLogicalSeatPosition, getMapValidationIssues, locateSeat, seatToWorldPosition } from '../src/data/cinemaLayout.ts'
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
  assert.ok(Math.abs(a.seatPosition[2] - (-6.8)) < 1e-9)
  assert.ok(Math.abs(q.seatPosition[2] - (-6.8 + 16 * 0.95)) < 1e-9)
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
