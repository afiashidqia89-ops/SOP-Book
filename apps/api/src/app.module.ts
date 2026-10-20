import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { DocumentsController } from './documents.controller';
import { SyncController } from './sync.controller';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth.service';
@Module({imports:[JwtModule.register({global:true,secret:process.env.JWT_ACCESS_SECRET || 'dev-secret',signOptions:{expiresIn:'15m'}})],controllers:[AuthController,DocumentsController,SyncController],providers:[PrismaService,AuthService]})
export class AppModule {}
