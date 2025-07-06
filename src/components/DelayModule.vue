<template>
    <div class="bg-gray-800 p-4 rounded-md shadow text-white w-72">
        <h2 class="text-lg font-semibold mb-3">⏱️ Delay</h2>
        <div class="mb-3">
            <label class="block text-xs">Time (s)</label>
            <input type="range" min="0" max="1" step="0.01" v-model="time" @input="updateTime" class="w-full" />
        </div>
        <div class="mb-3">
            <label class="block text-xs">Feedback</label>
            <input type="range" min="0" max="0.95" step="0.01" v-model="feedback" @input="updateFeedback" class="w-full" />
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
const delay = context.createDelay(1.0)
const feedbackGain = context.createGain()
const dryGain = context.createGain()
const wetGain = context.createGain()
const outputGain = context.createGain()

inputGain.connect(delay)
inputGain.connect(dryGain)

delay.connect(feedbackGain).connect(delay)
delay.connect(wetGain)

dryGain.connect(outputGain)
wetGain.connect(outputGain)

const time = ref(0.3)
const feedback = ref(0.3)
const mix = ref(0.5)

delay.delayTime.value = time.value
feedbackGain.gain.value = feedback.value
wetGain.gain.value = mix.value
dryGain.gain.value = 1 - mix.value

onMounted(() => {
    emit('ready', {
        id: 'delay-' + Math.random().toString(36).substring(7),
        input: inputGain,
        output: outputGain,
    })
})

onUnmounted(() => {
    inputGain.disconnect()
    delay.disconnect()
    feedbackGain.disconnect()
    dryGain.disconnect()
    wetGain.disconnect()
    outputGain.disconnect()
})

const updateTime = () => delay.delayTime.setValueAtTime(time.value, context.currentTime)
const updateFeedback = () => feedbackGain.gain.setTargetAtTime(feedback.value, context.currentTime, 0.01)
const updateMix = () => {
    wetGain.gain.setTargetAtTime(mix.value, context.currentTime, 0.01)
    dryGain.gain.setTargetAtTime(1 - mix.value, context.currentTime, 0.01)
}
</script>
