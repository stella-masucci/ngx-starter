import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { concat, of, Observable, Subject } from 'rxjs';
import {
	catchError,
	debounceTime,
	distinctUntilChanged,
	map,
	switchMap,
	tap
} from 'rxjs/operators';

import { isNotNullOrUndefined } from '../../../common/rxjs-utils';
import { SessionService } from '../../auth/session.service';
import { User } from '../../auth/user.model';
import { MasqueradeService } from '../masquerade.service';

@UntilDestroy()
@Component({
	templateUrl: './masquerade.component.html'
})
export class MasqueradeComponent implements OnInit {
	usersLoading = false;
	usersInput$ = new Subject<string>();

	users$: Observable<User[]>;

	selectedUserDn: string;

	isMasquerading = false;

	searchByDn = false;

	constructor(
		public router: Router,
		private masqueradeService: MasqueradeService,
		private sessionService: SessionService
	) {}

	ngOnInit() {
		if (this.masqueradeService.getMasqueradeDn()) {
			this.isMasquerading = true;
			this.masqueradeService.clear();
			window.location.href = '/api/auth/signout';
		} else {
			this.sessionService
				.getSession()
				.pipe(untilDestroyed(this), isNotNullOrUndefined())
				.subscribe((session) => {
					if (session.user.userModel.canMasquerade) {
						this.loadUsers();
					} else {
						window.location.href = '#/';
					}
				});
		}
	}

	submit() {
		this.masqueradeService.setMasqueradeDn(this.selectedUserDn);
		window.location.href = '/api/auth/signout';
	}

	private loadUsers() {
		this.users$ = concat(
			of([]), // default items
			this.usersInput$.pipe(
				debounceTime(200),
				distinctUntilChanged(),
				tap(() => (this.usersLoading = true)),
				switchMap((term) => this.masqueradeService.searchUsers({}, term)),
				map((result) => result.elements),
				catchError(() => of([])), // empty list on error
				tap(() => {
					this.usersLoading = false;
				})
			)
		);
	}
}
