<template>
    <div class="bg-gray-800 p-4 rounded-md shadow text-white w-72">
        <h2 class="text-lg font-semibold mb-3">🔊 Filter</h2>

        <div class="mb-3">
            <label class="block text-xs">Type</label>
            <select v-model="type" @change="updateType" class="w-full text-black rounded px-2 py-1">
                <option>lowpass</option>
                <option>highpass</option>
                <option>bandpass</option>
                <option>notch</option>
            </select>
        </div>

        <div class="mb-3">
            <label class="block text-xs">Cutoff</label>
            <input type="range" min="20" max="20000" v-model="cutoff" @input="updateCutoff" class="w-full">
        </div>

        <div class="mb-3">
            <label class="block text-xs">Resonance (Q)</label>
            <input type="range" min="0.1" max="20" step="0.1" v-model="q" @input="updateQ" class="w-full">
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../composable/useSynthEngine'

const emit = defineEmits(['ready'])
const { context } = useSynthEngine()

const inputGain = context.createGain()
const outputGain = context.createGain()
const filter = context.createBiquadFilter()

filter.type = 'lowpass'
filter.frequency.value = 800
filter.Q.value = 1

inputGain.connect(filter).connect(outputGain)

const type = ref('lowpass')
const cutoff = ref(800)
const q = ref(1)

const updateType = () => filter.type = type.value
const updateCutoff = () => filter.frequency.setValueAtTime(cutoff.value, context.currentTime)
const updateQ = () => filter.Q.setValueAtTime(q.value, context.currentTime)

onMounted(() => {
    emit('ready', {
        id: 'filter-' + Math.random().toString(36).substring(7),
        input: inputGain,
        output: outputGain
    })
})

onUnmounted(() => {
    inputGain.disconnect()
    filter.disconnect()
    outputGain.disconnect()
})
</script>
