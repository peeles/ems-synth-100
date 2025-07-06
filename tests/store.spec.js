import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSynthBus } from '../src/stores'

// simple localStorage mock for vitest node environment
const mockStorage = () => {
  let store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} }
  }
}

describe('synth bus store', () => {
  let bus
  beforeEach(() => {
    setActivePinia(createPinia())
    bus = useSynthBus()
    // reset mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage(),
      configurable: true
    })
  })

  it('adds connections without duplicates', () => {
    bus.addConnection({ from: 'a', to: 'b' })
    bus.addConnection({ from: 'a', to: 'b' })
    expect(bus.connections.length).toBe(1)
  })

  it('removing a module clears its connections', () => {
    bus.addConnection({ from: 'mod1', to: 'mod2' })
    bus.addConnection({ from: 'mod2', to: 'mod1' })
    bus.clearModule('mod1')
    expect(bus.connections.some(c => c.from === 'mod1' || c.to === 'mod1')).toBe(false)
  })

  it('savePatch and loadPatch persist modules', () => {
    const mods = [{ id: 'osc-1', type: 'osc', position: { x: 1, y: 1 } }]
    bus.savePatch(mods)
    setActivePinia(createPinia())
    const another = useSynthBus()
    expect(another.loadPatch()).toEqual(mods)
  })
})
