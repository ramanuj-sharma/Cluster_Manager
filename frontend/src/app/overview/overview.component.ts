import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ApiService } from '../api.service';
import { Cluster, Summary } from 'src/api/Map';
import { ActivatedRoute, Router } from '@angular/router';
import { SidenavService } from '../sidenav.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  // Parameter modification for DBSCAN
  min_pts = 1 // all slider values are updated once server is ready
  max_pts = 100000

  epsilon = 0

  dimension_alg = "TSVD"

  algorithm = "flow"

  // Parameter modification for k clustering
  alg = "kmeans"
  k = 2

  // Cluster map
  loading = true
  clusters: Cluster[] = []

  private map?: L.Map
  shapes: L.FeatureGroup = L.featureGroup()
  legend = new L.Control({ position: 'bottomright' });

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute, private sservice: SidenavService, private notification: MatSnackBar) { }

  /**
   * Reads the current clustering parameters from the server, invokes clustering, starts loading screen, and prepares the cluster map once the result is available.
   */
  ngOnInit(): void {
    this.loading = true
    this.sservice.clear()
    this.sservice.setTitle("Clustering Results")
    this.sservice.setSubtitle("Basic KPIs of the current clustering")
    this.sservice.addSoloItem("KPIs are being calculated...", "")
    this.api.getClusteringAlgorithm().then(res => {console.log(res);this.algorithm = res})
    this.api.getMIN_PTS().then(min_pts => this.min_pts = min_pts)
    this.api.getEPSILON().then(epsilon => this.epsilon = epsilon)
    this.api.getManualAlgorithm().then(alg => this.alg = alg)
    this.api.getManualNumberOfClusters().then(k => this.k = k)
    this.api.getDimensionAlg().then(dimension_alg => this.dimension_alg = dimension_alg)
    this.api.getEventLogSize().then(size => this.max_pts = size)
    this.api.getClusters(this.route.snapshot.queryParams['reload'] != undefined).then(clusters => {
      this.loading = false
      this.clusters = clusters
      if(this.shapes) {
        this.shapes.remove()
      }
      this.shapes = L.featureGroup()
      this.initMap()
      // Set the Quick Response Panel
      this.api.getSummary().then(summary => {
        this.sservice.clear()
        this.sservice.setTitle("Clustering Results")
        this.sservice.setSubtitle("Basic KPIs of the current clustering")
        this.sservice.addSoloItem("Number of Clusters", String(summary.getNumberOfClusters()))
        this.sservice.addSoloItem("Avg. Number of Cases per Cluster", String(summary.getAvgNumberOfCasesPerCluster().toFixed(2)))
        if(this.algorithm == "flow") {
          this.sservice.addSoloItem("Avg. Number of Distinct Feature Values per Cluster", String(summary.getAvgNumberDistintActivitiesPerCluster().toFixed(2)))
        }
        let ratio_sum = 0
        let point_sum = 0
        let hint_order = []
        for(let cluster of this.clusters) {
          ratio_sum += cluster.getRatio() * cluster.getPoints()
          point_sum += cluster.getPoints()
          hint_order.push(cluster)
        }
        let ratio = ratio_sum / point_sum
        this.sservice.addSoloItem("Quality of the Clustering", ratio.toFixed(2) + " / " + "1.00")
        hint_order.sort(function(a,b){
          const result = a.getRatio() - b.getRatio();
          if(result > 0) {
            return -1
          } else if(result < 0) {
            return 1
          } else {
            return b.getPoints()-a.getPoints()
          }});
        if(clusters.length > 0) {
          this.sservice.addSoloItem("Drilldown Suggestion", "Cluster " + hint_order[0].getID())
        }
        this.sservice.setNext("Visualize Features", "/visualization")

        if(this.clusters.length == 0) {
          this.sservice.clear()
          this.sservice.setTitle("Clustering Results")
          this.sservice.setSubtitle("Basic KPIs of the current clustering")
          this.sservice.addSoloItem("No clusters found.", "")
          this.notification.open("No clusters found. Try modifying the parameters.", "", {duration: 2000})
        }
      })
    })
  }

  /**
   * Creates a blank map consisting of the clusters returned from the server. It adds a legend for the cluster labels and hover texts.
   */
  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 3,
      crs: L.CRS.Simple,
      attributionControl: false,
      preferCanvas: true
    });

    let clusters = this.clusters
    this.loading = false
    this.legend.onAdd = function (map: L.Map) {

      let div = L.DomUtil.create('div', 'info legend')
      div.style.setProperty("padding", "6px 8px")
      div.style.setProperty("background", "rgba(0,0,0,0.1)")
      div.style.setProperty("border-radius", "5px")
      div.style.setProperty("line-height", "18px")

      for (let polygon of clusters) {
        div.innerHTML += '<i style="background:' + polygon.getColor() + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' + 'Cluster ' + polygon.getID() + "<br>";
      }

      return div;
    };
    for (let polygon of clusters) {
      let polygon_leaf: L.Polygon
      //@ts-ignore
      polygon_leaf = L.polygon(polygon.getCoords(), { fillColor: polygon.getColor(), fillOpacity: 0.2, weight: 2, opacity: 1, color: polygon.getColor(), id: polygon.getID() }).addTo(this.map)
      polygon_leaf.bindTooltip("Cluster " + polygon.getID() + "<br />" + (polygon.getPoints()/this.max_pts*100).toFixed(1) + " % cases")
      polygon_leaf.on({
        mouseover: this.hoverPolygon,
        mouseout: this.outPolygon,
        click: this.clickPolygon.bind(this)
      })
      this.shapes.addLayer(polygon_leaf)
    }
    if(this.clusters.length > 0) {
      setTimeout(() => this.map?.fitBounds(this.shapes.getBounds()), 200)
      this.map!.fitBounds(this.shapes.getBounds())
      this.legend.addTo(this.map!)
    }

    setTimeout(() => this.map!.invalidateSize(), 0);
  }

  /**
   * On hover of a cluster, the color gets stronger.
   * @param e The MouseEvent.
   */
  hoverPolygon(e: any) {
    //@ts-ignore
    this.openTooltip();
    e.target.setStyle({
      fillOpacity: 0.6
    })
  }

  /**
   * On release of a cluster, the color gets weaker.
   * @param e The MouseEvent.
   */
  outPolygon(e: any) {
    //@ts-ignore
    this.closeTooltip();
    e.target.setStyle({
      fillOpacity: 0.2
    })
  }

  /**
   * TBD
   * @param e The MouseEvent.
   */
  clickPolygon(e: any) {
    console.log(e.target.options.id)
    this.router.navigate(['drilldown'], { queryParams: { cluster_id: e.target.options.id} })
  }

  /**
   * Sends the updated clustering parameters to the server and invokes a recalculation of the view.
   */
  update() {
    this.api.setMIN_PTS(this.min_pts).then(_ => {
      this.api.setEPSILON(this.epsilon).then(_ => {
        this.api.setDimensionAlg(this.dimension_alg).then(_ => {
          this.api.setManualAlgorithm(this.alg).then(_ => {
            this.api.setManualNumberOfClusters(this.k).then(_ => {
              this.router.navigate([], {
                queryParams: {reload: null},
                queryParamsHandling: 'merge'
              })
              setTimeout(() => this.ngOnInit(), 200);
            })
          })
        })
      })
    })
  }

}
