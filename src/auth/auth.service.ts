import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('Auth ms')

    constructor(
        private readonly jwtService: JwtService,
    ){
        super();
    }

    onModuleInit() {
        this.$connect();
        this.logger.log('mongo db connected')
    }

    signJwt(payload: JwtPayload){
        return this.jwtService.sign(payload);
    }

    async registerUser(registerUser: RegisterUserDto) {  
        const {email, name, password} = registerUser;
        try {

            const user = await this.user.findUnique({
                where: {
                    email
                }
            })

            if(user){
                throw new RpcException({
                    status: HttpStatus.NOT_FOUND,
                    message: 'User already exists',
                })
            }

            const response = await this.user.create({
                data: {
                    ...registerUser,
                    password: bcrypt.hashSync(registerUser.password, 10),
                }
            });

            console.log({response});
            
             const {password, ...rest} = response; 

            return {
                newUser: rest, 
                token: this.signJwt(rest),
            }
            
        } catch (error) {
            console.log({error});
            
            throw new RpcException({
                status: 400,
                message: error.message
            })
        }

        // return 'registerUser siu';
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const {email, password} = loginUserDto;
        try {

            const user = await this.user.findUnique({
                where: {
                    email
                }
            })

            if(!user){
                throw new RpcException({
                    status: HttpStatus.NOT_FOUND,
                    message: 'User not found',
                })
            }

            const isPasswordValid = bcrypt.compareSync(loginUserDto.password, user.password);

            if(!isPasswordValid){
                throw new RpcException({
                    status: 400,
                    message: 'User/Password not valid'
                })
            }
            
             const {password, ...rest} = user; 

            return {
                newUser: rest, 
                token: this.signJwt(rest),
            }
            
        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            })
        }
        return 'loginUser';
    }

    async verifyUser(token: string) {
        try {
            const {sub, iat, exp, ...user} = await this.jwtService.verify(token, {
                secret: envs.secretJwt,
            });

            return {
                user,
                token: this.signJwt(user)
            }

        } catch (error) {
            throw new RpcException({
                status: HttpStatus.UNAUTHORIZED,
                messaeg: 'Invalid token'
            })
        }
        

    }

}
