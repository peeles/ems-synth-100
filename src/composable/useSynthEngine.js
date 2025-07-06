let audioContext = null

export const useSynthEngine = () => {
    const getContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        return audioContext
    }

    const resume = async () => {
        const ctx = getContext()
        if (ctx.state === 'suspended') {
            await ctx.resume()
        }
    }

    const createOscillatorNode = ({ frequency = 440, type = 'sine', gain = 0.5 }) => {
        const ctx = getContext()

        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(frequency, ctx.currentTime)
        gainNode.gain.setValueAtTime(gain, ctx.currentTime)

        osc.connect(gainNode)
        osc.start()

        return { osc, gain: gainNode }
    }

    return {
        context: getContext(),
        resume,
        createOscillatorNode,
    }
}
