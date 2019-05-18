import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.authService.logout();
  }

  goToHome(){
    this.router.navigate(['members','home']);
  }

}
