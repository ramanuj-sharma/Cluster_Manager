import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

import { TooltipComponent } from './tooltip.component';
import { By } from '@angular/platform-browser';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatIconModule, MatTooltipModule],
      declarations: [TooltipComponent]
    });
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the handed over tooltip', () => {
    const debug = fixture.debugElement.query(By.css('mat-icon'));
    const tooltip = debug.injector.get<MatTooltip>(MatTooltip);
    expect(component.tooltip).toEqual(tooltip.message);
  });
});
