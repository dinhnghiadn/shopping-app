import multer from 'multer'
import admin from 'firebase-admin'
import {Request} from "express";
import {ErrorResponse, SuccessResponse} from "./interfaces";
import sharp from 'sharp'


const {BUCKET,FIREBASE_STORAGE} = process.env
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

export const uploadImage = async (image: Express.Multer.File, directory: string): Promise<SuccessResponse | ErrorResponse> => {

    image.buffer = await sharp(image.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()
    const nameArchive = Date.now() + '.' + image.originalname.split('.').pop()
    const fullPath = `${directory}/${nameArchive}`;
    const bucketFile = bucket.file(fullPath)
    const stream = bucketFile.createWriteStream({
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
            await bucketFile.makePublic()
            const firebaseUrl = `https://storage.googleapis.com/${BUCKET}/${directory}/${nameArchive}`
            resolve({
                'success': true,
                'status': 200,
                'message': 'Upload image successfully!',
                resource: firebaseUrl
            })
        })
        stream.end(image.buffer)
    })

}
export const deleteImage = async (url: string) => {
    const ref = url.replace(FIREBASE_STORAGE as string,'')
    return await bucket.file(ref).delete()

}
