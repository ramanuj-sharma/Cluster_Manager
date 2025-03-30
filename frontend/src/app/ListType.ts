import { SidenavType } from "./SidenavType"

export class ListType implements SidenavType {
    title = ""
    content: string[] = []

    constructor(_title: string, ...contents: string[]) {
        this.title = _title
        this.content = contents
    }

    /**
     * Creates a format string representing the sections title and an unordered list.
     * @returns Format string to be displayed.
     */
    public format(): string {
        let res = "<h4>" + this.title + "</h4>"
        res += "<ul>"
        for(let item of this.content) {
            res += "<li>" + item + "</li>"
        }
        res += "</ul>"
        return res
    }

    /**
     * Adds a list item to the unordered list.
     * @param element The list item to be added.
     */
    public add(element: string) {
        this.content.push(element)
    }
}