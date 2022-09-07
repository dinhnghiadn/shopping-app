import fs from 'fs'
import path from 'path'
import { DataSource, EntityManager, Repository } from 'typeorm'

const { MYSQL_USERNAME, DB_HOST, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env
const ENTITIES_PATH = './src/models/entities/*.entity.ts'
const ENTITIES_DIR = './src/models/entities'

export class DatabaseConnection {
    dataSource: DataSource
    repositories: { [entity: string]: Repository<any> }
    entityManager: EntityManager
    constructor() {
        this.dataSource = new DataSource({
            type: 'mysql',
            host: DB_HOST,
            port: 3306,
            username: MYSQL_USERNAME,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE,
            entities: [ENTITIES_PATH],
            synchronize: true,
            // logging: ['query', 'error'],
        })
        this.repositories = {}
        this.entityManager = this.dataSource.manager
    }

    initialize() {
        return this.dataSource
            .initialize()
            .then(async () => {
                console.log('Data Source has been initialized!')
                // init repositories models
                const files = fs.readdirSync(ENTITIES_DIR)
                // fetch all files in models folder
                for (const file of files) {
                    if (file.indexOf('.') !== 0 && file.slice(-3) === '.ts') {
                        const model = await import(
                            path.join(`${__dirname}/`, '../../models/entities', file)
                        )
                        const modelName = file.replace('.entity.ts', '')
                        this.repositories[modelName] = this.dataSource.getRepository(
                            model[modelName]
                        )
                    }
                }
            })
            .catch((err) => {
                console.error('Error during Data Source initialization', err)
            })
    }

    getRepository(entityName: string) {
        return this.repositories[entityName]
    }
}
