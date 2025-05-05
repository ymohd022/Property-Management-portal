import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAgentDialogComponent } from './assign-agent-dialog.component';

describe('AssignAgentDialogComponent', () => {
  let component: AssignAgentDialogComponent;
  let fixture: ComponentFixture<AssignAgentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignAgentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAgentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
