import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'asy-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
	/**
	 * Title to display in the modal header
	 */
	@Input()
	title = '';

	/**
	 * Text to display on the modal 'ok' button
	 */
	@Input()
	okText = 'OK';

	/**
	 * Text to display on the modal 'cancel' button
	 */
	@Input()
	cancelText = 'Cancel';

	@Input()
	disableOk = false;

	@Input()
	autoCaptureFocus = false;

	@Output()
	readonly ok = new EventEmitter<void>();

	@Output()
	readonly cancel = new EventEmitter<void>();

	constructor() {}
}
