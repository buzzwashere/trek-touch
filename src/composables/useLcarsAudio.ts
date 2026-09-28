import { ref } from 'vue'

// Console chirps, synthesised rather than sampled. The AudioContext is created on the
// first sound, which always follows a tap, so browsers' autoplay rules are satisfied.
const enabled = ref(false)
let ctx: AudioContext | null = null

function context(): AudioContext {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine') {
  const ac = context()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ac.currentTime + start
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.12, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

export function useLcarsAudio() {
  // A short two-note chirp for an ordinary tap.
  function chirp() {
    if (!enabled.value) {
      return
    }
    tone(1320, 0, 0.06)
    tone(1760, 0.05, 0.08)
  }

  // A falling pair for acknowledging or closing something.
  function confirm() {
    if (!enabled.value) {
      return
    }
    tone(990, 0, 0.07)
    tone(660, 0.07, 0.1)
  }

  // Three rising whoops for red alert.
  function klaxon() {
    if (!enabled.value) {
      return
    }
    const ac = context()
    for (let i = 0; i < 3; i++) {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      const t = ac.currentTime + i * 0.55
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(420, t)
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.45)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.connect(gain).connect(ac.destination)
      osc.start(t)
      osc.stop(t + 0.52)
    }
  }

  function toggle() {
    enabled.value = !enabled.value
    // Sound the confirmation only when switching on, so the switch proves it works.
    chirp()
  }

  return { enabled, chirp, confirm, klaxon, toggle }
}
