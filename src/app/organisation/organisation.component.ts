import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import * as bootstrap from 'bootstrap';
import {User} from '../login/login.component';

export interface Organisation {
  id: number,
  name: string,
}


@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.scss']
})

export class OrganisationComponent implements OnInit {
  organisations: Array<Organisation>
  orgName: string
  editObj: Organisation

  constructor(private router: Router, private http: HttpClient) {
    this.load();
  }

  load(): void {
    this.http.get<Array<Organisation>>('http://localhost:9080/organisations').subscribe((response) => {
      this.organisations = response;
    });
  }

  delete(org: Organisation): void {
    console.log('delete', org);
    if (confirm(`Are you sure to delete the org ${org.name}?`)) {
      this.http.delete<Array<Organisation>>('http://localhost:9080/organisations?id=' + org.id).subscribe((response) => {
        this.load();
      });
    }
  }

  edit(org: Organisation): void {
    this.editObj = org;
    this.orgName = org.name;
    $('#editOrgDialog').modal('show');
  }

  create(): void {
    this.editObj = null;
    this.orgName = '';
    $('#editOrgDialog').modal('show');
  }

  save(): void {
    if (this.editObj) {
      this.http.put<User>('http://localhost:9080/organisations', {id: this.editObj.id, name: this.orgName}).subscribe((response) => {
        this.load();
      });
    } else {
      this.http.post<User>('http://localhost:9080/organisations', {name: this.orgName}).subscribe((response) => {
        this.load();
      });
    }
    $('#editOrgDialog').modal('hide');
  }

  ngOnInit(): void {
  }
}
