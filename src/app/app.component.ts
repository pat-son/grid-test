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
  public tileHeld: any;
  public tempTiles: any[];
  public placeholders = [];
  public gridState: any[][];

  ngOnInit() {
    this.gridState = [];
    this.initGridState(this.gridState);
  }

  public gridMode() {
    this.isGridMode = !this.isGridMode;
  }

  public pickupTile(tile: any) {
    if(tile.id === 0) return;
    this.tileHeld = tile;
    this.isGridMode = true;
  }

  public placeholderHover(placeholder: any) {
    this.tempTiles = [];
    let col = placeholder.col;
    let row = placeholder.row;
    [col, row] = this.nudgeToFit(this.gridState, this.tileHeld, col, row);
    if(placeholder.row > 0) this.tempTiles.push({text: '', cols: this.numCol, rows: row, color: 'rgba(0,0,0,0)'});
    if(placeholder.col > 0) this.tempTiles.push({text: '', cols: col, rows: 1, color: 'rgba(0,0,0,0)'});
    this.tempTiles.push(this.tileHeld);
  }

  public dropTile(placeholder: any) {
    let col = placeholder.col;
    let row = placeholder.row;
    this.tiles = this.tiles.filter((tile) => tile.id !== 0);
    [col, row] = this.nudgeToFit(this.gridState, this.tileHeld, col, row);
    let newGridState = [];
    for(let r = 0; r < row + this.tileHeld.rows; r++) {
      newGridState.push([]);
      for(let c = 0; c < this.numCol; c++) newGridState[r].push(0);
    }
    this.writeTile(newGridState, col, row, this.tileHeld);
    let newIndex = this.getInsertionPoint(newGridState, this.tileHeld);
    console.log('new Grid State', newIndex, newGridState);
    let newArray = [];
    let tileSet = this.scanGridState(newGridState, newArray, this.tiles);
    for(let tile of this.tiles) {
      if(!tileSet.has(tile.id)) {
        tileSet.add(tile.id);
        newArray.push(tile);
      }
    }
    this.tiles = newArray;
    this.gridState = [];
    this.initGridState(this.gridState);
    this.isGridMode = false;
  }

  private initGridState(array: any[][]) {
    this.tiles = this.tiles.filter((tile) => tile.id !== 0);
    array.push([]);
    for(let i = 0; i < this.numCol; i++) array[0].push(0);
    let headCol = 0;
    let headRow = 0;
    this.tiles.forEach((tile, index) => {
      let tempCol;
      let tempRow;
      let spaceFound = false;
      while(!spaceFound) {
        [tempRow, tempCol] = this.nextOpenSpace(array, headCol, headRow);
        if(tempRow === null) {
          array.push([]);
          headCol = 0;
          headRow = array.length - 1;
          for(let i = 0; i < this.numCol; i++) array[headRow].push(0);
        } else {
          headCol = tempCol;
          headRow = tempRow;
          while(array.length - headRow < tile.rows) {
            array.push([]);
            for(let i = 0; i < this.numCol; i++) array[array.length - 1].push(0);
          }
          if(this.enoughSpace(array, headCol, headRow, tile)) {
            spaceFound = true;
          } else {
            headCol += 1;
            if(headCol >= array[headRow].length) {
              headCol = 0;
              headRow += 1;
              if(headRow >= array.length) {
                array.push([]);
                for(let i = 0; i < this.numCol; i++) array[headRow].push(0);
              }
            }
          }
        }
      }

      // write tile to this space
      this.writeTile(array, headCol, headRow, tile);
      headCol += tile.cols;
      if(headCol >= array[headRow].length && index < this.tiles.length - 1) {
        headCol = 0;
        headRow += 1;
        if(headRow >= array.length) {
          array.push([]);
          for(let i = 0; i < this.numCol; i++) array[headRow].push(0);
        }
      }

    });

    let newArray = [];
    this.scanGridState(array, newArray, this.tiles, true);
    this.tiles = newArray;

    let stateStr = '';
    this.placeholders = [];
    for(let row = 0; row < array.length; row++) {
      for(let col = 0; col < array[row].length; col++) {
        stateStr += ' ' + array[row][col];
        this.placeholders.push({col: col, row: row});
      }
      stateStr += '\n';
    }
    console.log(stateStr);
  }

  private getInsertionPoint(array: any[][], insertedTile: any) {
    let headCol = 0;
    let headRow = 0;
    let index = 0;
    for(let tile of this.tiles) {
      if(tile.id === insertedTile.id) {
        // index += 1;
        continue;
      }
      let tempCol;
      let tempRow;
      let spaceFound = false;
      while(!spaceFound) {
        [tempRow, tempCol] = this.nextOpenSpace(array, headCol, headRow, insertedTile.id);
        if(tempRow === null) {
          return index;
        } else {
          headCol = tempCol;
          headRow = tempRow;
          while(array.length - headRow < tile.rows) {
            array.push([]);
            for(let i = 0; i < this.numCol; i++) array[array.length - 1].push(0);
          }
          if(this.enoughSpace(array, headCol, headRow, tile)) {
            spaceFound = true;
          } else {
            headCol += 1;
            if(headCol >= array[headRow].length) {
              headCol = 0;
              headRow += 1;
              if(headRow >= array.length) {
                array.push([]);
                for(let i = 0; i < this.numCol; i++) array[headRow].push(0);
              }
            }
          }
        }
      }
      // write tile to this space
      this.writeTile(array, headCol, headRow, tile);
      headCol += tile.cols;
      if(headCol >= array[headRow].length && index < this.tiles.length - 1) {
        headCol = 0;
        headRow += 1;
        if(headRow >= array.length) {
          array.push([]);
          for(let i = 0; i < this.numCol; i++) array[headRow].push(0);
        }
      }
      index += 1;
    }
    return index;
  }

  private nextOpenSpace(array: any[][], startCol: number, startRow: number, checkId?: number) {
    for(let row = startRow; row < array.length; row++) {
      for(let col = startCol; col < array[row].length; col++) {
        if(array[row][col] === checkId) return [null, null];
        if(array[row][col] === 0) return [row, col];
      }
      startCol = 0;
    }

    return [null, null];
  }

  private enoughSpace(array: any[][], startCol: number, startRow: number, tile: any): boolean {
    for(let row = 0; row < tile.rows; row++ ) {
      if(row + startRow >= array.length) return false;
      for(let col = 0; col < tile.cols; col++) {
        if(col + startCol >= array[row + startRow].length) return false;
        if(array[row + startRow][col + startCol] !== 0) return false;
      }
    }
    return true;
  }

  private writeTile(array: any[][], headCol: number, headRow: number, tile: any) {
    for(let row = 0; row < tile.rows; row++) {
      for(let col = 0; col < tile.cols; col++) {
        array[row + headRow][col + headCol] = tile.id;
      }
    }
  }

  private nudgeToFit(array: any[][], tile: any, col: number, row: number) {
    while(this.numCol - col < tile.cols) col -= 1;
    while(array.length - row < tile.rows) row -= 1;
    return [col, row];
  }

  private scanGridState(array: any[][], newArray: any[], oldArray: any[], addSpacer?: boolean) {
    let set = new Set();
    for(let row = 0; row < array.length; row++) {
      for(let col = 0; col < array[0].length; col++) {
        if(array[row][col] === 0) {
          if(addSpacer) newArray.push({text: 'spacer', cols: 1, rows: 1, color: 'rgba(0,0,0,0)', id: 0});
          continue;
        }
        if(!set.has(array[row][col])) {
          set.add(array[row][col]);
          newArray.push(oldArray.find(tile => tile.id === array[row][col]));
        }
      }
    }
    return set;
  }

}
