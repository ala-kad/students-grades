const Joi = require('joi')
// Defining students schema for adding a student in students.json file 
const studentSchema = Joi.object({
    id: Joi.number().integer(),
    nom: Joi.string().trim().min(3).required(),
    classe: Joi.string().trim().required(),
    modules: Joi.array().items(
      Joi.object({
        module: Joi.string().trim().min(3).required(),
        note: Joi.number().min(0).max(20).required()
      })
    ),
    moyenne: Joi.number().min(0).max(20).precision(2)
});
// Defining students schema for updating a student in students.json file 
const studentsUpdateSchema = Joi.object({
  id: Joi.number().integer(),
  nom: Joi.string().trim().min(3),
  classe: Joi.string().trim().min(3),
  modules: Joi.array().items(
    Joi.object({
      module: Joi.string().trim().min(3),
      note: Joi.number().min(0).max(20)
    })
  ),
  moyenne: Joi.number().min(0).max(20).precision(2)
});
// exporting schemas as modules
module.exports={studentSchema, studentsUpdateSchema};
