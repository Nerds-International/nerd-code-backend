import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BattleService } from './battle.service';
import { randomUUID } from 'crypto';

@WebSocketGateway({ cors: false })
export class BattleGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('BattleGateway');

  constructor(private readonly battleService: BattleService) { }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('joinBattle')
  async joinBattle(
    @MessageBody() battleId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Joining battle with ID: ${battleId}`);
    client.join(battleId);
    this.server.to(battleId).emit('opponentJoined', { battleId: battleId, id: client.id });
  }

  @SubscribeMessage('syncCode')
  handleSyncCode(
    @MessageBody() data: { battleId: string; code: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Syncing code for battle ID: ${data.battleId}`);
    this.server.to(data.battleId).emit('codeUpdated', { code: data.code, id: client.id });
  }

  @SubscribeMessage('useSkill')
  handleSkills(
    @MessageBody() data: { battleId: string; skill_name: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Used that skill: ${data.skill_name}`);
    this.server.to(data.skill_name).emit('codeUpdated', { code: data.skill_name, id: client.id });
  }

  @SubscribeMessage('startMatch')
  handleStartMatch(
    @MessageBody() battleId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(battleId).emit('opponentJoined', { battleId: battleId, id: client.id });
  }
}
