import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountViewComponent } from './account-view.component';

describe('AccountViewComponent', () => {
  let component: AccountViewComponent;
  let fixture: ComponentFixture<AccountViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountViewComponent]
    });
    fixture = TestBed.createComponent(AccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
