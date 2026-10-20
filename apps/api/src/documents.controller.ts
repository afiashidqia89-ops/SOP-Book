import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus, OfflinePolicy } from '@prisma/client';
import { PrismaService } from './prisma.service';
class CreateDocumentDto { @IsString() documentNumber!:string; @IsString() title!:string; @IsString() type!:string; @IsOptional() @IsString() department?:string; @IsEnum(OfflinePolicy) offlinePolicy!:OfflinePolicy; @IsBoolean() requiresAcknowledgement!:boolean; }
@Controller('documents') export class DocumentsController {
 constructor(private prisma:PrismaService){}
 @Get() list(){return this.prisma.document.findMany({include:{versions:true},orderBy:{updatedAt:'desc'}});}
 @Get(':id') one(@Param('id') id:string){return this.prisma.document.findUnique({where:{id},include:{versions:true}});}
 @Post() create(@Body() dto:CreateDocumentDto){return this.prisma.document.create({data:dto});}
 @Post(':id/publish') publish(@Param('id') id:string){return this.prisma.document.update({where:{id},data:{status:DocumentStatus.PUBLISHED}});}
}
