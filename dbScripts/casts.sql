create table casts(
id int primary key auto_increment,
actor_id int , foreign key (actor_id) references actors(id) on delete set null,
director_id int , foreign key (director_id) references directors(id) on delete set null,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp 
);