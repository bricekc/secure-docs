import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LogGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private jwtService: JwtService) {}

  private connectedUsers: Map<string, Socket> = new Map();

  async handleConnection(
    client: Socket,
    // , ...args: any[]
  ) {
    const userToken = client.handshake.query.JWTToken as string;
    const tokenDecode:
      | { id: string; email: string; role: string; iat: number; exp: number }
      | Error = await this.jwtService.decode(userToken);
    console.log('LogGateway handleConnection', userToken, tokenDecode);
    if (!(tokenDecode instanceof Error) && tokenDecode.role === 'ADMIN') {
      this.connectedUsers.set('logs', client);
    }
  }

  sendNewLog(data: any) {
    const userSocket = this.connectedUsers.get('logs');
    if (userSocket) {
      console.log(`Sending new log`, data);
      userSocket.emit('log', data);
    }
  }
}
