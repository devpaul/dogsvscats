import { Given, Then, When } from 'cucumber';

Given('there is a record of vote results', () => {});

Given('we have not voted', () => {});

Given('we have voted for a {string}', (character: string) => {});

When('we vote for a {string}', (character: string) => {});

Then('the vote for {string} increases', (character: string) => {});

Then('the vote chages from {string} to {string}', (initial: string, character: string) => {});
