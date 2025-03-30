import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { HelpComponent } from './help/help.component';
import { StartingComponent } from './starting/starting.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { OverviewComponent } from './overview/overview.component';
import { VisualizationComponent } from './visualization/visualization.component';
import { DfgComponent } from './dfg/dfg.component';

/**
 * Routes within the app.
 * Format: YOUR_URL/path --> Replaces <router-outlet></router-outlet> with the specified component.
 */
let routes: Routes = [{path: '', component: StartingComponent},
                      { path: 'settings', component: SettingsComponent },
                      {path: 'help', component: HelpComponent},
                      {path: 'datasets', component: DatasetsComponent},
                      {path: 'overview', component: OverviewComponent},
                      {path: 'visualization', component: VisualizationComponent},
                      {path: 'drilldown', component: DfgComponent}]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
