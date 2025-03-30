import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
                MatFormFieldModule,
                MatIconModule,
                FormsModule,
                MatInputModule,
                BrowserAnimationsModule],
      declarations: [SettingsComponent]
    });
    fixture = TestBed.createComponent(SettingsComponent);
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
