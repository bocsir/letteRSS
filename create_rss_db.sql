create database if not exitsts rss_db;

use rss_db;

create table user (
	id int(11) not null auto_increment,
	email varchar(50) collate utf8mb4_unicode_ci not null,
	password varchar(200) collate utf8mb4_unicode_ci not null,
	refresh_token varchar(200) default 'asdf',
	primary key (id),
	unique key (email)
) engine=InnoDB auto_increment=4 default CHARSET=utf8mb4
collate=utf8mb4_unicode_ci;

create table url (
	id INT(11) not null auto_increment,
	user_id INT(11) not null,
	name VARCHAR(100),
	folder VARCHAR(100),
	url VARCHAR(2083) collate utf8mb4_unicode_ci not null,
	created_at TIMESTAMP default CURRENT_TIMESTAMP,
	primary key (id),
	foreign key (user_id) references user(id) on delete cascade,
	index (user_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
