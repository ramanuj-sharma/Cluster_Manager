import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { StartingComponent } from './starting.component';
import { SpinnerButtonComponent } from '../utils/spinner-button/spinner-button.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('StartingComponent', () => {
  let component: StartingComponent;
  let fixture: ComponentFixture<StartingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
                MatCardModule,
                MatIconModule],
      declarations: [StartingComponent,
                     SpinnerButtonComponent]
    });
    fixture = TestBed.createComponent(StartingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be grouped in two sections', () => {
    expect(fixture.debugElement.nativeElement.querySelectorAll('h2').length).toBe(2);
  });

  it('should initialize backend when clicking start', fakeAsync(() => {
    spyOn(component, 'newClustering');

    const debug = fixture.debugElement.query(By.css('spinner-button'));
    const button = debug.injector.get<SpinnerButtonComponent>(SpinnerButtonComponent);
    button.action.emit()
    tick();
    expect(component.newClustering).toHaveBeenCalled();
  }));

  it('should containg a starting card', () => {
    expect(fixture.debugElement.nativeElement.querySelectorAll('.start').length).toBe(1);
  });
});
