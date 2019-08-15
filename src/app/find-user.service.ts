import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pluck, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FindUserService {
  token = 'a06d7f211fcabac42e1688f6f30365f5ae6eb2a2';
  users;
  constructor(private http: HttpClient) {}
  set sharedUsers(value) {
    this.users = value;
  }
  get sharedUsers() {
    return this.users;
  }
  getUsers(userName, page) {
    return this.http
      .get<any>(
        `https://api.github.com/search/users?q=${userName}&access_token=a06d7f211fcabac42e1688f6f30365f5ae6eb2a2&page=${page}&per_page=100`,
        {
          observe: 'response'
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  getRepos(url) {
    return this.http.get(url).pipe(
      pluck('public_repos'),
      catchError(this.errorHandler)
    );
  }
  errorHandler(error: HttpErrorResponse) {
    return throwError(error.message || 'Server Error');
  }
}
