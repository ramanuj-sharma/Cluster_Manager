import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule,
              RouterTestingModule,
              BrowserAnimationsModule,
              MatToolbarModule,
              MatSidenavModule],
    declarations: [AppComponent,
                   MatSidenav]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Cluster Manager'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Cluster Manager');
  });

  it(`should have a header`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
  });

  it(`should contain the help button`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink*="help/"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink*="help/"]')?.innerHTML.toLowerCase()).toContain("help");
  });

  it(`should contain the settings button`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink*="settings/"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink*="settings/"]')?.innerHTML.toLowerCase()).toContain("settings");
  });

  it(`should not contain the magic button on start page`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const buttons = fixture.debugElement.queryAll(By.css('a'));
    expect(buttons[2]).toBeFalsy()
  });
});
