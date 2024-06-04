const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta para realizar una nueva reserva
app.post('/nueva-reserva', (req, res) => {
    const { name, email, phone, date, time, guests } = req.body;
    const confirmationNumber = Math.floor(Math.random() * 1000000);

    // Cargar o crear el archivo Excel
    const filePath = 'reservas.xlsx';
    let workbook;
    let worksheet;

    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Reservas'];
    } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([['Número de Confirmación', 'Nombre', 'Correo Electrónico', 'Teléfono', 'Fecha', 'Hora', 'Número de Personas']]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');
    }

    // Añadir la nueva reserva
    const newRow = [confirmationNumber, name, email, phone, date, time, guests];
    XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

    // Guardar el archivo
    XLSX.writeFile(workbook, filePath);

    res.json({ confirmationNumber, name, email, phone, date, time, guests });
});

// Ruta para consultar una reserva
app.get('/consultar-reserva', (req, res) => {
    const { reservationNumber } = req.query;
    const filePath = 'reservas.xlsx';

    if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets['Reservas'];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const reservation = data.find(row => row[0] == reservationNumber);

        if (reservation) {
            res.json({
                success: true,
                reservation: {
                    confirmationNumber: reservation[0],
                    name: reservation[1],
                    email: reservation[2],
                    phone: reservation[3],
                    date: reservation[4],
                    time: reservation[5],
                    guests: reservation[6]
                }
            });
        } else {
            res.json({ success: false, message: "Reserva no encontrada" });
        }
    } else {
        res.json({ success: false, message: "No hay reservas registradas" });
    }
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
