import { HttpErrorResponse } from '@angular/common/http';
import {
	Component,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import { Router } from '@angular/router';

import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of, Observable } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';

import { ModalAction } from '../../../common/modal/modal.model';
import { ModalService } from '../../../common/modal/modal.service';
import { PagingOptions, PagingResults } from '../../../common/paging.model';
import { isNotNullOrUndefined } from '../../../common/rxjs-utils';
import { SortDirection } from '../../../common/sorting.model';
import { SystemAlertService } from '../../../common/system-alert/system-alert.service';
import { AsyTableDataSource } from '../../../common/table/asy-table-data-source';
import { AsyFilterDirective } from '../../../common/table/filter/asy-filter.directive';
import { ListFilterOption } from '../../../common/table/filter/asy-header-list-filter/asy-header-list-filter.component';
import { AuthorizationService } from '../../auth/authorization.service';
import { SessionService } from '../../auth/session.service';
import { User } from '../../auth/user.model';
import { AddMembersModalComponent } from '../add-members-modal/add-members-modal.component';
import { TeamAuthorizationService } from '../team-authorization.service';
import { TeamMember } from '../team-member.model';
import { TeamRole } from '../team-role.model';
import { Team } from '../team.model';
import { TeamsService } from '../teams.service';

@UntilDestroy()
@Component({
	selector: 'list-team-members',
	templateUrl: './list-team-members.component.html'
})
export class ListTeamMembersComponent implements OnChanges, OnDestroy, OnInit {
	@ViewChild(AsyFilterDirective)
	filter: AsyFilterDirective;

	@Input()
	team!: Team;

	isUserAdmin = false;

	canManageTeam = false;

	teamRoleOptions: any[] = TeamRole.ROLES;

	typeFilterOptions: ListFilterOption[] = [
		{ display: 'Explicit', value: 'explicit', active: false, hide: false },
		{ display: 'Implicit', value: 'implicit', active: false, hide: false }
	];
	roleFilterOptions = TeamRole.ROLES.map(
		(role) =>
			({
				display: role.label,
				value: role.role
			} as ListFilterOption)
	);

	user: User | null = null;

	columns = ['name', 'username', 'lastLogin', 'type', 'role', 'actions'];
	displayedColumns: string[] = [];

	dataSource = new AsyTableDataSource<TeamMember>(
		(request) => this.loadData(request.pagingOptions, request.search, request.filter),
		null,
		{
			sortField: 'name',
			sortDir: SortDirection.asc
		}
	);

	private modalRef: BsModalRef | null = null;

	constructor(
		private bsModalService: BsModalService,
		private modalService: ModalService,
		private router: Router,
		private teamsService: TeamsService,
		private authorizationService: AuthorizationService,
		private teamAuthorizationService: TeamAuthorizationService,
		private sessionService: SessionService,
		private alertService: SystemAlertService
	) {}

