import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HelpComponent } from './help.component';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
                MatFormFieldModule,
                MatIconModule,
                FormsModule,
                MatInputModule,
                BrowserAnimationsModule],
      declarations: [HelpComponent]
    });
    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the key from the backend', fakeAsync(() => {
    spyOn(component, 'ngOnInit');

    tick();
    expect(component.key).toBeTruthy();
  }));

  it('should have three inputs for the three key components', () => {
    expect(fixture.debugElement.nativeElement.querySelectorAll('mat-form-field').length).toBe(3);
  });

  it('should have an update button at bottom of page', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
    expect(buttons[buttons.length - 1].innerText).toContain('Save');
  });

  it('should save changes on click', fakeAsync(() => {
    spyOn(component, 'save');

    const debugs = fixture.debugElement.queryAll(By.css('button'));
    const button = debugs[debugs.length - 1];
    button.nativeElement.click();
    tick();
    expect(component.save).toHaveBeenCalled();
  }));
});
