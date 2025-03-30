export class DataPool {
    private name: string
    private id: string

    constructor(_id: string, _name: string) {
        this.id = _id
        this.name = _name
    }

    public getName() {
        return this.name
    }
    public getID() {
        return this.id
    }
}

export class DataModel {
    private name: string
    private id: string

    constructor(_id: string, _name: string) {
        this.id = _id
        this.name = _name
    }

    public getName() {
        return this.name
    }
    public getID() {
        return this.id
    }
}

export class ProcessConfig {
    private activity_table_id: string
    private activity_column: string
    private case_table_id: string
    private case_column: string
    private case_table_alias: string
    private activity_table_alias: string
    private activity_columns: string[]

    constructor(_activity_table_id: string, _activity_column: string, _case_table_id: string, _case_column: string, _case_table_alias: string, _activity_table_alias: string, _activity_columns: string[]) {
        this.activity_table_id = _activity_table_id
        this.activity_column = _activity_column
        this.case_table_id = _case_table_id
        this.case_column = _case_column
        this.case_table_alias = _case_table_alias
        this.activity_table_alias = _activity_table_alias
        this.activity_columns = _activity_columns
    }

    public getActivityTableID() {
        return this.activity_table_id
    }
    public getCaseTableID() {
        return this.case_table_id
    }
    public getActivityColumn() {
        return this.activity_column
    }
    public getCaseColumn() {
        return this.case_column
    }
    public getActivityColumns() {
        return this.activity_columns
    }
    public getCaseTableAlias() {
        return this.case_table_alias
    }
    public getActivityTableAlias() {
        return this.activity_table_alias
    }
}