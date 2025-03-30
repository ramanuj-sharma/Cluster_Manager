export class Clustering {
    private timestamp: string
    private pool_name: string
    private model_name: string
    private log_size: number
    private clusters: number

    constructor(_timestamp: string, _pool_name: string, _model_name: string, _log_size: number, _clusters: number) {
        this.timestamp = _timestamp
        this.pool_name = _pool_name
        this.model_name = _model_name
        this.log_size = _log_size
        this.clusters = _clusters
    }

    public getID() {
        return this.timestamp
    }
    public getPoolName() {
        return this.pool_name
    }
    public getModelName() {
        return this.model_name
    }
    public getLogSize() {
        return this.log_size
    }
    public getClusters() {
        return this.clusters
    }
    public getDate() {
        let date = new Date(Number(this.timestamp))
        return date.toLocaleDateString() + " - " + date.toLocaleTimeString()
    }
}