import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from "@angular/core";
import * as jspreadsheet from "jspreadsheet-ce";
import { WebsocketService } from './websocket.service';
import { read, utils, writeFileXLSX } from 'xlsx-js-style';

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

interface President { Name: string; Index: number };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  rows: President[] = [{ Name: "SheetJS", Index: 0 }];

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
  color = Math.floor(Math.random() * 16777215).toString(16);

  // todo パレットから選択


  async ngOnInit(): Promise<void> {
    this.webSocketService.connect();
    // socketでブロードキャストを受け取った場合
    this.connection = this.webSocketService.on('broadcast').subscribe(data => {
      console.log('broadcast', data);
    })
    // socketでメッセージを受け取った場合
    this.connection = this.webSocketService.on('message').subscribe(data => {
      console.log('message', data);
      this.response = data;

      // todo お互いのセルが重なった場合の排他処理

      // セルを描画
      let y: number = this.response.cellY + 1;
      let x: string = String.fromCharCode(65 + this.response.cellX)
      let cell = `${x}${y}`;
      this.w.setStyle(cell, 'border', 'solid 1px #' + this.response.userColor);

      // 直前セルの描画をリセット
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

    /* Download from https://sheetjs.com/pres.numbers */
    // const f = await fetch("https://sheetjs.com/pres.numbers");
    // const f = await fetch('assets/data.json');
    // const f = await fetch('assets/sample_001.xlsx');
    // const f = await fetch('assets/sample_002.xlsx');
    const f = await fetch('assets/sample_003.xlsx');
    const ab = await f.arrayBuffer();

    /* parse workbook */
    const wb = read(ab);

    /* update data */
    this.rows = utils.sheet_to_json<President>(wb.Sheets[wb.SheetNames[0]]);

    console.log('loaded xlsx');
    
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

  /* get state data and export to XLSX */
  onSave(): void {
    const ws = utils.json_to_sheet(this.rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, "SheetJSAngularAoO.xlsx");
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

    // xlsx-js-style(SheetJS)を使ってxlsx形式のファイルを読み込む
    // https://github.com/gitbrent/xlsx-js-style/blob/master/demos/node/demo.js
    console.log(`\n\n--------------------==~==~==~==[ STARTING DEMO... ]==~==~==~==--------------------\n`);
    // console.log("`XLSX.version` ......... = " + XLSX.version);
    // console.log("`XLSX.style_version` ... = " + XLSX.style_version);

    // STEP 1: Create a new Workbook
    const wb = utils.book_new();

    // STEP 2: Create data rows
    let row1 = ["a", "b", "c"];
    let row2 = [1, 2, 3];
    let row3 = [
      { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
      { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
      { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
      { v: "line\nbreak!", t: "s", s: { alignment: { wrapText: true } } },
    ];

    // STEP 3: Create Worksheet, add data, set cols widths
    const ws = utils.aoa_to_sheet([row1, row2, row3]);
    ws["!cols"] = [{ width: 30 }, { width: 20 }, { width: 20 }];
    utils.book_append_sheet(wb, ws, "browser-demo");

    // STEP 4: Write Excel file to browser
    // XLSX.writeFile(wb, "xlsx-js-style-demo.xlsx");

    console.log(`\n--------------------==~==~==~==[ ...DEMO COMPLETE ]==~==~==~==--------------------\n\n`);

    this.w = jspreadsheet(this.spreadsheet.nativeElement, {
      url: 'assets/data.json',
      columns: [
        { title: 'タスク名', width: 300, align: 'left' },
        { title: '担当者', width: 80 },
        { title: '開始日', width: 80 },
        { title: '終了日', width: 80 },
        { title: '進捗率', width: 80, type: 'text', },
      ],
      toolbar: [
        /*
                {
                    type: 'i',
                    content: 'undo',
                    onclick: function() {
                      this.w.undo();
                    }
                },
                {
                    type: 'i',
                    content: 'redo',
                    onclick: function() {
                        table.redo();
                    }
                },
                {
                    type: 'i',
                    content: 'save',
                    onclick: function () {
                        table.download();
                    }
                },
        */
        {
          type: 'select',
          k: 'font-family',
          v: ['Arial', 'Verdana']
        },
        {
          type: 'select',
          k: 'font-size',
          v: ['9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px']
        },
        {
          type: 'i',
          content: 'format_align_left',
          k: 'text-align',
          v: 'left'
        },
        {
          type: 'i',
          content: 'format_align_center',
          k: 'text-align',
          v: 'center'
        },
        {
          type: 'i',
          content: 'format_align_right',
          k: 'text-align',
          v: 'right'
        },
        {
          type: 'i',
          content: 'format_bold',
          k: 'font-weight',
          v: 'bold'
        },
        {
          type: 'color',
          content: 'format_color_text',
          k: 'color'
        },
        {
          type: 'color',
          content: 'format_color_fill',
          k: 'background-color'
        },
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
