<template>
    <div class="h-12 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
        <h1 class="text-lg font-bold">EMS Synthi 100 (Web)</h1>
        <div class="text-sm text-gray-400">Patch count: {{ $slots.default?.length || 0 }}</div>
    </div>
</template>
