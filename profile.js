const express = require("express");
const router = express.Router();
const connection = require('./database');

// ***************************profiles*******************************

const getProfileDetails = async (req, res) => {
    try {
        const { id, limit, offset } = req.query;

        if (!req.query.id) {
            res.status(401).send({
                message: "missing parameter or id is required"
            })
        }

        const sql = 'select user_id, name, type, image from profiles where user_id = ? limit ? offset ?';
        const [results] = await connection.promise().execute(sql, [id, limit, offset]);

        const countstr = 'select count(*) as count from users'
        const [countResults] = await connection.promise().execute(countstr);

        res.status(200).send({
            messsage: "profile found",
            response: results,
            totalcount: countResults[0].count
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server issue"
        })
    }
}

const getProfilesByUserId = async (req, res, next) => {
    try {

        const { userid } = req.params;
        console.log(req.headers)

        if (!req.params.userid) {
            res.status(400).send({
                message: "missing parameter"
            })
        }

        const sqlStr = `select user_id, name, type, image from profiles where user_id=? `
        const [results] = await connection.promise().execute(sqlStr, [userid]);

        if (results.length === 0) {
            res.send({
                message: "profile not found",
                response: results[0]
            })
        }
        res.status(200).send({
            message: "profile show by user id",
            response: results
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}

const getVideoListbyProfileId = async (req, res, next) => {
    try {
        console.log(req.headers)

        const { id } = req.params;

        if (!req.params.id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }

        const sqlStr = ` select videos.title, videos.descrption,videos.cover_image,videos.duration,videos.release_date,videos.language, video_types.name ,video_lists.last_video_timestamp ,video_lists.status from video_types inner join videos inner join video_lists on video_types.id=videos.video_type_id and videos.id = video_lists.video_id  where video_lists.profile_id = ?`
        const [results] = await connection.promise().execute(sqlStr, [id])

        if (results.length === 0) {
            res.send({
                message: "video_lists not found",
                response: results[0]
            })
        }
        res.status(200).send({
            message: "videos list show",
            response: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}

const createProfile = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, type, image } = req.body;

        if (!id) {
            res.status(400).send({
                message: "id is required"
            })
        }

        const countsql = `select count(*) as profile_limit from profiles where user_id = ?`
        const [countResults] = await connection.promise().execute(countsql, [id])
        console.log(countResults[0].profile_limit)

        if (countResults[0].profile_limit <= 5) {
            const sql = `insert into profiles (name,type,image) values (?,?,?);`
            const [results] = await connection.promise().execute(sql, [name, type, image])

            if (!results.affectedRows) {
                res.send({
                    message: "data not inserted"
                })
            }

            res.status(200).send({
                message: "profile created",
                response: results
            })
        }
        res.send({
            message: "maximum limit is 5 for particular user"
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal"
        })
    }
}

const deleteProfile = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { profile_id } = req.params;

        if (!profile_id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }
        const sqlstr = `delete from profiles where id = ?`;
        const [results] = await connection.promise().query(sqlstr, [profile_id]);

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

const updateProfile = async (req, res, next) => {
    try {
        const { id } = req.params
        const { image, type, name } = req.body;

        if (!id) {
            res.status(400).send({
                message: "Bad Request"
            })
        }

        setArray = [];
        setData = [];

        if (image) {
            setArray.push("image = ?");
            setData.push(image);
        }

        if (type) {
            setArray.push("type = ?");
            setData.push(type);
        }

        if (name) {
            setArray.push("name = ?");
            setData.push(name);
        }

        const setString = setArray.join(',')

        console.log(setString)

        const sql = `update profiles set ${setString} where user_id = ?;`
        const [results] = await connection.promise().execute(sql, [...setData, id])

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

router.get("/profiles", getProfileDetails); //done
router.get("/profiles/:userid", getProfilesByUserId) //done
router.get("/profiles/:id/videoLists", getVideoListbyProfileId); //done
router.post("/profiles/:id", createProfile); //done
router.delete("/profiles/:profile_id", deleteProfile);
router.put("/profiles/:id", updateProfile) //done


module.exports = router;