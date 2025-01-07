import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatConfComponent } from './mat-conf.component';

describe('MatConfComponent', () => {
  let component: MatConfComponent;
  let fixture: ComponentFixture<MatConfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatConfComponent]
    });
    fixture = TestBed.createComponent(MatConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
