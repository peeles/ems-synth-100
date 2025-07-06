<template>
    <div class="bg-gray-800 p-4 rounded-md shadow text-white w-72">
        <h2 class="text-lg font-semibold mb-3">⏱️ Envelope</h2>

        <div v-for="(label, prop) in { attack: 'Attack', decay: 'Decay', sustain: 'Sustain', release: 'Release' }" :key="prop" class="mb-2">
            <label class="block text-xs">{{ label }}</label>
            <input
                type="range"
                :min="prop === 'sustain' ? 0 : 0.01"
                :max="prop === 'sustain' ? 1 : 2"
                step="0.01"
                v-model="envelope[prop]"
                class="w-full"
            />
        </div>

        <button @click="trigger" class="bg-green-600 hover:bg-green-500 text-xs px-2 py-1 rounded">Trigger</button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../composable/useSynthEngine'

const emit = defineEmits(['ready'])
const { context } = useSynthEngine()

const inputGain = context.createGain()
const envelopeGain = context.createGain()
inputGain.connect(envelopeGain)

const envelope = ref({
    attack: 0.2,
    decay: 0.3,
    sustain: 0.5,
    release: 0.5,
})

const trigger = () => {
    const now = context.currentTime
    const { attack, decay, sustain, release } = envelope.value

    envelopeGain.gain.cancelScheduledValues(now)
    envelopeGain.gain.setValueAtTime(0, now)
    envelopeGain.gain.linearRampToValueAtTime(1, now + attack)
    envelopeGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
    envelopeGain.gain.linearRampToValueAtTime(0, now + attack + decay + release)
}

onMounted(() => {
    emit('ready', {
        id: 'env-' + Math.random().toString(36).substring(7),
        input: inputGain,
        output: envelopeGain,
        trigger
    })
})

onUnmounted(() => {
    inputGain.disconnect()
    envelopeGain.disconnect()
})
</script>
