import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

// [NestJSでWebSocket - Qiita](https://qiita.com/YutaSaito1991/items/26d25ae6ccf89fb25115)

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any): WsResponse<string> {
    console.log('msg:', data);
    return { event: 'message', data: data };
  }

  @SubscribeMessage('broadcast')
  broadcast(@MessageBody() data: any): void {
    this.server.emit('broadcast', 'server response');
  }
}
