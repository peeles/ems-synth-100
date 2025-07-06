<template>
    <div class="overflow-auto max-w-full max-h-[60vh] bg-gray-900 text-white rounded-md shadow p-4">
        <h2 class="text-lg font-semibold mb-4">🎛️ Patch Matrix</h2>
        <table class="table-auto border-collapse text-sm">
            <thead>
            <tr>
                <th class="px-2 py-1 text-left">Out → In</th>
                <th
                    v-for="input in inputs"
                    :key="input.id"
                    class="px-2 py-1 text-center"
                >
                    {{ input.label }}
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="output in outputs" :key="output.id">
                <td class="font-bold px-2 py-1">{{ output.label }}</td>
                <td
                    v-for="input in inputs"
                    :key="input.id"
                    class="text-center px-1 py-1"
                >
                    <button
                        :class="[
                        'w-5 h-5 rounded-full transition',
                        isConnected(output.id, input.id)
                             ? 'bg-green-500 hover:bg-red-500'
                             : 'bg-gray-700 hover:bg-green-500'
                        ]"
                        :title="isConnected(output.id, input.id)
                        ? `Unpatch ${output.label} → ${input.label}`
                        : `Patch ${output.label} → ${input.label}`"
                        @click="togglePatch(output.id, input.id)"
                    />
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSynthBus } from '../stores/index'

const bus = useSynthBus()
const inputs = computed(() => bus.inputs)
const outputs = computed(() => bus.outputs)
const connections = computed(() => bus.connections)

// Check if a connection is active
const isConnected = (fromId, toId) =>
    connections.value.some(c => c.from === fromId && c.to === toId)

// Toggle: connect or disconnect
const togglePatch = (fromId, toId) => {
    const from = outputs.value.find(o => o.id === fromId)
    const to = inputs.value.find(i => i.id === toId)

    if (!from?.output || !to?.input) return

    const existing = isConnected(fromId, toId)
    if (existing) {
        from.output.disconnect(to.input)
        bus.removeConnection(fromId, toId)
    } else {
        from.output.connect(to.input)
        bus.addConnection({ from: fromId, to: toId })
    }
}
</script>
