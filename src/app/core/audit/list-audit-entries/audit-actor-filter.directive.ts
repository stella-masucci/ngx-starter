import { Directive, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PagingOptions } from '../../../common/paging.model';
import { AsyHeaderTypeaheadFilterComponent } from '../../../common/table/filter/asy-header-typeahead-filter/asy-header-typeahead-filter.component';
import { AuditService } from '../audit.service';

@Directive({
	selector: 'asy-header-filter[typeahead-filter][audit-actor-filter]'
})
export class AuditActorFilterDirective implements OnInit {
	constructor(
		private typeaheadFilter: AsyHeaderTypeaheadFilterComponent,
		private auditService: AuditService
	) {}

	ngOnInit() {
		this.typeaheadFilter.typeaheadFunc = this.typeaheadSearch;
		this.typeaheadFilter.buildFilterFunc = this.buildFilter;
	}

	typeaheadSearch(term: string): Observable<any> {
		return this.auditService
			.matchUser({}, term, new PagingOptions(), {})
			.pipe(map((pagingResult) => pagingResult.elements));
	}

	buildFilter(selectedValue: any): any {
		if (selectedValue) {
			return {
				['audit.actor._id']: {
					$obj: selectedValue.userModel._id
				}
			};
		}
	}
}
