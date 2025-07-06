<template>
    <div class="flex gap-1 mt-4">
        <button
            v-for="note in notes"
            :key="note.name"
            @mousedown.prevent="play()"
            @touchstart.prevent="play()"
            class="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
        >
            {{ note.name }}
        </button>
    </div>
</template>

<script setup>
import {useSynthBus} from '../stores/index'

const bus = useSynthBus()

const notes = [
    {name: 'C4', freq: 261.63},
    {name: 'D4', freq: 293.66},
    {name: 'E4', freq: 329.63},
    {name: 'F4', freq: 349.23},
    {name: 'G4', freq: 392},
    {name: 'A4', freq: 440},
    {name: 'B4', freq: 493.88},
    {name: 'C5', freq: 523.25},
]

const play = () => {
    Object.values(bus.triggers).forEach(trigger => {
        if (typeof trigger === 'function') {
            trigger()
            // trigger currently takes no parameters
        }
    })
}
</script>
