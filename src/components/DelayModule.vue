<template>
  <div class="bg-gray-800 text-white p-4 rounded-2xl shadow-md w-full max-w-sm">
    <h2 class="text-xl font-semibold mb-4">Delay {{ label }}</h2>
    <div class="mb-3">
      <label class="block text-sm font-medium mb-1">Time (s)</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="time"
        @input="updateTime"
        class="w-full accent-green-500"
      />
      <div class="text-xs text-gray-300 mt-1">{{ time }} s</div>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium mb-1">Feedback</label>
      <input
        type="range"
        min="0"
        max="0.95"
        step="0.01"
        v-model="feedback"
        @input="updateFeedback"
        class="w-full accent-green-500"
      />
      <div class="text-xs text-gray-300 mt-1">{{ feedback }}</div>
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
const delayNode = context.createDelay(5.0)
const feedbackGain = context.createGain()

input.connect(delayNode).connect(output)
delayNode.connect(feedbackGain).connect(delayNode)

const time = ref(0.3)
const feedback = ref(0.3)

delayNode.delayTime.value = time.value
feedbackGain.gain.value = feedback.value

const updateTime = () => {
  delayNode.delayTime.setValueAtTime(time.value, context.currentTime)
}

const updateFeedback = () => {
  feedbackGain.gain.setValueAtTime(feedback.value, context.currentTime)
}

onMounted(() => {
  emit('ready', { id: `delay-${props.label}`, input, output })
})
</script>
