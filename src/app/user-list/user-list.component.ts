import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FindUserService } from '../find-user.service';
import { HttpResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { from, interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  sharedUserInfo: any;
  resultCounts = [100, 200, 300, 400, 500];
  maxResults = 200;
  num: number;
  page: number;
  totalCount: number;
  remainingRequests: number;
  timeToUpdate: number;
  subTime: Subscription;
  subParamMap: Subscription;
  subGetUsers: Subscription;
  selectedId: string;
  errorMsg: string;
  avatar: string;
  displayedColumns = ['id', 'login', 'avatar'];
  foundUsers: any[];
  additionalArray: any[];
  dataSource: any;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private findUserService: FindUserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subParamMap = this.route.queryParamMap.subscribe(
      (params: ParamMap) => {
        this.subGetUsers
          ? this.subGetUsers.unsubscribe()
          : `console.log('first user-list load')`;
        const id = params.get('query');
        this.selectedId = id || '';
        // console.log('user-list inner ngOnInit: ', this.selectedId);
        this.getUserList();
      },
      err => (this.errorMsg = err),
      () => {}
    );
  }
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.subTime ? this.subTime.unsubscribe() : '';
    this.subParamMap ? this.subParamMap.unsubscribe() : '';
    this.subGetUsers ? this.subGetUsers.unsubscribe() : '';
  }
  getUserList() {
    this.subGetUsers = this.findUserService
      .getUsers(this.selectedId, 1)
      .subscribe(
        (data: HttpResponse<any>) => {
          this.num = 0;
          this.page = 1;
          this.getRequests(data);
          // console.log(data);
          this.totalCount = data.body.total_count;
          this.sharedUserInfo = data.body.items.map(element => {
            return {
              id: element.id,
              login: element.login,
              avatar_url: element.avatar_url,
              html_url: element.html_url,
              url: element.url
            };
          });
          this.findUserService.sharedUsers = this.sharedUserInfo;
          this.foundUsers = data.body.items.map(element => {
            this.num++;
            return {
              id: this.num,
              login: element.login,
              avatar: element.avatar_url
            };
          });

          this.getAdditionalRequests();
        },
        err => (this.errorMsg = err),
        () => {
          this.dataSource = new MatTableDataSource<any>(this.foundUsers);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      );
  }
  getAdditionalRequests() {
    // console.log(
    //   `i am in additioanl request: this.totalCount = ${
    //     this.totalCount
    //   }, this.num =  ${this.num}, this.maxResults =  ${this.maxResults}`
    // );
    if (this.num >= this.maxResults || this.num === this.totalCount) {
      // console.log('i am in first if of additioanl request');
      this.additionalArray = [];
      from(this.foundUsers)
        .pipe(
          take(
            this.totalCount > this.maxResults
              ? this.maxResults
              : this.totalCount
          )
        )
        .subscribe(data => this.additionalArray.push(data));
      this.dataSource = new MatTableDataSource<any>(this.additionalArray);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
    if (
      this.totalCount > 100 &&
      this.num < this.totalCount &&
      this.num < this.maxResults
    ) {
      // console.log('i am in second if of additioanl request');

      this.page++;
      this.findUserService.getUsers(this.selectedId, this.page).subscribe(
        (dataNext: HttpResponse<any>) => {
          this.getRequests(dataNext);
          // console.log(dataNext);
          // console.log(`Found users arr`, this.foundUsers);
          this.sharedUserInfo = [
            ...this.sharedUserInfo,
            ...dataNext.body.items.map(element => {
              return {
                id: element.id,
                login: element.login,
                avatar: element.avatar_url,
                html_url: element.html_url,
                url: element.url
              };
            })
          ];
          this.findUserService.sharedUsers = this.sharedUserInfo;
          // console.log('SERVICE', this.findUserService.sharedUsers);
          this.foundUsers = [
            ...this.foundUsers,
            ...dataNext.body.items.map(element => {
              this.num++;
              // console.log(`this.num = ${this.num}`);
              return {
                id: this.num,
                login: element.login,
                avatar: element.avatar_url
              };
            })
          ];
        },
        err => (this.errorMsg = err),
        () => {
          this.getAdditionalRequests();
          this.dataSource = new MatTableDataSource<any>(this.foundUsers);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      );

      // this.foundUsers = [1, 2, 3];
    }
  }

  getRequests(data) {
    this.remainingRequests = data.headers.get('X-RateLimit-Remaining');
    this.subTime ? this.subTime.unsubscribe() : '';
    let timeRemaining = Math.ceil(
      (new Date(
        parseInt(data.headers.get('X-RateLimit-Reset'), 10) * 1000
      ).getTime() -
        new Date().getTime()) /
        1000
    );
    this.subTime = interval(1000).subscribe(() => {
      this.timeToUpdate = timeRemaining--;
      if (this.timeToUpdate === 0) {
        this.remainingRequests = 30;
        this.subTime.unsubscribe();
      }
    });
  }

  clickRow(e: any) {
    // console.log('yea, targetImage: ', e.target.parentNode);

    if (e.target.parentNode.nodeName === 'TD') {
      // console.log(
      //   'Result from image: ',
      //   e.target.parentNode.parentNode.cells[1].firstChild.textContent
      // );
      this.router.navigate(
        [e.target.parentNode.parentNode.cells[1].firstChild.textContent],
        { relativeTo: this.route }
      );
    } else {
      // console.log(
      //   'yea, target: ',
      //   e.target.parentNode.cells[1].firstChild.textContent
      // );
      this.router.navigate(
        [e.target.parentNode.cells[1].firstChild.textContent],
        { relativeTo: this.route }
      );
    }
  }
}
