import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css'],
})
export class ExchangeComponent implements OnInit {
  public currencySettings: string[] = [];
  public currencyForm!: FormGroup;

  private currency_global = new Map<string, number>();
  private selectedRates: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.selectedRates[0] = null;
    this.selectedRates[1] = null;

    this.currencyForm = new FormGroup({
      inputs: new FormArray([new FormControl(''), new FormControl('')]),
    });

    this.formArr().controls[0].valueChanges.subscribe((changes) =>
      this.formArr().controls[1].patchValue(
        this.convert(changes, this.selectedRates[0]),
        { emitEvent: false }
      )
    );

    this.fetchRates().subscribe();
  }

  valueChanges(arg: number) {
    if (arg) {
      this.ConverSum();
    }
  }

  addCurrency(): void {
    this.selectedRates.push(null);

    this.formArr().push(new FormControl(0));

    this.formArr().controls[0].disable();
  }

  formArr(): FormArray {
    return this.currencyForm.get('inputs') as FormArray;
  }

  onChanges(index: number, val: string) {
    this.selectedRates[index] = val;
  }

  fetchRates() {
    return this.http
      .get<{ rates: [] }>(
        'http://api.exchangeratesapi.io/v1/latest?access_key=160cba66936428b1898767f8b1b71dbb'
      )
      .pipe(
        tap((res) => {
          for (let key in res.rates)
            this.currency_global.set(key, res.rates[key]);

          this.currencySettings = Object.keys(res.rates) as string[];
        })
      );
  }

  Convering(val: number, rate: string): number {
    const base = this.selectedRates[0];
    if (base) {
      return (
        ((this.currency_global.get(base) as number) /
          (this.currency_global.get(rate) as number)) *
        val
      );
    }
    return val;
  }

  convert(val: number, rate: string): number {
    const base = this.selectedRates[1];

    if (base) {
      return (
        ((this.currency_global.get(base) as number) /
          (this.currency_global.get(rate) as number)) *
        val
      );
    }
    return val;
  }

  ConverSum() {
    let sum = 0;
    for (let i = 1; i < this.formArr().controls.length; i++) {
      sum += this.Convering(
        +this.formArr().controls[i].value,
        this.selectedRates[i]
      );
    }
    this.formArr().controls[0].patchValue(sum, { emitEvent: false });
  }

  Delete(i: number) {
    this.currencySettings.splice(i, 1);
    this.formArr().controls.splice(i, 1);
    this.ConverSum();
    if (this.formArr().controls.length === 2) {
      this.formArr().controls[0].enable();
    }
  }
}
