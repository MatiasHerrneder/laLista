-- TODOS LOS CREATE NECESARIOS EN ORDEN

create table usuario (
	id int not null auto_increment,
    nombre varchar(20) not null,
    email varchar(50) not null,
    contraseña varchar(64) not null,
    sal varchar(64) not null,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    primary key(id)
) engine=innodb ;

create table tareaRepetitiva (
	id int not null auto_increment,
    nombre varchar(80) not null,
    descripcion varchar(320),
    temporalidad enum('semanas', 'meses', 'años') not null,
    unidad_de_temporalidad int not null default 1,
    plazo enum('dias', 'semanas', 'meses', 'años') not null,
    unidad_de_plazo int not null default 1,
    fecha_de_primer_tarea date not null default (CURRENT_DATE),
    fecha_de_ultima_creada date not null default "1900-01-01",
    id_usuario int not null default 1,
    primary key(id),
    foreign key(id_usuario) references usuario(id)
) engine=innodb ;

create table tarea (
	id int not null auto_increment,
    nombre varchar(80) not null,
    descripcion varchar(320),
    estado enum('Alcanzado', 'En Proceso', 'No Alcanzado') not null default 'En Proceso',
    fecha_de_propuesta date not null default (CURRENT_DATE),
    fecha_de_culminacion date,
    id_usuario int not null default 1,
    primary key (id),
    foreign key(id_usuario) references usuario(id)
) engine=innodb ;

DELIMITER $$
CREATE FUNCTION get_due_date(fecha DATE, plazo VARCHAR(20), unidad INT)
RETURNS DATE
deterministic
BEGIN
   DECLARE due_date DATE;
   IF plazo = 'semanas' THEN SET due_date = date_add(fecha, interval unidad WEEK);
   ELSEIF plazo = 'meses' THEN SET due_date = date_add(fecha, interval unidad MONTH);
   ELSEIF plazo = 'años' THEN SET due_date = date_add(fecha, interval unidad YEAR);
   ELSEIF plazo = 'dias' THEN SET due_date = date_add(fecha, interval unidad DAY);
   END IF;
   RETURN due_date;
END$$
DELIMITER ;

CREATE TRIGGER tareaRepetitiva_fechaUltCreada
BEFORE INSERT ON tareaRepetitiva
FOR EACH ROW
	set new.fecha_de_ultima_creada = 
    case
		when new.temporalidad = 'semanas' then date_sub(new.fecha_de_primer_tarea, interval new.unidad_de_temporalidad WEEK)
		when new.temporalidad = 'meses' then date_sub(new.fecha_de_primer_tarea, interval new.unidad_de_temporalidad MONTH) 
        when new.temporalidad = 'años' then date_sub(new.fecha_de_primer_tarea, interval new.unidad_de_temporalidad YEAR)
end;

DELIMITER $$
CREATE EVENT `tareaScheduler`
  ON SCHEDULE EVERY 6 HOUR STARTS '2023-02-05 00:00:00'
  ON COMPLETION PRESERVE
DO BEGIN
   insert into tarea(nombre, descripcion, fecha_de_culminacion, id_usuario) 
   select nombre, descripcion, get_due_date(get_due_date(fecha_de_ultima_creada, temporalidad, unidad_de_temporalidad), plazo, unidad_de_plazo), id_usuario
      from tareaRepetitiva
   where fecha_de_primer_tarea <= CURRENT_DATE and get_due_date(fecha_de_ultima_creada, temporalidad, unidad_de_temporalidad) <= CURRENT_DATE;
   
   update tareaRepetitiva 
   set fecha_de_ultima_creada = get_due_date(fecha_de_ultima_creada, temporalidad, unidad_de_temporalidad)
   where fecha_de_primer_tarea <= CURRENT_DATE and get_due_date(fecha_de_ultima_creada, temporalidad, unidad_de_temporalidad) <= CURRENT_DATE limit 10000;
END;$$
DELIMITER ;

-- FIN

use lalista;

-- UN MONTON DE COMANDOS RANDOM QUE GUARDO POR LAS DUDAS

insert into tarea (nombre, descripcion, estado, fecha_de_culminacion) values('Ejemplo 8', 'Descr3', 'En Proceso', '2020-01-24');

drop table tarea; drop table tareaRepetitiva; drop table usuario;

drop database lalista;

create database lalista;

insert into usuario (nombre, email, contraseña, sal) values ('Admin', 'Admin', 'Admin', 'Admin');

select * from tarea;

delete from tarea where id_usuario = 1;

SELECT * from tarea where estado = 'En Proceso';

SELECT * from tarea where estado = 'En Proceso' ORDER BY fecha_de_culminacion ASC LIMIT 5;

SELECT nombre, DATEDIFF(fecha_de_culminacion, fecha_de_propuesta), fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, CURDATE()) from tarea where estado = 'En Proceso' ORDER BY fecha_de_culminacion ASC LIMIT 5;

SELECT nombre, DATEDIFF(fecha_de_culminacion, fecha_de_propuesta), fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, CURDATE()) from tarea where estado = 'En Proceso' and DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) < 1000 ORDER BY fecha_de_culminacion ASC LIMIT 5;

SELECT nombre, DATEDIFF(fecha_de_culminacion, CURDATE()), fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) from tarea where estado = 'En Proceso' and DATEDIFF(fecha_de_culminacion, CURDATE()) < 0 ORDER BY fecha_de_culminacion ASC LIMIT 5;

SELECT id, nombre, DATEDIFF(CURDATE(), fecha_de_culminacion), fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) from tarea where estado = 'En Proceso' and DATEDIFF(fecha_de_culminacion, CURDATE()) < 0 ORDER BY fecha_de_culminacion DESC LIMIT 5;

UPDATE tarea SET descripcion = 'cambiaso' WHERE id = 2;

drop trigger tareaRepetitiva_fechaUltCreada;


delete from tareaRepetitiva where id = 4;

select * from tareaRepetitiva;

update tareaRepetitiva set fecha_de_ultima_creada = '1900-01-01' where id = 5 or id = 8;

show variables where variable_name='event_scheduler';

drop function get_due_date;

drop event tareaScheduler;

select * from usuario;

delete from usuario;

select * from tarea;

select * from tareaRepetitiva;

select * from information_schema.events;

SELECT * FROM information_schema.EVENTS WHERE event_name = 'tareaScheduler';

SHOW PROCESSLIST;

SHOW VARIABLES LIKE 'log_error';

USE mysql;
SHOW TABLES LIKE 'event%';

CALL tareaScheduler;

ALTER EVENT tareaScheduler
ON SCHEDULE EVERY 1 DAY STARTS '2023-02-05 00:00:00'
ENABLE;