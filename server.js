const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const QRCode = require('qrcode');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/reservacionesindex.html');
});

// Ruta para realizar una nueva reserva
app.post('/nueva-reserva', (req, res) => {
    const { name, email, phone, date, time, guests, restaurant } = req.body;
    const confirmationNumber = Math.floor(Math.random() * 1000000);

    const filePath = 'reservas.xlsx';
    let workbook;
    let worksheet;

    try {
        if (fs.existsSync(filePath)) {
            workbook = XLSX.readFile(filePath);
            worksheet = workbook.Sheets['Reservas'];
        } else {
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.aoa_to_sheet([['Número de Confirmación', 'Nombre', 'Correo Electrónico', 'Teléfono', 'Fecha', 'Hora', 'Número de Personas', 'Restaurante']]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');
        }

        const newRow = [confirmationNumber, name, email, phone, date, time, guests, restaurant];
        XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });
        XLSX.writeFile(workbook, filePath);

        res.json({ confirmationNumber, name, email, phone, date, time, guests, restaurant });
    } catch (error) {
        console.error('Error al crear o actualizar el archivo Excel:', error);
        res.status(500).json({ success: false, message: "Error al registrar la reserva" });
    }
});

// Ruta para consultar una reserva
app.get('/consultar-reserva', (req, res) => {
    const { reservationNumber } = req.query;
    const filePath = 'reservas.xlsx';

    try {
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
                        guests: reservation[6],
                        restaurant: reservation[7]
                    }
                });
            } else {
                res.json({ success: false, message: "Reserva no encontrada" });
            }
        } else {
            res.json({ success: false, message: "No hay reservas registradas" });
        }
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        res.status(500).json({ success: false, message: "Error al consultar la reserva" });
    }
});

// Ruta para generar el código QR
app.get('/generar-qr', (req, res) => {
    const { reservationNumber } = req.query;
    const filePath = 'reservas.xlsx';

    try {
        if (fs.existsSync(filePath)) {
            const workbook = XLSX.readFile(filePath);
            const worksheet = workbook.Sheets['Reservas'];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const reservation = data.find(row => row[0] == reservationNumber);

            if (reservation) {
                const qrData = {
                    confirmationNumber: reservation[0],
                    name: reservation[1],
                    email: reservation[2],
                    phone: reservation[3],
                    date: reservation[4],
                    time: reservation[5],
                    guests: reservation[6],
                    restaurant: reservation[7]
                };
                QRCode.toDataURL(JSON.stringify(qrData), (err, url) => {
                    if (err) {
                        res.json({ success: false, message: "Error generando el código QR" });
                    } else {
                        res.json({ success: true, qrCode: url });
                    }
                });
            } else {
                res.json({ success: false, message: "Reserva no encontrada" });
            }
        } else {
            res.json({ success: false, message: "No hay reservas registradas" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al generar el código QR" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
