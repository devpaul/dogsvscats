const AudioContext = (<any>window).AudioContext || (<any>window).webkitAudioContext; // safari :\

export class CoreAudio {
	private context!: AudioContext;

	private audioMap = new Map<string, AudioBuffer>();

	async play(sound: string, speed: number = 1) {
		if (!this.context) {
			this.context = new AudioContext();
		}

		// Chrome and Safari are both awful
		if (this.context.state === 'suspended') {
			this.context.resume();
		}

		speed = Math.max(Math.min(speed, 2), 0.5);
		const buffer = await this.loadCached(sound);
		const source = this.context.createBufferSource();
		source.buffer = buffer;
		source.connect(this.context.destination);
		source.playbackRate.value = speed;
		source.start(this.context.currentTime);

		await new Promise((resolve) => {
			setTimeout(resolve, buffer.duration);
		});
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
		if (this.context.decodeAudioData.length === 1) {
			return await this.context.decodeAudioData(audioData);
		} else {
			return await new Promise<AudioBuffer>((resolve, reject) => {
				this.context.decodeAudioData(audioData, resolve, reject);
			});
		}
	}
}
