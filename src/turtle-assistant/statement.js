/* Keeps track of location for a turtle statement
*/
export class Statement {
  constructor({ startRow = 0, text, quads }) {
    this.startRow = startRow;
    this.text = text;
    this.rowCount = text.split('\n').length;
    this.endRow = this.startRow + this.rowCount - 1;
    this.quads = quads;
  }
}
