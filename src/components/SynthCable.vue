<template>
    <svg class="absolute inset-0 pointer-events-none" style="z-index: 1">
        <path
            :d="path"
            stroke="#22c55e"
            stroke-width="2"
            fill="none"
        />
    </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    from: Object, // { x, y }
    to: Object,   // { x, y }
})

const path = computed(() => {
    const x1 = props.from.x
    const y1 = props.from.y
    const x2 = props.to.x
    const y2 = props.to.y
    const dx = Math.abs(x2 - x1) * 0.5

    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
})
</script>
