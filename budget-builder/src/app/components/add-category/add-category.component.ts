import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss',
  standalone: false,
})
export class AddCategoryComponent {
  categoryTypes = [
    { name: 'Income', value: 'income' },
    { name: 'Expense', value: 'expense' },
  ];
  constructor(private modal: NzModalRef, private message: NzMessageService) {}
  categoryForm: FormGroup = new FormBuilder().group({
    name: ['', [Validators.required]],
    type: ['', [Validators.required]],
  });
  destroyModal(): void {
    if (!this.categoryForm.valid) {
      this.message.create(
        'error',
        `Please provide the name and type of category`
      );
      return;
    }
    this.modal.close({ data: this.categoryForm.value });
  }
}
