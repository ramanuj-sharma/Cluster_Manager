import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BarChartData, Feature, FeatureClass } from 'src/api/Chart';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SidenavService } from '../sidenav.service';
import { ApiService } from '../api.service';
import { ChartComponent } from './chart.component';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let api: ApiService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        HttpClientModule,
        BrowserAnimationsModule
      ],
      providers: [{provide: ApiService}],
      declarations: [ChartComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    fixture = TestBed.createComponent(ChartComponent);
    api = TestBed.inject(ApiService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner while loading', () => {
    component.loading = true
    fixture.detectChanges()
    expect(fixture.debugElement.nativeElement.querySelector("#spinner")).toBeTruthy()
  })

  it('should show canvas while not loading', () => {
    component.loading = false
    fixture.detectChanges()
    expect(fixture.debugElement.nativeElement.querySelector("#canvas")).toBeTruthy()
  })

  it('should call plot on button press', fakeAsync(() => {
    component.loading = false
    fixture.detectChanges();
    spyOn(component, 'plot');
    let button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null )
    tick();
    fixture.detectChanges();
    expect(component.plot).toHaveBeenCalled();
  }));

  it('should show selector', () => {
    component.loading = false
    fixture.detectChanges()
    expect(fixture.debugElement.nativeElement.querySelector("mat-form-field")).toBeTruthy()
  })

  it('should label selector as feature', () => {
    component.loading = false
    fixture.detectChanges()
    expect(fixture.debugElement.nativeElement.querySelector("mat-label").innerText).toBe("Feature")
  })

  it('should initialize dropdown with 1 option on default', async () => {
    const trigger = fixture.debugElement.query(By.css('mat-select')).nativeElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable().then(() => {
      const inquiryOptions = fixture.debugElement.queryAll(By.css('mat-option'));
      expect(inquiryOptions.length).toEqual(1);
    });
  });

  it('should initialize dropdown with average throughput time on default', async () => {
    const trigger = fixture.debugElement.query(By.css('mat-select')).nativeElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable().then(() => {
      const inquiryOptions = fixture.debugElement.queryAll(By.css('mat-option'));
      expect(inquiryOptions[0].nativeElement.innerText).toBe("Average Throughput Time (Days)");
    })
  });   
});
