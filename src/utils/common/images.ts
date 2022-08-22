import multer from 'multer'
import admin from 'firebase-admin'
import {NextFunction, Request, Response} from "express";
import {ErrorResponse, SuccessResponse} from "./interfaces";


const BUCKET = 'shopping-app-e4150.appspot.com'
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image !'))
        }
        cb(null, true)
    }
})

admin.initializeApp({
    credential: admin.credential.cert('src/utils/credentials/fire-base-key.json'),
    storageBucket: BUCKET
})

const bucket = admin.storage().bucket()

export const uploadImage = async (req: Request): Promise<SuccessResponse | ErrorResponse> => {
    if (!req.file) {
        return {
            'success': false,
            'status': 500,
            'message': 'Error occur!'
        }
    }
    const image = req.file
    const nameArchive = Date.now() + '.' + image.originalname.split('.').pop()
    const file = bucket.file(nameArchive)
    const stream = file.createWriteStream({
        metadata: {
            contentType: image.mimetype
        }
    })
    return new Promise((resolve, reject) => {
        stream.on('error', (e) => {
            reject(
                {
                    'success': false,
                    'status': 500,
                    'message': 'Error occur!'
                }
            )
        })
        stream.on('finish', async () => {
            await file.makePublic()
            const firebaseUrl = `https://storage.googleapis.com/${BUCKET}/${nameArchive}`
            resolve({
                'success': true,
                'status': 200,
                'message': 'Upload image successfully!',
                resource: firebaseUrl
            })
        })
        stream.end(image.buffer)
    })
    // const stream = file.createWriteStream({
    //     metadata: {
    //         contentType: req.file.mimetype
    //     }
    // })
    //
    // stream.on('error', (e) => {
    //     console.log(e)
    // })
    // stream.on('finish',async () => {
    //     await file.makePublic()
    //     req.body.firebaseUrl = `https://storage.googleapis.com/${BUCKET}/${nameArchive}`
    //     console.log(req.body.firebaseUrl)
    // })
    // stream.end(image.buffer)
    // return {
    //     'success': true,
    //     'status': 200,
    //     resource: `https://storage.googleapis.com/${BUCKET}/${nameArchive}`,
}
