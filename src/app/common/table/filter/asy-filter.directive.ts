import { Directive, Input } from '@angular/core';

import isEmpty from 'lodash/isEmpty';

import { AsyTableDataSource } from '../asy-table-data-source';

/** Interface for a directive that holds sorting state consumed by `AsyFilterHeader`. */
export interface AsyFilterable {
	/** The id of the column being filtered. */
	id: string;
	clearFilter(): void;
}

@Directive({
	selector: '[asyFilter]',
	exportAs: 'asyFilter',
	// eslint-disable-next-line @angular-eslint/no-host-metadata-property
	host: { class: 'asy-filter' }
})
export class AsyFilterDirective {
	/** Collection of all registered filterables that this directive manages. */
	filterables = new Map<string, AsyFilterable>();

	filters = new Map<string, any>();

	@Input()
	dataSource: AsyTableDataSource<any>;

	/**
	 * Register function to be used by the contained AsyFilterables. Adds the AsyFilterable to the
	 * collection of AsyFilterables.
	 */
	register(filterable: AsyFilterable): void {
		if (!filterable.id) {
			throw Error(`AsyFilterHeaderComponent must be provided with a unique id.`);
		}

		if (this.filterables.has(filterable.id)) {
			throw Error(`Cannot have two AsyFilterables with the same id (${filterable.id}).`);
		}

		this.filterables.set(filterable.id, filterable);
	}

	/**
	 * Unregister function to be used by the contained AsyFilterables. Removes the AsyFilterable from the
	 * collection of contained AsyFilterables.
	 */
	deregister(filterable: AsyFilterable): void {
		this.filterables.delete(filterable.id);
	}

	constructor() {}

	filter(id: string, query: any): void {
		this.filters.set(id, query);
		this.dataSource.filter(this._buildFilter());
	}

	clearFilter(): void {
		this.filters.clear();
		this.filterables.forEach((f) => {
			f.clearFilter();
		});
	}

	_buildFilter() {
		const queries = [...this.filters.values()].filter((q) => !isEmpty(q));
		if (queries.length === 0) {
			return {};
		}
		return { $and: queries };
	}
}
