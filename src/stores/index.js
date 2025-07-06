import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSynthBus = defineStore('synthBus', () => {
  const inputs = ref([])
  const outputs = ref([])
  const triggers = ref({})
  const savedModules = ref([])
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

  const savePatch = (modules) => {
    savedModules.value = JSON.parse(JSON.stringify(modules))
    localStorage.setItem('synth-patch', JSON.stringify(savedModules.value))
  }

  const loadPatch = () => {
    const stored = localStorage.getItem('synth-patch')
    if (stored) {
      savedModules.value = JSON.parse(stored)
      return savedModules.value
    }
    return []
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
    savePatch,
    loadPatch,
    addConnection,
    removeConnection,
  }
})
