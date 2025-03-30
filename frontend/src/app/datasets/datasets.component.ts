import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { DataPool, DataModel } from 'src/api/Data';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from '../api.service';
import { SidenavService } from '../sidenav.service';
import { Feature, FeatureClass } from 'src/api/Chart';


@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent implements OnInit {

  // Data for the first stepper page.
  dataPool = new FormControl<string | DataPool>('');
  dataPoolOptions: DataPool[] = [];
  dataPoolFilteredOptions: Observable<DataPool[]> | undefined;
  pool?: DataPool

  // Data for the second stepper page.
  dataModel = new FormControl<string | DataModel>('');
  dataModelOptions: DataModel[] = [];
  dataModelFilteredOptions: Observable<DataModel[]> | undefined;
  model?: DataModel

  // Data for the third stepper page.
  clustering_goal: string = "flow"

  minpts: number = 1
  epsilon: number = 0
  dimension_alg: string = "TSVD"
  auto_estimate: boolean = true

  column: string = ""
  activity_columns: string[] = []

  features_fixed: FeatureClass[] = []
  alg = "kmeans"
  k = 2

  case_table?: string
  activity_table?: string

  // Boxings for the forms of the first three stepper pages.
  firstFormGroup = this.formBuilder.group({
    firstCtrl: this.dataPool,
  });
  secondFormGroup = this.formBuilder.group({
    secondCtrl: this.dataModel,
  });
  thirdFormGroup = this.formBuilder.group({
    goalCtrl: ['', Validators.required],
    thirdCtrl: ['', Validators.required],
    fourthCtrl: ['', Validators.required],
    fifthCtrl: [''],
    sixCtrl: ['', Validators.required],
    seventhCtrl: ['', Validators.required],
    eighthCtrl: [''],
    ninthCtrl: ['', Validators.required],
    tenthCtrl: ['', Validators.required]
  });

  constructor(private formBuilder: FormBuilder, private api: ApiService, private sservice: SidenavService) { }

  /**
   * Sets up the header content hint in the Quick Response Panel.
   */
  initSidenav() {
    this.sservice.clear()
    this.sservice.setTitle("Preparation")
    this.sservice.setSubtitle("Clustering Configuration")
  }

  /* DataPool */

  /**
   * Sets up the content hint in the Quick Response Panel and loads the available {@link DataPool} objects from the backend.
   */
  ngOnInit() {
    this.initSidenav()
    this.sservice.addSoloItem("Data Pool", "Cluster Manager searches your Celonis team for available data pools. You can select one from the dropdown.<br />Hint: You can start typing the name or ID of your pool to find it.")
    this.api.getDataPools().then(pools => {
      this.dataPoolOptions = pools
      this.dataPoolFilteredOptions = this.dataPool.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : (value!.getName() + value?.getID());
          return name ? this._filterPool(name as string) : this.dataPoolOptions.slice();
        }),
      );
    })
  }

  /**
   * Defines the format of the {@link DataPool} after its selection.
   * @param pool The selected pool.
   * @returns The format string.
   */
  displayDataPool(pool: DataPool): string {
    return pool && pool.getName() ? pool.getName() + ' - [' + pool.getID() + ']' : '';
  }

  /**
   * Filters the list of shown {@link DataPool} objects visible in the dropdown.
   * @param name The user content.
   * @returns The remaining {@link DataPool} objects.
   */
  private _filterPool(name: string): DataPool[] {
    const filterValue = name.toLowerCase();

    return this.dataPoolOptions.filter(option => (option.getName()+option.getID()).toLowerCase().includes(filterValue));
  }

  /* DataModel */

  /**
   * Sets up the content hint in the Quick Response Panel, sends the selected data pool, and loads the available {@link DataModel} objects from the backend.
   */
  setPool() {
    this.initSidenav()
    this.sservice.addSoloItem("Data Pool", this.pool!.getName())
    this.sservice.addSoloItem("Data Model", "Cluster Manager searches your Celonis team for available data models based on your selected data pool. You can select one from the dropdown.<br />Hint: You can start typing the name or ID of your model to find it.")
    this.api.getDataModels(this.pool!).then(models => {
      this.dataModelOptions = models
      this.dataModelFilteredOptions = this.dataModel.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : (value!.getName() + value?.getID());
          return name ? this._filterModel(name as string) : this.dataModelOptions.slice();
        }),
      );
    })
  }

  /**
   * Defines the format of the {@link DataModel} after its selection.
   * @param model The selected model.
   * @returns The format string.
   */
  displayDataModel(model: DataModel): string {
    return model && model.getName() ? model.getName() + ' - [' + model.getID() + ']' : '';
  }

  /**
   * Filters the list of shown {@link DataModel} objects visible in the dropdown.
   * @param name The user content.
   * @returns The remaining {@link DataModel} objects.
   */
  private _filterModel(name: string): DataModel[] {
    const filterValue = name.toLowerCase();

    return this.dataModelOptions.filter(option => (option.getName()+option.getID()).toLowerCase().includes(filterValue));
  }

  /* Parameters */

  /**
   * Sets up the content hint in the Quick Response Panel, sends the selected data model, and asks for the algorithm specific parameters.
   */
  setModel() {
    this.initSidenav()
    this.sservice.addSoloItem("Data Pool", this.pool!.getName())
    this.sservice.addSoloItem("Data Model", this.model!.getName())
    this.api.getProcessConfig(this.model!).then(config => {
      this.case_table = config.getCaseTableAlias()
      this.activity_table = config.getActivityTableAlias()
      this.sservice.addSoloItem("Case Column", config.getCaseColumn())
      this.column = config.getActivityColumn()
      this.sservice.addSoloItem("Activity Column", this.column)
      this.activity_columns = config.getActivityColumns()
      this.api.getFeaturesFixed().then(features => this.features_fixed = features)
    })
    this.sservice.addSoloItem("Algorithm", "Cluster Manager currently supports three techniques to cluster you log. Based on your clustering decisions, a preselection is made. You can then fine-tune you selection.")
  }

  /**
   * Updates the form boxing {@link thirdFormGroup} to either require inputs for MIN_PTS and EPSILON or not.
   */
  clickAuto() {
    console.log(this.auto_estimate)
    if(this.clustering_goal == "flow") {
      this.thirdFormGroup.get('eighthCtrl')?.clearValidators()
      this.thirdFormGroup.get('ninthCtrl')?.clearValidators()
      this.thirdFormGroup.get('tenthCtrl')?.clearValidators()
      if(this.auto_estimate) {
        this.thirdFormGroup.get('thirdCtrl')?.clearValidators()
        this.thirdFormGroup.get('fourthCtrl')?.clearValidators()
        this.thirdFormGroup.get('sixCtrl')?.clearValidators()
      } else {
        this.thirdFormGroup.get('thirdCtrl')?.addValidators(Validators.required)
        this.thirdFormGroup.get('fourthCtrl')?.addValidators(Validators.required)
        this.thirdFormGroup.get('sixCtrl')?.addValidators(Validators.required)
      }
      console.log(this.thirdFormGroup.get('thirdCtrl'))
      console.log(this.thirdFormGroup.get('fourthCtrl'))
    } else {
      this.thirdFormGroup.get('thirdCtrl')?.clearValidators()
      this.thirdFormGroup.get('fourthCtrl')?.clearValidators()
      this.thirdFormGroup.get('sixCtrl')?.clearValidators()
      this.thirdFormGroup.get('seventhCtrl')?.clearValidators()
      this.thirdFormGroup.get('sixCtrl')?.addValidators(Validators.required)
      this.thirdFormGroup.get('eighthCtrl')?.addValidators(Validators.required)
      console.log(this.thirdFormGroup.get('eighthCtrl'))
      this.thirdFormGroup.get('ninthCtrl')?.addValidators(Validators.required)
      this.thirdFormGroup.get('tenthCtrl')?.addValidators(Validators.required)
    }
  }

  /**
   * Sends the parameter selection to the backend and updates the Quick Response Panel.
   */
  setParam() {
    this.initSidenav()
    this.api.setClusteringAlgorithm(this.clustering_goal)
    this.sservice.addSoloItem("Data Pool", this.pool!.getName())
    this.sservice.addSoloItem("Data Model", this.model!.getName())
    if(this.clustering_goal == "flow") {
      if(!this.auto_estimate) {
        this.api.setMIN_PTS(this.minpts)
        this.api.setEPSILON(this.epsilon)
        this.api.setDimensionAlg(this.dimension_alg)
        this.sservice.setNext("LET'S GO", "/overview")
      } else {
        this.api.getEstimation().then(res => this.sservice.setNext("LET'S GO", "/overview"))
      }
      this.sservice.addSoloItem("Algorithm", "DBSCAN")
      this.sservice.addListItem("Parameters", "MIN_PTS: " + (this.auto_estimate ? 'Will be estimated.' : this.minpts), "EPSILON: " + (this.auto_estimate ? 'Will be estimated.' : this.epsilon))
      this.api.setClusteringColumn(this.column)
    } else {
      let num_selection = {}
      let cat_selection = {}
      let date_selection = {}
      //@ts-ignore
      num_selection[this.case_table] = []
      //@ts-ignore
      num_selection[this.activity_table] = []
      //@ts-ignore
      cat_selection[this.case_table] = []
      //@ts-ignore
      cat_selection[this.activity_table] = []
      //@ts-ignore
      date_selection[this.case_table] = []
      //@ts-ignore
      date_selection[this.activity_table] = []
      for(let feature of this.thirdFormGroup!.get('eighthCtrl')!.value!) {
        //@ts-ignore
        if(feature.group_name == "Numerical") {
          //@ts-ignore
          num_selection[feature.table_name].push(feature.column_name)
        //@ts-ignore
        } else if(feature.group_name == "Categorical") {
          //@ts-ignore
          cat_selection[feature.table_name].push(feature.column_name)
        //@ts-ignore
        } else if(feature.group_name == "Datetime") {
        //@ts-ignore
        date_selection[feature.table_name].push(feature.column_name)
      }
      }
      this.api.setFeatureSelection(num_selection, cat_selection, date_selection).then(res => {
        this.api.setManualAlgorithm(this.alg).then(res => {
          this.api.setManualNumberOfClusters(this.k).then(res => {
            this.api.setDimensionAlg(this.dimension_alg).then(res => {
              this.sservice.addSoloItem("Algorithm", this.clustering_goal == "flow"? "Control Flow Clustering": "Along Case/Activity KPIs")
              this.sservice.addListItem("Parameters", "Number of clusters: " + this.k, "Technique: " + this.alg)
              this.sservice.setNext("LET'S GO", "/overview")
            })
          })
        })
      })
    }
    this.api.getProcessConfig(this.model!).then(config => {
      this.sservice.addSoloItem("Case Column", config.getCaseColumn())
      this.sservice.addSoloItem("Activity Column", this.column)
    })
    
  }

}
