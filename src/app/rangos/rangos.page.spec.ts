import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RangosPage } from './rangos.page';

describe('RangosPage', () => {
  let component: RangosPage;
  let fixture: ComponentFixture<RangosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RangosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
