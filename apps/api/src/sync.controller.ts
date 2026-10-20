import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Controller('sync') export class SyncController {
 constructor(private prisma:PrismaService){}
 @Post('check') async check(@Body() body:{lastSyncAt?:string}) { const since=body.lastSyncAt?new Date(body.lastSyncAt):new Date(0); const documents=await this.prisma.document.findMany({where:{updatedAt:{gt:since},status:'PUBLISHED'},include:{versions:{orderBy:{createdAt:'desc'},take:1}}}); return {serverTime:new Date().toISOString(),updates:documents}; }
 @Post('push') async push(@Body() body:{events:Array<{userId:string;documentId:string;versionNumber:string;deviceId?:string}>}) { const results=[]; for(const event of body.events||[]){ results.push(await this.prisma.acknowledgement.upsert({where:{userId_documentId_versionNumber:{userId:event.userId,documentId:event.documentId,versionNumber:event.versionNumber}},update:{deviceId:event.deviceId,syncedOffline:true},create:{...event,syncedOffline:true}})); } return {accepted:results.length}; }
}
