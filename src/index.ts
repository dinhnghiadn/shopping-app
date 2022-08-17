import 'dotenv/config'
import {DatabaseConnection} from "./utils/database/db";
import express, {Express} from 'express'
import {wrap} from "./utils/shared/wrap";

const port = process.env.PORT
const app: Express = express()

// Middleware for parsing bodies from URL to request
app.use(express.urlencoded({
    extended: false
}))

// Middleware for parsing json objects to request
app.use(express.json())

export const databaseConnection = new DatabaseConnection()
databaseConnection.initialize()
    .then((res) => {
            const initialize = wrap(databaseConnection, express.Router())
            app.use('/user', initialize.userRoutes)
            app.use('/product', initialize.productRoutes)
            app.listen(port, () => {
                console.log(`Server is up on ${port}! `)
            })
        }
    ).catch((e) => {
        console.error("Error during Data Source initialization", e)
    }
)

