import { Component, Input } from '@angular/core';
import { Feature, FeatureClass } from 'src/api/Chart';
import { SidenavService } from '../sidenav.service';
import { ApiService } from '../api.service';
import { Chart, registerables  } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns'
import {enUS} from 'date-fns/locale';

Chart.register(annotationPlugin);
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent {

  //Available features and ID are passed from the Visualization component.
  @Input('features') featureOptions:FeatureClass[] = []
  @Input('ID') id:string = '0'

  //Feature selected in the Selector.
  feature?: string
  
  //Loading used for spinner while chart is created.
  loading = false

  //Saves the actual chart.
  chart: any;

  constructor(private api: ApiService, private sservice: SidenavService) {}

  /**
   * Creates a bar chart for the throughput time in days. For more info on how the chart is composed refer to the documentation of Chart.js.
   */
  private plot_throughput(): void {
    this.api.getThroughput().then( barData => {
      this.chart = new Chart(this.id, {
        type: 'bar',
        data: {
          labels: barData.lables,
          datasets: [
            {
              borderColor: '#41fe37',
              backgroundColor: '#8dfe85',
              data: barData.data[0],
              label: barData.dataLables[0],
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
            annotation: {
              annotations: [{
                  type: 'line',
                  label: {
                    display: true,
                    content: 'Overall Mean',
                    position: 'end',
                    rotation: 270
                  },
                  yMin: barData.overallMean,
                  yMax: barData.overallMean,
                  borderColor: 'black',
                  borderWidth: 1
              }],
            }
          }
        }
      })
      this.loading = false
    })
  }

  /**
   * Creates a bar chart for a numerical feature. For more info on how the chart is composed refer to the documentation of Chart.js.
   * @param table_name The name of the table from which the feature comes from.
   * @param column_name The name of the column.
   */
  private plot_numerical(table_name: string, column_name: string): void{
    this.api.getNumerical(table_name, column_name).then( barData => {
      this.chart = new Chart(this.id, {
        type: 'bar',
        data: {
          labels: barData.lables,
          datasets: [
            {
              borderColor: '#41fe37',
              backgroundColor: '#8dfe85',
              data: barData.data[0],
              label: barData.dataLables[0],
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
            annotation: {
              annotations: [{
                  type: 'line',
                  label: {
                    display: true,
                    content: 'Overall Mean',
                    position: 'end',
                    rotation: 270
                  },
                  yMin: barData.overallMean,
                  yMax: barData.overallMean,
                  borderColor: 'black',
                  borderWidth: 1
              }],
            }
          }
        }
      })
      this.loading = false
    })
  }

  /**
   * Creates a stacked bar chart for a categorical feature. For more info on how the chart is composed refer to the documentation of Chart.js.
   * @param table_name The name of the table from which the feature comes from.
   * @param column_name The name of the column.
   */
  private plot_categorical(table_name: string, column_name: string): void{
    this.api.getCategorical(table_name, column_name).then( barData => {
      let datasets = []
      for(let i = 0; i < barData.data.length; i++){
        datasets.push({data: barData.data[i], label: barData.dataLables[i]})
      }
      this.chart = new Chart(this.id, {
        type: 'bar',
        data: {
          labels: barData.lables,
          datasets: datasets,
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },  
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true
            }
          }
        }
      })
      this.loading = false
    })
  }

  /**
   * Creates a horizontal bar chart for a datetime feature. For processing of datetime unit the adapter for date-fns is used. For more info on how the chart is composed refer to the documentation of Chart.js.
   * @param table_name The name of the table from which the feature comes from.
   * @param column_name The name of the column.
   */
  private plot_date(table_name: string, column_name: string): void{
    this.api.getDate(table_name, column_name).then( barData => {
      let min = barData.data[0][0]
      for(let i = 0; i < barData.data.length; i++){
        if(barData.data[i][0] < min){
          min = barData.data[i][0]
        }
      }
      this.chart = new Chart(this.id, {
        type: 'bar',
        data: {
          labels: barData.lables,
          datasets: [
            {
              borderColor: '#41fe37',
              backgroundColor: '#8dfe85',
              data: barData.data,
              label: barData.dataLables[0],
            },
          ],
        },
        options: {
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false,
            }
          },  
          scales: {
            x: {
              adapters: {
                date: {
                    locale: enUS
                }
              },
              type: 'time',
              min: min,
            },
            y: {
              beginAtZero: true
            }
          }
        }
      })
      this.loading = false
    })
  }

  /**
   * Determines the type of the feature and correspondingly calls one of the 'plot' methods to create a chart.
   */
  plot(){
    if(this.feature){
      this.loading = true
      if(this.chart){
        this.chart.destroy()
      }
      if(this.feature == "Average Throughput Time"){
        this.plot_throughput()
      }
      else{
        let type = this.feature.split("::")[0]
        let full_name = this.feature.split("::")[1]
        let selectedFeature = new Feature(" ", " ")
        for(let i = 0; i < this.featureOptions.length; i++){
          let temp = this.featureOptions[i].features
          for(let j = 0; j < temp.length; j++){
            if(full_name == temp[j].full_name){
              selectedFeature = temp[j]
            }
          }
        }
        if(type == "Numerical"){
          this.plot_numerical(selectedFeature.table_name, selectedFeature.column_name)
        }
        else if (type == "Categorical"){
          this.plot_categorical(selectedFeature.table_name, selectedFeature.column_name)
        }
        else if (type == "Datetime"){
          this.plot_date(selectedFeature.table_name, selectedFeature.column_name)
        }
      }
    }
  }

}
