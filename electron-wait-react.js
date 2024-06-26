const net = require('net');
const port = process.env.PORT ? (process.env.PORT - 100) : 5000;

process.env.ELECTRON_START_URL = `http://localhost:${port}`;

const client = new net.Socket();

let startedElectron = false;
const tryConnection = () => client.connect({ port: port, host: '127.0.0.1' }, () => {
    client.end();
    if (!startedElectron) {
        console.log('starting electron');
        startedElectron = true;
        const exec = require('child_process').exec;
        var electron = exec('pnpm electron');

        electron.stdout.on('data', function (data) {
            console.log(data);
        });
    }
});

tryConnection();

client.on('error', (error) => {
    setTimeout(tryConnection, 1000);
});