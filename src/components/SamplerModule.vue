<template>
    <div class="bg-gray-800 p-4 rounded-md shadow text-white w-72">
        <h2 class="text-lg font-semibold mb-3">🎵 Sampler</h2>
        <div class="mb-3">
            <input
                type="file"
                accept="audio/*"
                @change="loadSample"
                class="text-xs"
            />
        </div>
        <div class="mb-3 flex items-center gap-2">
            <button
                @click="playing ? stop() : play()"
                class="bg-green-600 hover:bg-green-500 text-xs px-2 py-1 rounded"
            >
                {{ playing ? 'Stop' : 'Play' }}
            </button>
            <label class="text-xs flex items-center gap-1">
                <input type="checkbox" v-model="loop" @change="toggleLoop" />
                Loop
            </label>
        </div>
        <div>
            <label class="block text-xs">Volume</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model="volume"
                @input="updateVolume"
                class="w-full"
            />
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useSynthEngine} from '../composable/useSynthEngine'

const emit = defineEmits(['ready'])
const {context} = useSynthEngine()

const gainNode = context.createGain()
const volume = ref(1)
const loop = ref(true)
const playing = ref(false)
let buffer = null
let source = null

const loadSample = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
        buffer = await context.decodeAudioData(reader.result)
    }
    reader.readAsArrayBuffer(file)
}

const play = () => {
    if (!buffer) return
    stop()
    source = context.createBufferSource()
    source.buffer = buffer
    source.loop = loop.value
    source.connect(gainNode)
    source.start()
    playing.value = true
}

const stop = () => {
    if (source) {
        source.stop()
        source.disconnect()
        source = null
    }
    playing.value = false
}

const toggleLoop = () => {
    if (source) source.loop = loop.value
}

const updateVolume = () => {
    gainNode.gain.setValueAtTime(volume.value, context.currentTime)
}

gainNode.gain.value = volume.value

onMounted(() => {
    emit('ready', {
        id: 'sampler-' + Math.random().toString(36).substring(7),
        input: null,
        output: gainNode,
    })
})
</script>
