import { useCallback, useEffect, useRef, useState } from 'react'
import { profile } from '@/config/profile'
import { preloadApps } from '@/features/desktop/apps'
import { Dock } from '@/features/desktop/Desktop'
import { FullscreenApp } from '@/features/desktop/FullscreenApp'
import { Spotlight } from '@/features/desktop/Spotlight'
import { Wallpaper } from '@/features/desktop/Wallpaper'
import { Buddy } from '@/features/desktop/Buddy'
import { ScreenOutline } from '@/features/desktop/ScreenOutline'
import { useLaunch } from '@/features/desktop/useLaunch'
import { CursorLight } from './CursorLight'
import { HeroQuote, HeroTitle, ScrollCue } from './HeroOverlay'
import { Hud, type HudState } from './Hud'
import { KEY_BY_ID, LARGE_KEYS } from './keys'
import { MacBook } from './MacBook'
import { MatrixRain } from './MatrixRain'
import { useOpening } from './useOpening'
import { installAudioUnlock, playKey, unlockAudio } from './sound'
import { useSettings } from './useSettings'
import './macbook.css'

const STEP = 1 / 16
const MIN_SCREEN = 0.3

/** Physical keys that don't exist on a Mac keyboard, mapped to their closest match. */
const ALIASES: Record<string, string> = {
  ControlRight: 'ControlLeft',
  IntlBackslash: 'Backquote',
  NumpadEnter: 'Enter',
}
/** Browser shortcuts we swallow so the keyboard can use these keys. */
const PREVENT_DEFAULT = new Set(['F1', 'F2', 'F3', 'F6', 'F7', 'F10', 'Space'])

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
}

