const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/farmers', require('./routes/farmer.routes'));
app.use('/api/agents', require('./routes/agent.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/motors', require('./routes/motor.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/memberships', require('./routes/membership.routes'));

module.exports = app;