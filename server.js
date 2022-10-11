//server.js
var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

//DB connection
const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'prb'
})
connection.connect()

app.get('/', function (req, res) {
    res.send('Hello World!');
})

app.post('/login', function (req, res) {
    connection.query(`SELECT *
                      from users
                      where username = '${req.body.username}'
                        and password = '${req.body.password}'`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows[0]);
        }
    })
})

app.get('/organisations', function (req, res) {
    connection.query(`SELECT *
                      from organisation`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows);
        }
    })
})

app.post('/organisations', function (req, res) {
    connection.query(`insert into organisation(name)
                      values ('${req.body.name}')`, (err, rows, fields) => {
        if (err) throw err
        res.send({result: true});
    })
})

app.put('/organisations', function (req, res) {
    connection.query(`update organisation
                      set name='${req.body.name}'
                      where id = ${req.body.id}`, (err, rows, fields) => {
        if (err) throw err
        res.send({result: true});
    })
})

app.delete('/organisations', function (req, res) {
    console.log(req.query.id);
    connection.query(`delete
                      from organisation
                      where id = ${req.query.id}`, (err, rows, fields) => {
        if (err) throw err
        res.send({result: true});
    })
})

app.get('/patients', function (req, res) {
    connection.query(`SELECT * from patient`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows);
        }
    })
})

app.post('/patients', function (req, res) {
    connection.query(`insert into patient(first_name, last_name, age, notes)
                      values ('${req.body.firstName}', '${req.body.lastName}', ${req.body.age}, '${req.body.notes}')`, (err, rows, fields) => {
        if (err) throw err
        res.send({result: true});
    })
})

app.put('/patients', function (req, res) {
    connection.query(`update patient
                      set first_name='${req.body.firstName}', last_name='${req.body.lastName}', age=${req.body.age}, notes='${req.body.notes}'
                      where id = ${req.body.id}`, (err, rows, fields) => {
        if (err) throw err
        res.send({result: true});
    })
})

app.delete('/patients', function (req, res) {
    console.log(req.query.id);
    connection.query(`delete
                      from patient
                      where id = ${req.query.id}`, (err, rows, fields) => {
        if (err) throw err
        res.send({result: true});
    })
})

app.put('/studies', function (req, res) {
    connection.query(`update patient set study_id=NULL where study_id=${req.body.id}`, (err, rows, fields) => {
        if (err) throw err
        connection.query(`update patient set study_id=${req.body.id} where id in (${req.body.patients})`, (err, rows, fields) => {
            if (err) throw err
            connection.query(`update study
                          set title='${req.body.title}', description='${req.body.description}'
                          where id = ${req.body.id}`, (err, rows, fields) => {
                if (err) throw err
                res.send({result: true});
            })
        })
    });

})

app.post('/studies', function (req, res) {
    connection.query(`insert into study(title, description, org_id)
                      values ('${req.body.title}', '${req.body.description}', ${req.body.orgId})`, (err, result, fields) => {
        if (err) throw err
        const newStudyId = result.insertId;
        connection.query(`update patient set study_id=${newStudyId} where id in (${req.body.patients})`, (err, rows, fields) => {
            if (err) throw err
            res.send({result: true});
        })
    });
})

app.get('/studies', function (req, res) {
    connection.query(`SELECT study.id, study.title, study.description, study.status, study.org_id, count(patient.id) as number_of_patients
                      from study left join patient on(patient.study_id=study.id)
                      where org_id = ${req.query.orgId} group by study.id, study.title, study.description, study.org_id, study.status order by status desc`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows);
        }
    })
})

app.get('/studies/:id', function (req, res) {
    connection.query(`SELECT * from study where id = ${req.params.id}`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows[0]);
        }
    })
})

app.get('/studies/:id/patients', function (req, res) {
    connection.query(`SELECT * from patient where study_id = ${req.params.id}`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows);
        }
    })
})

app.get('/patients/available', function (req, res) {
    connection.query(`SELECT * from patient where study_id is null`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows);
        }
    })
})

app.delete('/studies', function (req, res) {
    console.log('======', req.query.action);
    if(req.query.action){
        console.log('if======', req.query.action);
        connection.query(`update patient set study_id=NULL where study_id=${req.query.id}`, (err, rows, fields) => {
            if (err) throw err
            connection.query(`update study set status='Completed' where id = ${req.query.id}`, (err, rows, fields) => {
                if (err) throw err
                res.send({result: true});
            })
        })
    } else {
        console.log('else======', req.query.action);
        connection.query(`update patient set study_id=NULL where study_id=${req.query.id}`, (err, rows, fields) => {
            if (err) throw err
            connection.query(`delete
                      from study
                      where id = ${req.query.id}`, (err, rows, fields) => {
                if (err) throw err
                res.send({result: true});
            })
        })
    }
})

app.get('/studies/:studyId/patients/:patientId/records', function (req, res) {
    connection.query(`SELECT * from record where study_id = ${req.params.studyId} and patient_id = ${req.params.patientId}`, (err, rows, fields) => {
        if (err) throw err
        if (!rows) {
            res.send(null);
        } else {
            res.send(rows);
        }
    })
})

app.post('/studies/:studyId/patients/:patientId/records', function (req, res) {
    connection.query(`insert into record(score, notes, study_id, patient_id) values(${req.body.score}, '${req.body.notes}', ${req.params.studyId}, ${req.params.patientId})`, (err, rows, fields) => {
        if (err) throw err
        res.send(true);
    })
})

var server = app.listen(9080, function () {
    console.log("Backend Application listening at http://localhost:9080")
})

//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678';
//1