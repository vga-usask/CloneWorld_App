import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisViewComponent } from './vis-view.component';

describe('VisViewComponent', () => {
  let component: VisViewComponent;
  let fixture: ComponentFixture<VisViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisViewComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
