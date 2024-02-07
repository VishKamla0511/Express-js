const express = require('express');
const mysql = require('mysql2');
const bodyparser = require('body-parser');
const uuid = require('uuid');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Kamla@0511",
    database: "netflix"
})

connection.connect(function (err) {
    if (err) throw err
    console.log("Database connected")
})

const app = express();
app.use(bodyparser.json());

app.use((req, res, next) => {
    req.headers['request_id'] = uuid.v1()   //request id
    next();
})

const getUserById = async (req, res, next) => {
    try {
        console.log(req.headers);

        const { id } = req.params;

        if (!req.params.id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }

        const sql = 'select email, phone_no from users where id = ?';
        const [results] = await connection.promise().execute(sql, [id]);

        if (results.length == 0) {
            res.send({
                message: "user not found"
            })
        }
    
            res.status(200).send({
                message: "user list",
                response: results[0]
            })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}
app.get("/users/:id", getUserById);

const getUserDetails = async (req, res) => {
    try {
        const { id, limit, offset } = req.query;

        if (!req.query.id) {
            res.status(401).send({
                message: "missing parameter or id is required"
            })
        }

        const sql = 'select email,phone_no from users where id = ? limit ? offset ?';
        const [results] = await connection.promise().execute(sql, [id, limit, offset]);

        const countstr = 'select count(*) as count from users'
        const [countResults] = await connection.promise().execute(countstr);

        if (results.length === 0) {
            res.send({
                message: "user not found"
            })
        }
        else {
            res.status(200).send({
                messsage: "user found",
                response: results[0],
                totalcount: countResults[0].count
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server issue"
        })
    }
}

app.get("/users", getUserDetails);

app.listen(3001, console.log('server started'));

