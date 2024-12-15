import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { BattleService } from './battle.service';
  
  @WebSocketGateway({ cors: false })
  export class BattleGateway {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly battleService: BattleService) {}
  
    // Инициализация баттла
    @SubscribeMessage('createBattle')
    async createBattle(
      @MessageBody() battleId: string,
      @ConnectedSocket() client: Socket,
    ) {
      await this.battleService.createBattle(battleId, client.id);
      client.join(battleId);
      this.server.to(battleId).emit('battleCreated', { battleId });
    }
  
    // Подключение к существующему баттлу
    @SubscribeMessage('joinBattle')
    async joinBattle(
      @MessageBody() battleId: string,
      @ConnectedSocket() client: Socket,
    ) {
      const battleExists = await this.battleService.checkBattle(battleId);
      if (battleExists) {
        client.join(battleId);
        this.server.to(battleId).emit('opponentJoined', { battleId });
      } else {
        client.emit('error', { message: 'Battle not found' });
      }
    }
  
    // Обмен кодом между участниками
    @SubscribeMessage('syncCode')
    handleSyncCode(
      @MessageBody() data: { battleId: string; code: string },
      @ConnectedSocket() client: Socket,
    ) {
      this.server.to(data.battleId).emit('codeUpdated', { code: data.code });
    }
  }
  