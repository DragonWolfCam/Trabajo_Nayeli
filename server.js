const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const QRCode = require('qrcode');
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

    try {
        if (fs.existsSync(filePath)) {
            console.log('Archivo existente encontrado.');
            workbook = XLSX.readFile(filePath);
            worksheet = workbook.Sheets['Reservas'];
        } else {
            console.log('Archivo no encontrado. Creando nuevo archivo.');
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.aoa_to_sheet([['Número de Confirmación', 'Nombre', 'Correo Electronico', 'Telefono', 'Fecha', 'Hora', 'Numero de Personas']]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');
        }

        // Añadir la nueva reserva
        const newRow = [confirmationNumber, name, email, phone, date, time, guests];
        console.log('Añadiendo nueva reserva:', newRow);
        XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

        // Guardar el archivo
        XLSX.writeFile(workbook, filePath);
        console.log('Archivo guardado con la nueva reserva.');
        res.json({ confirmationNumber, name, email, phone, date, time, guests });
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
                        guests: reservation[6]
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

    console.log(`Generating QR for reservation number: ${reservationNumber}`);

    try {
        if (fs.existsSync(filePath)) {
            const workbook = XLSX.readFile(filePath);
            const worksheet = workbook.Sheets['Reservas'];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            console.log('Reservation data loaded');

            const reservation = data.find(row => row[0] == reservationNumber);

            if (reservation) {
                console.log('Reservation found:', reservation);
                const qrData = {
                    confirmationNumber: reservation[0],
                    name: reservation[1],
                    email: reservation[2],
                    phone: reservation[3],
                    date: reservation[4],
                    time: reservation[5],
                    guests: reservation[6]
                };
                QRCode.toDataURL(JSON.stringify(qrData), (err, url) => {
                    if (err) {
                        console.error('Error generating QR code:', err);
                        res.json({ success: false, message: "Error generando el código QR" });
                    } else {
                        console.log('QR code generated successfully:', url);
                        res.json({ success: true, qrCode: url });
                    }
                });
            } else {
                console.log('Reservation not found');
                res.json({ success: false, message: "Reserva no encontrada" });
            }
        } else {
            console.log('Reservation file not found');
            res.json({ success: false, message: "No hay reservas registradas" });
        }
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        res.status(500).json({ success: false, message: "Error al generar el código QR" });
    }
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
    console.log('Directorio actual:', __dirname);
});