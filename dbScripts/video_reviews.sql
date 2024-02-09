create table video_reviews(
id int primary key auto_increment,
video_id int, foreign key(video_id) references videos(id) on delete set null,
user_id int, foreign key(user_id) references users(id) on delete set null,
status enum('not for me','i like this', 'love this'),
comment text ,
date datetime default current_timestamp,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp
);