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
        else {
            res.status(200).send({
                message: "user list",
                response: results[0]
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/users/:id", getUserById) //done

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

app.get("/users", getUserDetails); //done

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

        if (!results.insertId) {
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

app.post("/users", createuser); //done

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

        if (!email) {
            res.send({
                message: "email is required"
            })
        }

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

        if(!res.changedRows===1){
            res.send({
                message : "not upadated"
            })
        }

        res.status(200).send({
            message: "update successfully",
            response: results
        })

        if (results.length === 0) {
            res.send({
                message: "user not found"
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.put("/users/:id", updateUser); //done

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

        if(!results.affectedRows === 1){
            res.send({
                message : "data is not deleted"
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

app.delete("/users/:id", deleteUser); //done

// ***************************profiles*******************************

const getProfileDetails = async (req, res) => {
    try {
        const { id, limit, offset } = req.query;

        if (!req.query.id) {
            res.status(401).send({
                message: "missing parameter or id is required"
            })
        }

        const sql = 'select user_id, name, type, image from profiles where id = ? limit ? offset ?';
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

app.get("/profiles", getProfileDetails); //done

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

app.get("/profiles/:userid", getProfilesByUserId) //done

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

app.get("/profiles/:id/videoLists", getVideoListbyProfileId ); //done

const createProfile = async (req,res,next) => {
    try {
        const {id} = req.params

        if(!id) {
            res.status(400).send({
                message : "id is required"
            })
        }

        const {name,type,image} = req.body;

        let createData = [];
        let data = []

        if(name){
            createData.push('name=?');
            data.push(name);
        }

        if(type){
            createData.push('type=?');
            data.push(type);
        }

        if(image){
            createData.push('image=?');
            data.push(image);
        }

        let str = createData.join(',');
        const countsql = `select count(*) from profiles where user_id = ?`
        const [countResults] = await connection.promise().execute(countsql,[id])
        
        if (countResults < 6) {
            const sql = `insert into profiles (${str}) values (?,?,?);`
            const [results] = await connection.promise().execute(sql,[...data])
    
            res.send(200).send({
                message : "profile created"
            })
        }
        else {
            res.send({
                message : "maximum limit is 5 for particular user"
            })
        }

        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message : "internal"
        })
    }
}

app.post("/profiles",createProfile);

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

        if(!results.affectedRows === 1){
            res.send({
                message : "data is not deleted"
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

app.delete("/profiles/:profile_id", deleteProfile);

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
        res.send({
            message: "videp-list",
            response: results[0]
        })

        if (results.length === 0) {
            res.status(401).send({
                message: "video not found"
            })
        }

    } catch (error) {
        res.send({
            message: 'internal error'
        })
    }
}

app.get("/videos/:id", getvideobyid); //done

// incomplete two id kaise le.....................

const getCastByVideoId = async (req,res,next) => {
    try {
        // console.log(req.headers);

        console.log(req.params)

        const {cast_id,video_id} = req.params;

        if (!cast_id) {
            res.send({
                message: "missing parameter"
            })
        }
        
        if (!video_id) {
            res.send({
                message: "missing parameter"
            })
        }

        const  sql = `select casts.id, actors.name as actor_name ,directors.name as director_name
        from actors inner join casts inner join directors
        on casts.actor_id = actors.id and directors.id=casts.director_id
        where casts.id = ? and casts.id in (select casts_id from videos where video_id =?);`;

        console.log(sql);

        const [results] = await connection.promise().execute(sql,[cast_id,video_id]);

        if (results.length === 0) {
            res.status(401).send({
                message: "cast not found"
            })
        }

        res.send({
            message: "cast-list",
            response: results[0]
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message  : "Internal Server Error"
        })
    }
}

app.get("/videos/:video_id/cast/:cast_id",getCastByVideoId);

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
        res.status(200).send({
            message: "video review",
            response: results[0]
        })

        if (results.length === 0) {
            res.send({
                message: "no review found"
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/videos/:id/reviews", getReviewByVideoId) //done

const getVideos = async (req, res) => {
    try {
        console.log(req.headers);
        const { id, limit, offset } = req.query

        if (!req.query.id) {
            res.status(400).send({
                message: 'missing parameter'
            })
        }
        else {
            const sql = 'select title, descrption, language, duration, release_date , video_type_id from videos where id =? order by release_date limit ? offset ?';
            const [results] = await connection.promise().execute(sql, [id, limit, offset]);

            const countsql = 'select count(*) as count from videos'
            const [countResults] = await connection.promise().execute(countsql)

            res.send({
                message: "video-list",
                response: results[0],
                totalcount: countResults[0].countsql
            })
        }

    } catch (error) {
        res.send({
            message: "internal error"
        })
    }
}
app.get("/videos", getVideos); //done

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

        res.status(200).send({
            message: "video added succesfully",
            response: results[0]
        })

        if (results.length === 0) {
            res.send({
                message: "video not found"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: " Internal Server Error"
        })
    }
}

app.post("/videos", createVideo) //done

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

        res.status(200).send({
            message: "update successfully",
            response: results
        })

        if (results.length === 0) {
            res.send({
                message: "vidoe not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.put("/videos/:id", updateVideo) //done

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

        res.status(200).send({
            message: "delete successfully",
            response: results[0]
        });

        if (results.length == 0) {
            res.send({
                message: "Video not found"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.delete("/videos/:id", deleteVideo) //done

// *************************ACTORS****************************

const getActorDetails = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id, limit, offset } = req.query

        if (!req.query.id) {
            res.status(400).send({
                message: 'missing parameter'
            })
        }

        const sql = 'select name, born_date from actors';
        const [results] = await connection.promise().execute(sql, [id, limit, offset]);

        const countsql = 'select count(*) as count from actors'
        const [countResults] = await connection.promise().execute(countsql)

        res.send({
            message: "actor-list",
            response: results,
            totalcount: countResults[0].count
        })

        if (results.length === 0) {
            res.send({
                message: "Actor not found"
            })
        }

    } catch (error) {
        res.send({
            message: "internal error"
        })
    }
}

app.get("/actors", getActorDetails); //done

const getActorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(req.headers);

        if (!req.params.id) {
            res.status(400).send({
                message: 'id is required'
            })
        }

        const sql = 'select name, born_date from actors where id = ?';
        const [results] = await connection.promise().execute(sql, [id]);
        console.log(res);

        res.status(200).send({
            message: "actor list",
            response: results
        })

        if (results.length === 0) {
            res.send({
                message: "actor not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/actors/:id", getActorById); //done

const createActor = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { name, born_date } = req.body

        if (!req.body.name) {
            res.send({
                message: "name is required"
            })
        }
        const sqlstr = `insert into actors (name, born_date) values (?,?)`
        const [results] = await connection.promise().query(sqlstr, [name, born_date]);

        if (!results.insertId) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "actor created",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.post("/actors", createActor); //done

const deleteActor = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!req.params.id) {
            res.status(400).send({
                message: "Id is required"
            })
        }
        const sqlStr = `delete from actors where id = ?`
        const [results] = await connection.promise().execute(sqlStr, [id]);

        if(!results.affectedRows === 1){
            res.send({
                message : "data is not deleted"
            })
        }

        res.status(200).send({
            message: "delete successfully",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}

app.delete("/actors/:id", deleteActor); //done

const updateActor = async (req,res,next) => {
    try {
        console.log(req.headers);
        const { id } = req.params
        const { born_date } = req.body;

        if (!req.params.id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }

        // let setArray = [];
        // let data = [];

        // if (year) {
        //     setArray.push('year=?');
        //     data.push(year)
        // }

        // if (image) {
        //     setArray.push('image=?');
        //     data.push(image)
        // }

        // const setstr = setArray.join(',')

        const sqlStr = `update actors set bore_date = ? where id =?`
        const [results] = await connection.promise().execute(sqlStr, [born_date,id]);

        if(!res.changedRows===1){
            res.send({
                message : "not upadated"
            })
        }

        res.status(200).send({
            message: "update successfully",
            response: results
        })

        if (results.length === 0) {
            res.send({
                message: "Actor not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.put("/actors/:id",updateActor)

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

app.get("/casts", getCast); //done

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

app.get("/casts/:id" , getCastById); //done


// ****************************DIRECTORS******************************

const getDirectorDetails = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id, limit, offset } = req.query

        if (!req.query.id) {
            res.status(400).send({
                message: 'missing parameter'
            })
        }

        const sql = 'select name, year, image from directors';
        const [results] = await connection.promise().execute(sql, [id, limit, offset]);

        const countsql = 'select count(*) as count from directors'
        const [countResults] = await connection.promise().execute(countsql)

        if (results.length === 0) {
            res.send({
                message: "director not found"
            })
        }

        res.send({
            message: "director-list",
            response: results,
            totalcount: countResults[0].count
        })

    } catch (error) {
        res.send({
            message: "internal server error"
        })
    }
}

app.get("/directors", getDirectorDetails); //done

const getDirectorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(req.headers);

        if (!req.params.id) {
            res.status(400).send({
                message: 'id is required'
            })
        }

        const sql = 'select name, year, image from directors where id = ?';
        const results= await connection.promise().execute(sql, [id]);

        if ([results].length === 0) {
            res.send({
                message: "Director not found"
            })
        }

        res.status(200).send({
            message: "Director list",
            response: results[0]
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/directors/:id", getDirectorById); //done

const createDirector = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { name, year, image } = req.body

        if (!name) {
            res.send({
                message: "name is required"
            })
        }
        if(!year){
            res.send({
                message: "year is required"
            })
        }
        if(!image){
            res.send({
                message: "image is required"
            })
        }
        const sqlstr = `insert into directors (name, year, image) values (?,?,?)`
        const [results] = await connection.promise().query(sqlstr, [name, year, image]);

        if (!results.insertId) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "actor created",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.post("/directors", createDirector); //done

const deleteDirectorbyId = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!id) {
            res.status(400).send({
                message: "Id is required"
            })
        }
        const sqlStr = `delete from directors where id = ?`
        const [results] = await connection.promise().execute(sqlStr, [id]);

        if(!results.affectedRows === 1){
            res.send({
                message : "data is not deleted"
            })
        }

        res.status(200).send({
            message: "delete successfully",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}

app.delete("/directors/:id", deleteDirectorbyId); //done

const updateDirector = async (req,res,next) => {
    try {
        console.log(req.headers);
        const { id } = req.params
        const { year, image } = req.body;

        if (!req.params.id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }

        let setArray = [];
        let data = [];

        if (year) {
            setArray.push('year=?');
            data.push(year)
        }

        if (image) {
            setArray.push('image=?');
            data.push(image)
        }

        const setstr = setArray.join(',')

        const sqlStr = `update directors set ${setstr} where id =?`
        const [results] = await connection.promise().execute(sqlStr, [...data,id]);

        if(!res.changedRows===1){
            res.send({
                message : "not upadated"
            })
        }

        res.status(200).send({
            message: "update successfully",
            response: results
        })

        if (results.length === 0) {
            res.send({
                message: "director not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.put("/directors/:id", updateDirector)

// update api => cast and director baki h
// profile ka upadte n create baki h right {{{{{{{{}}}}}}}}
// cast me dikhna chaiye actor name and director name
// same video_type bhi dikhna chaiye

app.listen(3000, console.log('server started'));

// TypeError: Bind parameters must not contain undefined. To pass SQL NULL specify JS null

