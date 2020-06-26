import 'cucumber';

declare module 'cucumber' {
	type TypedStepDefinitionCode<T extends unknown> = (this: T, ...stepArgs: any[]) => any;

	export function Given<T extends unknown>(pattern: RegExp | string, code: TypedStepDefinitionCode<T>): void;
	export function Given<T extends unknown>(
		pattern: RegExp | string,
		options: StepDefinitionOptions,
		code: TypedStepDefinitionCode<T>
	): void;
	export function Then<T extends unknown>(
		pattern: RegExp | string,
		options: StepDefinitionOptions,
		code: TypedStepDefinitionCode<T>
	): void;
	export function Then<T extends unknown>(pattern: RegExp | string, code: TypedStepDefinitionCode<T>): void;
	export function When<T extends unknown>(
		pattern: RegExp | string,
		options: StepDefinitionOptions,
		code: TypedStepDefinitionCode<T>
	): void;
	export function When<T extends unknown>(pattern: RegExp | string, code: TypedStepDefinitionCode<T>): void;
}

export interface World {}
