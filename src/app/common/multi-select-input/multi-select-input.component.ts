import { Component, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgModel, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'asy-multi-select-input',
	templateUrl: './multi-select-input.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: MultiSelectInputComponent,
			multi: true
		}
	]
})
export class MultiSelectInputComponent implements ControlValueAccessor {
	@Input() placeholder = '';

	@Input() readonly = false;

	@ViewChild(NgModel) model?: NgModel;

	autocompleteOpen = false;

	private innerValue: string[] = [];

	onChange = (_: any) => {};
	onTouched = () => {};

	constructor() {}

	onSearch($event: { term: string }) {
		this.autocompleteOpen = $event.term.trim().length > 0;
	}

	onAdd() {
		this.autocompleteOpen = false;
	}

	get value(): string[] {
		return this.innerValue;
	}

	set value(value: string[]) {
		if (this.innerValue !== value) {
			this.innerValue = value;
			this.onChange(value);
		}
	}

	writeValue(value: string[]) {
		this.innerValue = value;
	}

	registerOnChange(fn: (_: any) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}
}
