create table profiles(
id int primary key auto_increment,
name varchar(20) not null,
type enum('kid','adult'),
image blob ,
user_id int, foreign key (user_id) references users(id) on delete set null,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp  
);