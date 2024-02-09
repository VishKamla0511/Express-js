create table video_types(
id int primary key auto_increment,
name varchar(20) not null unique,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp 
);