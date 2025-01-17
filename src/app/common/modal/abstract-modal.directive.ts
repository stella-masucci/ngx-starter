import { Directive, inject } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

import { ModalAction, ModalCloseEvent } from './modal.model';

/**
 * The AbstractModalDirective serves as the base for the ConfigurableModalComponent and ContainerModalComponent and contains
 * the class properties and functions common to both.
 */
@Directive()
export abstract class AbstractModalDirective {
	/**
	 * Title to display in the modal header
	 */
	title: string;

	/**
	 * Text to display on the modal 'ok' button
	 */
	okText: string;

	/**
	 * Text to display on the modal 'cancel' button
	 */
	cancelText: string;

	modalRef = inject(BsModalRef);

	/**
	 * ModalCloseEvent Subject that emits when the modal is closed for any reason
	 */
	/* eslint-disable-next-line rxjs/finnish */
	onClose: Subject<ModalCloseEvent> = new Subject();

	constructor() {}

	ok() {
		this.modalRef.hide();
		this.onClose.next({ action: ModalAction.OK });
	}

	cancel() {
		this.modalRef.hide();
		this.onClose.next({ action: ModalAction.CANCEL });
	}
}
