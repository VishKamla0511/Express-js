create table videos(
id int primary key auto_increment,
title varchar(50) not null,
descrption text not null,
cover_image blob,
language varchar(20) not null,
duration time not null,
release_date datetime not null,
video_type_id int, foreign key (video_type_id) references video_types(id) on delete set null,
casts_id int, foreign key (casts_id) references casts(id) on delete set null,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp  
);