import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GitCloneViewComponent } from './git-clone-view.component';

describe('GitCloneViewComponent', () => {
  let component: GitCloneViewComponent;
  let fixture: ComponentFixture<GitCloneViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GitCloneViewComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GitCloneViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
