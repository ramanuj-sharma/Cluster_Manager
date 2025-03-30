import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavType } from './SidenavType';
import { ListType } from './ListType';
import { SoloType } from './SoloType';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
/**
 * This class represents the right panel displayed on every page of the app.
 * Note: This component is also refered to as Quick Response Panel.
 */
export class SidenavService {

  private sidenav : MatSidenav | undefined

  private title = ""
  private subtitle = ""
  private contentList: SidenavType[] = []
  private next = ""
  private link = ""
  private params: string[] = []

  constructor(private router: Router) { }

  /**
   * Stores the sidenav object for later access.
   * @param sidenav The sidenav object.
   */
  public init(sidenav : MatSidenav) {
    this.sidenav = sidenav
  }

  /**
   * Clears all content from the sidenav.
   */
  public clear() {
    this.title = ""
    this.subtitle = ""
    this.contentList = []
    this.next = ""
    this.link = ""
    this.params = []
  }

  /**
   * Adds an entry of type {@link SoloType} to the sidenav.
   * @param key The title of the section.
   * @param value The paragraph content.
   */
  public addSoloItem(key: string, value: string) {
    this.contentList.push(new SoloType(key, value))
  }

  /**
   * Adds an entry of type {@link ListType} to the sidenav.
   * @param key The title of the section.
   * @param values The unordered list content.
   */
  public addListItem(key: string, ...values: string[]) {
    this.contentList.push(new ListType(key, ...values))
  }

  /**
   * Adds the navigation button the the buttom right corner of the sidenav object.
   * @param text The button caption.
   * @param link The reference URL.
   * @param params A sequence of parameters to the query.
   */
  public setNext(text: string, link: string, ...params: string[]) {
    this.next = text.toUpperCase()
    this.link = link
    this.params = params
  }

  /**
   * Sets the title of the sidenav object.
   * @param title The title of the sidenav object.
   */
  public setTitle(title: string) {
    this.title = title
  }

  /**
   * Sets the subtitle of the sidenav object.
   * @param subtitle The subtitle of the sidenav object.
   */
  public setSubtitle(subtitle: string) {
    this.subtitle = subtitle
  }

  /**
   * Returns if the sidenav has a button object in the bottom right corner.
   * @returns true iff the button is visible
   */
  public hasNext() {
    return this.next != ""
  }

  /**
   * Returns the title of the Quick Response Panel.
   * @returns The title.
   */
  public getTitle() {
    return this.title
  }

  /**
   * Returns the subtitle of the Quick Response Panel.
   * @returns The subtitle.
   */
  public getSubtitle() {
    return this.subtitle
  }

  /**
   * Returns the list of all content elements of the Quick Response Panel.
   * @returns The content list.
   */
  public getContentList() {
    return this.contentList
  }

  /**
   * Returns the display name of the continuation button in the Quick Response Panel.
   * @returns The display name of the bottom right button.
   */
  public getNext() {
    return this.next
  }

  /**
   * Returns the URL of the continuation button in the Quick Response Panel.
   * @returns The URL.
   */
  public getLink() {
    return this.link
  }

  /**
   * Navigates the main content area to the desired locaiton.
   * Incorporates the parameter list.
   */
  public navigate() {
    let queryParams: Object = {}
    for(let param of this.params) {
      //@ts-ignore
      queryParams[param] = "."
    }
    this.router.navigate([this.getLink()], { queryParams: queryParams})
  }

}