/** Full-screen view of an open MacBook from above: half the display, the keyboard, half the trackpad. */
export function MacBookHero() {
  const [settings, update] = useSettings()
  const [screen, setScreen] = useState(1)
  const [pressed, setPressed] = useState<ReadonlySet<string>>(() => new Set())
  const [capsOn, setCapsOn] = useState(false)
  const [hud, setHud] = useState<HudState | null>(null)
  const [hudVisible, setHudVisible] = useState(false)
  const hudTimer = useRef<number>(undefined)

  // Opening animation: scroll through the track to open the laptop.
  const { track, scene, camera, laptop, lid, hint, setFocus } = useOpening()

  /** The keyboard only works once the laptop has fully opened (useOpening sets data-open). */
  const isOpen = useCallback(() => track.current?.hasAttribute('data-open') ?? true, [track])

  useEffect(installAudioUnlock, [])
  // fetch the apps' code once the intro has played, so opening one never waits
  useEffect(() => {
    const t = window.setTimeout(preloadApps, 2500)
    return () => window.clearTimeout(t)
  }, [])

  // Latest values for window-level listeners and stable callbacks.
  const latest = useRef({ settings, screen, pressed })
  useEffect(() => {
    latest.current = { settings, screen, pressed }
  })

  const press = useCallback((id: string) => {
    setPressed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])
  const release = useCallback((id: string) => {
    setPressed((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])
  const releaseAll = useCallback(() => setPressed(new Set()), [])

  /** Every key and trackpad sound goes through here, so silence while opening is one check. */
  const sound = useCallback(
    (id: string, phase: 'down' | 'up') => {
      if (!isOpen()) return
      const { volume, muted } = latest.current.settings
      if (!muted) playKey(phase, LARGE_KEYS.has(id), volume)
    },
    [isOpen],
  )

  const tap = useCallback(
    (id: string) => {
      press(id)
      sound(id, 'down')
      window.setTimeout(() => {
        release(id)
        sound(id, 'up')
      }, 130)
    },
    [press, release, sound],
  )

  // Opening an app: the keyboard types its name in Spotlight, then the screen becomes the page.
  const keyDown = useCallback(
    (id: string) => {
      press(id)
      sound(id, 'down')
    },
    [press, sound],
  )
  const keyUp = useCallback(
    (id: string) => {
      release(id)
      sound(id, 'up')
    },
    [release, sound],
  )
  const getCamera = useCallback(() => camera.current, [camera])
  const launcher = useLaunch({ keyDown, keyUp, setFocus, getCamera })
  // latest Spotlight typing handler, for the window-level key listener
  const typeRef = useRef(launcher.type)
  useEffect(() => {
    typeRef.current = launcher.type
  })

  const showHud = useCallback((state: HudState) => {
    setHud(state)
    setHudVisible(true)
    window.clearTimeout(hudTimer.current)
    hudTimer.current = window.setTimeout(() => setHudVisible(false), 1400)
  }, [])

  /** Function row and Touch ID. */
  const runAction = useCallback(
    (id: string) => {
      const { settings: s, screen: sc } = latest.current
      switch (id) {
        case 'F1':
        case 'F2': {
          const next = clamp(sc + (id === 'F2' ? STEP : -STEP), MIN_SCREEN, 1)
          setScreen(next)
          showHud({ kind: 'brightness', level: (next - MIN_SCREEN) / (1 - MIN_SCREEN) })
          break
        }
        case 'F10':
          update({ muted: !s.muted })
          showHud({ kind: 'volume', level: s.volume, muted: !s.muted })
          break
        case 'F11':
        case 'F12': {
          const volume = clamp(s.volume + (id === 'F12' ? STEP : -STEP), 0, 1)
          update({ volume, muted: false })
          showHud({ kind: 'volume', level: volume, muted: false })
          break
        }
        case 'TouchID':
          showHud({ kind: 'touchid', label: `Welcome, ${profile.firstName}` })
          break
      }
    },
    [showHud, update],
  )

  // Clicking / tapping the on-screen keys.
  const onKeyPress = useCallback(
    (id: string) => {
      if (!isOpen()) return
      unlockAudio()
      press(id)
      sound(id, 'down')
      if (id === 'CapsLock') setCapsOn((c) => !c)
      else {
        runAction(id)
        typeRef.current(id) // clicking the laptop's keys types into Spotlight too
      }
    },
    [isOpen, press, sound, runAction],
  )

  const onKeyRelease = useCallback(
    (id: string) => {
      if (!latest.current.pressed.has(id)) return
      release(id)
      sound(id, 'up')
    },
    [release, sound],
  )

  // The visitor's real keyboard.
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      // while the laptop is still opening, keys do their normal job (Space/arrows scroll)
      if (isEditable(e.target) || !isOpen()) return
      unlockAudio()
      const id = ALIASES[e.code] ?? e.code
      setCapsOn(e.getModifierState('CapsLock'))
      // macOS sends one event when caps lock turns on and one when it turns off
      if (id === 'CapsLock') return tap(id)
      if (!KEY_BY_ID.has(id)) return

      if (!e.repeat) {
        press(id)
        sound(id, 'down')
      }
      if (PREVENT_DEFAULT.has(id)) e.preventDefault()
      if (!e.metaKey && !e.ctrlKey) {
        runAction(id)
        // typing on your keyboard searches in Spotlight (Space then types, rather than scrolling)
        if (!e.altKey && typeRef.current(id)) e.preventDefault()
      }
    }

    const onUp = (e: KeyboardEvent) => {
      const id = ALIASES[e.code] ?? e.code
      setCapsOn(e.getModifierState('CapsLock'))
      if (id === 'CapsLock') return tap(id)
      if (!KEY_BY_ID.has(id)) return
      release(id)
      sound(id, 'up')
      // macOS doesn't send keyup for keys pressed while ⌘ is held
      if (id.startsWith('Meta')) releaseAll()
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', releaseAll)
    }
  }, [isOpen, press, release, releaseAll, sound, tap, runAction])

  return (
    <div className="mb-track" ref={track}>
      <section className="mb-hero" data-app-open={launcher.phase === 'open' || undefined}>
        <MatrixRain className="mb-matrix" />
        <div className="mb-atmos" aria-hidden="true" />
        <CursorLight />
        {/* soft light on the "floor" under the closed laptop */}
        <div className="mb-floor" aria-hidden="true" />
        <HeroTitle />
        <HeroQuote />
        <MacBook
          pressed={pressed}
          capsOn={capsOn}
          backlight={settings.backlight}
          finish={settings.finish}
          screenBrightness={screen}
          onPress={onKeyPress}
          onRelease={onKeyRelease}
          sceneRef={scene}
          cameraRef={camera}
          laptopRef={laptop}
          lidRef={lid}
          onTrackpad={() => {
            if (!isOpen()) return
            unlockAudio()
            sound('Space', 'down')
          }}
        >
          {/* On the Mac's screen: wallpaper, a little friend who watches your cursor, the Dock */}
          <Wallpaper />
          <ScreenOutline />
          <Buddy />
          <Spotlight query={launcher.query} phase={launcher.phase} hidden={hudVisible} />
          <Dock
            openIds={launcher.app ? [launcher.app.id] : []}
            launching={launcher.phase === 'typing' ? (launcher.app?.id ?? null) : null}
            onLaunch={(app) =>
              app.href
                ? window.open(app.href, '_blank', 'noopener,noreferrer')
                : void launcher.launch(app)
            }
          />
          <Hud state={hud} visible={hudVisible} />
        </MacBook>
        <ScrollCue ref={hint} />
        <FullscreenApp
          app={launcher.app}
          phase={launcher.phase}
          fit={launcher.fit}
          onClose={launcher.close}
        />
        {/* a faint film grain over everything (see .mb-grain) */}
        <div className="mb-grain" aria-hidden="true" />
        {/* how far the laptop has opened */}
        <div className="mb-progress" aria-hidden="true" />
      </section>
    </div>
  )
}
