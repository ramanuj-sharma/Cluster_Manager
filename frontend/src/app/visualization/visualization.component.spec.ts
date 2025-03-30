import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../api.service';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { By } from '@angular/platform-browser';



import { VisualizationComponent } from './visualization.component';
import { FeatureClass } from 'src/api/Chart';

describe('VisualizationComponent', () => {
  let component: VisualizationComponent;
  let fixture: ComponentFixture<VisualizationComponent>;
  let api: ApiService


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        HttpClientModule,
      ],
      providers: [{provide: ApiService}],
      declarations: [VisualizationComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    fixture = TestBed.createComponent(VisualizationComponent);
    api = TestBed.inject(ApiService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display spinner when loading', () => {
    if(component.loading){
      expect(fixture.debugElement.nativeElement.querySelector('mat-spinner')).toBeTruthy()
    }
  })

  it('should set counter by default to 2', () => {
    expect(component.counter).toBe(2)
  })


  it('should increase counter when calling addPlot', () => {
    let counter = component.counter
    component.addPlot()
    expect(component.counter).toBe(counter + 1)
  })

  it('should decrease counter when calling deletePlot', () => {
    let counter = component.counter
    component.deletePlot()
    expect(component.counter).toBe(counter - 1)
  })

  it('should generate exactly counter many IDs when calling generateID', () => {
    let ids = component.generateID()
    expect(ids.length).toBe(component.counter)
  })

  it('should display header and buttons after loading', () => {
    component.loading = true
    fixture.detectChanges()
    expect(fixture.debugElement.query(By.css('#header-container'))).toBeFalsy()
    component.loading = false
    fixture.detectChanges()
    expect(fixture.debugElement.query(By.css('#header-container'))).toBeTruthy()
  })
  
  it('should display charts only when not loading', () => {
    component.loading = true
    fixture.detectChanges()
    expect(fixture.debugElement.query(By.css('#chart-container'))).toBeFalsy()
    component.loading = false
    fixture.detectChanges()
    expect(fixture.debugElement.query(By.css('#chart-container'))).toBeTruthy()
  })

  it('should call deletePlot on button press', fakeAsync(() => {
    component.loading = false
    fixture.detectChanges();
    spyOn(component, 'deletePlot');
    let button = fixture.debugElement.queryAll(By.css('button'))[0];
    button.triggerEventHandler('click', null )
    tick();
    fixture.detectChanges();
    expect(component.deletePlot).toHaveBeenCalled();
  }));

  it('should call addPlot on button press', fakeAsync(() => {
    component.loading = false
    fixture.detectChanges();
    spyOn(component, 'addPlot');
    let button = fixture.debugElement.queryAll(By.css('button'))[1];
    button.triggerEventHandler('click', null )
    tick();
    fixture.detectChanges();
    expect(component.addPlot).toHaveBeenCalled();
  }));

});
