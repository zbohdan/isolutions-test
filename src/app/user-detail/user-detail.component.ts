import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FindUserService } from '../find-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  subFindUser: Subscription;
  subRepos: Subscription;
  subParamMap: Subscription;
  routeLogin: string;
  errMsg: string;
  users: any;
  user: any;
  reposAmount: number;

  constructor(
    private findUserService: FindUserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subParamMap = this.route.paramMap.subscribe((params: ParamMap) => {
      const login = params.get('login');
      this.routeLogin = login;
      // console.log('country-detail inner ngOnInit: ', this.routeLogin);
    });
    // console.log(this.findUserService.sharedUsers);
    this.users = this.findUserService.sharedUsers;
    if (this.users) {
      this.user = {
        from: 'shared',
        ...[...this.users.filter(el => el.login === this.routeLogin)][0]
      };
      this.subRepos = this.findUserService
        .getRepos(this.user.url)
        .subscribe(data => (this.user.repos = data));
      // console.log(this.user);
    } else {
      this.subFindUser = this.findUserService
        .getUsers(this.routeLogin, 1)
        .subscribe(
          data => {
            this.users = data;
            // console.log(this.users);
            const userFullInfo = {
              ...[
                ...data.body.items.filter(i => i.login === this.routeLogin)
              ][0]
            };
            this.user = {
              from: 'request',
              login: userFullInfo.login,
              id: userFullInfo.id,
              avatar_url: userFullInfo.avatar_url,
              html_url: userFullInfo.html_url,
              url: userFullInfo.url
            };
            this.subRepos = this.findUserService
              .getRepos(this.user.url)
              .subscribe(
                count => (this.user.repos = count),
                err => (this.errMsg = err)
              );
          },
          err => (this.errMsg = err)
        );
    }
  }
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.subFindUser ? this.subFindUser.unsubscribe() : '';
    this.subRepos ? this.subRepos.unsubscribe() : '';
    this.subParamMap ? this.subParamMap.unsubscribe() : '';
  }
}
