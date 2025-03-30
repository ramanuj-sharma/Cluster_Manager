import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SidenavService } from '../sidenav.service';
import { Network } from 'vis-network';
import { DFG } from 'src/api/DFG';
import { Cluster } from 'src/api/Map';

@Component({
  selector: 'app-dfg',
  templateUrl: './dfg.component.html',
  styleUrls: ['./dfg.component.scss']
})
export class DfgComponent implements OnInit {

  //Gets the div in which the network/DFG is rendered.
  @ViewChild('visNetwork', { static: false }) visNetwork!: ElementRef;
  private networkInstance: any

  //The DFG is saved in a custom class, which offers some functionality for changing edge properties and retrieving basic KPIs.
  dfg?: DFG

  //If loading is true, a spinner is shown instead of the blank canvas
  loading: boolean = true

  //Determines the cut off point below which edges are not shown anymore (in percentage) and the type of label shown on the edges.
  cutOff: number = 20
  label_type: string = "Frequency"

  //Which cluster is shown.
  cluster_id: number = -1

  //The current cluster
  cluster?: Cluster

  //

  constructor(private api: ApiService, private router: Router, private sservice: SidenavService, private route: ActivatedRoute){}

  /** 
   * Retrieves the query parameters and queries the DFG data from the backend and plot it onces its available. Furthermore, the side navigation bar is loaded with data from the DFG.
  */
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.cluster_id = params["cluster_id"] || -1
    })
    this.api.getClusters(true).then(clusters => {
      for (let i = 0; i < clusters.length; i++) {
        if(clusters[i].getID() == this.cluster_id){
          this.cluster = clusters[i]
        }
      }
    })  
    this.sservice.clear()
    this.sservice.setTitle("Drilldown on Cluster " + this.cluster_id)
    this.sservice.addSoloItem("DFG is being computed...", "")
    this.sservice.setNext("Go back to Overview", "/overview", "reload")
    this.api.getDFG(this.cluster_id).then(dfg => {
      this.dfg = dfg
      this.plotDFG()
      this.sservice.clear()
      this.sservice.setTitle("Drilldown on Cluster " + this.cluster_id)
      this.sservice.setSubtitle("Basic KPIs of the current cluster")
      this.sservice.addSoloItem("Number of Cases", String(this.dfg!.numberOfCases()))
      this.sservice.addSoloItem("Number of Distinct Activities", String(this.dfg!.numberOfDistinctActivities()))
      this.sservice.addListItem("Most frequent Activities", ...this.dfg!.mostFrequentActivities(5))
      this.sservice.addListItem("Longest Transition between Activities", ...this.dfg!.longestAverageActivities(5))
      this.sservice.addSoloItem("Quality of Cluster", this.cluster!.getRatio().toFixed(2))
      this.sservice.setNext("Go back to Overview", "/overview", "reload")
    })
  }

  /**
   * Based on the current settings the DFG is plotted. We use fixed options and retrieve the edge and node data from the DFG object.
   * Inside the DFG object the edges are set to hidden, if they are infrequent.
   */
  plotDFG(){
    this.loading = true

    if(this.networkInstance){
      this.networkInstance.destroy()
    }

    this.dfg!.filterOutInfrequent(this.cutOff)

    let data = {
      nodes: this.dfg!.customNodeLayout(),
      edges: this.dfg!.edges.map(value => value.mapToVisJS(this.label_type)),
    }
    let options = {
      height: "100%",
      width: "70vw",
      autoResize: true,
      nodes: {
        shape: 'box',
        color: {
          border: "black",
          background: "white"
        }
      },
      edges: {
        arrows: 'to',
        color: 'blue',
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.3 
        },
        font: {
          align: "horizontal",
          size: 14
        },
        selfReference: {
          size: 40,
          renderBehindTheNode: false
        }
      },
      physics: {
        enabled: true,
        hierarchicalRepulsion: {
          avoidOverlap: 1.0,
          springLength: 300
        }
      },
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: true,
          levelSeparation: 120,
          nodeSpacing: 350,
          edgeMinimization: true,
          blockShifting: true,
          parentCentralization: true,
          direction: 'UD',        // UD, DU, LR, RL
          sortMethod: 'hubsize',  // hubsize, directed
          shakeTowards: 'leaves'  // roots, leaves
        }
      }
    
    }
    const container = this.visNetwork;
    this.networkInstance = new Network(container.nativeElement, data, options)
    this.networkInstance.on("stabilizationIterationsDone", () => {
      this.networkInstance.setOptions( { physics: false } );
    });
    this.loading = false
  }

  /**
   * Used to format the string that is shown on the slider. It only adds a percentage character to the actual value.
   * @param value The number that needs to be formatted.
   * @returns The number as a string concatenated with a percentage character.
   */
  formatLabel(value: number): string {
     return `${value}` + "%";
  }

}
