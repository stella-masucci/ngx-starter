import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AsyAbstractColumnComponent } from '../asy-abstract-column.component';
import { AsyTableDataSource } from '../asy-table-data-source';

@UntilDestroy()
@Component({
	selector: 'asy-selection-column',
	templateUrl: './asy-selection-column.component.html',
	styleUrls: ['./asy-selection-column.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class AsySelectionColumnComponent<T, TB = T>
	extends AsyAbstractColumnComponent<T>
	implements AfterViewInit, OnInit
{
	@Input()
	enableSelectAll = true;

	@Input()
	clearOnLoad = true;

	@Input()
	multi = true;

	_isAllSelected$: Observable<boolean>;

	_isMultiTemplateDataRows = false;

	private dataSource: AsyTableDataSource<T>;

	private selectionModel: SelectionModel<TB>;

	@Input()
	isSelectable: (index: number, rowData: T) => boolean = () => true;

	@Input()
	trackBy: (index: number, rowData: T) => TB = (index, rowData) => rowData as unknown as TB;

	constructor() {
		super();
		this.name = 'selection';
	}

	override ngOnInit(): void {
		super.ngOnInit();

		this.selectionModel = new SelectionModel<TB>(this.multi);

		if (this._isAsyTableDataSource(this._table.dataSource)) {
			this.dataSource = this._table.dataSource;
			this._isMultiTemplateDataRows = this._table.multiTemplateDataRows;
		} else {
			throw Error(
				'Selection column could not find a parent table with dataSource of type AsyTableDataSource'
			);
		}
	}

	ngAfterViewInit(): void {
		if (this.clearOnLoad) {
			this.dataSource.pagingResults$.pipe(untilDestroyed(this)).subscribe(() => {
				this.selectionModel.clear();
			});
		}

		this._isAllSelected$ = this.selectionModel.changed.pipe(
			untilDestroyed(this),
			map(() => this._isAllSelected())
		);
	}

	select(...trackByValues: TB[]) {
		this.selectionModel.select(...trackByValues);
	}

	toggle(index: number, result: T) {
		this.selectionModel.toggle(this.trackBy(index, result));
	}

	isSelected(index: number, result: T) {
		return this.selectionModel.isSelected(this.trackBy(index, result));
	}

	get selected() {
		return this.selectionModel.selected;
	}

	// eslint-disable-next-line rxjs/finnish
	get changed() {
		return this.selectionModel.changed;
	}

	hasSelection() {
		return this.selectionModel.hasValue();
	}

	_isAllSelected() {
		return (
			this.selectionModel.selected.length > 0 &&
			this.selectionModel.selected.length ===
				this.dataSource.pagingResults$.value.elements.filter((result, index) =>
					this.isSelectable(index, result)
				).length
		);
	}

	_toggleAll() {
		if (this._isAllSelected()) {
			this.selectionModel.clear();
		} else {
			this.dataSource.pagingResults$.value.elements.forEach((result, index) => {
				if (this.isSelectable(index, result)) {
					this.select(this.trackBy(index, result));
				}
			});
		}
	}

	private _isAsyTableDataSource(
		// eslint-disable-next-line rxjs/finnish
		dataSource: DataSource<T> | Observable<ReadonlyArray<T> | T[]> | ReadonlyArray<T> | T[]
	): dataSource is AsyTableDataSource<T> {
		return 'pagingResults$' in dataSource;
	}
}
