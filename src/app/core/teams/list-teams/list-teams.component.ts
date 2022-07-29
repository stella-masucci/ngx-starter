import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';

import { SystemAlertService } from '../../../common/system-alert/system-alert.service';
import { AsyTableDataSource } from '../../../common/table/asy-table-data-source';
import { AuthorizationService } from '../../auth/authorization.service';
import { Team } from '../team.model';
import { TeamsService } from '../teams.service';
import { BaseListTeamsComponent } from './base-list-teams.component';

@Component({
	templateUrl: './list-teams.component.html',
	styleUrls: ['./list-teams.component.scss']
})
export class ListTeamsComponent
	extends BaseListTeamsComponent
	implements OnChanges, OnDestroy, OnInit
{
	constructor(
		teamsService: TeamsService,
		alertService: SystemAlertService,
		authorizationService: AuthorizationService
	) {
		super(
			teamsService,
			alertService,
			authorizationService,
			new AsyTableDataSource<Team>(
				(request) => this.loadData(request.pagingOptions, request.search, request.filter),
				'list-teams-component',
				{
					sortField: 'name',
					sortDir: 'ASC'
				}
			)
		);
	}
}
