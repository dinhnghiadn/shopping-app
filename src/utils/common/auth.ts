import {NextFunction, Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {JwtPayload} from "jsonwebtoken";
import {databaseConnection} from "../../index";
import {wrap} from "../shared/wrap";
import {Repository} from "typeorm";
import {User} from "../../models/entities/User.entity";
const {JWT_SECRET} = process.env
export const auth = async (req: Request, res: Response, next: NextFunction, userRepository : Repository<User>) => {
    try {
        const token = req.header('Authorization')!.replace('Bearer ', '')
        const decode = jwt.verify(token, JWT_SECRET as string)
        const username = (decode as JwtPayload)['username'];
        const user = await userRepository.findOneOrFail({
            where: {username},
            relations: {profile: true, orders: true}
        })
        req.body.token = token
        req.body.user = user
        next()
    } catch (e) {
        res.status(401).send({error: 'Unauthenticated!'})
    }
}
