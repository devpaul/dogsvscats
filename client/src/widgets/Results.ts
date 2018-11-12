import { v } from '@dojo/framework/widget-core/d';
import { theme, ThemedMixin } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';

import * as css from './styles/results.m.css';
import * as headcss from './styles/heading.m.css';

export interface ResultsProperties {
	catCount: number;
	dogCount: number;
}

@theme(css)
export class Results extends ThemedMixin(WidgetBase)<ResultsProperties> {
	protected render() {
		const { catCount, dogCount } = this.properties;

		return v('div', { classes: css.root }, [
			v('div', { classes: [headcss.headingContainer, css.voteContainer] }, [
				v('h1', { classes: [headcss.highlighted] }, ['Cats']),
				v('p', [String(catCount)])
			]),
			v('div', { classes: css.voteContainer }, [
				v('h1', { classes: [headcss.highlighted] }, ['Dogs']),
				v('p', [String(dogCount)])
			])
		]);
	}
}
