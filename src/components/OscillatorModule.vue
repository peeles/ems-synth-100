<template>
    <div class="bg-gray-800 text-white p-4 rounded-2xl shadow-md w-full max-w-sm">
        <h2 class="text-xl font-semibold mb-4">Oscillator {{ label }}</h2>

        <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Frequency (Hz)</label>
            <input
                type="range"
                min="50"
                max="2000"
                step="1"
                v-model="frequency"
                @input="updateFrequency"
                class="w-full accent-green-500"
            />
            <div class="text-xs text-gray-300 mt-1">{{ frequency }} Hz</div>
        </div>

        <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Waveform</label>
            <select v-model="waveform" @change="updateWaveform" class="w-full bg-gray-700 text-white rounded-md px-2 py-1">
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
                <option value="sawtooth">Sawtooth</option>
            </select>
        </div>

        <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Gain</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model="gainValue"
                @input="updateGain"
                class="w-full accent-green-500"
            />
            <div class="text-xs text-gray-300 mt-1">{{ gainValue }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../composable/useSynthEngine'

const props = defineProps({
    label: {
        type: String,
        default: 'A',
    },
})

const emit = defineEmits(['ready'])

const frequency = ref(440)
const waveform = ref('sawtooth')
const gainValue = ref(0.5)

const { context, createOscillatorNode } = useSynthEngine()

const oscRef = ref(null)
const gainRef = ref(null)

onMounted(() => {
    const { osc, gain } = createOscillatorNode({
        frequency: frequency.value,
        type: waveform.value,
        gain: gainValue.value,
    })

    oscRef.value = osc
    gainRef.value = gain

    // Patch directly to destination by default (can be unpatched later)
    gain.connect(context.destination)

    emit('ready', {
        output: gain,
        input: null, // No input for osc
        id: `osc-${props.label}`,
    })
})

const updateFrequency = () => {
    oscRef.value.frequency.setValueAtTime(frequency.value, context.currentTime)
}

const updateWaveform = () => {
    oscRef.value.type = waveform.value
}

const updateGain = () => {
    gainRef.value.gain.setValueAtTime(gainValue.value, context.currentTime)
}

onUnmounted(() => {
    oscRef.value?.stop()
    oscRef.value?.disconnect()
    gainRef.value?.disconnect()
})
</script>
