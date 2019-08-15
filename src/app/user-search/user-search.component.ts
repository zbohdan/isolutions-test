import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {
  isSubmit = false;
  get userName() {
    return this.searchingForm.get('userName');
  }

  searchingForm = this.fb.group({
    userName: ['', Validators.required]
  });
  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {}

  onSubmit(queryData) {
    if (this.searchingForm.get('userName').invalid) {
      this.isSubmit = true;
    } else {
      this.router.navigate(['search/user'], {
        queryParams: { query: queryData }
      });
    }
  }
}
