export class Edge {
    private _from: string
    private _to: string
    private _frequency: string
    private _performance: {[key: string]: number}
    private _hidden: boolean = false

    constructor(from: string, to: string, frequency: string, performance:{[key: string]: number}, hidden?: boolean){
        this._from = from
        this._to = to
        this._performance = performance
        this._frequency = frequency
        this._hidden = hidden || false
    }

    get from(){
        return this._from
    }

    get to(){
        return this._to
    }

    get frequency(){
        return this._frequency
    }

    get hidden(){
        return this._hidden
    }

    get performance(){
        return this._performance
    }

    set hidden(hidden: boolean){
        this._hidden = hidden
    }
    
    /**
     * Returns the edge as an object that fits the VisJs API.
     * @param label_type The type of label that is shown on the edge. Currently accepted labels: Frequency, Median (Hours), Median (Days), Mean (Hours), Mean (Days).
     * @returns An object of the form {'from': string , 'to': string, 'label': string, 'hidden:' boolean}
     */
    public mapToVisJS(label_type: String){
        if(label_type == "Frequency"){
            return {'from': this.from, 'to': this.to, 'label': String(this._frequency), 'hidden': this.hidden}
        }
        else if(label_type == "Median (Hours)"){
            return {'from': this.from, 'to': this.to, 'label': Math.round(this._performance['median']/3600) + " Hours", 'hidden': this.hidden}
        }
        else if(label_type == "Median (Days)"){
            return {'from': this.from, 'to': this.to, 'label': Math.round(this._performance['median']/86400).toFixed(0) + " Days", 'hidden': this.hidden}
        }
        else if(label_type == "Mean (Hours)"){
            return {'from': this.from, 'to': this.to, 'label': Math.round(this._performance['mean']/3600).toFixed(0) + " Hours", 'hidden': this.hidden}
        }
        else if(label_type == "Mean (Days)"){
            return {'from': this.from, 'to': this.to, 'label': Math.round(this._performance['mean']/86400).toFixed(0) + " Days", 'hidden': this.hidden}
        }
        else{
            return {'from': this.from, 'to': this.to, 'label': String(this._frequency), 'hidden': this.hidden}
        }
    }
}



export class DFG {
    private _nodes: string[]
    //Internally the edges are saved in an object such that for each node we have one array that saves all edges starting at that node.
    private _edges: {[key: string]: Edge[]}

    constructor(nodes: string[], edges: {[key: string]: Edge[]}) {
        this._nodes = nodes
        this._edges = edges
    }

    get nodes(){
        return this._nodes
    }

    /**
     * @returns The edges as one entire array.
     */
    get edges(){
        let result: Edge[] = []
        for(let key in this._edges){
            result = result.concat(this._edges[key])
        }
        return result
    }

    /**
     * Set the hidden property of all edges with a frequency less than the cutoff to true. In case a node becomes terminal set all edges leading there also to hidden.
     * @param cutOff The percentage of cases that at least need to flow through an edge such that it is shown.
     */
    public filterOutInfrequent(cutOff: number){
        let numCases = this.numberOfCases()
        const limit = Math.floor(numCases * cutOff/100)
        for(let key in this._edges){
            this._edges[key].forEach((edge) => edge.hidden = false)
        }
        for(let key in this._edges){
            this._edges[key].forEach((edge) => {
                if(parseInt(edge.frequency) < limit){
                    edge.hidden = true
                }
            })
            if(this._edges[key].every((edge) =>  edge.hidden) && key != "Process End"){
                for(let otherKey in this._edges){
                    this._edges[otherKey].forEach((edge) => {if(edge.to == key) edge.hidden = true})
                }
            } 
        }
    }

    public mapNodesToLabelID(): any[]{
        return this._nodes.map(value => ({
          id: value, label: value
        }))
    }

    /**
     * Gives each node a level property by starting a breath first search from the Process Start and counting how many steps are needed until the corresponding node is reached. Hidden edges are ignored.
     * @returns An array of objects of the form {'id': string, 'label': string, 'level': hidden}
     */
    public customNodeLayout() {
        const result = []
        const visited = new Set()
        const queue = [{node: "Process Start", level: 0}]
        let maxLvl = 0
        while(queue.length){
            const current = queue.shift()!
            if(!visited.has(current.node)){
                visited.add(current.node)
                if(current.node == "Process Start"){
                    result.push({id: current.node, label: current.node, level: current.level, color: '#5cfe50'})
                }
                else{
                    result.push({id: current.node, label: current.node, level: current.level})
                }
                maxLvl = maxLvl < current.level + 1  ? current.level + 1 : maxLvl
                for(let i = 0; i < this._edges[current.node].length; i++){
                    const edge = this._edges[current.node][i]
                    if(edge.hidden == false && edge.to != "Process End"){
                        queue.push({node: edge.to, level: current.level + 1})
                    }
                }
            }
        }        
        result.push({id: "Process End", label: "Process End", level: maxLvl, color: '#5cfe50'})
        return result
    }

    /**
     * Calculates the number of cases in the cluster.
     * @returns The number of cases in the cluster.
     */
    public numberOfCases(): number {
        let result = 0
        for (let i = 0; i < this._edges['Process Start'].length; i++) {
            result += parseInt(this._edges['Process Start'][i].frequency)
        }
        return result
    }

    /**
     * Calculates the number of distinct activities in the cluster
     * @returns The number of distinct activities in the cluster.
     */
    public numberOfDistinctActivities(): number {
        return this._nodes.length - 2
    }

    /**
     * Calculates the most frequent activities in the cluster.
     * @param numAct The number of activities that is returned.
     * @returns A sorted string array, where the most frequent activity is first and each string is of the following form: "Activity: Frequency".
     */
    public mostFrequentActivities(numAct: number): string[] {
        let frequencyCount = []
        for(let key in this._edges){
            if(key != "Process Start" && key != "Process End"){
                let frequency = 0
                for (let i = 0; i < this._edges[key].length; i++) {
                    frequency += parseInt(this._edges[key][i].frequency)
                }
                frequencyCount.push({name: key, freq: frequency})
            }
        }
        frequencyCount.sort((a, b) => (b.freq - a.freq))
        if(numAct > frequencyCount.length){
            numAct = frequencyCount.length
        }
        let result = []
        for (let i = 0; i < numAct; i++) {
           result.push(frequencyCount[i].name + ": " + frequencyCount[i].freq)   
        }
        return result
    }

    /**
     * Calculates the transitions that take the longest.
     * @param numAct The number of transitions that is returned.
     * @returns A sorted string array, where the longest transition is first and each string is of the following form: "Activity - Activity: Duration"
     */
    public longestAverageActivities(numAct: number): string[] {
        let averageTimeTaken = this.edges.sort((a,b) => (b.performance['mean'] - a.performance['mean']))
        let result = []
        for (let i = 0; i < numAct; i++) {
           result.push(averageTimeTaken[i].from + " - " + averageTimeTaken[i].to + ": " + Math.round(averageTimeTaken[i].performance['mean']/86400) + " Days")   
        }
        return result
    }
}