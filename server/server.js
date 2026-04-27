import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Nodemailer Transporter Setup
// IMPORTANT: User needs to set these in a .env file
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail
    }
});

app.post('/api/audit', async (req, res) => {
    const { nombre, email, whatsapp, instagram, sitioWeb, experiencia } = req.body;

    console.log('Recibida nueva solicitud de auditoría:', { nombre, email });

    // Validate Required Fields
    if (!nombre || !email || !whatsapp) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (Nombre, Email, WhatsApp)' });
    }

    try {
        // Send Email
        const mailOptions = {
            from: `"Click Audit System" <${process.env.EMAIL_USER}>`,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `NUEVA AUDITORÍA: ${nombre}`,
            text: `
                Has recibido una nueva solicitud de auditoría desde el sitio web.

                DATOS DEL CLIENTE:
                ------------------
                Nombre: ${nombre}
                Email: ${email}
                WhatsApp: ${whatsapp}
                Instagram: ${instagram}
                Sitio Web: ${sitioWeb}
                Experiencia con agencias: ${experiencia}
            `,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #f15a24;">Nueva Solicitud de Auditoría</h2>
                    <p>Has recibido una nueva solicitud de auditoría detallada a continuación:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${nombre}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>WhatsApp:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${whatsapp}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Instagram:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${instagram}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Sitio Web:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${sitioWeb}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Experiencia:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${experiencia}</td></tr>
                    </table>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">Enviado automáticamente por Click Productions.</p>
                </div>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Audit requested successfully and email sent.' });
        } else {
            console.warn('SMTP Credentials not found. Skipping email send but moving to WhatsApp redirect.');
            res.status(200).json({ message: 'Audit received. (Email skipped - Credentials not set)' });
        }

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Fallo al procesar la solicitud interna' });
    }
});

app.listen(port, () => {
    console.log(`Backend de Click activo en: http://localhost:${port}`);
});
