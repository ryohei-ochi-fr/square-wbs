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
  w!: jspreadsheet.JSpreadsheetElement;
  //w: any;

  // フロントがangular
  // [NestJSでWebSocket - Qiita](https://qiita.com/YutaSaito1991/items/26d25ae6ccf89fb25115)

  connection: any;
  response: any;
  msg: message = {
    socketId: 'aaa',
    username: 'unicast',
    cellx: 1,
    celly: 1,
  };

  constructor(private webSocketService: WebsocketService) { }

  title = 'SquareWBS';
  log = '';

  ngOnInit(): void {
    this.webSocketService.connect();
    this.connection = this.webSocketService.on('broadcast').subscribe(data => {
      console.log('broadcast', data);
      this.response = data;
    })
    this.connection = this.webSocketService.on('message').subscribe(data => {
      console.log('message', data);
      this.response = data;
    })
    // this.webSocketService.emit('message', this.msg);
  }

  ngOnDestroy(): void {
    this.connection.unsubscribe();
  }

  send(x1: number, y1: number) {
    this.msg = {
      socketId: '',
      username: '',
      cellx: x1,
      celly: y1,
    }
    // サーバへ送信する
    this.webSocketService.emit('message', this.msg);

    const msg2: message = {
      socketId: 'aaa',
      username: 'broadcast',
      cellx: 9,
      celly: 9,
    };
    // サーバへ送信した後にレスポンスをブロードキャストで受け取る
    this.webSocketService.emit('broadcast', msg2);

    // this.w[0].set
    //   style: { B1: 'border: solid 1px orange;' },
    // };

    // this.w.setStyle('B1','border','solid 1px orange;');
    // this.spreadsheet.nativeElement.setStyle('B1','border','solid 1px orange;');
    this.w.setComments('B2','aaaa','');
    this.w.setStyle('B1','background-color','yellow');
    this.w.setStyle('C1','border','solid 1px orange');


  }

  ngAfterViewInit() {
    this.log = '';
    const selectionActive = (instance: HTMLElement, x1: number, y1: number, x2: number, y2: number) => {
      var cellName1 = jspreadsheet.getColumnNameFromId([x1, y1]);
      var cellName2 = jspreadsheet.getColumnNameFromId([x2, y2]);
      console.log('The selection from ' + cellName1 + ' to ' + cellName2 + '');

      this.send(x1, y1);
    }

    this.w = jspreadsheet(this.spreadsheet.nativeElement, {
      url: "assets/data.json",
      columns: [
        { title: 'タスク名', width: 300, align: 'left' },
        { title: '担当者', width: 80 },
        { title: '開始日', width: 80 },
        { title: '終了日', width: 80 },
        { title: '進捗率', width: 80, type: 'text', },
      ],
      style: 
        { A1: 'border: solid 1px orange;' },
      minDimensions: [10, 10],
      onselection: selectionActive,
    });



    // 外部のjsを読み込む場合
    // const script = document.createElement('script');
    // script.async = true;
    // script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.4/Chart.min.js';

    // const div = document.getElementById('script');
    // if (div != null) {
    //   div.insertAdjacentElement('afterend', script);
    // }

  }
}
