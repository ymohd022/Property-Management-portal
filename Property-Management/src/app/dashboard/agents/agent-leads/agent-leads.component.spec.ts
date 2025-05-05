import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentLeadsComponent } from './agent-leads.component';

describe('AgentLeadsComponent', () => {
  let component: AgentLeadsComponent;
  let fixture: ComponentFixture<AgentLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentLeadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
