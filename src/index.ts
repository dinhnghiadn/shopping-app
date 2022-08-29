import 'dotenv/config'
import { DatabaseConnection } from './utils/database/db'
import express, { Express } from 'express'
import { wrap } from './utils/shared/wrap'
import { sessionMiddleware } from './utils/common/session'
import path from 'path'

const port = process.env.PORT
const app: Express = express()

// Middleware for parsing bodies from URL to request
app.use(
    express.urlencoded({
        extended: false,
    })
)

// Middleware for parsing json objects to request
app.use(express.json())
app.use(sessionMiddleware)
app.use(express.static(path.join(__dirname, '../public')))

app.set('views', path.join(__dirname, '../public/views'))
app.set('view engine', 'ejs')

export const databaseConnection = new DatabaseConnection()
databaseConnection
    .initialize()
    .then((res) => {
        const initialize = wrap(databaseConnection, express.Router())
        app.use('', initialize)

        app.listen(port, () => {
            console.log(`Server is up on ${port}! `)
        })
    })
    .catch((e) => {
        console.error('Error during Data Source initialization', e)
    })
