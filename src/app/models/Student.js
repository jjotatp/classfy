const bd = require("../../config/bd")
const { age, date } = require('../../lib/ultils.js')

module.exports = {
    all(callback) { 
        bd.query(`SELECT * FROM students`, function(err, results){
            if(err) throw `Database Error! ${err}`
            callback(results.rows)
        })
    },

    create(data, callback) {
        const query = `INSERT INTO students (
            avatar_url,
            name,
            email,
            birth,
            level,
            time_class,
            created_at,
            teacher_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`
        
        const values = [
            data.avatar_url,
            data.name,
            data.email,
            date(data.birth).iso,
            data.level,
            data.time_class,
            date(Date.now()).iso,
            data.teacher
        ]

        bd.query(query, values, function(err, results){
            if(err) throw `Database Error! ${err}`
            callback(results.rows[0])
        })
    },

    find(id, callback){
        bd.query(`
            SELECT students.*, teachers.name AS teacher_name
            FROM students 
            LEFT JOIN teachers ON (students.teacher_id = teachers.id)
            WHERE students.id = $1`, [id], function(err, results){
                if(err) throw `Database Error! ${err}`
                callback(results.rows[0])
        })
    },

    update(data, callback) {
        const query = `
            UPDATE students SET
            avatar_url=($1),
            name=($2),
            email=($3),
            birth=($4),
            level=($5),
            time_class=($6),
            teacher_id=($7)
            WHERE id = $8
        `
        const values = [
            data.avatar_url,
            data.name,
            data.email,
            date(data.birth).iso,
            data.level,
            data.time_class,
            data.teacher,
            data.id
        ]

        bd.query(query, values, function(err, results){
            if(err) throw `Database Error! ${err}`
            callback()
        })
    },

    delete(id, callback){
        bd.query(`DELETE FROM students WHERE id = $1`, [id], function(err, results){
            if(err) throw `Database Error! ${err}`
            return callback()
        })
    },

    teacherSelectOptions(callback){
        bd.query(`SELECT name, id FROM teachers`, function(err, results){
            if(err) throw `Database ${err}`
            
            callback(results.rows)
        })
    },

    paginate(params){
        const { filter, limit, offset, callback} = params

        let query = "",
            filterQuery = "",
            totalQuery = `(
                SELECT count(*) from students
            ) AS total`
            
        if( filter ) {
            filterQuery = `
            WHERE students.name ILIKE '%${filter}%'`

            totalQuery = `(
                SELECT count(*) FROM students
                ${filterQuery}
            ) as total`
        }

        query = `
        SELECT students.*, ${totalQuery}
        FROM students
        ${filterQuery}
        LIMIT $1 OFFSET $2`

        bd.query(query, [limit, offset], function(err, results){
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    }
}
