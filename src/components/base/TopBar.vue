<template>
    <div
        class="h-12 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between text-green-200 relative"
    >
        <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold tracking-wide module-title">EMS Synth 100</h1>

            <div class="relative">
                <button
                    @click="open = !open"
                    class="bg-gray-700 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded"
                >
                    + Module
                </button>
                <div
                    v-if="open"
                    class="absolute left-0 mt-1 bg-gray-900 border border-gray-700 rounded shadow flex flex-col z-20"
                >
                    <button
                        v-for="type in moduleTypes"
                        :key="type"
                        @click="spawn(type)"
                        class="text-left px-3 py-1 hover:bg-gray-800 whitespace-nowrap"
                    >
                        {{ type }}
                    </button>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <div class="text-sm text-green-400">Patch count: {{ patchCount }}</div>
            <button
                @click="emit('toggleMatrix')"
                class="bg-gray-700 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded"
            >
                Matrix
            </button>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'

const emit = defineEmits(['spawn', 'toggleMatrix'])

defineProps({
    patchCount: {
        type: Number,
        default: 0,
    },
})

const open = ref(false)

const moduleTypes = [
    'Oscillator',
    'Filter',
    'Envelope',
    'Master',
    'LFO',
    'Delay',
    'Reverb',
]

const spawn = type => {
    emit('spawn', type)
    open.value = false
}
</script>
