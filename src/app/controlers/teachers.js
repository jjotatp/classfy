Intl = require('intl')
const { age, date } = require('../../lib/ultils.js')
const Teacher = require('../models/Teacher.js')

module.exports = {
    index(req, res){
        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 3

        let offset = limit * ( page - 1 )

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(teachers){
                const pagination = {
                    total: Math.ceil(teachers[0].total / limit),
                    page
                }
                return res.render("teachers/index", { teachers, pagination, filter }) 
            }
        }
        
        Teacher.paginate(params)
    },

    create(req, res){
        return res.render("teachers/create")
    },

    post(req, res){
        const keys = Object.keys(req.body)
    
        for(key of keys) {
            if(req.body[key] == "") {
                return res.send("Preencha os campos vazios")
            }   
        }
        
        Teacher.create(req.body, function(teachers){
            return res.redirect(`/teachers/${ teachers.id }`)
        })
    },

    show(req, res){
        Teacher.find(req.params.id, function(teacher){
            if(!teacher) return res.send("Professor não encontrado!")

            teacher.age = age(teacher.birth)
            teacher.subjects = teacher.subjects.split(", ")
            teacher.created_at = date(teacher.created_at).format

            return res.render("teachers/show", { teacher })
        })
    }, 

    edit(req, res){
        Teacher.find(req.params.id, function(teacher){
            if(!teacher) return res.send("Professor não encontrato!")

            teacher.birth = date(teacher.birth).iso

            return res.render("teachers/edit", { teacher })
        })
    },

    put(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Preencha todos os campos") 
            }
        }

        Teacher.update(req.body, function(teacher){
            return res.redirect(`/teachers/${req.body.id}`)
        })
    },

    delete(req, res) {    
        Teacher.delete(req.body.id, function(teacher){
            return res.redirect("/teachers")
        })    
    }
}