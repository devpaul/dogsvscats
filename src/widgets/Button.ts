import { Handle } from '@dojo/framework/core/Destroyable';
import { LinkProperties } from '@dojo/framework/routing/interfaces';
import Link from '@dojo/framework/routing/Link';
import Router from '@dojo/framework/routing/Router';
import { v, w } from '@dojo/framework/widget-core/d';
import { alwaysRender } from '@dojo/framework/widget-core/decorators/alwaysRender';
import { diffProperty } from '@dojo/framework/widget-core/decorators/diffProperty';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import * as css from './styles/Button.m.css';

export interface ButtonLinkProperties extends LinkProperties {
    selected?: boolean;
}

@alwaysRender()
export class Button extends WidgetBase<ButtonLinkProperties> {
    private _handle: Handle | undefined;

    @diffProperty('routerKey')
	protected onRouterKeyChange(current: ButtonLinkProperties, next: ButtonLinkProperties) {
		const { routerKey = 'router' } = next;
		const item = this.registry.getInjector<Router>(routerKey);
		if (this._handle) {
			this._handle.destroy();
			this._handle = undefined;
		}
		if (item) {
			this._handle = item.invalidator.on('invalidate', () => {
				this.invalidate();
			});
			this.own(this._handle);
		}
	}

	protected onAttach() {
		if (!this._handle) {
			this.onRouterKeyChange(this.properties, this.properties);
		}
    }

    protected render() {
        const selected = this.isSelected();

        return w(Link, { ... this.properties, classes: css.root }, [
            v('div', { classes: [ css.container, selected ? css.selected : undefined ] }, this.children)
        ]);
    }

    private isSelected() {
        const { to, routerKey = 'router' } = this.properties;
		const item = this.registry.getInjector<Router>(routerKey);

		if (item) {
			const router = item.injector();
			const outletContext = router.getOutlet(to);
			if (outletContext) {
                return true;
            }
        }
        return false;
    }
}
