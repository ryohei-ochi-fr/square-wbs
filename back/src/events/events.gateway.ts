import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// [NestJSでWebSocket - Qiita](https://qiita.com/YutaSaito1991/items/26d25ae6ccf89fb25115)
// ↓ roomの具体例
// [socket.io - Qiita](https://qiita.com/akkun_choi/items/15af5e48cfd5e969a12a)

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  private roomId = 'debug_room';

  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() data: any): WsResponse<string> {
  //   console.log('msg:', data);
  //   return { event: 'message', data: data };
  // }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): WsResponse<string> {
    client.join(this.roomId);
    console.log('msg:', data);
    console.log('client:', client.id);
    // console.log('debug:', this.server.adapter);
    this.server.to(this.roomId).emit('message', data);
    // return { event: 'message', data: data };
    return;
  }

  @SubscribeMessage('broadcast')
  broadcast(@MessageBody() data: any): void {
    this.server.to(this.roomId).emit('broadcast', 'server response');
  }
}
