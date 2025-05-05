import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLeadDialogComponent } from './add-lead-dialog.component';

describe('AddLeadDialogComponent', () => {
  let component: AddLeadDialogComponent;
  let fixture: ComponentFixture<AddLeadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLeadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLeadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
