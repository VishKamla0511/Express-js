const express = require("express");
const router = express.Router();
const connection = require('./database');

// ****************************CAST*********************************

const getCast = async (req, res, next) => {
    try {
        console.log(req.headers);

        const {id,limit,offset} = req.query

        if(!id){
            res.status(400).send({
                message : "missing parameter"
            })
        }
        const sqlStr = `select * from casts limit = ? offset ?`;
        const [results] = await connection.promise().execute(sqlStr,[id,limit,offset])

        const countsql = 'select count(*) as count from actors'
        const [countResults] = await connection.promise().execute(countsql)

        if(results.length === 0) {
            res.send({
                message : "cast not found"
            })
        }

        res.status(200).send({
            message: "cast list",
            response: results[0],
            totalcount: countResults[0].count
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error"
        })
    }
}

const getCastById = async (req,res,next) => {
    try {
        console.log(req.headers);
        const {id} = req.params;
    
        if(!id){
            res.status(400).send({
                message : "Missing Parameter"
            })
        }
    
        const sql = `select * from casts where id = ?`;
        const [results] = await connection.promise().execute(sql,[id])

        if(results.length === 0){
            res.send({
                message : "no cast found"
            })
        }
    
        res.status(200).send({
            message : "Casts list",
            response : results
        })  

    } catch (error) {
       console.log(error) ;
       res.status(500).send({
        message : "internal server error"
       })
    }
}

router.get("/casts/:id" , getCastById); //done
router.get("/casts", getCast); //done

module.exports = router;