<template>
    <div class="bg-gray-800 p-4 rounded-md shadow text-white w-72">
        <h2 class="text-lg font-semibold mb-3">🏟️ Reverb</h2>
        <div class="mb-3">
            <label class="block text-xs">Decay (s)</label>
            <input type="range" min="0.1" max="5" step="0.1" v-model="decay" @input="updateImpulse" class="w-full" />
        </div>
        <div class="mb-3">
            <label class="block text-xs">Mix</label>
            <input type="range" min="0" max="1" step="0.01" v-model="mix" @input="updateMix" class="w-full" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../composable/useSynthEngine'

const emit = defineEmits(['ready'])
const { context } = useSynthEngine()

const inputGain = context.createGain()
const convolver = context.createConvolver()
const dryGain = context.createGain()
const wetGain = context.createGain()
const outputGain = context.createGain()

inputGain.connect(convolver)
inputGain.connect(dryGain)
convolver.connect(wetGain)
dryGain.connect(outputGain)
wetGain.connect(outputGain)

const decay = ref(2)
const mix = ref(0.5)

const createImpulse = (time) => {
    const rate = context.sampleRate
    const length = rate * time
    const impulse = context.createBuffer(2, length, rate)
    for (let ch = 0; ch < 2; ch++) {
        const buf = impulse.getChannelData(ch)
        for (let i = 0; i < length; i++) {
            buf[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, time)
        }
    }
    return impulse
}

convolver.buffer = createImpulse(decay.value)
wetGain.gain.value = mix.value
dryGain.gain.value = 1 - mix.value

onMounted(() => {
    emit('ready', {
        id: 'reverb-' + Math.random().toString(36).substring(7),
        input: inputGain,
        output: outputGain,
    })
})

onUnmounted(() => {
    inputGain.disconnect()
    convolver.disconnect()
    dryGain.disconnect()
    wetGain.disconnect()
    outputGain.disconnect()
})

const updateImpulse = () => {
    convolver.buffer = createImpulse(decay.value)
}

const updateMix = () => {
    wetGain.gain.setTargetAtTime(mix.value, context.currentTime, 0.01)
    dryGain.gain.setTargetAtTime(1 - mix.value, context.currentTime, 0.01)
}
</script>
