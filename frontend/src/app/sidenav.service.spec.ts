import { TestBed } from '@angular/core/testing';

import { SidenavService } from './sidenav.service';

describe('SidenavService', () => {
  let service: SidenavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidenavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set a title', () => {
    service.setTitle("@JASMINE TEST");
    expect(service.getTitle()).toEqual("@JASMINE TEST");
  });

  it('should set a subtitle', () => {
    service.setSubtitle("@JASMINE TEST");
    expect(service.getSubtitle()).toEqual("@JASMINE TEST");
  });

  it('should set a solo item', () => {
    service.addSoloItem("@JASMINE TEST", "SOLO");
    expect(service.getContentList()[0].format()).toContain("@JASMINE TEST");
    expect(service.getContentList()[0].format()).toContain("SOLO");
  });

  it('should set a list item', () => {
    service.addListItem("@JASMINE TEST", "LIST1", "LIST2");
    expect(service.getContentList()[0].format()).toContain("@JASMINE TEST");
    expect(service.getContentList()[0].format()).toContain("LIST1");
    expect(service.getContentList()[0].format()).toContain("LIST2");
  });

  it('should set a next button', () => {
    service.setNext("@JASMINE TEST", "URL");
    expect(service.hasNext()).toBeTrue();
    expect(service.getNext()).toEqual("@JASMINE TEST");
    expect(service.getLink()).toEqual("URL");
  });

  it('should clear the panel', () => {
    service.clear();
    expect(service.getTitle()).toEqual("");
    expect(service.getSubtitle()).toEqual("");
    expect(service.getContentList()).toEqual([]);
    expect(service.getNext()).toEqual("");
    expect(service.getLink()).toEqual("");
  });
});
