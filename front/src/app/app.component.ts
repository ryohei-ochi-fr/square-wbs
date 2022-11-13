import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from "@angular/core";
import * as jspreadsheet from "jspreadsheet-ce";
// import io from 'socket.io-client';
import { io } from "socket.io-client";
import { WebsocketService } from './websocket.service';

interface message {
  socketId: string
  username: string
  cellx: number
  celly: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild("spreadsheet")
  spreadsheet!: ElementRef;

  // フロントがangular
  // [NestJSでWebSocket - Qiita](https://qiita.com/YutaSaito1991/items/26d25ae6ccf89fb25115)

  connection: any;
  response: any;
  msg: message = {
    socketId: 'aaa',
    username: 'bbb',
    cellx: 1,
    celly: 1,
  };

  constructor( private webSocketService: WebsocketService ){}

  title = 'SquareWBS';
  log = '';

  ngOnInit(): void {
    this.webSocketService.connect();
    this.connection = this.webSocketService.on('message').subscribe(data => {
      console.log(data);
      this.response = data;
    })
    this.webSocketService.emit('message', this.msg);
  }

  ngOnDestroy(): void {
    this.connection.unsubscribe();
  }

  onClick(){
    this.webSocketService.emit('events', this.msg);
    console.log('click start');
    console.log('click end')

  }

  ngAfterViewInit() {
    this.log = '';
    const selectionActive = function (instance: HTMLElement, x1: number, y1: number, x2: number, y2: number) {
      var cellName1 = jspreadsheet.getColumnNameFromId([x1, y1]);
      var cellName2 = jspreadsheet.getColumnNameFromId([x2, y2]);
      console.log('The selection from ' + cellName1 + ' to ' + cellName2 + '');
    }

    jspreadsheet(this.spreadsheet.nativeElement, {
      url: "assets/data.json",
      columns: [
        { title: 'タスク名', width: 300, align: 'left' },
        { title: '担当者', width: 80 },
        { title: '開始日', width: 80 },
        { title: '終了日', width: 80 },
        { title: '進捗率', width: 80, type: 'text', },
      ],
      minDimensions: [10, 10],
      onselection: selectionActive,
    });



    // 外部のjsを読み込む場合
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.4/Chart.min.js';

    const div = document.getElementById('script');
    if (div != null) {
      div.insertAdjacentElement('afterend', script);
    }

  }
}
