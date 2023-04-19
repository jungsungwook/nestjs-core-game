import { Injectable, NestMiddleware } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { User } from 'src/pages/users/user.entity'

@Injectable()
export class AuthTokenMiddleware implements NestMiddleware {
    public async use(req: Request, res: Response, next: () => void) {
        req.user = await this.verifyUser(req)
        return next()
    }

    private async verifyUser(req: Request): Promise<User> {
        let user: User = null
        try {
            const { authorization } = req.headers
            const token = authorization.replace('Bearer ', '').replace('bearer ', '')
            const decoded = await this.verifyToken(token)

            // user = await this.userRepository.findOne({ where : {customId : decoded.customId} });
            user = decoded;
        } catch (e) {}

        return user;
    }

    private async verifyToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) reject(err)
                resolve(decoded)
            })
        })
    }
}