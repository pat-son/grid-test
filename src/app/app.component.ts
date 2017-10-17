import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public isGridMode = false;
  public numCol = 4;
  public rowHeight = 200;
  public tiles = [
    {text: 'One', cols: 2, rows: 1, color: 'lightblue', id: 1},
    {text: 'Two', cols: 2, rows: 2, color: 'lightgreen', id: 2},
    {text: 'Three', cols: 2, rows: 1, color: 'lightpink', id: 3},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1', id: 4},
    {text: 'Five', cols: 2, rows: 1, color: 'lightblue', id: 5},
    {text: 'Six', cols: 2, rows: 2, color: 'lightgreen', id: 6},
    {text: 'Seven', cols: 2, rows: 1, color: 'lightpink', id: 7},
    {text: 'Eight', cols: 2, rows: 1, color: '#DDBDF1', id: 8},
  ];
  public gridState: any[][];

  ngOnInit() {
    this.gridState = [];
    this.gridState.push([]);
    for(let i = 0; i < this.numCol; i++) this.gridState[0].push(0);
    let headCol = 0;
    let headRow = 0;
    for(let tile of this.tiles) {
      let tempCol;
      let tempRow;
      let spaceFound = false;
      while(!spaceFound) {
        [tempRow, tempCol] = this.nextOpenSpace(this.gridState, headCol, headRow);
        if(tempRow === null) {
          headCol += 1;
          if(headCol >= this.gridState[headRow].length) {
            headCol = 0;
            headRow += 1;
            this.gridState.push([]);
            for(let i = 0; i < this.numCol; i++) this.gridState[headRow].push(0);
          }
        } else {
          headCol = tempCol;
          headRow = tempRow;
          spaceFound = true;
        }
      }

    }
    // for(let tile of this.tiles) {
    //   for(let col = 0; col < tile.cols; col++) {
    //     for(let row = 0; row < tile.rows; row++) {
    //       if(headY + row >= this.gridState.length) {
    //         this.gridState.push([]);
    //         for(let i = 0; i < this.numCol; i++) this.gridState[headY + row].push(0);
    //       }
    //       this.gridState[headY + row][headX + col] = tile.id;
    //     }
    //   }
    // }
    // console.log(this.gridState);
  }

  public gridMode() {
    this.isGridMode = true;
  }

  private nextOpenSpace(array: any[][], startCol: number, startRow: number) {
    for(let row = startRow; row < array.length; row++) {
      for(let col = startCol; col < array[row].length; col++) {
        if(array[row][col] === 0) return [row, col];
      }
      startCol = 0;
    }

    return [null, null];
  }
}
