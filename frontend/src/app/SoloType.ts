import { SidenavType } from "./SidenavType"

export class SoloType implements SidenavType {
    title = ""
    content = ""

    constructor(_title: string, _content: string) {
        this.title = _title
        this.content = _content
    }

    /**
     * Creates a format string representing the sections title and its paragraph.
     * @returns Format string to be displayed.
     */
    format(): string {
        let res = "<h4>" + this.title + "</h4>"
        res += "<span>" + this.content + "</span>"
        return res
    }
}