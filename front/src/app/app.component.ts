import { Component, ViewChild, ElementRef } from "@angular/core";
import * as jspreadsheet from "jspreadsheet-ce";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild("spreadsheet")
  spreadsheet!: ElementRef;

  title = 'SquareWBS';

  ngAfterViewInit() {
    jspreadsheet(this.spreadsheet.nativeElement, {
      url: "assets/data.json",
      columns: [
        { title:'タスク名', width:300, align: 'left' },
        { title:'担当者', width:80 },
        { title:'開始日', width:80 },
        { title:'終了日', width:80 },
        { title:'進捗率', width:80, type: 'text', },
      ],
      minDimensions: [10, 10]
    });

    // 外部のjsを読み込む場合
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.4/Chart.min.js';

    const div = document.getElementById('script');
    if (div != null){
      div.insertAdjacentElement('afterend', script);
    }

  }
}
