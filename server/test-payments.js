const { SquareClient } = require('square');
require('dotenv').config();

const client = new SquareClient({
  bearerAuthCredentials: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN
  },
  environment: 'sandbox',
});

console.log('client.payments type:', typeof client.payments);
console.log('client.payments keys:', Object.keys(client.payments));
console.log('client.payments methods:', Object.getOwnPropertyNames(client.payments));

// Check prototype
const proto = Object.getPrototypeOf(client.payments);
console.log('\nPrototype methods:', Object.getOwnPropertyNames(proto));

// Look for create
const allMethods = Object.getOwnPropertyNames(proto);
const createMethods = allMethods.filter(m => m.toLowerCase().includes('create') || m.toLowerCase().includes('payment'));
console.log('\nCreate/Payment methods:', createMethods);
