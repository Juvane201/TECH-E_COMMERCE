import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BttnPrimaryComponent } from './bttn-primary.component';

describe('BttnPrimaryComponent', () => {
  let component: BttnPrimaryComponent;
  let fixture: ComponentFixture<BttnPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BttnPrimaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BttnPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
