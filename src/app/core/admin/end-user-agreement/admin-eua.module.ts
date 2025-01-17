import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { DirectivesModule } from '../../../common/directives.module';
import { ModalModule } from '../../../common/modal.module';
import { ModalService } from '../../../common/modal/modal.service';
import { PipesModule } from '../../../common/pipes.module';
import { SearchInputModule } from '../../../common/search-input.module';
import { SystemAlertModule } from '../../../common/system-alert.module';
import { TableModule } from '../../../common/table.module';
import { AdminUsersService } from '../user-management/admin-users.service';
import { AdminCreateEuaComponent } from './admin-create-eua.component';
import { AdminUpdateEuaComponent } from './admin-edit-eua.component';
import { EuaService } from './eua.service';
import { AdminListEuasComponent } from './list-euas/admin-list-euas.component';

@NgModule({
	imports: [
		BsDropdownModule.forRoot(),
		CommonModule,
		DirectivesModule,
		FormsModule,
		ModalModule,
		PipesModule,
		RouterModule,
		SystemAlertModule,
		SearchInputModule,
		CdkTableModule,
		TableModule
	],
	exports: [],
	declarations: [AdminListEuasComponent, AdminCreateEuaComponent, AdminUpdateEuaComponent],
	providers: [AdminUsersService, EuaService, ModalService]
})
export class AdminEuaModule {}
