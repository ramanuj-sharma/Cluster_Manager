import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { OverviewComponent } from './overview.component';
import { TooltipComponent } from '../utils/tooltip/tooltip.component';
import { LoaderComponent } from '../utils/loader/loader.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ApiService } from '../api.service';
import { Cluster } from 'src/api/Map';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let api: ApiService;

  class ApiMock {
    constructor() { }
    public getMIN_PTS() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
    public getEPSILON() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
    public getDimensionAlg() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
    public getEventLogSize() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
    public getClusters(): Promise<Cluster[]> {
      return new Promise((resolve, reject) => {
        setTimeout(() => { resolve([]) }, 1000);
      })
    }
    public setMIN_PTS() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
    public setEPSILON() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
    public setDimensionAlg() {
      return new Promise((resolveInner) => {
        setTimeout(resolveInner, 1000);
      })
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
        BrowserAnimationsModule,
        MatSliderModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        MatTooltipModule,
        HttpClientModule,
        MatSnackBarModule,
        RouterTestingModule],
      declarations: [OverviewComponent, TooltipComponent, LoaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      //providers: [{provide: ApiService, useValue: new ApiMock()}]
    });
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    //api = TestBed.get(ApiService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tooltip', () => {
    expect(fixture.debugElement.nativeElement.querySelector('tooltip')).toBeTruthy();
  });

  it('should display loading screen', () => {
    expect(fixture.debugElement.nativeElement.querySelector('loader')).toBeTruthy();
  });

  it('should display map', () => {
    expect(fixture.debugElement.nativeElement.querySelector('#map')).toBeTruthy();
  });

  it('should bound MIN_PTS slider by default with lower bound 1', () => {
    expect(component.min_pts).toBe(1);
  });

  it('should bound MIN_PTS slider by default with upper bound 100000', () => {
    expect(component.max_pts).toBe(100000);
  });

  it('should set EPSILON slider by default to 0', () => {
    expect(component.epsilon).toBe(0);
  });

  it('should set dimension reduction algorithm selector by default to TSVD', () => {
    expect(component.dimension_alg).toEqual('TSVD');
  });

  /*it('should initialize map', fakeAsync(() => {
    //@ts-ignore
    var spy = spyOn(component, 'initMap');
    component.ngOnInit();
    //@ts-ignore
    expect(spy).toHaveBeenCalled();
  }));*/

  it('should perform update', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'update');

    let button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null )
    tick();
    fixture.detectChanges();
    expect(component.update).toHaveBeenCalled();
  }));
});
