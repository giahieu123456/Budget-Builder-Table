import {
  Component,
  HostListener,
  ViewContainerRef,
  OnInit,
} from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddCategoryComponent } from './components/add-category/add-category.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  months: string[] = []; // Dynamically generated months
  startMonth = new Date(new Date().getFullYear(), 0, 1);
  endMonth = new Date(new Date().getFullYear(), 11, 1);
  contextMenuVisible: boolean = false;
  contextMenuX: string = '0px';
  contextMenuY: string = '0px';
  selectedData?: { rowId: string; data: { id: string; value: number } };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.hideContextMenu();
  }
  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.updateMonths();
  }
  ngOnInit(): void {}

  rows: Map<
    string,
    {
      category: string;
      values: { id: string; value: number }[];
      type: 'income' | 'expense';
      id: string;
    }
  > = new Map([
    [
      uuidv4(),
      {
        id: uuidv4(),
        category: 'Salary',
        values: Array.from({ length: 12 }, () => ({ id: uuidv4(), value: 0 })),
        type: 'income',
      },
    ],
    [
      uuidv4(),
      {
        id: uuidv4(),
        category: 'Rent',
        values: Array.from({ length: 12 }, () => ({ id: uuidv4(), value: 0 })),
        type: 'expense',
      },
    ],
    [
      uuidv4(),
      {
        id: uuidv4(),
        category: 'Groceries',
        values: Array.from({ length: 12 }, () => ({ id: uuidv4(), value: 0 })),
        type: 'expense',
      },
    ],
  ]);

  showContextMenu(
    event: MouseEvent,
    selectedData: { rowId: string; data: { id: string; value: number } }
  ): void {
    console.log(this.rows, selectedData);
    event.preventDefault(); // Prevent default right-click menu
    this.contextMenuVisible = true;
    this.contextMenuX = `${event.pageX}px`; // Set menu position
    this.contextMenuY = `${event.pageY}px`;
    this.selectedData = selectedData;
  }

  applyToAll(): void {
    if (this.selectedData) {
      const row = this.rows.get(this.selectedData.rowId);
      if (row) {
        const vlauesUpdated = row?.values.map((item) => {
          if (this.selectedData) {
            item.value = this.selectedData.data.value;
          }
          return item;
        });

        this.rows.set(this.selectedData.rowId, {
          ...row,
          values: vlauesUpdated,
        });
      }
    }
    this.hideContextMenu(); // Hide context menu after applying
  }

  hideContextMenu(): void {
    this.contextMenuVisible = false;
    this.selectedData = undefined;
  }

  updateMonths(): void {
    const startYear = this.startMonth.getFullYear();
    const startM = this.startMonth.getMonth();
    const endYear = this.endMonth.getFullYear();
    const endM = this.endMonth.getMonth();
    const startDate = new Date(startYear, startM - 1); // Start date
    const endDate = new Date(endYear, endM); // End date

    this.months = []; // Reset months array

    // Generate months dynamically (excluding the end month)
    while (startDate < endDate) {
      this.months.push(
        startDate.toLocaleString('default', { month: 'long' }) +
          ' ' +
          startDate.getFullYear()
      );
      startDate.setMonth(startDate.getMonth() + 1); // Move to the next month
    }
    // Update row values to match the new months array
    this.rows.forEach((row) => {
      row.values = Array.from({ length: this.months.length }, () => ({
        id: uuidv4(),
        value: 0,
      }));
    });
  }

  addRow(): void {
    const modal = this.modal.create({
      nzViewContainerRef: this.viewContainerRef,
      nzContent: AddCategoryComponent,
      nzFooter: null,
    });
    modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
    // Return a result when closed
    modal.afterClose.subscribe((result) => {
      if (result.data) {
        const data = result.data;
        this.rows.set(uuidv4(), {
          id: uuidv4(), // Use the same ID for the new row object
          category: data.name,
          values: Array.from({ length: 12 }, () => ({
            id: uuidv4(),
            value: 0,
          })),
          type: data.type,
        });
      }
    });
  }

  deleteRow(rowId: string): void {
    if (this.rows.has(rowId)) {
      this.rows.delete(rowId);
    }
  }

  handleKeyNavigation(
    event: KeyboardEvent,
    rowIndex: number,
    colIndex: number
  ): void {
    const rowsArray = Array.from(this.rows.values()); // Convert Map to array
    const currentRow = rowsArray[rowIndex];
    const totalRows = rowsArray.length;
    const totalCols = currentRow.values.length;
    const table = document.querySelector('nz-table')!;

    // Prevent default Tab or Arrow behavior
    if (
      ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }

    // Handle navigation
    switch (event.key) {
      case 'Tab': // Move to the first cell of the next row
        if (rowIndex < totalRows - 1) {
          const nextRow = table.querySelectorAll('tr')[rowIndex + 3]; // +2 accounts for the header row
          const firstInput = nextRow?.querySelector(
            'input'
          ) as HTMLInputElement;
          firstInput?.focus();
        }
        break;

      case 'ArrowUp': // Move to the cell above
        if (rowIndex > 0) {
          const prevRow = table.querySelectorAll('tr')[rowIndex + 1];
          const inputAbove = prevRow?.querySelectorAll('input')[
            colIndex
          ] as HTMLInputElement;
          inputAbove?.focus();
        }
        break;

      case 'ArrowDown': // Move to the cell below
        if (rowIndex < totalRows - 1) {
          const nextRow = table.querySelectorAll('tr')[rowIndex + 3];
          const inputBelow = nextRow?.querySelectorAll('input')[
            colIndex
          ] as HTMLInputElement;
          inputBelow?.focus();
        }
        break;

      case 'ArrowLeft': // Move to the cell on the left
        if (colIndex > 0) {
          const inputLeft = table
            .querySelectorAll('tr')
            [rowIndex + 2]?.querySelectorAll('input')[
            colIndex - 1
          ] as HTMLInputElement;
          inputLeft?.focus();
        }
        break;

      case 'ArrowRight': // Move to the cell on the right
        if (colIndex < totalCols - 1) {
          const inputRight = table
            .querySelectorAll('tr')
            [rowIndex + 2]?.querySelectorAll('input')[
            colIndex + 1
          ] as HTMLInputElement;
          inputRight?.focus();
        }
        break;
    }
  }

  calculateRowSubtotal(values: { id: string; value: number }[]): number {
    return values.reduce((sum, item) => sum + item.value, 0);
  }

  get totalIncome(): number {
    return Array.from(this.rows.values()) // Convert Map values to an array
      .filter((row) => row.type === 'income') // Filter for rows of type 'income'
      .reduce((sum, row) => sum + this.calculateRowSubtotal(row.values), 0); // Sum the subtotals
  }

  get totalExpense(): number {
    return Array.from(this.rows.values()) // Convert the Map values to an array
      .filter((row) => row.type === 'expense') // Filter rows with type 'expense'
      .reduce((sum, row) => sum + this.calculateRowSubtotal(row.values), 0); // Calculate the sum
  }

  get overallTotal(): number {
    return this.totalIncome - this.totalExpense;
  }
}
