import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable() export class AuthService {
 constructor(private prisma:PrismaService, private jwt:JwtService){}
 async login(email:string,password:string){ const user=await this.prisma.user.findUnique({where:{email}}); if(!user || !user.active || !(await bcrypt.compare(password,user.passwordHash))) throw new UnauthorizedException('Email atau password salah'); return {accessToken:await this.jwt.signAsync({sub:user.id,role:user.role}),user:{id:user.id,name:user.name,email:user.email,role:user.role}}; }
}
