import { create } from '@dojo/framework/core/vdom';
import { CoreAudio } from '../CoreAudio';

const audio = new CoreAudio();
const factory = create();

const player = factory(function() {
	return {
		play(sound: string, rate: number) {
			audio.play(sound, rate);
		}
	};
});
export { player };
