const express = require('express');
const morgan = require('morgan');
const path = require('path')
const fs = require('fs');
const app = express();

app.listen(3000, () => console.log("Server ready on port 3000."));

//Connects to log.csv
const logPath = path.join(__dirname, 'log.csv');
const logStream = fs.createWriteStream(logPath, {flags: 'a'});
if (fs.existsSync(logPath) && fs.statSync(logPath).size === 0) { //Writes CSV header if log is empty
    logStream.write('Agent, Time, Method, Resource, Version, Status\n');
}

//Logging middleware
app.use((req, res, next) => {
    console.log('Incoming request for:', req.originalUrl);
    const start = new Date();

    res.on('finish', () => {
        const agent = req.get('User-Agent');
        const time = start.toISOString();
        const method = req.method;
        const resource = req.originalUrl;
        const version = `HTTP/${req.httpVersion}`;
        const status = res.statusCode;   

    const logEntry = `${agent},${time},${method},${resource},${version},${status}\n`;
    logStream.write(logEntry);
    console.log(logEntry.trim()); 
    });

    next();
}); 

/*morgan.token('user-agent', (req) => req.header('User-Agent'));
morgan.token('time', () => new Date().toISOString());
morgan.token('method', (req) => req.method);
morgan.token('resource', (req) => req.originalUrl);
morgan.token('version', (req) => `HTTP/${req.httpVersion}`);
const logFormat = ':user-agent|:time|:method|:resource|:version|:status\n';
app.use(morgan(logFormat, {stream:logStream}));*/

app.get('/', (req, res) => {
    res.status(200).send('Ok')
})

//returns JSON object
app.get('/logs', (req, res) => {
    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({error: 'Failed to read log file'});
        }
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const entries = lines.slice(1).map(line => {
            const values = line.split(',');
            const entry = {};
            headers.forEach((header,idx) => {
                entry[header] = values[idx];
            });
            return entry;
        });

        res.json(entries);
    })
    /*const agent = req.get('User-Agent');
    //const safeAgent = `"${agent.replace(/"/g, '""')}`;
    const time = new Date().toISOString();
    const method = req.method;
    const resource = req.originalUrl;
    const version = `HTTP/${req.httpVersion}`;
    const status = res.statusCode;

    res.json({
        Agent: agent,
        Time: time,
        Method: method,
        Resource: resource,
        Version: version,
        Status: status,
    });*/
});

module.exports = app;