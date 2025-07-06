export const signalColors = {
    osc: 'bg-blue-500',
    filter: 'bg-orange-500',
    env: 'bg-purple-500',
    lfo: 'bg-teal-500',
    master: 'bg-yellow-500',
}

export const getSignalColorClass = (id) => {
    const key = id.split('-')[0]
    return signalColors[key] || 'bg-green-500'
}
