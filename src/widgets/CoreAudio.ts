export class CoreAudio {
	private context!: AudioContext;

	play(sound: any) {
		const audio = this.load();

		if (this.context.state === 'suspended') {
			this.context.resume();
		}

		audio.start();
		setTimeout(() => {
			audio.stop()
		}, 500);

		console.log(sound);
	}

	private load(): AudioScheduledSourceNode {
		if (!this.context) {
			this.context = new AudioContext();
		}

		const osc = this.context.createOscillator();
		osc.frequency.setValueAtTime(440, this.context.currentTime);
		osc.connect(this.context.destination);

		return osc;
	}
}
