import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { Observable } from 'rxjs';


interface message {
  socketId: string
  roomId: string
  username: string
  cellX: number
  cellY: number
  cellXBefore: number
  cellYBefore: number
}


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private backUrl = 'http://localhost:3333';
  private roomId = 'debug-room';
  private socket: any;

  connect() {
    this.socket = io(this.backUrl);
  }

  emit(emitName: string, msg: message) {
    this.socket.emit(emitName, msg);
  }

  on(onName: string) {
    let observable = new Observable(observer => {
      this.socket.on(onName, (msg: message) => {
        observer.next(msg);
      });

      return () => { this.socket.disconnect(); };
    });
    return observable;
  }
}
