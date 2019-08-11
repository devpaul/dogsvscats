export const enum Route {
	Main = 'catsvsdogs',
	Results = 'results'
}

export const routes = [
	{
		path: 'catsvsdogs',
		outlet: Route.Main,
		defaultRoute: true
	},
	{
		path: 'results',
		outlet: Route.Results
	}
]
