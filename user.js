const express = require("express");
const router = express.Router();
const connection = require('./database');

// ************************USER*********************************

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(req.headers);

        if (!req.params.id) {
            res.status(400).send({
                message: 'id is required'
            })
        }

        const sql = 'select email,phone_no from users where id = ?';
        const [results] = await connection.promise().execute(sql, [id]);
        // console.log(res)

        if (results.length == 0) {
            res.status(404).send({
                message: "user not found"
            })
        }
        res.status(200).send({
            message: "user list",
            response: results[0]
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

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

        res.status(200).send({
            messsage: "user found",
            response: results[0],
            totalcount: countResults[0].count
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server issue"
        })
    }
}

const createuser = async (req, res, next) => {
    try {
        console.log(req.headers);

        const { email, phone_no, passward } = req.body

        if (!req.body.email) {
            res.send({
                message: "email is required"
            })
        }

        if (!req.body.phone_no) {
            res.send({
                message: "phone number is required"
            })
        }

        if (!req.body.passward) {
            res.send({
                message: "password is required"
            })
        }

        const sqlstr = `insert into users (email, phone_no, passward) values (?,?,?)`
        const [results] = await connection.promise().query(sqlstr, [email, phone_no, passward]);

        if (!results.affectedRows) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "user created",
            response: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const updateUser = async (req, res, next) => {
    try {

        console.log(req.headers);

        const { id } = req.params
        const { email, phone_no, passward } = req.body

        if ((!id)) {
            res.send({
                message: "id required"
            })
        }

        // if (!email) {
        //     res.send({
        //         message: "email is required"
        //     })
        // }

        let setArray = [];
        let values = [];

        if (email) {
            setArray.push('email=?');
            values.push(email)
        }

        if (phone_no) {
            setArray.push('phone_no=?');
            values.push(phone_no)
        }

        if (passward) {
            setArray.push('passward=?');
            values.push(passward)
        }

        const setstr = setArray.join(',')

        const sqlstr = `update users set ${setstr} where id = ?`;
        const [results] = await connection.promise().execute(sqlstr, [...values, id]);

        if (!res.changedRows === 0) {
            res.send({
                message: "not upadated"
            })
        }

        if (results.length === 0) {
            res.send({
                message: "user not found"
            })
        }

        res.status(200).send({
            message: "update successfully",
            response: results
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const deleteUser = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!req.params.id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }
        const sqlstr = `delete from users where id = ?`;
        const [results] = await connection.promise().query(sqlstr, [id]);

        if (!results.affectedRows === 1) {
            res.send({
                message: "data is not deleted"
            })
        }

        res.status(200).send({
            message: "user delete succesfully",
            response: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error"
        })
    }
}

router.get("/users/:id", getUserById) //done
router.get("/users", getUserDetails); //done
router.post("/users", createuser); //done
router.put("/users/:id", updateUser); //done
router.delete("/users/:id", deleteUser); //done

module.exports = router;