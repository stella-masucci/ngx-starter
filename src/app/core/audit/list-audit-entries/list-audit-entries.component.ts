import { Component, OnDestroy, ViewChild } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { PagingOptions, PagingResults } from '../../../common/paging.model';
import { AsyTableDataSource } from '../../../common/table/asy-table-data-source';
import { AsyFilterDirective } from '../../../common/table/filter/asy-filter.directive';
import { ConfigService } from '../../config.service';
import { AuditViewChangeModalComponent } from '../audit-view-change-modal/audit-view-change-modal.component';
import { AuditViewDetailsModalComponent } from '../audit-view-details-modal/audit-view-details-modal.component';
import { AuditService } from '../audit.service';

@UntilDestroy()
@Component({
	templateUrl: './list-audit-entries.component.html',
	styleUrls: ['./list-audit-entries.component.scss']
})
export class ListAuditEntriesComponent implements OnDestroy {
	@ViewChild(AsyFilterDirective)
	filter: AsyFilterDirective;

	displayedColumns = [
		'actor',
		'created',
		'audit.action',
		'audit.auditType',
		'object',
		'before',
		'message'
	];

	dataSource = new AsyTableDataSource(
		(request) => this.loadData(request.pagingOptions, request.search, request.filter),
		'list-audit-entries-component',
		{
			sortField: 'created',
			sortDir: 'DESC'
		}
	);

	private auditModalRef: BsModalRef | null = null;

	constructor(
		private auditService: AuditService,
		private modalService: BsModalService,
		private configService: ConfigService
	) {
		this.configService
			.getConfig()
			.pipe(first(), untilDestroyed(this))
			.subscribe((config) => {
				if (config?.masqueradeEnabled) {
					this.displayedColumns.push('masqueradingUser');
				}
			});
	}

	ngOnDestroy() {
		this.dataSource.disconnect();
	}

	loadData(pagingOptions: PagingOptions, search: string, query: any): Observable<PagingResults> {
		return this.auditService.search(query, search, pagingOptions);
	}

	clearFilters() {
		this.dataSource.search('');
		this.filter.clearFilter();
	}

	viewMore(auditEntry: any, type: string) {
		switch (type) {
			case 'viewDetails':
				this.auditModalRef = this.modalService.show(AuditViewDetailsModalComponent, {
					ignoreBackdropClick: true,
					class: 'modal-dialog-scrollable modal-lg',
					initialState: {
						auditEntry
					}
				});
				break;
			case 'viewChanges':
				this.auditModalRef = this.modalService.show(AuditViewChangeModalComponent, {
					ignoreBackdropClick: true,
					class: 'modal-dialog-scrollable modal-lg',
					initialState: {
						auditEntry
					}
				});
				break;
			default:
				break;
		}
	}
}
