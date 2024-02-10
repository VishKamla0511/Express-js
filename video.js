const express = require("express");
const router = express.Router();
const connection = require('./database');

// ****************************VIDEOS*******************************

const getvideobyid = async (req, res) => {
    try {

        console.log(req.headers)
        const { id } = req.params;

        if (!req.params.id) {
            res.send({
                message: "missing parameter"
            })
        }

        const sql = 'select * from users where id = ?';
        const [results] = await connection.promise().execute(sql, [id]);

        if (results.length === 0) {
            res.status(401).send({
                message: "video not found"
            })
        }

        res.send({
            message: "videp-list",
            response: results[0]
        })

    } catch (error) {
        res.send({
            message: 'internal error'
        })
    }
}

const getReviewByVideoId = async (req, res, next) => {

    try {

        console.log(req.headers);

        const { id } = req.params;

        if (!id) {
            res.status(400).send({
                message: "id is required"
            })
        }

        const sqlStr = `select video_reviews.comment, video_reviews.date from videos inner join video_reviews on videos.id = video_reviews.video_id where videos.id=?`;
        const [results] = await connection.promise().execute(sqlStr, [id]);

        if (results.length === 0) {
            res.send({
                message: "no review found"
            })
        }

        res.status(200).send({
            message: "video review",
            response: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error"
        })
    }
}

const getVideos = async (req, res) => {
    try {
        console.log(req.headers);
        const { id, limit, offset } = req.query

        if (!req.query.id) {
            res.status(400).send({
                message: 'missing parameter'
            })
        }
            const sql = 'select title, descrption, language, duration, release_date , video_type_id from videos where id =? order by release_date limit ? offset ?';
            const [results] = await connection.promise().execute(sql, [id, limit, offset]);

            const countsql = 'select count(*) as count from videos'
            const [countResults] = await connection.promise().execute(countsql)

            if (results.length === 0) {
                res.send({
                    message: "no video found"
                })
            }

            res.send({
                message: "video-list",
                response: results[0],
                totalcount: countResults[0].countsql
            })

    } catch (error) {
        res.send({
            message: "internal error"
        })
    }
}

const createVideo = async (req, res, next) => {
    try {
        console.log(req.headers);

        const { title, descrption, language, duration, release_date, video_type_id, casts_id } = req.body

        const sqlstr = `insert into videos (title, descrption, language, duration, release_date , video_type_id, casts_id) values (?,?,?,?,?,?,?)`

        const [results] = await connection.promise().execute(sqlstr, [title, descrption, language, duration, release_date, video_type_id, casts_id])

        if (!results.insertId) {
            res.send({
                message: "data not inserted"
            })
        }

        if (results.length === 0) {
            res.send({
                message: "video not found"
            })
        }

        res.status(200).send({
            message: "video added succesfully",
            response: results[0]
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: " Internal Server Error"
        })
    }
}

const updateVideo = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params
        const { duration, release_date, video_type_id } = req.body;

        if (!req.params.id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }

        let setArray = [];
        let data = [];

        if (duration) {
            setArray.push('duration=?');
            data.push(duration)
        }

        if (release_date) {
            setArray.push('release_date=?');
            data.push(release_date)
        }

        if (video_type_id) {
            setArray.push('video_type_id=?');
            data.push(video_type_id);
        }

        const setstr = setArray.join(',')

        const sqlStr = `update videos set ${setstr} where id =?`
        const [results] = await connection.promise().execute(sqlStr, [...data,id]);

        if(!res.changedRows===1){
            res.send({
                message : "not upadated"
            })
        }

        if (results.length === 0) {
            res.send({
                message: "vidoe not found"
            })
        }

        res.status(200).send({
            message: "update successfully",
            response: results
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const deleteVideo = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!req.params.id) {
            res.send({
                message: "Missing Parameter"
            })
        }

        const sqlStr = `delete from videos where id = ?`
        const [results] = await connection.promise().execute(sqlStr, [id]);

        if(!results.affectedRows === 1){
            res.send({
                message : "data is not deleted"
            })
        }

        if (results.length == 0) {
            res.send({
                message: "Video not found"
            })
        }

        res.status(200).send({
            message: "delete successfully",
            response: results[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

router.get("/videos/:id", getvideobyid); //done
router.get("/videos/:id/reviews", getReviewByVideoId) //done
router.get("/videos", getVideos); //done
router.post("/videos", createVideo) //done
router.put("/videos/:id", updateVideo) //done
router.delete("/videos/:id", deleteVideo) //done

module.exports = router;