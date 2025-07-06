<template>
  <div class="bg-gray-800 text-white p-4 rounded-2xl shadow-md w-full max-w-sm">
    <h2 class="text-xl font-semibold mb-4">Reverb {{ label }}</h2>
    <div class="mb-3">
      <label class="block text-sm font-medium mb-1">Decay (s)</label>
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        v-model="decay"
        @input="updateImpulse"
        class="w-full accent-green-500"
      />
      <div class="text-xs text-gray-300 mt-1">{{ decay }} s</div>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium mb-1">Mix</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="mix"
        @input="updateMix"
        class="w-full accent-green-500"
      />
      <div class="text-xs text-gray-300 mt-1">{{ mix }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSynthEngine } from '../composable/useSynthEngine'

const props = defineProps({ label: { type: String, default: 'A' } })
const emit = defineEmits(['ready'])

const { context } = useSynthEngine()

const input = context.createGain()
const output = context.createGain()
const convolver = context.createConvolver()
const dryGain = context.createGain()
const wetGain = context.createGain()

input.connect(dryGain).connect(output)
input.connect(convolver).connect(wetGain).connect(output)

dryGain.gain.value = 0.5
wetGain.gain.value = 0.5

const decay = ref(2)
const mix = ref(0.5)

const createImpulse = (decayTime) => {
  const rate = context.sampleRate
  const length = rate * decayTime
  const impulse = context.createBuffer(2, length, rate)
  for (let i = 0; i < 2; i++) {
    const channel = impulse.getChannelData(i)
    for (let j = 0; j < length; j++) {
      channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decayTime)
    }
  }
  return impulse
}

const updateImpulse = () => {
  convolver.buffer = createImpulse(decay.value)
}

const updateMix = () => {
  dryGain.gain.setValueAtTime(1 - mix.value, context.currentTime)
  wetGain.gain.setValueAtTime(mix.value, context.currentTime)
}

onMounted(() => {
  updateImpulse()
  emit('ready', { id: `reverb-${props.label}`, input, output })
})
</script>
