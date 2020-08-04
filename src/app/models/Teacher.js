const bd = require("../../config/bd")
const { age, date } = require('../../lib/ultils.js')

module.exports = {
    all(callback) {
        bd.query(`SELECT * FROM teachers`, function(err, results){
            if(err) throw `Database Error! ${err}`
            callback(results.rows)
        })
    },

    create(data, callback) {
        const query = `INSERT INTO teachers (
            avatar_url,
            name,
            birth,
            grade,
            class_type,
            subjects,
            created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`
        
        const values = [
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.grade,
            data.class_type,
            data.subjects,
            date(Date.now()).iso
        ]

        bd.query(query, values, function(err, results){
            if(err) throw `Database Error! ${err}`
            callback(results.rows[0])
        })
    },

    find(id, callback){
        bd.query(`
            SELECT *
            FROM teachers 
            WHERE id = $1`, [id], function(err, results){
                if(err) throw `Database Error! ${err}`
                callback(results.rows[0])
        })
    },

    findby(filter, callback){
        bd.query(`SELECT teachers.*, count(students) AS total_students
                  FROM teachers
                  LEFT JOIN students ON (teachers.id = students.teacher_id)
                  WHERE teachers.name ILIKE '%${filter}%'
                  GROUP BY teachers.id
                  ORDER BY total_students DESC`, function(err, results){
            if(!err) throw `Database ${err}`
                callback(results.rows)
        })
    },

    update(data, callback) {
        const query = `
            UPDATE teachers SET
            avatar_url=($1),
            name=($2),
            birth=($3),
            grade=($4),
            class_type=($5),
            subjects=($6)
            WHERE id = $7
        `
        const values = [
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.grade,
            data.class_type,
            data.subjects,
            data.id
        ]

        bd.query(query, values, function(err, results){
            if(err) throw `Database Error! ${err}`
            callback()
        })
    },

    delete(id, callback){
        bd.query(`DELETE FROM teachers WHERE id = $1`, [id], function(err, results){
            if(err) throw `Database Error! ${err}`
            return callback()
        })
    },

    paginate(params){
        const { filter, limit, offset, callback} = params

        let query = "",
            filterQuery = "",
            totalQuery = `(
                SELECT count(*) from teachers
            ) AS total`
            
        if( filter ) {
            filterQuery = `
            WHERE teachers.name ILIKE '%${filter}%'`

            totalQuery = `(
                SELECT count(*) FROM teachers
                ${filterQuery}
            ) as total`
        }

        query = `
        SELECT teachers.*, ${totalQuery}, count(students) AS total_students
        FROM teachers
        LEFT JOIN students ON (teachers.id = students.teacher_id)
        ${filterQuery}
        GROUP BY teachers.id LIMIT $1 OFFSET $2`

        bd.query(query, [limit, offset], function(err, results){
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    }
}
