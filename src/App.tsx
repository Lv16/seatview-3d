import { useState } from 'react'
import CinemaScene from './components/cinema/CinemaScene'
import { SeatMap2D } from './components/cinema/SeatMap2D'
import { cinemaLayout, getMapValidationIssues, locateSeat } from './data/cinemaLayout'
import { toggleSeatSelection } from './data/seatSelection'
import './App.css'

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
}

function App() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [mode, setMode] = useState<'map' | '3d'>('map')
  const [viewingSeat, setViewingSeat] = useState<string | null>(null)
  const [centerRequest, setCenterRequest] = useState(0)
  const seats = cinemaLayout.rows.flatMap((row) => row.seats)
  const occupied = seats.filter((seat) => seat.status === 'occupied').length

  const toggleSeat = (seatId: string) => setSelectedSeats((current) => toggleSeatSelection(current, seatId, seats))

  const openPerspective = (seatId: string | null) => {
    if (seatId && !locateSeat(seatId)) return
    setViewingSeat(seatId)
    setMode('3d')
  }

  const issues = getMapValidationIssues()

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="SeatView 3D início"><Mark /><span>seatview<span className="brand-accent">3D</span></span></a>
        <div className="topbar-note"><span className="status-dot" /> VISUALIZAÇÃO INTERATIVA</div>
        <button className="profile-button" aria-label="Perfil">NV</button>
      </header>

      <section className="experience" id="top">
        <div className="intro-row">
          <div><div className="eyebrow"><span className="eyebrow-line" /> {mode === 'map' ? 'MAPA RECONSTRUÍDO · PRÉVIA LOCAL' : 'PRÉ-VISUALIZAÇÃO DA SALA'}</div><h1>{mode === 'map' ? <>Escolha seu lugar.<br /><em>Explore a perspectiva.</em></> : <>Veja o cinema <em>de outro ângulo.</em></>}</h1><p className="intro-copy">{mode === 'map' ? 'Selecione um ou dois assentos no mapa para ver a sala a partir deles.' : 'Explore a sala e confira a perspectiva dos lugares selecionados.'}</p></div>
          <div className="room-chip"><span className="screen-icon">▱</span><span><strong>{cinemaLayout.name}</strong><small>SALA CONVENCIONAL · MAPA SIMULADO</small></span><span className="chip-chevron">⌄</span></div>
        </div>

        {mode === 'map' ? <div className="selection-layout">
          <SeatMap2D selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />
          <aside className="selection-panel">
            <div><span className="summary-kicker">SEUS ASSENTOS</span><h2>{selectedSeats.length} <small>/ 2 selecionados</small></h2></div>
            <div className="selected-list">{selectedSeats.length ? selectedSeats.map((id) => <div className="selected-seat-row" key={id}><span className="selected-seat-dot">{id}</span><span><strong>Assento {id}</strong><small>Posição reconhecida no mapa 3D</small></span><button aria-label={`Remover ${id}`} onClick={() => toggleSeat(id)}>×</button></div>) : <p className="selection-empty">Toque em um assento disponível no mapa para começar.</p>}</div>
            <button className="next-button map-action" disabled={!selectedSeats.length} onClick={() => openPerspective(selectedSeats[0] ?? null)}>Visualizar em 3D <span>↗</span></button>
            <button className="overview-link" onClick={() => openPerspective(null)}>Explorar sala em visão geral <span>→</span></button>
            <div className="selection-note"><span>i</span><p>A seleção é apenas uma simulação visual. O SeatView não reserva lugares.</p></div>
          </aside>
        </div> : <div className="viewer-frame">
          <div className="viewer-topline"><span><i /> {viewingSeat ? `PERSPECTIVA DO ASSENTO ${viewingSeat}` : 'VISÃO GERAL DA SALA'}</span><span className="viewer-size">{cinemaLayout.rows.length} FILEIRAS <b>·</b> {seats.length} LUGARES</span></div>
          <div className={`canvas-wrap${viewingSeat ? ' is-first-person' : ''}`}>
            <CinemaScene seatId={viewingSeat} centerRequest={centerRequest} />
            <div className="scene-caption"><span className="caption-label">TELA</span><span className="caption-rule" /><span className="caption-label">FILEIRA A</span></div>
            <div className="view-cube" aria-hidden="true"><span>3D</span><i /></div>
            <div className="view-controls" aria-label="Controles de visualização">
              {viewingSeat ? <><span className="seat-badge">ASSENTO <strong>{viewingSeat}</strong></span>{selectedSeats.map((id) => <button key={id} onClick={() => setViewingSeat(id)} aria-pressed={viewingSeat === id}>{id}</button>)}<button className="control-primary" onClick={() => setCenterRequest((value) => value + 1)}>Centralizar tela <span>◎</span></button></>
                : <><span className="seat-badge">SALA 6</span>{selectedSeats.map((id) => <button key={id} className="control-primary" onClick={() => setViewingSeat(id)}>Visualizar {id} <span>↗</span></button>)}</>}
              <button className="control-exit" onClick={() => { setMode('map'); setViewingSeat(null) }}>Voltar ao mapa <span>↗</span></button>
            </div>
          </div>
          <div className="viewer-bottomline"><div className="instructions"><span className="gesture-icon">⤢</span><span><strong>{viewingSeat ? `Na perspectiva de ${viewingSeat}` : 'Explore a sala'}</strong><small>{viewingSeat ? 'Arraste para olhar ao redor · posição fixa' : 'Arraste para girar · Scroll para aproximar'}</small></span></div><span className="illustrative-note">SIMULAÇÃO ILUSTRATIVA · NÃO DIMENSIONAL</span></div>
          <div className="viewer-map-return"><button onClick={() => { setMode('map'); setViewingSeat(null) }}>← Voltar ao mapa <span>{selectedSeats.length ? `· ${selectedSeats.join(' e ')} mantido${selectedSeats.length > 1 ? 's' : ''}` : ''}</span></button></div>
        </div>}

        <footer className="summary-row"><div className="summary-copy"><span className="summary-kicker">KINOPLEX NOVA AMÉRICA · SALA 6</span><p>{cinemaLayout.rows.length} fileiras reconstruídas a partir da referência visual.</p></div><div className="seat-summary"><span>{seats.length} <small>lugares no mapa</small></span><i /><span>{occupied} <small>ocupados legíveis</small></span></div><span className="map-quality">{issues.length ? 'REVISAR MAPA' : 'ESTRUTURA VALIDADA'}</span></footer>
        <div className="mobile-hint">Role horizontalmente o mapa para ver todos os assentos</div>
      </section>
    </main>
  )
}

export default App
