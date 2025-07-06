<template>
    <div
        class="flex flex-col h-screen bg-gray-950 text-white"
        @click="resumeAudio"
        @touchstart="resumeAudio"
    >
        <Topbar
            :patchCount="modules.length"
            @spawn="spawnModule"
            @toggleMatrix="matrixOpen = !matrixOpen"
        />

        <div class="flex flex-1 overflow-hidden">
            <!-- Workspace Area -->
            <div class="flex-1 p-4 h-full overflow-auto relative" ref="workspaceRef">
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
                    v-for="cable in validCables"
                    :key="cable.key"
                    :from="cable.from"
                    :to="cable.to"
                />

                <VirtualKeyboard />

                <!-- Save/Load Controls -->
                <div class="absolute top-4 right-4 flex gap-2 z-20">
                    <input
                        v-model="patchName"
                        list="patch-list"
                        placeholder="patch name"
                        class="bg-gray-700 border border-gray-500 text-sm px-2 py-1 rounded shadow text-white"
                    />
                    <datalist id="patch-list">
                        <option v-for="n in patchList" :key="n" :value="n">
                            {{ n }}
                        </option>
                    </datalist>
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
                        @click="share"
                        class="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded shadow"
                    >
                        Share Patch
                    </button>
                    <button
                        @click="clear"
                        class="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded shadow"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <PatchMatrix
                :inputs="bus.inputs"
                :outputs="bus.outputs"
                class="fixed top-0 right-0 w-64 h-full border-l border-gray-700 bg-gray-900 text-green-200 overflow-auto p-4 transform transition-transform duration-300 z-20"
                :class="matrixOpen ? 'translate-x-0' : 'translate-x-full'"
            />
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue'
import {nanoid} from 'nanoid'
import {useSynthEngine} from '../composable/useSynthEngine'
import {useSynthBus} from '../stores/index'
import SynthCable from '../components/SynthCable.vue'
import Topbar from '../components/base/TopBar.vue'
import ModuleWrapper from '../components/ModuleWrapper.vue'
import PatchMatrix from '../components/PatchMatrix.vue' // Optional if ready
import VirtualKeyboard from '../components/VirtualKeyboard.vue'

const {resume} = useSynthEngine()
const bus = useSynthBus()
const workspaceRef = ref(null)
const moduleRefs = ref({})
const modules = ref([]) // All spawned modules
const connections = computed(() => bus.connections)
const rafTick = ref(0)
const matrixOpen = ref(false)

const patchName = ref('default')
const patchList = ref(bus.listPatches())

const startRaf = () => {
    const step = () => {
        rafTick.value++
        rafId = requestAnimationFrame(step)
    }
    step()
}
let rafId

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

const getSocketPosition = el => {
    const rect = el.getBoundingClientRect()
    const container = workspaceRef.value
    if (container) {
        const cRect = container.getBoundingClientRect()
        return {
            x: rect.left + rect.width / 2 - cRect.left + container.scrollLeft,
            y: rect.top + rect.height / 2 - cRect.top + container.scrollTop,
        }
    }
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
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
    rafTick.value
    modules.value
    return connections.value
        .map(conn => {
            const endpoints = getCableEndpoints(conn.from, conn.to)
            return endpoints
                ? {...endpoints, key: `${conn.from}->${conn.to}`}
                : null
        })
        .filter(Boolean)
})

// basic size approximation for module bounds
const MODULE_WIDTH = 380
const MODULE_HEIGHT = 220
const MODULE_GAP = 20

// Check if two positions overlap based on approximate size
const overlaps = (posA, posB) => {
    return (
        posA.x < posB.x + MODULE_WIDTH &&
        posA.x + MODULE_WIDTH > posB.x &&
        posA.y < posB.y + MODULE_HEIGHT &&
        posA.y + MODULE_HEIGHT > posB.y
    )
}

// Spawn a module and track its type + position, avoiding overlaps
const spawnModule = (type, position = {x: 100, y: 100}) => {
    const id = `${type.toLowerCase()}-${nanoid(6)}`
    const workspace = workspaceRef.value
    const maxWidth = workspace?.clientWidth || 0
    let pos = {...position}

    // shift position until it no longer collides with existing modules
    while (modules.value.some(m => overlaps(pos, m.position))) {
        pos.x += MODULE_WIDTH + MODULE_GAP
        if (maxWidth && pos.x + MODULE_WIDTH > maxWidth) {
            pos.x = MODULE_GAP
            pos.y += MODULE_HEIGHT + MODULE_GAP
        }
    }

    modules.value.push({id, type, position: pos})
}

// Register module audio nodes into SynthBus
const registerModule = ({id, input, output, trigger}) => {
    bus.register({id, input, output, trigger})
}

const removeModule = id => {
    modules.value = modules.value.filter(m => m.id !== id)
    bus.clearModule(id)
}

// Save patch using SynthBus store
const save = () => {
    bus.savePatch(
        modules.value.map(mod => ({
            id: mod.id,
            type: mod.type,
            position: mod.position,
        })),
        patchName.value || 'default'
    )
    alert(`Patch "${patchName.value}" saved.`)
    patchList.value = bus.listPatches()
}

// Load patch using SynthBus store
const load = () => {
    const loadedModules = bus.loadPatch(patchName.value || 'default')
    if (!loadedModules.length)
        return alert(`No patch named "${patchName.value}" found.`)

    // Reset current bus state and modules before rehydrating
    bus.clear()
    modules.value = []

    // Rehydrate the modules (let ModuleWrapper re-register them)
    for (const mod of loadedModules) {
        spawnModule(mod.type, mod.position)
    }
}

const share = () => {
    const json = bus.exportPatch(patchName.value || 'default')
    const blob = new Blob([json], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${patchName.value || 'patch'}.json`
    a.click()
    URL.revokeObjectURL(url)
}

// Clear everything (state + bus)
const clear = () => {
    if (confirm('Clear all modules and connections?')) {
        modules.value = []
        bus.clear()
        bus.clearPatch()
        patchList.value = bus.listPatches()
    }
}

// Optional: auto-load on app start
onMounted(() => {
    patchList.value = bus.listPatches()
    load()
    startRaf()
})

onUnmounted(() => {
    cancelAnimationFrame(rafId)
})
</script>
