create table directors(
id int primary key auto_increment,
name varchar(20) not null,
year datetime not null,
image blob,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp 
 );