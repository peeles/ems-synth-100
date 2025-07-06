<template>
    <div
        class="absolute select-none"
        :style="`left: ${position.x}px; top: ${position.y}px;`"
    >
          <div
            class="cursor-move flex items-center justify-between bg-gray-700 px-2 py-1 rounded-t"
            @mousedown.prevent="startDrag"
        >
            <span class="text-xs font-semibold">{{ module.type }}</span>

            <button
                @click="remove"
                class="text-red-400 hover:text-red-300 text-sm leading-none ml-2"
                title="Close module"
            >
                ✖
            </button>
        </div>

        <div class="relative rounded-b bg-gray-800 p-2 shadow-xl">
            <div
                ref="outputRef"
                class="absolute top-1 left-[-10px] w-2 h-2 rounded-full bg-green-500 z-10"
                title="Output"
            />
            <div
                ref="inputRef"
                class="absolute top-1 right-[-10px] w-2 h-2 rounded-full bg-yellow-500 z-10"
                title="Input"
            />

            <component
                :is="moduleComponent"
                :label="module.id"
                @ready="handleReady"
            />
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import OscillatorModule from './OscillatorModule.vue'
import FilterModule from './FilterModule.vue'
import EnvelopeModule from './EnvelopeModule.vue'
import MasterOutput from './MasterOutput.vue'

import { useSynthBus } from '../stores/index'
const bus = useSynthBus()

const props = defineProps({ module: Object, position: Object })
const emit = defineEmits(['remove'])
const componentMap = {
    Oscillator: OscillatorModule,
    Filter: FilterModule,
    Envelope: EnvelopeModule,
    Master: MasterOutput,
}

const moduleComponent = computed(() => componentMap[props.module.type]);
const outputRef = ref(null)
const inputRef = ref(null)

defineExpose({ outputRef, inputRef })
const handleReady = (data) => {
    bus.register(data)
}

const remove = () => {
    emit('remove', props.module.id)
}

let offsetX = 0
let offsetY = 0

const startDrag = (e) => {
    offsetX = e.clientX - props.position.x
    offsetY = e.clientY - props.position.y
    document.addEventListener('mousemove', drag)
    document.addEventListener('mouseup', stopDrag)
}

const drag = (e) => {
    props.module.position.x = e.clientX - offsetX
    props.module.position.y = e.clientY - offsetY
}

const stopDrag = () => {
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('mouseup', stopDrag)
}
</script>
