import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../sidenav.service';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { SpinnerButtonComponent } from '../utils/spinner-button/spinner-button.component';
import { Clustering } from 'src/api/Clustering';

@Component({
  selector: 'app-starting',
  templateUrl: './starting.component.html',
  styleUrls: ['./starting.component.scss']
})
export class StartingComponent implements OnInit {

  pending = false
  clusterings: Clustering[] = []

  constructor(private sservice: SidenavService, private api: ApiService, private router: Router) { }

  /**
   * Sets up the content hint in the Quick Response Panel.
   */
  ngOnInit(): void {
    this.api.getExportList().then(res => {
      this.clusterings = res
      console.log(this.clusterings)
    })
    this.sservice.clear()
    this.sservice.setTitle("Clustering Manager")
    this.sservice.setSubtitle("Deep Dive Process Insides")
    this.sservice.addSoloItem("How to Cluster", "The Cluster Manager allows you to partition your data set semantically. That way, you can compare the main variants of your data, gain insides into your process performance, and take actions to achieve business value more precise than ever before.")
    this.sservice.addSoloItem("Getting Started", "You will be guided throughout the clustering process. A detailed reference documentation can be found <a color='accent' href='/help'>here</a>. In particular, you need to setup your Celonis team for working with the Cluster Manager by providing an <a color='accent' href='/settings'>API key</a>.")
    this.sservice.addSoloItem("Starting from Scratch", "If you have not yet obtained a cluster analysis of your data, get started with a clear analysis.")
    this.sservice.addSoloItem("Revisit an Analysis", "In case you have already created a clustering before, your specific parameter configuration is stored. By restoring an existing clustering attempt, you will save much time since no estimation needs to be performed.")
  }

  /**
   * Calls the backend API for initialization of the Celonis connection and redirects to the data selection page.
   */
  newClustering() {
    this.api.setupCelonis().then(state => {
      this.pending = false
      if(state)
        this.router.navigate(['datasets'])
    })
  }

  /**
   * Restores a clustering by initializing the backend, setting the parameters, and invoking the recomputation.
   * @param id The ID of the clustering to be loaded.
   */
  loadClustering(id: string) {
    this.api.setupCelonis().then(state => {
      if(state) {
        this.api.getLoad(id).then(state => {
          if(state) {
            this.router.navigate(['overview'])
          }
        })
      }
    })
  }

}
