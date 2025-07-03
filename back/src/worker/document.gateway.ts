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
export class DocumentGateway implements OnGatewayConnection {
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
    if (!(tokenDecode instanceof Error) && tokenDecode.id) {
      this.connectedUsers.set(tokenDecode.id.toString(), client);
    }
  }

  sendDocumentUpload(userId: string, data: any) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      console.log(`Sending document upload to user ${userId}, ${data}`);
      userSocket.emit('document-upload', data);
    }
  }

  sendDocumentUpdate(userId: string, data: any) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      console.log(`Sending document update to user ${userId}`);
      userSocket.emit('document-update', data);
    }
  }
}
