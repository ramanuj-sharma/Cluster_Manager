export class Feature {
    private _table_name: string
    private _column_name: string
    private _group_name?: string

    constructor(_table_name: string, _column_name: string, _group_name?: string) {
        this._table_name = _table_name
        this._column_name = _column_name
        this._group_name = _group_name
    }

    get table_name() {
        return this._table_name
    }
    get column_name() {
        return this._column_name
    }
    get group_name() {
        return this._group_name
    }

    get full_name() {
        return this._table_name + " - " + this._column_name
    }
}

export class FeatureClass {
    private _type: string
    private _features: Feature[]

    constructor(type: string, features: Feature[]){
        this._type = type
        this._features = features
    }

    get type(){
        return this._type
    }
    get features(){
        return this._features
    }
}

export class BarChartData {
    private _lables: string[]
    private _data: number[][]
    private _dataLables: string[]
    private _overallMean?: number

    constructor(lables: string[], data: number[][], dataLables: string[], overallMean?: number){
        this._lables = lables
        this._data = data
        this._dataLables = dataLables
        this._overallMean = overallMean
    }

    get lables(){
        return this._lables
    }
    get data(){
        return this._data
    }
    get overallMean(){
        return this._overallMean
    }

    get dataLables(){
        return this._dataLables
    }

}