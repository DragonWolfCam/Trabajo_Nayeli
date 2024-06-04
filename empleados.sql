-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS empleadosDB;

-- Usar la base de datos
USE empleadosDB;

-- Eliminar la tabla empleados si ya existe
DROP TABLE IF EXISTS empleados;

-- Crear la tabla empleados con los campos nombre, codigo_qr, puesto y evento
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_qr VARCHAR(255) NOT NULL,
    puesto VARCHAR(100),
    evento VARCHAR(100)
);

-- Insertar los nombres de empleados junto con su código QR, puesto y evento
INSERT INTO empleados (nombre, codigo_qr, puesto, evento) VALUES
('Luis Alfredo Camacho', 'qr_luis_camacho', 'Puesto1', 'Evento1'),
('Pedro Vergara', 'qr_pedro_vergara', 'Puesto2', 'Evento2'),
('Alejandro Jaramillo', 'qr_alejandro_jaramillo', 'Puesto3', 'Evento3'),
('Pedro Mendoza', 'qr_pedro_mendoza', 'Puesto4', 'Evento4'),
('Ana Christa Vega', 'qr_ana_vega', 'Puesto5', 'Evento5');

-- Eliminar la tabla registros si ya existe
DROP TABLE IF EXISTS registros;

-- Crear la tabla registros con los campos empleado_id, hora_entrada y hora_salida
CREATE TABLE registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT,
    hora_entrada DATETIME,
    hora_salida DATETIME,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);
