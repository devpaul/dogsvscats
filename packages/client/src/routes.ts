export const enum Route {
	Main = 'select',
	Results = 'results'
}

export const routes = [
	{
		path: 'select',
		outlet: Route.Main,
		defaultRoute: true
	},
	{
		path: 'results',
		outlet: Route.Results
	}
]
