import http from 'http'
import { WebSocketServer } from 'ws'

enum LogLevel {
    Debug = 0,
    Info = 1,
    Error = 2,
    Silent = 3,
}

type ArgParser<T> = (value: string) => T | undefined
type ArgValidator<T> = (value: T | undefined) => boolean

function getArgValue(argName: string, defaultValue: string, validator?: ArgValidator<string>): string
function getArgValue<T>(argName: string, defaultValue: T, parser: ArgParser<T>, validator?: ArgValidator<T>): T
function getArgValue<T>(
    argName: string,
    defaultValue: T,
    parserOrValidator?: ArgParser<T> | ArgValidator<T>,
    validator?: ArgValidator<T>
): T {
    const index = process.argv.indexOf(`--${argName}`)
    if (index !== -1 && process.argv.length > index + 1) {
        const value: string = process.argv[index + 1]
        let parsedValue: T | undefined
        let isValid: boolean = true
        if (typeof defaultValue === 'string') {
            parsedValue = value as T
            if (parserOrValidator) {
                isValid = (parserOrValidator as unknown as ArgValidator<string>)(value)
            }
        } else if (parserOrValidator) {
            parsedValue = (parserOrValidator as ArgParser<T>)(value)
            if (validator) {
                isValid = validator(parsedValue)
            } else if (parsedValue === undefined) {
                isValid = false
            }
        }
        if (!isValid || parsedValue === undefined) {
            console.warn(`Provided invalid value for argument: --${argName} ${value}`)
        } else {
            return parsedValue
        }
    }
    return defaultValue
}

const port = getArgValue<number>(
    'port',
    9772,
    (value) => parseInt(value, 10),
    (value) => typeof value === 'number' && !isNaN(value) && value >= 1 && value <= 65535
)
const host = getArgValue('host', 'localhost')
const logLevel = getArgValue<LogLevel>('log', LogLevel.Info, (value) => {
    switch (value) {
        case 'debug':
            return LogLevel.Debug
        case 'info':
            return LogLevel.Info
        case 'error':
            return LogLevel.Error
        case 'silent':
            return LogLevel.Silent
    }
})

function log(message: string, level: Exclude<LogLevel, LogLevel.Silent>): void {
    if (logLevel > level) return
    const logFunctions = {
        [LogLevel.Debug]: console.debug,
        [LogLevel.Info]: console.info,
        [LogLevel.Error]: console.error,
    }
    logFunctions[level](message)
}

const httpServer = http.createServer((req, res) => {
    log(`Received request: ${req.method} ${req.url}`, LogLevel.Debug)
    if (req.method === 'POST' && req.url === '/command') {
        let body = ''
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on('end', () => {
            log(`Broadcasting command to ${wsServer.clients.size} client(s): ${body}`, LogLevel.Debug)
            wsServer.clients.forEach((client) => {
                if (client.readyState !== client.OPEN) return
                client.send(body)
            })
            res.writeHead(204)
            res.end()
        })
    }
})

httpServer.on('error', (err) => {
    log(`HTTP server error: ${err.message}`, LogLevel.Error)
    process.exit(1)
})

const wsServer = new WebSocketServer({ server: httpServer })

wsServer.on('connection', (ws) => {
    log(`Client connected. ${wsServer.clients.size} connection(s) active`, LogLevel.Debug)
    ws.on('close', () => {
        log(`Client disconnected. ${wsServer.clients.size} connection(s) active`, LogLevel.Debug)
    })
})

wsServer.on('error', (err) => {
    log(`WebSocket server error: ${err.message}`, LogLevel.Error)
})

httpServer.listen(port, host, () => {
    log(`HTTP/WebSocket relay server running on port ${port}`, LogLevel.Info)
})
