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
  }
}
