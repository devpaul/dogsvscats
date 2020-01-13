const ghpages = require('gh-pages');

async function publish() {
	console.log('publishing');
	await ghpages.publish('client/output/dist', (err) => {
		if (err) {
			console.log('failed', err);
		}
		else {
			console.log('published');
		}
	});
}

publish();
