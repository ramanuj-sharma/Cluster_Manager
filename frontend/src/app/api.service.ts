import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, min, Observable } from 'rxjs';
import { Key } from 'src/api/Key';
import { DataModel, DataPool, ProcessConfig } from 'src/api/Data';
import { Feature, FeatureClass, BarChartData } from 'src/api/Chart';
import { timeout } from 'rxjs/operators';
import { Cluster, Summary } from 'src/api/Map';
import { DFG, Edge } from 'src/api/DFG';
import { Clustering } from 'src/api/Clustering';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // API prefix to be used. This is redirected by a proxy for development, but functional in production.
  private url = "/api/"

  constructor(private http: HttpClient) { }

  // private blank queries
  private _getServerOnline(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url, { observe: 'response', responseType: 'text' })
  }

  private _getKey(): Observable<Object> {
    return this.http.get(this.url + "key", { observe: 'body', responseType: 'json' })
  }

  private _setKey(key: Key): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "key", { url: key.getURL(), token: key.getToken(), type: key.getType() }, { observe: 'response', responseType: 'text' })
  }

  private _setupCelonis(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "setup", { observe: 'response', responseType: 'text' })
  }

  private _getDataPools(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "pools", { observe: 'response', responseType: 'json' })
  }

  private _getDataModels(pool_id: string): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('pool_id', pool_id);
    return this.http.get(this.url + "models", { observe: 'response', responseType: 'json', params: params })
  }

  private _getProcessConfig(model_id: string): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('model_id', model_id);
    return this.http.get(this.url + "process_config", { observe: 'response', responseType: 'json', params: params })
  }

  private _getFeatures(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "features", { observe: 'response', responseType: 'json'}).pipe(timeout(30000))
  }

  private _getFeaturesFixed(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "features_fixed", { observe: 'response', responseType: 'json'}).pipe(timeout(30000))
  }

  private _getThroughput(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "throughput", { observe: 'response', responseType: 'json'})
  }

  private _getNumerical(table_name: string, column_name: string): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('table_name', table_name).set('column_name', column_name);
    return this.http.get(this.url + "num_feature", { observe: 'response', responseType: 'json', params: params})
  }

  private _getCategorical(table_name: string, column_name: string): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('table_name', table_name).set('column_name', column_name);
    return this.http.get(this.url + "cat_feature", { observe: 'response', responseType: 'json', params: params})
  }

  private _getDate(table_name: string, column_name: string): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('table_name', table_name).set('column_name', column_name);
    return this.http.get(this.url + "date_feature", { observe: 'response', responseType: 'json', params: params})
  }

  private _getEventLogSize(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "size", { observe: 'response', responseType: 'text' })
  }

  private _setMIN_PTS(min_pts: number): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "min_pts", { min_pts: min_pts }, { observe: 'response', responseType: 'text' })
  }

  private _setEPSILON(epsilon: number): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "epsilon", { epsilon: epsilon }, { observe: 'response', responseType: 'text' })
  }

  private _setDimensionAlg(dimension_alg: string): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "dimension_alg", { dimension_alg: dimension_alg }, { observe: 'response', responseType: 'text' })
  }

  private _getMIN_PTS(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "min_pts", { observe: 'response', responseType: 'text' })
  }

  private _getEPSILON(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "epsilon", { observe: 'response', responseType: 'text' })
  }

  private _getDimensionAlg(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "dimension_alg", { observe: 'response', responseType: 'text' })
  }

  private _setClusteringAlgorithm(algorithm: string): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "algorithm", { algorithm: algorithm }, { observe: 'response', responseType: 'text' })
  }

  private _getClusteringAlgorithm(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "algorithm", { observe: 'response', responseType: 'text' })
  }

  private _setFeatureSelection(num: Object, cat: Object, date: Object): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "features_fixed_selection", { num_selection: num, cat_selection: cat, date_selection: date }, { observe: 'response', responseType: 'text' })
  }

  private _getFeatureSelection(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "features_fixed_selection", { observe: 'response', responseType: 'text' })
  }

  private _setManualAlgorithm(algorithm: string): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "manual_alg", { algorithm: algorithm }, { observe: 'response', responseType: 'text' })
  }

  private _getManualAlgorithm(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "manual_alg", { observe: 'response', responseType: 'text' })
  }

  private _setManualK(k: number): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "manual_k", { k: k }, { observe: 'response', responseType: 'text' })
  }

  private _getManualK(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "manual_k", { observe: 'response', responseType: 'text' })
  }

  private _getEstimation(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "estimate", { observe: 'response', responseType: 'text' })
  }

  private _setClusteringColumn(column: string): Observable<HttpResponse<Object>> {
    return this.http.post(this.url + "cluster_column", { column: column }, { observe: 'response', responseType: 'text' })
  }

  private _getClusters(reload: boolean): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('reload', reload);
    return this.http.get(this.url + "cluster", { observe: 'response', responseType: 'json', params: params })
  }

  private _getSummary(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "summary", { observe: 'response', responseType: 'json' })
  }

  private _getExport(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "export", { observe: 'response', responseType: 'text' })
  }

  private _getExportList(): Observable<HttpResponse<Object>> {
    return this.http.get(this.url + "export_list", { observe: 'response', responseType: 'json' })
  }

  private _getLoad(timestamp: string): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('timestamp', timestamp);
    return this.http.get(this.url + "load", { observe: 'response', responseType: 'text', params: params })
  }

  private _getDFG(cluster_id: number): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set('cluster_id', cluster_id)
    return this.http.get(this.url + "dfg", { observe: 'response', responseType: 'json', params: params})
  }

  /* ------------------ */

  // boxed queries

  /**
   * Requests the availability of the backend API server.
   * @returns Promise with value true iff the server's pong returns in time.
   */
  public async getServerOnline(): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._getServerOnline())
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Returns a promise of the {@link Key} used in the backend.
   * @returns The promise of a {@link Key}.
   */
  public async getKey(): Promise<Key> {
    let resp = await firstValueFrom(this._getKey())
    if (!resp || !Object.keys(resp).length) {
      return new Key("", "", "")
    }
    //@ts-ignore
    return new Key(resp['url'], resp['token'], resp['type'])
  }

  /**
   * Sends the key provided as a parameter to the backend.The success value for updating the key is given.
   * @param key The key to be set.
   * @returns Promise with value true iff the update was successful.
   */
  public async setKey(key: Key): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setKey(key))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Initializes the backend with an instance of the Celonis API.
   * @returns A promise with value true iff the creation and connection was successful.
   */
  public async setupCelonis(): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setupCelonis())
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Reads all data pools and returns their names and IDs. The result is based on the key used for the Celonis instance.
   * @returns A promise for a {@link DataPool} array containing the available pools.
   */
  public async getDataPools(): Promise<DataPool[]> {
    let resp = await firstValueFrom(this._getDataPools())
    if (!resp || !Object.keys(resp).length) {
      return []
    }
    let res: DataPool[] = []
    for (let key in resp.body) {
      //@ts-ignore
      res.push(new DataPool(key, resp.body[key]))
    }
    return res
  }

  /**
   * The given data pool is set within the backend and its data models are read.
   * @param pool The data pool to be inspected.
   * @returns A promise for a {@link DataModel} array containing the available pools.
   */
  public async getDataModels(pool: DataPool): Promise<DataModel[]> {
    let resp = await firstValueFrom(this._getDataModels(pool.getID()))
    if (!resp || !Object.keys(resp).length) {
      return []
    }
    let res: DataModel[] = []
    for (let key in resp.body) {
      //@ts-ignore
      res.push(new DataModel(key, resp.body[key]))
    }
    return res
  }

  /**
   * Reads the case and activity tables resp. columns from the provided data model.
   * @param model The data model to be inspected.
   * @returns A promise of a {@link ProcessConfig} containing the desired table IDs and column names.
   */
  public async getProcessConfig(model: DataModel): Promise<ProcessConfig> {
    let resp = await firstValueFrom(this._getProcessConfig(model.getID()))
    if (!resp || !Object.keys(resp).length) {
      return new ProcessConfig("Error", "Error", "Error", "Error", "Error", "Error", ["Error"])
    }
    //@ts-ignore
    let res: ProcessConfig = new ProcessConfig(resp.body['activity_table_id'], resp.body['activity_column'], resp.body['case_table_id'], resp.body['case_column'], resp.body['case_table_alias'], resp.body['activity_table_alias'], resp.body['activity_columns'])
    return res
  }

  /**
   * Reads the size of the current event log from the server.
   * @returns A promise of the size of the current event log.
   */
  public async getEventLogSize(): Promise<number> {
    try {
      let resp = await firstValueFrom(this._getEventLogSize())
      return Number(resp.body)
    } catch {
      return 0
    }
  }

  /**
   * Sets the value of the clustering parameter MIN_PTS on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setMIN_PTS(min_pts: number): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setMIN_PTS(min_pts))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Sets the value of the clustering parameter EPSILON on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setEPSILON(epsilon: number): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setEPSILON(epsilon))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Sets the type of clustering on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setClusteringAlgorithm(algorithm: string): Promise<boolean> {
    let alg = ""
    if(algorithm == "flow") {
      alg = "dbscan"
    } else {
      alg = "manual"
    }
    try {
      let resp = await firstValueFrom(this._setClusteringAlgorithm(alg))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Gets the value of the clustering algorithm on the server.
   * @returns A promise with the algorithm name.
   */
  public async getClusteringAlgorithm(): Promise<string> {
    try {
      let resp = await firstValueFrom(this._getClusteringAlgorithm())
      let res = String(resp.body)
      if(res == "dbscan") {
        res = "flow"
      } else {
        res = "manual"
      }
      console.log("Algorithm", res)
      return res
    } catch {
      return ""
    }
  }

  /**
   * Sets the features for manual clustering on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setFeatureSelection(num: Object, cat: Object, date: Object): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setFeatureSelection(num, cat, date))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Gets the selected clustering features for fixed clustering on the server.
   * @returns A promise with the features.
   */
  public async getFeatureSelection(): Promise<FeatureClass[]> {
    try{
      let resp = await firstValueFrom(this._getFeatureSelection())
      if (!resp || !Object.keys(resp).length) {
        return []
      }
      let res:FeatureClass[] = []
      for(let type in resp.body) {
        let featureType:Feature[] = []
        //@ts-ignore
        for(let table in resp.body[type]){
          //@ts-ignore
          for(let column in resp.body[type][table])
            //@ts-ignore
            featureType.push(new Feature(table, resp.body[type][table][column], type))
        }
        res.push(new FeatureClass(type, featureType))    
      }
      return res
    }
    catch {
      return []
    }
  }

  /**
   * Sets the clustering algorithm for manual clustering on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setManualAlgorithm(algorithm: string): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setManualAlgorithm(algorithm))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Gets the value of the fixed clustering algorithm on the server.
   * @returns A promise with the algorithm name.
   */
  public async getManualAlgorithm(): Promise<string> {
    try {
      let resp = await firstValueFrom(this._getManualAlgorithm())
      return String(resp.body)
    } catch {
      return ""
    }
  }

    /**
   * Sets the number of clusters for manual clustering on the server.
   * @returns A promise with the value true iff the update was successful.
   */
    public async setManualNumberOfClusters(k: number): Promise<boolean> {
      try {
        let resp = await firstValueFrom(this._setManualK(k))
        return resp.status == 200
      } catch {
        return false
      }
    }

    /**
   * Gets the desired number of clusters for fixed clustering from the server.
   * @returns A promise with the number of clusters.
   */
  public async getManualNumberOfClusters(): Promise<number> {
    try {
      let resp = await firstValueFrom(this._getManualK())
      return Number(resp.body)
    } catch {
      return 0
    }
  }

  /**
   * Sets the dimension reduction algorithm for clustering on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setDimensionAlg(dimension_alg: string): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setDimensionAlg(dimension_alg))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Reads the current value of the clustering parameter MIN_PTS from the server.
   * @returns A promise of the value MIN_PTS.
   */
  public async getMIN_PTS(): Promise<number> {
    try {
      let resp = await firstValueFrom(this._getMIN_PTS())
      return Number(resp.body)
    } catch {
      return 0
    }
  }

  /**
   * Reads the current value of the clustering parameter EPSILON from the server.
   * @returns A promise of the value EPSILON.
   */
  public async getEPSILON(): Promise<number> {
    try {
      let resp = await firstValueFrom(this._getEPSILON())
      return Number(resp.body)
    } catch {
      return 0
    }
  }

  /**
   * Reads the current dimension reduction algorithm from the server.
   * @returns A promise with the name of the algorithm.
   */
  public async getDimensionAlg(): Promise<string> {
    try {
      let resp = await firstValueFrom(this._getDimensionAlg())
      return String(resp.body)
    } catch {
      return ""
    }
  }

  /**
   * Invokes the parameter estimation on the server.
   * @returns A promise with true iff the estimation was successful.
   */
  public async getEstimation(): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._getEstimation())
      return Boolean(resp.body)
    } catch {
      return false
    }
  }

  /**
   * Sets the clustering column for the algorithm on the server.
   * @returns A promise with the value true iff the update was successful.
   */
  public async setClusteringColumn(column: string): Promise<boolean> {
    try {
      let resp = await firstValueFrom(this._setClusteringColumn(column))
      return resp.status == 200
    } catch {
      return false
    }
  }

  /**
   * Invokes the clustering procedure on the server. All necessary parameters are used as is from the server.
   * @returns An array of {@link Cluster} instances originated from the cluster of the event log based on MIN_PTS, EPSILON, and the dimension reduction algorithm.
   */
  public async getClusters(reload: boolean = true): Promise<Cluster[]> {
    console.log("Should reload?", !reload)
    let resp = await firstValueFrom(this._getClusters(!reload))
    if (!resp || !Object.keys(resp).length) {
      return []
    }
    let res: Cluster[] = []
    for (let key in resp.body) {
      //@ts-ignore
      res.push(new Cluster(Number(key), resp.body[key]['coords'], resp.body[key]['color'], resp.body[key]['points'], resp.body[key]['ratio']))
    }
    return res
  }

  /**
   * Based on the clustering computed by {@link getClusters()}, basic statistics are queried from the server.
   * @returns A {@link Summary} instance describing the current clustering.
   */
  public async getSummary(): Promise<Summary> {
    try {
      let resp = await firstValueFrom(this._getSummary())
      if (!resp || !Object.keys(resp).length) {
        return new Summary(0, 0, 0)
      }
      
      //@ts-ignore
      return new Summary(Number(resp.body['number_of_clusters']), Number(resp.body['avg_number_distint_activities_per_cluster']), Number(resp.body['avg_number_of_cases_per_cluster']))
    } catch {
      return new Summary(0, 0, 0)
    }
  }

  /**
   * Reads all possible features classified in categorical, numerical and datetime features from the tables usable for the punctual clustering.
   * @returns A promise of an array of {@link FeatureClass}, where each FeatureClass represents one type of feature and keeps an array of features of this type.
   */
  public async getFeaturesFixed(): Promise<FeatureClass[]> {
    try{
      let resp = await firstValueFrom(this._getFeaturesFixed())
      if (!resp || !Object.keys(resp).length) {
        return []
      }
      let res:FeatureClass[] = []
      for(let type in resp.body) {
        let featureType:Feature[] = []
        //@ts-ignore
        for(let table in resp.body[type]){
          //@ts-ignore
          for(let column in resp.body[type][table])
            //@ts-ignore
            featureType.push(new Feature(table, resp.body[type][table][column], type))
        }
        res.push(new FeatureClass(type, featureType))    
      }
      return res
    }
    catch {
      return []
    }
  }


  /**
   * Reads all possible features classified in categorical, numerical and datetime features.
   * @returns A promise of an array of {@link FeatureClass}, where each FeatureClass represents one type of feature and keeps an array of features of this type.
   */
  public async getFeatures(): Promise<FeatureClass[]> {
    try{
      let resp = await firstValueFrom(this._getFeatures())
      if (!resp || !Object.keys(resp).length) {
        return []
      }
      let res:FeatureClass[] = []
      for(let type in resp.body) {
        let featureType:Feature[] = []
        //@ts-ignore
        for(let table in resp.body[type]){
          //@ts-ignore
          for(let column in resp.body[type][table])
            //@ts-ignore
            featureType.push(new Feature(table, resp.body[type][table][column]))
        }
        res.push(new FeatureClass(type, featureType))    
      }
      return res
    }
    catch {
      return []
    }
  }
  /**
   * Reads the average throughput time per cluster and the overall average.
   * @returns A promise of {@link BarChartData}, which arranges the data into datasets, labels for each dataset (only one dataset here) and overall labels (cluster id) and overall mean.
   */
  public async getThroughput(): Promise<BarChartData> {
    let resp = await firstValueFrom(this._getThroughput())
    if (!resp || !Object.keys(resp).length) {
      return new BarChartData([], [[]], [], 0)
    }
    let lables: string[] = []
    let overallMean: number = 0
    let data: number[] = []
    let dataLables: string[] = ["Average Throughput Time"]
    for(let key in resp.body) {
      if (key == '-1'){
        lables.push('Noise Cases')
        //@ts-ignore
        data.push(resp.body[key])
      }
      else if (key == 'overall'){
        //@ts-ignore
        overallMean = resp.body[key]
      }
      else{
        lables.push("Cluster " + key)
        //@ts-ignore
        data.push(resp.body[key])
      }
    }
    return new BarChartData(lables, [data], dataLables, overallMean)
  }

  /**
   * Reads the of a numerical column per cluster and the overall average.
   * @param table_name The name of the table.
   * @param column_name The name of the column.
   * @returns A promise of {@link BarChartData}, which arranges the data into datasets, labels for each dataset (only one dataset here) and overall labels (cluster id) overall mean.
   */
  public async getNumerical(table_name:string, column_name:string): Promise<BarChartData> {
    let resp = await firstValueFrom(this._getNumerical(table_name, column_name))
    if (!resp || !Object.keys(resp).length) {
      return new BarChartData([], [[]], [], 0)
    }
    let lables: string[] = []
    let overallMean: number = 0
    let data: number[] = []
    let dataLables: string[] = [table_name + " -" + column_name]
    for(let key in resp.body) {
      if (key == '-1'){
        lables.push('Noise Cases')
        //@ts-ignore
        data.push(resp.body[key])
      }
      else if (key == 'overall'){
        //@ts-ignore
        overallMean = resp.body[key]
      }
      else{
        lables.push("Cluster " + key)
        //@ts-ignore
        data.push(resp.body[key])
      }
    }
    return new BarChartData(lables, [data], dataLables, overallMean)
  }

  /**
   * Reads the count of how often a value occurs per cluster for categorical columns.
   * @param table_name The name of the table.
   * @param column_name The name of the column.
   * @returns A promise of {@link BarChartData}, which arranges the data into datasets, labels for each dataset (one dataset per feature value) and overall labels (cluster id).
   */
  public async getCategorical(table_name:string, column_name:string): Promise<BarChartData> {
    let resp = await firstValueFrom(this._getCategorical(table_name, column_name))
    if (!resp || !Object.keys(resp).length) {
      return new BarChartData([], [[]], [], 0)
    }
    let lables: string[] = []
    let data: number[][] = []
    let dataLables: string[] = []
    for(let key in resp.body){
      let newDataset: number[] = []
      if(lables.length){
        //@ts-ignore
        for(let cluster in resp.body[key]){
          //@ts-ignore
          newDataset.push(resp.body[key][cluster])
        }
      }
      else{
        //@ts-ignore
        for(let cluster in resp.body[key]){
          //@ts-ignore
          newDataset.push(resp.body[key][cluster])
          lables.push("Cluster " + cluster)
        }
      }
      data.push(newDataset)
      dataLables.push(key)
    }
    return new BarChartData(lables, data, dataLables)
  }

  /**
   * Reads the first and last timestamp of a datetime column per cluster.
   * @param table_name The name of the table.
   * @param column_name The name of the column.
   * @returns A promise of {@link BarChartData}, which arranges the data into datasets, labels for each dataset (one dataset but each datapoint corresponds to two value (start, end)) and overall labels (cluster id).
   */
  public async getDate(table_name:string, column_name:string): Promise<BarChartData> {
    let resp = await firstValueFrom(this._getDate(table_name, column_name))
    if (!resp || !Object.keys(resp).length) {
      return new BarChartData([], [[]], [], 0)
    }
    let lables: string[] = []
    let data: number[][] = []
    let dataLables: string[] = [table_name + " -" + column_name]
    for(let key in resp.body){
      if(key != "-1"){
        lables.push('Cluster ' + key)
        //@ts-ignore
        let start: number = resp.body[key]['START']
        //@ts-ignore
        let stop: number = resp.body[key]['END']
        data.push([start, stop])
      }
    }
    return new BarChartData(lables, data, dataLables)
  }

  /**
   * Reads the DFG for one specific cluster.
   * @param cluster_id The id of the cluster for which the DFG is computed.
   * @returns A promise of {@link DFG}, which saves the nodes as well as the labeled edges.
   */
  public async getDFG(cluster_id:number): Promise<DFG> {
    let resp = await firstValueFrom(this._getDFG(cluster_id))
    if (!resp || !Object.keys(resp).length) {
      return new DFG([], {})
    }
    let orderedEdges = {}
    //@ts-ignore
    for(let node in resp.body['Nodes']){
      //@ts-ignore
      orderedEdges[resp.body['Nodes'][node]] = []
    }
    //@ts-ignore
    for(let edge in resp.body['Edges']){
      //@ts-ignore
      orderedEdges[resp.body['Edges'][edge]['from']].push(new Edge(resp.body['Edges'][edge]['from'], resp.body['Edges'][edge]['to'], resp.body['Edges'][edge]['frequency'], resp.body['Edges'][edge]['performance']))
    }
    //@ts-ignore
    return new DFG(resp.body['Nodes'], orderedEdges)
  }

  /**
   * Saves all relevant parameters in the backend.
   */
  public async getExport(): Promise<boolean> {
    let resp = await firstValueFrom(this._getExport())
    if (!resp || !Object.keys(resp).length) {
      return false
    }
    return resp.status == 200
  }

  /**
   * Reads the lsit of exported clusterings from the backend.
   */
  public async getExportList(): Promise<Clustering[]> {
    let resp = await firstValueFrom(this._getExportList())
    if (!resp || !Object.keys(resp).length) {
      return []
    }
    let res:Clustering[] = []
      for(let timestamp in resp.body) {
        //@ts-ignore
        let clustering = resp.body[timestamp]
        //@ts-ignore
        res.push(new Clustering(timestamp, clustering['pool_name'], clustering['model_name'], Number(clustering['log_size']), Number(clustering['clusters'])))    
      }
      return res
  }

  /**
   * Loads all relevant parameters in the backend.
   * @param timestamp The timestamp of the clustering to be loaded
   */
  public async getLoad(timestamp: string): Promise<boolean> {
    let resp = await firstValueFrom(this._getLoad(timestamp))
    if (!resp || !Object.keys(resp).length) {
      return false
    }
    return resp.status == 200
  }
}
