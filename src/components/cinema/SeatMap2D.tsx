import { useState } from 'react'
import { cinemaLayout, isAisleColumn } from '../../data/cinemaLayout'
import type { CinemaSeatData } from '../../types/cinema'

interface SeatMap2DProps {
  selectedSeats: string[]
  onToggleSeat: (seatId: string) => void
}

function seatLabel(seat: CinemaSeatData) {
  const label = seat.number === null ? `Assento da fileira ${seat.rowId}, número pendente de validação` : seat.id
  if (seat.status === 'blocked') return `${label}, bloqueado`
  if (seat.status === 'pending') return `${label}, pendente de validação`
  if (seat.status === 'occupied') return `${seat.id}, ocupado`
  return `${seat.id}, disponível`
}

export function SeatMap2D({ selectedSeats, onToggleSeat }: SeatMap2DProps) {
  const [mapZoom, setMapZoom] = useState(1)
  const rows = [...cinemaLayout.rows].reverse()
  return (
    <section className="map-panel" aria-label="Mapa demonstrativo de assentos">
      <div className="map-heading">
        <div><span className="eyebrow"><span className="eyebrow-line" /> MAPA DA SALA</span><h2>Mapa de assentos</h2><p>Selecione até dois lugares disponíveis.</p></div>
        <div className="map-tools"><span className="map-room-tag">SALA CONVENCIONAL</span><div className="map-zoom-controls" aria-label="Zoom do mapa"><button type="button" aria-label="Diminuir zoom do mapa" disabled={mapZoom <= 0.8} onClick={() => setMapZoom((zoom) => Math.max(0.8, Math.round((zoom - 0.1) * 10) / 10))}>−</button><span>{Math.round(mapZoom * 100)}%</span><button type="button" aria-label="Aumentar zoom do mapa" disabled={mapZoom >= 1.4} onClick={() => setMapZoom((zoom) => Math.min(1.4, Math.round((zoom + 0.1) * 10) / 10))}>+</button></div></div>
      </div>
      <div className="map-scroll" role="region" aria-label="Mapa de assentos, role horizontalmente em telas pequenas" tabIndex={0}>
        <div className="map-seating-area" style={{ zoom: mapZoom }}>
          <div className="seat-grid-head"><span>FILEIRA</span><span>ASSENTOS <small>· CORREDOR CENTRAL</small></span></div>
          <div className="seat-rows">
            {rows.map((row) => <div className="seat-map-row" key={row.id}>
              <span className="row-label">{row.label}</span>
              <div className="seat-grid" aria-label={`Fileira ${row.label}`}>
                {Array.from({ length: 27 }, (_, index) => {
                  const number = index + 1
                  const seat = row.seats.find((item) => item.logicalColumn === number)
                  if (!seat) return <span key={`${row.id}-gap-${number}`} className={`seat-gap${isAisleColumn(number) ? ' is-aisle' : ''}`} style={{ gridColumn: number }} aria-hidden="true" />
                  const selected = selectedSeats.includes(seat.id)
                  const unavailable = seat.status !== 'available' && !selected
                  return <button
                    key={seat.id}
                    type="button"
                    className={`seat-dot seat-${seat.status} seat-${seat.shape}${selected ? ' is-selected' : ''}${seat.kind === 'accessible' ? ' is-accessible' : ''}`}
                    style={{ gridColumn: number }}
                    disabled={unavailable}
                    aria-label={seatLabel(seat)}
                    aria-pressed={selected}
                    title={seatLabel(seat)}
                    onClick={() => onToggleSeat(seat.id)}
                  >
                    {seat.status === 'blocked' ? '⊘' : seat.status === 'occupied' ? '●' : seat.status === 'pending' ? '·' : seat.number}
                  </button>
                })}
              </div>
            </div>)}
          </div>
          <div className="screen-end"><span>TELA</span></div>
          <div className="map-key"><span><i className="key-available" /> Disponível</span><span><i className="key-selected" /> Selecionado</span><span><i className="key-occupied">●</i> Ocupado</span><span><i className="key-unavailable">⊘</i> Bloqueado</span><span><i className="key-pending">·</i> Pendente</span></div>
        </div>
      </div>
      <p className="map-disclaimer">Disposição demonstrativa. Assentos indisponíveis não podem ser selecionados.</p>
    </section>
  )
}
