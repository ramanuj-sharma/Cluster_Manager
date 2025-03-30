import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { DatasetsComponent } from './datasets.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterTestingModule } from '@angular/router/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { By } from '@angular/platform-browser';
import { TooltipComponent } from '../utils/tooltip/tooltip.component';
import { MatSelectModule } from '@angular/material/select';

describe('DatasetsComponent', () => {
  let component: DatasetsComponent;
  let fixture: ComponentFixture<DatasetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
                BrowserAnimationsModule,
                MatStepperModule,
                MatFormFieldModule,
                FormsModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatInputModule,
                RouterTestingModule,
                MatAutocompleteModule,
                MatIconModule,
                MatRadioModule,
                MatSelectModule],
      declarations: [DatasetsComponent, TooltipComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    fixture = TestBed.createComponent(DatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a stepper guide', () => {
    expect(fixture.debugElement.nativeElement.querySelector('mat-stepper')).toBeTruthy();
  });

  it('should consist of four stages', () => {
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));
    expect(steps.length).toBe(4);
  });

  it('should allow selection of data pool', () => {
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));
    expect(steps[0].query(By.css('mat-form-field')).query(By.css('mat-label')).nativeElement.innerText.toLowerCase()).toContain('data pool');
  });

  it('should allow selection of data model', () => {
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));
    expect(steps[1].query(By.css('mat-form-field')).query(By.css('mat-label')).nativeElement.innerText.toLowerCase()).toContain('data model');
  });

  it('should allow selection of parameters', () => {
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));
    expect(steps[2].queryAll(By.css('label'))[4].nativeElement.innerText.toLowerCase()).toContain('parameter');
  });

  it('should display finish tab', () => {
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));
    expect(steps[3].nativeElement.innerText.toLowerCase()).toContain('ready');
  });

  it('should setup quick response panel', fakeAsync(() => {
    spyOn(component, 'initSidenav');
    component.ngOnInit();
    tick();
    expect(component.initSidenav).toHaveBeenCalled();
  }));

  it('should set data pool', fakeAsync(() => {
    spyOn(component, 'setPool');
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));

    const button = steps[0].query(By.css('button'));
    button.nativeElement.click();
    tick();
    expect(component.setPool).toHaveBeenCalled();
  }));

  it('should set data model', fakeAsync(() => {
    spyOn(component, 'setModel');
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));

    const button = steps[1].query(By.css('button'));
    button.nativeElement.click();
    tick();
    expect(component.setModel).toHaveBeenCalled();
  }));

  it('should set parameters', fakeAsync(() => {
    spyOn(component, 'setParam');
    const steps = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-content'));

    const button = steps[2].query(By.css('button'));
    button.nativeElement.click();
    tick();
    expect(component.setParam).toHaveBeenCalled();
  }));
});