	ngOnInit() {
		if (!this.team) {
			throw new TypeError(`'Team' is required`);
		}
		this.alertService.clearAllAlerts();

		this.canManageTeam =
			this.authorizationService.isAdmin() || this.teamAuthorizationService.isAdmin(this.team);

		this.sessionService
			.getSession()
			.pipe(untilDestroyed(this), isNotNullOrUndefined())
			.subscribe((session) => {
				this.user = session?.user ?? null;
				this.isUserAdmin = this.authorizationService.isAdmin();
			});

		this.displayedColumns = this.columns
			.filter((column) => this.canManageTeam || column !== 'actions')
			.filter((column) => this.team.implicitMembers || column !== 'explicit');
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['team']) {
			this.dataSource.reload();
		}
	}

	ngOnDestroy(): void {
		this.modalRef?.hide();
		this.dataSource.disconnect();
	}

	loadData(
		pagingOptions: PagingOptions,
		search: string,
		query: any
	): Observable<PagingResults<TeamMember>> {
		return this.teamsService.searchMembers(this.team, query, search, pagingOptions, {});
	}

	clearFilters() {
		this.dataSource.search('');
		this.filter.clearFilter();
	}

	addMembers() {
		this.modalRef = this.bsModalService.show(AddMembersModalComponent, {
			ignoreBackdropClick: true,
			class: 'modal-dialog-scrollable modal-lg',
			initialState: {
				teamId: this.team._id
			}
		});
		this.modalRef.content.usersAdded
			.pipe(untilDestroyed(this))
			.subscribe((usersAdded: number) => {
				this.alertService.addAlert(`${usersAdded} user(s) added`, 'success', 5000);
				this.modalRef = null;
				this.reloadTeamMembers();
			});
	}

	removeMember(member: TeamMember) {
		this.modalService
			.confirm(
				'Remove member from team?',
				`Are you sure you want to remove member: "${member.userModel.name}" from this team?`,
				'Remove Member'
			)
			.pipe(
				first(),
				filter((action) => action === ModalAction.OK),
				switchMap(() => this.teamsService.removeMember(this.team, member.userModel._id)),
				switchMap(() => this.sessionService.reloadSession()),
				catchError((error: unknown) => {
					if (error instanceof HttpErrorResponse) {
						this.alertService.addClientErrorAlert(error);
					}
					return of(null);
				}),
				untilDestroyed(this)
			)
			.subscribe(() => this.reloadTeamMembers());
	}

	updateRole(member: TeamMember, role: string) {
		// No update required
		if (member.role === role) {
			return;
		}

		// If user is removing their own admin, verify that they know what they're doing
		if (
			this?.user?.userModel._id === member.userModel._id &&
			member.role === 'admin' &&
			role !== 'admin'
		) {
			this.modalService
				.confirm(
					'Remove "Team Admin" role?',
					"Are you sure you want to remove <strong>yourself</strong> from the Team Admin role?<br/>Once you do this, you will no longer be able to manage the members of this team. <br/><strong>This also means you won't be able to give the role back to yourself.</strong>",
					'Remove Admin'
				)
				.pipe(
					first(),
					filter((action) => action === ModalAction.OK),
					switchMap(() => this.doUpdateRole(member, role)),
					switchMap(() => this.sessionService.reloadSession()),
					catchError((error: unknown) => {
						if (error instanceof HttpErrorResponse) {
							this.alertService.addClientErrorAlert(error);
						}
						return of(null);
					}),
					untilDestroyed(this)
				)
				.subscribe(() => {
					// If we successfully removed the role from ourselves, redirect away
					this.router.navigate(['/teams', { clearCachedFilter: true }]);
				});
		} else if (!member.explicit) {
			// Member is implicitly in team, should explicitly add this member with the desired role
			this.addMember(member, role);
		} else {
			this.doUpdateRole(member, role)
				.pipe(
					catchError((error: unknown) => {
						if (error instanceof HttpErrorResponse) {
							this.alertService.addClientErrorAlert(error);
						}
						return of(null);
					}),
					untilDestroyed(this)
				)
				.subscribe(() => this.reloadTeamMembers());
		}
	}

	private addMember(member: TeamMember, role?: string) {
		if (null == this.team._id || null == member) {
			this.alertService.addAlert('Failed to add member. Missing member or teamId.');
			return;
		}

		this.teamsService
			.addMember(this.team, member.userModel._id, role)
			.pipe(
				switchMap(() => this.sessionService.reloadSession()),
				catchError((error: unknown) => {
					if (error instanceof HttpErrorResponse) {
						this.alertService.addClientErrorAlert(error);
					}
					return of(null);
				}),
				untilDestroyed(this)
			)
			.subscribe(() => this.reloadTeamMembers());
	}

	private doUpdateRole(
		member: TeamMember,
		role: string,
		persist: boolean = true
	): Observable<any> {
		if (!persist) {
			member.role = role;
			member.roleDisplay = TeamRole.getDisplay(member.role);
			return of(member);
		}

		return this.teamsService.updateMemberRole(this.team, member.userModel._id, role);
	}

	private reloadTeamMembers() {
		this.dataSource.page(0);
	}
}
