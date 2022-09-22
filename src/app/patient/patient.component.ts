import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {User} from '../login/login.component';
import {Organisation} from '../organisation/organisation.component';

export interface Patient {
  id: number,
  first_name: string,
  last_name: string,
  age: number,
  notes: string,
  study_id: number,
}

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  patients: Array<Patient>
  firstName: string
  lastName: string
  age: number
  notes: string
  editPatient: Patient
  currentUser: User
  organisations: Array<Organisation>

  constructor(private router: Router, private http: HttpClient) {
    this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    this.load();
  }

  load(): void {
    this.loadPatient();
  }

  loadPatient(): void {
    this.http.get<Array<Patient>>('http://localhost:9080/patients').subscribe((patients) => {
      this.patients = patients;
    });
  }

  delete(patient: Patient): void {
    console.log('delete', patient);
    if (confirm(`Are you sure to delete the patient ${patient.first_name}?`)) {
      this.http.delete<Array<Patient>>('http://localhost:9080/patients?id=' + patient.id).subscribe((response) => {
        this.load();
      });
    }
  }

  edit(patient: Patient): void {
    this.editPatient = patient;
    this.firstName = patient.first_name;
    this.lastName = patient.last_name;
    this.age = patient.age;
    this.notes = patient.notes;
    $('#editPatientDialog').modal('show');
  }

  create(): void {
    this.editPatient = null;
    this.firstName = '';
    this.lastName = '';
    this.age = 0;
    this.notes = '';
    $('#editPatientDialog').modal('show');
  }

  save(): void {
    const body = {firstName: this.firstName, lastName: this.lastName, age: this.age, notes: this.notes}
    if (this.editPatient) {
      this.http.put<User>('http://localhost:9080/patients', {id: this.editPatient.id, ...body}).subscribe((response) => {
        this.loadPatient();
      });
    } else {
      this.http.post<User>('http://localhost:9080/patients', body).subscribe((response) => {
        this.loadPatient();
      });
    }
    $('#editPatientDialog').modal('hide');
  }

  ngOnInit(): void {
  }
}
