<template>
    <div class="h-12 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between text-green-200">
        <h1 class="text-lg font-bold tracking-wide module-title">EMS Synth 100</h1>
        <div class="text-sm text-green-400">Patch count: {{ patchCount }}</div>
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
