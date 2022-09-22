import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

export interface User {
  id: number,
  username: string,
  password: string,
  role: string,
  orgId: number,
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  error: string;

  constructor(private router: Router, private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  login(): void {
    if (!this.username || !this.password) {
      this.error = 'Username and password cannot be empty.';
      return;
    }
    this.http.post<User>('http://localhost:9080/login', {username: this.username, password: this.password}).subscribe((response) => {
      if (response) {
        sessionStorage.setItem('currentUser', JSON.stringify(response));
        this.error = '';
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Username or password is not correct, please try again.'
      }
    });

  }
}

