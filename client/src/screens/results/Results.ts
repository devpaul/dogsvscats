import { v, w } from '@dojo/framework/core/vdom';
import { theme, ThemedMixin } from '@dojo/framework/core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import * as css from './results.m.css';
import { Cat } from '../../widgets/cat/Cat';
import { Dog } from '../../widgets/dog/Dog';

export interface ResultsProperties {
	catCount?: number;
	dogCount?: number;
	fetchResults: () => void;
}

@theme(css)
export class Results extends ThemedMixin(WidgetBase)<ResultsProperties> {
	private _interval: any;

	protected onAttach() {
		const { fetchResults } = this.properties;
		fetchResults();
		this._interval = setInterval(fetchResults, 3000);
	}

	protected onDetach() {
		clearInterval(this._interval);
	}

	protected render() {
		const { catCount, dogCount } = this.properties;

		return v('div', { classes: css.root }, [
			v('div', { classes: css.col }, [
				v('h1', { classes: css.header }, ['Cats']),
				v('p', { classes: css.total }, [`${ catCount !== undefined ? catCount : ''}`]),
				w(Cat, { small: true })
			]),
			v('div', { classes: css.col }, [
				v('h1', { classes: css.header }, ['Dogs']),
				v('p', { classes: css.total }, [`${ dogCount !== undefined ? dogCount : ''}`]),
				w(Dog, { small: true })
			])
		]);
	}
}
