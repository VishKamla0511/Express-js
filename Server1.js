const express = require('express');
const bodyparser = require('body-parser');
const uuid = require('uuid');

const user = require('./user')
const video = require('./video');
const profile = require('./profile');
const actor = require('./actor');
const director = require('./director');
const cast = require('./cast')

const app = express();

app.use(bodyparser.json());

app.use((req, res, next) => {
    req.headers['request_id'] = uuid.v1()   //request id
    next();
})

app.use('/v1', user);
app.use('/v1',profile);
app.use('/v1',video);
app.use('/v1',actor);
app.use('/v1',director);
app.use('/v1',cast);

app.listen(3000, console.log('server started'));


// incomplete two id kaise le.....................

// const getCastByVideoId = async (req,res,next) => {
//     try {
//         // console.log(req.headers);

//         console.log(req.params)

//         const {cast_id,video_id} = req.params;

//         if (!cast_id) {
//             res.send({
//                 message: "missing parameter"
//             })
//         }
        
//         if (!video_id) {
//             res.send({
//                 message: "missing parameter"
//             })
//         }

//         const  sql = `select casts.id, actors.name as actor_name ,directors.name as director_name
//         from actors inner join casts inner join directors
//         on casts.actor_id = actors.id and directors.id=casts.director_id
//         where casts.id = ? and casts.id in (select casts_id from videos where video_id =?);`;

//         console.log(sql);

//         const [results] = await connection.promise().execute(sql,[cast_id,video_id]);

//         if (results.length === 0) {
//             res.status(401).send({
//                 message: "cast not found"
//             })
//         }

//         res.send({
//             message: "cast-list",
//             response: results[0]
//         })


//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             message  : "Internal Server Error"
//         })
//     }
// }

// app.get("/videos/:video_id/cast/:cast_id",getCastByVideoId);



// update api => cast and director baki h
// profile ka upadte n create baki h right {{{{{{{{}}}}}}}}
// cast me dikhna chaiye actor name and director name
// same video_type bhi dikhna chaiye

// TypeError: Bind parameters must not contain undefined. To pass SQL NULL specify JS null

