create table video_lists(
id int primary key auto_increment,
profile_id int, foreign key (profile_id) references profiles(id) on delete set null,
video_id int, foreign key (video_id) references videos(id) on delete set null,
status enum('in process','completed'),
last_video_timestamp timestamp,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp
);