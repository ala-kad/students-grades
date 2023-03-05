const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser');
const {studentSchema, studentsUpdateSchema} = require('./models/students')
require('dotenv').config()
app.use(express.json());
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Get all students 
app.get('/students/', (req, res) => {
    fs.readFile('./students.json', 'utf-8', (err, fileOutPut) => {
        if(err){
            return res.status(500).send(`Error in reading file !`)
        }
        else{
            return res.status(200).json(JSON.parse(fileOutPut))
        }
    })
});
// Get a student bu his ID 
app.get('/students/:id', (req, res) => {
    // converting the id passed in req params to int 
    const id = parseInt(req.params.id)
    fs.readFile('./students.json', 'utf-8', (err, fileOutPut) => {
        if(err){
            return res.status(500).send(`Error readin file `)
        }
        else{
            // converting fileoutput to an array of students 
            const students = JSON.parse(fileOutPut);
            // searching for the student id in the students array
            const student = students.filter((student) => student.id === id)
            const index = students.findIndex((student) => student.id === id);
            if(index === -1 ){
               return  res.status(404).send(`Student with id : ${id} was not found ! `)
            }
            return res.status(201).send(student)
        }
    })
});
// Add a student api : Create
app.post('/students/', (req, res) => {
    fs.readFile('./students.json','utf-8', (err,fileOutPut) => {
        if(err){
            return res.status(500).send(`Error in reading file !`)
        }
        else{
            const students = JSON.parse(fileOutPut)
            // validating req.body student's propreties using Joi
            let validation_res = studentSchema.validate(req.body);
            if(validation_res.error){
                return res.status(400).send(validation_res.error.message)
            }
            // defining the new student object to add
            const student = {
                id: students.length+1,
                nom: req.body.nom,
                classe: req.body.classe,
                modules: req.body.modules,
                moyenne: calculMoyenne(req.body.modules)
            }
            students.push(student)
            // writing the updated array array of students in students.json file 
            fs.writeFile('./students.json',JSON.stringify(students),(err) => {
                if(err){
                    return res.status(401).send(`Error in writing to file `)
                }
                else{
                    return res.status(200).send(JSON.stringify(student))
                }
            })
        }
    })  
});
// Update an existing student
app.put('/students/:id', (req, res) => {;
    const id = parseInt(req.params.id)
    // Read existing students
    fs.readFile('./students.json','utf-8', (err, fileOutPut) => {
        if(err){
            res.status(500).send('Error in reading file')
        }
        const students = JSON.parse(fileOutPut)
        // searching for the student id in the students array 
        const index = students.findIndex((student) => student.id === id);
        if (index === -1 ){
            return res.status(404).send(`Student ${id} not found`)
        }
        // validating the put req.body using the updateSchema from schemas module
        const validation_res = studentsUpdateSchema.validate(req.body)
        if(validation_res.error){
            return res.status(401).send(validation_res.error.message)
        }
        // putting new student's propreties in an object 
        const updatedStudent = {
            id: students[index].id,
            nom: req.body.nom,
            classe: req.body.classe,
            modules: req.body.modules,
            moyenne: calculMoyenne(req.body.modules),
        };
        // putting the new student's propreties in the same student's position in students array (same id)
        students[index] = updatedStudent;
        // wrting back the updated student and the updated array of students to json file
        fs.writeFile('./students.json',JSON.stringify(students), 'utf-8', (err) => {
            if(err){
                res.send(`Error writing file`)
            }
            return res.status(201).send(`Student with ID ${id} has been updated`);
        })
    })
});
// Delete a student by his id
app.delete('/students/:id', (req, res) => {
    // parsing req.params.id to an int 
    const id = parseInt(req.params.id);
    // reading the students.json file
    fs.readFile('./students.json', 'utf8', (err, fileOutPut) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        //   putting fileoutput in an array of students
        const students = JSON.parse(fileOutPut);
        // checking if student's id exists
        const index = students.findIndex((student) => student.id === id);
        if (index === -1 ){
            return res.status(404).send(`Student ${id} not found`)
        }
        //   filtering the array to eliminate to student with req id and putting new array
        const updatedStudents = students.filter((student) => student.id !== id);
        
        //   writing back the new array(without the student with the passed id)
        fs.writeFile('students.json', JSON.stringify(updatedStudents), 'utf8', (err) => {
            if (err) {
            console.error(err);
            return res.status(500).send('Error writing file');
            
            }
        return  res.send(`Student with ID ${id} has been deleted.`);
        });
    });
});
// un endpoint pur afficher chaque étudiant avec leur meilleure et leur moindre
// module. 
app.get('/students/:id/best-worst-modules', (req, res) => {
    const studentId = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync('./students.json'));
    const student = data.find((s) => s.id === studentId);
    if (!student) {
      return res.status(404).send(`Student with id : ${studentId} was not found !`);
    }
    const modules = student.modules;
    // reduce(acc,cur) Finding best an worst modules of a given studen id
    // an accumulator (acc) and a current module (cur).
    //  The accumulator is initialized with the first element of the modules array (modules[0]).
    const bestModule = modules.reduce((acc, cur) => (cur.note > acc.note ? cur : acc), modules[0]);
    const worstModule = modules.reduce((acc, cur) => (cur.note < acc.note ? cur : acc), modules[0]);
    // sending back each student based on the passed id with his bestModule and worst module
    res.send({
      id: student.id,
      nom: student.nom,
      classe: student.classe,
      bestModule: bestModule,
      worstModule: worstModule,
    });
});
// un endpoint pour afficher la moyenne de tous les étudiants. 
app.get('/students/:id/average', (req, res) => {
    fs.readFile('./students.json', (err, fileOutPut) => {
      if (err) {
        return res.status(500).send(`Erro reading file`)
      }
      const students = JSON.parse(fileOutPut);
      const average = calculMoyennes(students)
      res.send(`The average of all students is: ${average}`);
    });
});
// Fonction qui calcule la moyenne de tous les etudiants
function calculMoyennes(students) {
    let sum = 0;
    for (let i = 0; i < students.length; i++) {
      sum += students[i].moyenne;
    }
    return Math.round(sum / students.length);
}
// Fonction qui calcule la moyenne de chaque etudiant
function calculMoyenne(modules) {
    let sum = 0;
    for (let i = 0; i < modules.length; i++) {
      sum += modules[i].note;
    }
    return Math.round(sum / modules.length);
}
// Starting express server
app.listen(process.env.PORT, () => {
    console.log(`Server started at localhost:${process.env.PORT}`)
});

