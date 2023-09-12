import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTableInnerComponent } from './transaction-table-inner.component';

describe('TransactionTableInnerComponent', () => {
  let component: TransactionTableInnerComponent;
  let fixture: ComponentFixture<TransactionTableInnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionTableInnerComponent]
    });
    fixture = TestBed.createComponent(TransactionTableInnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
