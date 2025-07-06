<template>
    <div class="w-48 bg-gray-900 border-r border-gray-700 flex flex-col p-4 gap-4">
        <h2 class="text-lg font-bold mb-2">Modules</h2>
        <button
            v-for="type in moduleTypes"
            :key="type"
            @click="$emit('spawn', type)"
            class="bg-green-700 hover:bg-green-600 text-white py-1 px-2 rounded text-sm text-left"
        >
            + {{ type }}
        </button>
    </div>
</template>

<script setup>
const moduleTypes = ['Oscillator', 'Filter', 'Envelope', 'Master', 'LFO']
</script>
