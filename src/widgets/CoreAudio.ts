export class CoreAudio {
	private context!: AudioContext;

	private audioMap = new Map<string, AudioBuffer>();

	async play(sound: string) {
		if (!this.context) {
			this.context = new AudioContext();
		}

		// Chrome and Safari are both awful
		if (this.context.state === 'suspended') {
			this.context.resume();
		}

		const source = this.context.createBufferSource();
		source.buffer = await this.loadCached(sound);
		source.connect(this.context.destination);
		source.start(this.context.currentTime);

		console.log(sound);
	}

	private async loadCached(sound: string) {
		if (this.audioMap.has(sound)) {
			return this.audioMap.get(sound)!;
		}

		const buffer = await this.loadAudio(sound);
		this.audioMap.set(sound, buffer);
		return buffer;
	}

	private async loadAudio(sound: string) {
		const result = await fetch(`assets/sounds/${sound}.mp3`);
		const audioData = await result.arrayBuffer();
		return await this.context.decodeAudioData(audioData);
	}
}
