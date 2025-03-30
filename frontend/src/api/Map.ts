export class Cluster {
    private id: number
    private coords: number[][]
    private color: string
    private points: number
    private ratio: number

    constructor(_id: number, _coords: number[][], _color: string, _points: number, _ratio: number) {
        this.id = _id
        this.coords = _coords
        this.color = _color
        this.points = _points
        this.ratio = _ratio
    }

    public getID() {
        return this.id
    }
    public getCoords() {
        return this.coords
    }
    public getColor() {
        return this.color
    }
    public getPoints() {
        return this.points
    }
    public getRatio() {
        return this.ratio
    }
}

export class Summary {
    private number_of_clusters: number
    private avg_number_distint_activities_per_cluster: number
    private avg_number_of_cases_per_cluster: number

    constructor(_number_of_clusters: number, _avg_number_distint_activities_per_cluster: number, _avg_number_of_cases_per_cluster: number) {
        this.number_of_clusters = _number_of_clusters
        this.avg_number_distint_activities_per_cluster = _avg_number_distint_activities_per_cluster
        this.avg_number_of_cases_per_cluster = _avg_number_of_cases_per_cluster
    }

    public getNumberOfClusters() {
        return this.number_of_clusters
    }
    public getAvgNumberDistintActivitiesPerCluster() {
        return this.avg_number_distint_activities_per_cluster
    }
    public getAvgNumberOfCasesPerCluster() {
        return this.avg_number_of_cases_per_cluster
    }
}