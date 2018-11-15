import { v, w } from '@dojo/framework/widget-core/d';
import { theme, ThemedMixin } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';

import * as css from './styles/results.m.css';
import { Cat } from './Cat';
import { Dog } from './Dog';

export interface ResultsProperties {
	catCount: number;
	dogCount: number;
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
		const { catCount = 0, dogCount = 0 } = this.properties;

		return v('div', { classes: css.root }, [
			v('div', { classes: css.col }, [
				v('h1', { classes: css.header }, ['Cats']),
				v('p', { classes: css.total }, [`${catCount}`]),
				w(Cat, { small: true })
			]),
			v('div', { classes: css.col }, [
				v('h1', { classes: css.header }, ['Dogs']),
				v('p', { classes: css.total }, [`${dogCount}`]),
				w(Dog, { small: true })
			])
		]);
	}
}
