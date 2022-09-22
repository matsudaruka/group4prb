import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Patient} from '../patient/patient.component';
import {HttpClient} from '@angular/common/http';
import {Study} from '../study/study.component';
import {User} from '../login/login.component';
export interface Record {
  id: number,
  score: number,
  notes: string,
  record_time: string,
}
@Component({
  selector: 'app-study-detail',
  templateUrl: './study-detail.component.html',
  styleUrls: ['./study-detail.component.scss']
})
export class StudyDetailComponent implements OnInit {
  studyId: number
  patientId: number
  study: Study
  questions: Array<number>
  notes: string
  records: any[] | Record
  currentPatient: Patient = {
    id: 0,
    first_name: '',
    last_name: '',
    age: 0,
    notes: '',
    study_id: 0
  }

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.route.params.subscribe(params => this.studyId = params.id);
    this.http.get<Study>('http://localhost:9080/studies/' + this.studyId).subscribe((study) => {
      this.study = study;
      this.http.get<Array<Patient>>('http://localhost:9080/studies/' + this.studyId + '/patients').subscribe((patients) => {
        this.study.patients = patients;
      });
    });
    this.questions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  openAddRecordDialog(patient): void {
    this.currentPatient = patient;
    $('#addRecordDialog').modal('show');
  }

  openHistoryRecordDialog(patient): void {
    this.currentPatient = patient;
    // tslint:disable-next-line:max-line-length
    this.http.get<Array<Record>>(`http://localhost:9080/studies/${this.studyId}/patients/${patient.id}/records`).subscribe((response) => {
      this.records = response || [];
    });
    $('#historyRecordDialog').modal('show');
  }

  submit(): void {
    let score = 0;
    for (let i = 0; i < 10; i++) {
      score = score + (+this.questions[i]);
    }
    const body = {
      notes: this.notes,
      score: score,
    };

    // tslint:disable-next-line:max-line-length
    this.http.post<boolean>(`http://localhost:9080/studies/${this.studyId}/patients/${this.currentPatient.id}/records`, body).subscribe((response) => {
      $('#addRecordDialog').modal('hide');
    });
  }

  ngOnInit(): void {
  }

}
