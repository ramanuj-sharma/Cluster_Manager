import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../sidenav.service';
import { ApiService } from '../api.service';
import { FeatureClass } from 'src/api/Chart';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent implements OnInit {

  //Features that can be plotted.
  features: FeatureClass[] = []

  //Number of plots.
  counter: number = 2

  //Loading while fetching features.
  loading: boolean = true

  constructor(private sservice: SidenavService, private api: ApiService) {}

  /**
   * Fetches the available features from the backend.
   */
  ngOnInit(): void {
    this.api.getFeatures().then(featureList => {
      this.features = featureList
      this.loading = false
    })
    this.sservice.setNext("Overview", "/overview", "reload")
  }

  /**
   * Generates unique IDs for the different charts.
   * @returns An array of {@link counter} unique strings functioning as IDs.
   */
  generateID(): string[] {
    let res = []
    for (let index = 1; index <= this.counter; index++) {
      res.push("Chart" + index.toString())
    }
    return res
  }

  /**
   * Increments the counter and thereby increasing the number of plots by 1.
   */
  addPlot(): void {
    this.counter++
  }

  /**
   * Decrements the counter and thereby decreasing the number of plots by 1.
   */
  deletePlot(): void {
    this.counter--
  }

}
