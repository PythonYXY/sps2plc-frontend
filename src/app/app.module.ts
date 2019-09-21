// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MaterialModule } from '../material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ProjectsComponent } from './projects/projects.component';
import { AlertComponent } from './alert/alert.component';
import { ProjectDialogComponent } from './project-dialog/project-dialog.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { RequirementDetailsComponent } from './requirement-details/requirement-details.component';
import { RequirementsTabComponent } from './project-details/requirements-tab/requirements-tab.component';
import { TasksTabComponent } from './project-details/tasks-tab/tasks-tab.component';
import { DeleteProjectModalComponent } from './projects/delete-project-modal/delete-project-modal.component';
import { PropertyExpressionWizardComponent } from './pattern-wizard/expression-wizard/property-expression-wizard.component';
import { PatternWizardComponent } from './pattern-wizard/pattern-wizard.component';
import { ScopeExpressionWizardComponent } from './pattern-wizard/expression-wizard/scope-expression-wizard.component';


// Services
import { AuthenticationService } from './services/authentication.service';
import { AlertService } from './alert/alert.service';
import { ProjectService } from './services/project.service';
import { RequirementService } from './services/requirement.service';
import { TaskService } from './services/task.service';
import { InMemoryDataService } from './services/in-memory-data.service';

// Guards
import {AuthGuard} from './auth.guard';

// Http Interceptor
import { JwtInterceptor } from './jwt.interceptor.js';
import { IoTableTabComponent } from './project-details/io-table-tab/io-table-tab.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AlertComponent,
    ProjectsComponent,
    ProjectDialogComponent,
    ProjectDetailsComponent,
    RequirementDetailsComponent,
    RequirementsTabComponent,
    TasksTabComponent,
    PatternWizardComponent,
    PropertyExpressionWizardComponent,
    DeleteProjectModalComponent,
    ScopeExpressionWizardComponent,
    IoTableTabComponent,
    // IOTableTabComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxDatatableModule,
    MaterialModule,
    BrowserAnimationsModule,
    NgbModule.forRoot(),

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.

    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryDataService, { dataEncapsulation: false }
    // )
  ],
  providers: [
    AuthenticationService,
    AuthGuard,
    AlertService,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
    },
    ProjectService,
    RequirementService,
    TaskService,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
