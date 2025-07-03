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

  private connectedUsers: Map<string, Socket> = new Map();

  handleConnection(
    client: Socket,
    // , ...args: any[]
  ) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client);
    }
  }

  sendDocumentUpload(userId: string, data: any) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      console.log(`Sending document upload to user ${userId}`);
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
