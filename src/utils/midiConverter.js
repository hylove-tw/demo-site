import synth from 'synth-js'; // Available under the MIT License. https://github.com/patrickroberts/synth-js

export default class MidiConverter {
    constructor(midi) {
        this.midi = midi;
    }

    convertToMidiBlob() {
        if (this.midi instanceof Uint8Array) {
            return new Blob([this.midi], {type: 'audio/midi'})
        }
    }

    convertToWavBlob() {
        if (this.midi instanceof Uint8Array) {
            this.wavBlob = synth.midiToWav(this.midi.buffer).toBlob()
            return this.wavBlob
        }
    }

}