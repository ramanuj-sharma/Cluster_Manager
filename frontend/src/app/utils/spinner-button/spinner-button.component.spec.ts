import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';

import { SpinnerButtonComponent } from './spinner-button.component';

describe('SpinnerButtonComponent', () => {
  let component: SpinnerButtonComponent;
  let fixture: ComponentFixture<SpinnerButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatIconModule],
      declarations: [SpinnerButtonComponent]
    });
    fixture = TestBed.createComponent(SpinnerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be ready initially', () => {
    expect(component.pending).toBeFalse();
  });

  it('should respond to action after being clicked', fakeAsync(() => {
    spyOn(component, 'handle');

    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    tick();
    expect(component.handle).toHaveBeenCalled();
  }));

  it('should be spinning after being clicked', () => {
    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    expect(component.pending).toBeTrue();
  });
});
