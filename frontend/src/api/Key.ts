export class Key {
    public url: string
    public token: string
    public type: string

    constructor(_url: string, _token: string, _type: string) {
        this.url = _url
        this.token = _token
        this.type = _type
    }

    public getURL() {
        return this.url
    }
    public getToken() {
        return this.token
    }
    public getType() {
        return this.type
    }
}