<template>
    <div class="h-12 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
        <h1 class="text-lg font-bold">EMS Synth 100</h1>
        <div class="text-sm text-gray-400">Patch count: {{ patchCount }}</div>
    </div>
</template>

<script setup>
defineProps({
    patchCount: {
        type: Number,
        default: 0,
    },
})
</script>
