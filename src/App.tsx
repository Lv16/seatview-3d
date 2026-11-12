import { useEffect, useMemo, useRef, useState } from 'react'
import { VideoTexture } from 'three'
import CinemaScene from './components/cinema/CinemaScene'
import { SeatMap2D } from './components/cinema/SeatMap2D'
import { cinemaLayout, locateSeat } from './data/cinemaLayout'
import { toggleSeatSelection } from './data/seatSelection'
import './App.css'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem('seatview-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
  } catch {
    // Use the operating system preference when browser storage is unavailable.
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
}

function App() {
  const video = useMemo(() => {
    const element = document.createElement('video')
    element.preload = 'metadata'
    element.playsInline = true
    element.muted = true
    return element
  }, [])
  const [texture, setTexture] = useState<VideoTexture | null>(null)
  const [videoState, setVideoState] = useState<'checking' | 'ready' | 'missing'>('checking')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [mode, setMode] = useState<'map' | '3d'>('map')
  const [viewingSeat, setViewingSeat] = useState<string | null>(null)
  const [centerRequest, setCenterRequest] = useState(0)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
  const seats = cinemaLayout.rows.flatMap((row) => row.seats)

  useEffect(() => {
    const source = '/videos/seatview-demo.mp4'
    const controller = new AbortController()
    const instance = new VideoTexture(video)
    instance.colorSpace = 'srgb'
    // oxlint-disable-next-line react/set-state-in-effect -- Publish the resource created for this React effect lifecycle.
    setTexture(instance)
    // oxlint-disable-next-line react/immutability -- HTMLMediaElement src is the browser API used to load the local asset.
    const onSourceReady = (response: Response) => {
      if (!response.ok || !response.headers.get('content-type')?.startsWith('video/')) {
        setVideoState('missing')
        return
      }
      // oxlint-disable-next-line react/immutability -- Attach the verified local video to the media element.
      video.src = source
      video.load()
    }
    const onReady = () => {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight })
      setVideoState('ready')
    }
    const onError = () => { setVideoState('missing'); setIsPlaying(false) }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    video.addEventListener('loadeddata', onReady)
    video.addEventListener('error', onError)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    void fetch(source, { method: 'HEAD', signal: controller.signal })
      .then(onSourceReady)
      .catch(() => { if (!controller.signal.aborted) setVideoState('missing') })
    return () => {
      controller.abort()
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('error', onError)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      instance.dispose()
    }
  }, [video])

  const togglePlayback = async () => {
    if (videoState !== 'ready') return
    if (!video.paused) video.pause()
    else { try { await video.play() } catch { setIsPlaying(false) } }
  }
  const restartPlayback = async () => {
    if (videoState !== 'ready') return
    // oxlint-disable-next-line react/immutability -- Restart through the HTMLMediaElement playback API.
    video.currentTime = 0
    try { await video.play() } catch { setIsPlaying(false) }
  }
  const toggleMute = () => {
    const muted = !video.muted
    // oxlint-disable-next-line react/immutability -- Keep the DOM media element's audio state in sync with the control.
    video.muted = muted
    setIsMuted(muted)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem('seatview-theme', theme)
    } catch {
      // The selected theme still applies for this session without browser storage.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0d12' : '#f2f4f7')
  }, [theme])

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === viewerRef.current)
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleSeat = (seatId: string) => setSelectedSeats((current) => toggleSeatSelection(current, seatId, seats))

  const openPerspective = (seatId: string | null) => {
    if (seatId && (!selectedSeats.includes(seatId) || !locateSeat(seatId))) return
    setViewingSeat(seatId)
    setMode('3d')
  }

  const returnToMap = () => {
    setMode('map')
    setViewingSeat(null)
  }

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await viewerRef.current.requestFullscreen()
    } catch {
      // Fullscreen is optional and can be unavailable in embedded mobile browsers.
    }
  }

  const navigateToViewer = () => {
    if (mode === '3d') {
      returnToMap()
      return
    }
    const firstSeat = selectedSeats[0]
    if (firstSeat) openPerspective(firstSeat)
  }

  return (
    <main className="app-shell" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="SeatView, início">
          <Mark /><span>SeatView<span className="brand-accent">3D</span></span>
        </a>
        <nav className="step-navigation" aria-label="Etapas da visualização">
          <button className={`step-link${mode === 'map' ? ' is-active' : ''}`} aria-current={mode === 'map' ? 'step' : undefined} onClick={returnToMap}>
            <span aria-hidden="true">▦</span> Escolher assento
          </button>
          <button className={`step-link${mode === '3d' ? ' is-active' : ''}`} aria-current={mode === '3d' ? 'step' : undefined} disabled={!selectedSeats.length && mode === 'map'} onClick={navigateToViewer}>
            <span aria-hidden="true">▷</span> Visualização
          </button>
        </nav>
        <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`} title={`Tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span><span className="theme-switch" aria-hidden="true"><i /></span>
        </button>
      </header>

      <section className={`experience${mode === '3d' ? ' is-viewing' : ''}`}>
        <div className="workspace-heading">
          <div><span className="eyebrow">{mode === 'map' ? 'SELEÇÃO DE ASSENTOS' : 'PRÉ-VISUALIZAÇÃO'}</span><h1>{mode === 'map' ? 'Escolha seus assentos' : viewingSeat ? `Assento ${viewingSeat}` : 'Visão geral da sala'}</h1></div>
          <span className="room-chip"><i aria-hidden="true" /> Sala convencional <span>·</span> Demonstrativa</span>
        </div>

        {mode === 'map' ? <div className="selection-layout">
          <SeatMap2D selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />
          <aside className="selection-panel" aria-labelledby="selection-title">
            <div className="selection-panel-heading"><div><span className="summary-kicker">SELEÇÃO ATUAL</span><h2 id="selection-title">Assentos <small>{selectedSeats.length}/2</small></h2></div><button className="clear-button" type="button" onClick={() => setSelectedSeats([])} disabled={!selectedSeats.length}>Limpar</button></div>
            <div className="selected-list" aria-live="polite">
              {selectedSeats.length ? selectedSeats.map((id) => <div className="selected-seat-row" key={id}><span className="selected-seat-dot">{id}</span><span><strong>Assento {id}</strong><small>Pronto para visualizar</small></span><button aria-label={`Remover assento ${id}`} onClick={() => toggleSeat(id)}>×</button></div>) : <p className="selection-empty">Selecione até dois assentos disponíveis no mapa.</p>}
            </div>
            <button className="next-button map-action" type="button" disabled={!selectedSeats.length} onClick={() => openPerspective(selectedSeats[0] ?? null)}>Visualizar em 3D <span aria-hidden="true">→</span></button>
            <button className="overview-link" type="button" onClick={() => openPerspective(null)}>Explorar visão geral da sala <span aria-hidden="true">→</span></button>
            <p className="selection-note">A disponibilidade é demonstrativa.</p>
          </aside>
        </div> : <div className="viewer-frame" ref={viewerRef}>
          <div className="viewer-topline"><span><i /> {viewingSeat ? `PERSPECTIVA · ${viewingSeat}` : 'VISÃO GERAL'}</span></div>
          <div className={`canvas-wrap${viewingSeat ? ' is-first-person' : ''}`}>
            {texture && <CinemaScene seatId={viewingSeat} centerRequest={centerRequest} texture={texture} videoWidth={videoSize.width} videoHeight={videoSize.height} available={videoState === 'ready'} />}
            <div className="view-controls" aria-label="Controles de visualização">
              {viewingSeat ? <><span className="seat-badge">ASSENTO <strong>{viewingSeat}</strong></span>{selectedSeats.map((id) => <button className="seat-switch" key={id} type="button" onClick={() => setViewingSeat(id)} aria-pressed={viewingSeat === id}>{id}</button>)}<button className="control-button" type="button" onClick={() => setCenterRequest((value) => value + 1)}><span aria-hidden="true">◎</span> Centralizar</button></>
                : <><span className="seat-badge">SALA CONVENCIONAL</span>{selectedSeats.map((id) => <button className="control-button" key={id} type="button" onClick={() => setViewingSeat(id)}>Visualizar {id} <span aria-hidden="true">→</span></button>)}</>}
              <button className="icon-button" type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'} aria-pressed={isFullscreen}><span aria-hidden="true">{isFullscreen ? '×' : '⛶'}</span></button>
              <button className="control-exit" type="button" onClick={returnToMap}><span aria-hidden="true">←</span> Voltar ao mapa</button>
            </div>
          </div>
          <div className="viewer-bottomline"><div className="instructions"><span className="gesture-icon" aria-hidden="true">⤢</span><span><strong>{viewingSeat ? `Perspectiva do assento ${viewingSeat}` : 'Visão geral da sala'}</strong><small>{viewingSeat ? 'Arraste para olhar ao redor · posição fixa' : 'Arraste para girar · role para aproximar'}</small></span></div><div className="projection-controls" role="group" aria-label="Controles da projeção"><button type="button" onClick={togglePlayback} disabled={videoState !== 'ready'} aria-label={isPlaying ? 'Pausar projeção' : 'Reproduzir projeção'} title={isPlaying ? 'Pausar' : 'Reproduzir'}>{isPlaying ? '❚❚' : '▶'}</button><button type="button" onClick={restartPlayback} disabled={videoState !== 'ready'} aria-label="Reiniciar projeção" title="Reiniciar">↺</button><button type="button" onClick={toggleMute} disabled={videoState !== 'ready'} aria-label={isMuted ? 'Ativar som' : 'Desativar som'} aria-pressed={!isMuted} title={isMuted ? 'Ativar som' : 'Desativar som'}>{isMuted ? '◖' : '◖))'}</button>{videoState === 'missing' && <span className="projection-status" role="status">Projeção indisponível</span>}</div><span className="illustrative-note">SIMULAÇÃO ILUSTRATIVA</span></div>
        </div>}
      </section>
    </main>
  )
}

export default App
