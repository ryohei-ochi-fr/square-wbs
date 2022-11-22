import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from "@angular/core";
import * as jspreadsheet from "jspreadsheet-ce";
import { WebsocketService } from './websocket.service';

interface message {
  socketId: string
  roomId: string
  userName: string
  userColor: string
  cellX: number
  cellY: number
  cellXBefore: number
  cellYBefore: number
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
  cellXBefore: number = 0;
  cellYBefore: number = 0;
  msg: message = {
    socketId: '',
    roomId: '',
    userName: '',
    userColor: '',
    cellX: 0,
    cellY: 0,
    cellXBefore: 0,
    cellYBefore: 0,
  };

  constructor(private webSocketService: WebsocketService) { }

  title = 'SquareWBS';
  log = '';

  // ランダムカラー
  color = Math.floor(Math.random()*16777215).toString(16);

  // todo パレットから選択


  ngOnInit(): void {
    this.webSocketService.connect();
    // socketでブロードキャストを受け取った場合
    this.connection = this.webSocketService.on('broadcast').subscribe(data => {
      console.log('broadcast', data);
    })
    // socketでメッセージを受け取った場合
    this.connection = this.webSocketService.on('message').subscribe(data => {
      console.log('message', data);
      this.response = data;

      // セルを描画
      let y: number = this.response.cellY + 1;
      let x: string = String.fromCharCode(65 + this.response.cellX)
      let cell = `${x}${y}`;
      this.w.setStyle(cell, 'border', 'solid 1px #'+this.response.userColor);

      // セルを描画
      y = this.response.cellYBefore + 1;
      x = String.fromCharCode(65 + this.response.cellXBefore)
      cell = `${x}${y}`;
      // todo スタイルのリセット方法を調査
      this.w.setStyle(cell, 'border-top', 'solid 1px #ccc');
      this.w.setStyle(cell, 'border-left', 'solid 1px #ccc');
      this.w.setStyle(cell, 'border-right', 'solid 1px transparent');
      this.w.setStyle(cell, 'border-bottom', 'solid 1px transparent');

    })
    // this.webSocketService.emit('message', this.msg);
  }

  ngOnDestroy(): void {
    this.connection.unsubscribe();
  }

  // send(x1: number, y1: number, x2: number, y2: number) {
  send() {
    //   this.msg = {
    //   socketId: '',
    //   userName: '',
    //   roomId: 'debug_room',
    //   cellX: x1,
    //   cellY: y1,
    //   cellXBefore: x2,
    //   cellYBefore: y2,
    // }
    // サーバへ送信する
    this.webSocketService.emit('message', this.msg);

    // サーバへ送信した後にレスポンスをブロードキャストで受け取る
    // this.webSocketService.emit('broadcast', this.msg);

    // const msg2: message = {
    //   socketId: 'aaa',
    //   userName: '',
    //   roomId: 'debug_room',
    //   cellX: 9,
    //   cellY: 9,
    //   cellXBefore: 9,
    //   cellYBefore: 9,
    // };
    // サーバへ送信した後にレスポンスをブロードキャストで受け取る
    // this.webSocketService.emit('broadcast', msg2);

    // this.w.setComments('B2','aaaa','');
    // this.w.setStyle('B1','background-color','yellow');
    // this.w.setStyle('C1','border','solid 1px orange');


  }

  ngAfterViewInit() {
    this.log = '';
    const selectionActive = (instance: HTMLElement, x1: number, y1: number, x2: number, y2: number) => {
      var cellName1 = jspreadsheet.getColumnNameFromId([x1, y1]);
      var cellName2 = jspreadsheet.getColumnNameFromId([x2, y2]);
      console.log('The selection from ' + cellName1 + ' to ' + cellName2 + '');

      // todo 範囲選択の処理

      this.msg = {
        socketId: '',
        userName: '',
        userColor: this.color,
        roomId: 'debug_room',
        cellX: x1,
        cellY: y1,
        cellXBefore: this.cellXBefore,
        cellYBefore: this.cellYBefore,
      }

      this.cellXBefore = x1;
      this.cellYBefore = y1;

      // this.send(x1, y1, x1, y1);
      this.send();
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
