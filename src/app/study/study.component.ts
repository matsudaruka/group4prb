import { Component, OnInit } from '@angular/core';
import {User} from '../login/login.component';
import {Organisation} from '../organisation/organisation.component';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Patient} from '../patient/patient.component';
import { FormControl } from '@angular/forms';

export interface Study {
  id: number,
  title: string,
  description: string,
  org_id: number,
  patients: Array<Patient>,
}

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss']
})
export class StudyComponent implements OnInit {
  studies: Array<Study>
  title: string
  description: string
  orgId: number
  editStudy: Study
  currentUser: User
  organisations: Array<Organisation>
  patients: Array<Patient>
  selectedPatients: Array<Patient>
  patientList = new FormControl('');

  constructor(private router: Router, private http: HttpClient) {
    this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    this.load();
  }

  load(): void {
    this.http.get<Array<Organisation>>('http://localhost:9080/organisations').subscribe((response) => {
      this.organisations = response;
      this.orgId = this.organisations[0].id;
      this.http.get<Array<Patient>>('http://localhost:9080/patients/available').subscribe((patients) => {
        this.patients = patients;
      });
      this.loadStudy(this.organisations[0].id);
    });
  }

  loadStudy(orgId: number): void {
    this.orgId = orgId;
    this.http.get<Array<Study>>('http://localhost:9080/studies?orgId=' + orgId).subscribe((studies) => {
      this.studies = studies;
    });
  }

  delete(study: Study): void {
    if (confirm(`Are you sure to delete the study ${study.title}?`)) {
      this.http.delete<Array<Study>>('http://localhost:9080/studies?id=' + study.id).subscribe((response) => {
        this.load();
      });
    }
  }

  edit(study: Study): void {
    this.editStudy = study;
    this.title = study.title;
    this.description = study.description;
    this.orgId = study.org_id;
    $('#editStudyDialog').modal('show');
  }

  create(): void {
    this.editStudy = null;
    this.title = '';
    this.description = '';
    $('#editStudyDialog').modal('show');
  }

  save(): void {
    const body = {title: this.title, description: this.description, orgId: this.orgId, patients: this.selectedPatients}
    console.log(this.selectedPatients);
    if (this.editStudy) {
      this.http.put<User>('http://localhost:9080/studies', {id: this.editStudy.id, ...body}).subscribe((response) => {
        this.loadStudy(this.orgId);
      });
    } else {
      this.http.post<User>('http://localhost:9080/studies', body).subscribe((response) => {
        this.loadStudy(this.orgId);
      });
    }
    $('#editStudyDialog').modal('hide');
  }

  ngOnInit(): void {
  }

}
