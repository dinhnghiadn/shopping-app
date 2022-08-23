import {NextFunction, Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {JwtPayload} from "jsonwebtoken";
import {Repository} from "typeorm";
import {User} from "../../models/entities/User.entity";
import {Role, UserStatus} from "./enum";

const {JWT_SECRET} = process.env

const verify = async (req: Request, res: Response, next: NextFunction, userRepository: Repository<User>) => {
    const token = req.header('Authorization')!.replace('Bearer ', '')
    const decode = jwt.verify(token, JWT_SECRET as string)
    const username = (decode as JwtPayload)['username'];
    const user = await userRepository.findOneOrFail({
        where: {username}
    })
    req.body.token = token
    req.body.user = user
}

export const auth = async (req: Request, res: Response, next: NextFunction, userRepository: Repository<User>) => {
    try {
        await verify(req, res, next, userRepository)
        if (req.body.user.status === UserStatus.Blocked) {
            return res.status(400).send({
                error: 'You are blocked. Contact' +
                    ' admin for more information!'
            })
        }
        next()
    } catch (e) {
        res.status(401).send({error: 'Unauthenticated!'})
    }
}
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.isAdmin) {
            return res.status(401).send({
                error: 'You need to sign as an admin to' +
                    ' continue!'
            })
        } else

            next()
    } catch (e) {
        res.status(401).send({error: 'Unauthenticated!'})
    }
}
