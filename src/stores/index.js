import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSynthBus = defineStore('synthBus', () => {
  const inputs = ref([])
  const outputs = ref([])
  const triggers = ref({})
  const savedModules = ref([])
  const patchLibrary = ref({})
  const connections = ref([]);

  const addConnection = (conn) => {
    if (!connections.value.some(c => c.from === conn.from && c.to === conn.to)) {
      connections.value.push(conn);
    }

  }
  const removeConnection = (from, to) => {
    connections.value = connections.value.filter(c => c.from !== from || c.to !== to)

  }
  const register = ({ id, input, output, trigger }) => {
    if (input) {
      inputs.value.push({id, label: id.toUpperCase(), input})
    }
    if (output) {
      outputs.value.push({id, label: id.toUpperCase(), output})
    }
    if (trigger){
      triggers.value[id] = trigger
    }
  }
  const clear = () => {
    inputs.value = []
    outputs.value = []
    connections.value = []
    triggers.value = {}

  }
  const clearModule = (id) => {
    inputs.value = inputs.value.filter(i => i.id !== id)
    outputs.value = outputs.value.filter(o => o.id !== id)
    connections.value = connections.value.filter(
        c => c.from !== id && c.to !== id
    )
    delete triggers.value[id]

  }

  const savePatch = (modules, name = 'default') => {
    const library = JSON.parse(localStorage.getItem('synth-patches') || '{}')
    library[name] = JSON.parse(JSON.stringify(modules))
    patchLibrary.value = library
    savedModules.value = library[name]
    localStorage.setItem('synth-patches', JSON.stringify(library))
  }

  const loadPatch = (name = 'default') => {
    const library = JSON.parse(localStorage.getItem('synth-patches') || '{}')
    patchLibrary.value = library
    savedModules.value = library[name] || []
    return savedModules.value
  }

  const listPatches = () => {
    const library = JSON.parse(localStorage.getItem('synth-patches') || '{}')
    patchLibrary.value = library
    return Object.keys(library)
  }

  const removePatch = (name) => {
    const library = JSON.parse(localStorage.getItem('synth-patches') || '{}')
    delete library[name]
    patchLibrary.value = library
    localStorage.setItem('synth-patches', JSON.stringify(library))
  }

  const clearPatch = () => {
    savedModules.value = []
    patchLibrary.value = {}
    localStorage.removeItem('synth-patches')
  }

  return {
    inputs,
    outputs,
    triggers,
    register,
    clear,
    clearModule,
    connections,
    savedModules,
    patchLibrary,
    savePatch,
    loadPatch,
    listPatches,
    removePatch,
    clearPatch,
    addConnection,
    removeConnection,
  }
})
