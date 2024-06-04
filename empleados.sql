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
('Luis Alfredo Camacho', 'qr_luis_camacho', 'Cocinero', 'Preparación de platos'),
('Pedro Vergara', 'qr_pedro_vergara', 'Gerente', 'Supervisión del restaurante'),
('Alejandro Jaramillo', 'qr_alejandro_jaramillo', 'Bartender', 'Preparación de bebidas'),
('Pedro Mendoza', 'qr_pedro_mendoza', 'Repartidor', 'Entrega de pedidos a domicilio'),
('Ana Christa Vega', 'qr_ana_vega', 'Camarera', 'Atención a los clientes');

-- Eliminar la tabla registros si ya existe
DROP TABLE IF EXISTS registros;

-- Crear la tabla registros con los campos empleado_id, fecha_registro, hora_entrada y hora_salida
CREATE TABLE registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT,
    fecha_registro DATE,
    hora_entrada DATETIME,
    hora_salida DATETIME,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);
