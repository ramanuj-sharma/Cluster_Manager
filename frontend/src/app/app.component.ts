import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { SidenavService } from './sidenav.service';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentChecked {
  title = 'Cluster Manager';

  // Quick Response Panel
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(public router : Router, public sservice : SidenavService, private cdref: ChangeDetectorRef, private api: ApiService){ }

  /**
   * Keeps track of updates
   */ 
  ngAfterContentChecked(): void {
    this.sservice.init(this.sidenav)
    this.cdref.detectChanges()
  }

  /**
   * Redirect to main page
   */
  goToStart() {
    this.router.navigate(["/"])
  }

  /**
   * Saves the current clustering parameters to the backend.
   */
  restart_or_save() {
    this.api.getExport().then(res => {
      this.goToStart()
    })
  }

}
