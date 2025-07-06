<template>
    <div
        class="flex h-screen bg-gray-950 text-white"
        @click="resumeAudio"
        @touchstart="resumeAudio"
    >
        <!-- Sidebar -->
        <Sidebar @spawn="spawnModule" />

        <!-- Main View -->
        <div class="flex-1 relative overflow-hidden">
            <Topbar :patchCount="modules.length" />

            <!-- Workspace Area -->
            <div class="p-4 h-full overflow-auto relative">
                <ModuleWrapper
                    v-for="mod in modules"
                    :key="mod.id"
                    :ref="el => registerRef(mod.id, el)"
                    :module="mod"
                    :position="mod.position"
                    @remove="removeModule"
                    @register="registerModule"
                />

                <SynthCable
                    v-for="(conn, i) in bus.connections"
                    :key="i"
                    v-bind="getCableEndpoints(conn.from, conn.to)"
                />

                 <PatchMatrix :inputs="bus.inputs" :outputs="bus.outputs" />

                <!-- Save/Load Controls -->
                <div class="absolute top-4 right-4 flex gap-2 z-20">
                    <button
                        @click="save"
                        class="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded shadow"
                    >
                        Save Patch
                    </button>
                    <button
                        @click="load"
                        class="bg-orange-600 hover:bg-orange-500 text-white text-sm px-3 py-1 rounded shadow"
                    >
                        Load Patch
                    </button>
                    <button
                        @click="clear"
                        class="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded shadow"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import { nanoid } from 'nanoid'
import { useSynthEngine } from '../composable/useSynthEngine'
import { useSynthBus } from '../stores/index'
import SynthCable from '../components/SynthCable.vue'
import Sidebar from '../components/base/SideBar.vue';
import Topbar from '../components/base/TopBar.vue';
import ModuleWrapper from '../components/ModuleWrapper.vue';
import PatchMatrix from '../components/PatchMatrix.vue' // Optional if ready

const { resume } = useSynthEngine();
const bus = useSynthBus();
const moduleRefs = ref({});
const modules = ref([]); // All spawned modules
const connections = computed(() => bus.connections);

const registerRef = (id, el) => {
    if (el) {
        moduleRefs.value[id] = el
    }
}

const resumeAudio = async () => {
    try {
        await resume()
        console.log('AudioContext resumed')
    } catch (err) {
        console.warn('Failed to resume AudioContext:', err)
    }
}

const getSocketPosition = (el) => {
    const rect = el.getBoundingClientRect()
    return {
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + rect.height / 2 + window.scrollY,
    }
}

const getCableEndpoints = (fromId, toId) => {
    const from = moduleRefs.value[fromId]?.outputRef
    const to = moduleRefs.value[toId]?.inputRef

    if (from?.value && to?.value) {
        return {
            from: getSocketPosition(from.value),
            to: getSocketPosition(to.value),
        }
    }
    return null
}

const validCables = computed(() => {
    return connections.value
        .map((conn) => {
            const endpoints = getCableEndpoints(conn.from, conn.to)
            return endpoints ? { ...endpoints, key: `${conn.from}->${conn.to}` } : null
        })
        .filter(Boolean)
})

// Spawn a module and track its type + position
const spawnModule = (type, position = { x: 100, y: 100 }) => {
    modules.value.push({
        id: `${type.toLowerCase()}-${nanoid(6)}`,
        type,
        position,
    })
}

// Register module audio nodes into SynthBus
const registerModule = ({ id, input, output, trigger }) => {
    bus.register({ id, input, output, trigger })
}

const removeModule = (id) => {
    modules.value = modules.value.filter(m => m.id !== id);
    bus.clearModule(id);
}

// Save patch to localStorage
const save = () => {
    const serialized = modules.value.map((mod) => ({
        id: mod.id,
        type: mod.type,
        position: mod.position,
    }))
    localStorage.setItem('synth-patch', JSON.stringify(serialized))
    alert('Patch saved.')
}

// Load patch from localStorage
const load = () => {
    const patch = localStorage.getItem('synth-patch')
    if (!patch) return alert('No saved patch found.')

    const loadedModules = JSON.parse(patch)

    // Reset current bus state and modules before rehydrating
    bus.clear()
    modules.value = []

    // Rehydrate the modules (let ModuleWrapper re-register them)
    for (const mod of loadedModules) {
        spawnModule(mod.type, mod.position)
    }
}

// Clear everything (state + bus)
const clear = () => {
    if (confirm('Clear all modules and connections?')) {
        modules.value = []
        bus.clear()
        localStorage.removeItem('synth-patch')
    }
}

// Optional: auto-load on app start
onMounted(() => {
    load()
})
</script>
