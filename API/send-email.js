const express = require('express');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await sgMail.send({
      to,
      from: 'your-email@example.com', // Replace with your verified sender
      subject,
      text,
    });

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
