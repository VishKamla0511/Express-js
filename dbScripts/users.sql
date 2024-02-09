create table users(
id int primary key auto_increment,
email varchar(40) not null,
phone_no int not null unique check(length(phone_no)=10),
passward varchar(20) not null,
is_active boolean,
created_at datetime default current_timestamp,
updated_at datetime default null on update current_timestamp  
);