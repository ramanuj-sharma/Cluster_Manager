import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    });
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an overlay', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#overlay')).toBeTruthy();
  });

  it('should have an animation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.children[0].children[0].getAnimations({ subtree: true }).length).toBeGreaterThan(0);
  });
});
