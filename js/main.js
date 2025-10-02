AFRAME.registerComponent('init-puzzle', {
  init: function () {
    const marker = document.getElementById("marker");
    const container = document.getElementById("piecesContainer");
    const cameraEl = document.querySelector("a-camera");

    const rows = 3;
    const cols = 3;
    const pieceSize = 0.3;
    const pieceGap = 0.01;

    const grid = [];
    const pieces = [];
    let emptyPos = { row: 2, col: 0 };

    function getWorldPos(row, col) {
      const x = (col - (cols - 1) / 2) * (pieceSize + pieceGap);
      const y = ((rows - 1) / 2 - row) * (pieceSize + pieceGap);
      return { x, y, z: 0.01 };
    }

    function createEmptyHole() {
      if (!document.getElementById("hole")) {
        const hole = document.createElement("a-plane");
        hole.setAttribute("width", pieceSize);
        hole.setAttribute("height", pieceSize);
        hole.setAttribute("material", "color: #555555; opacity: 0.3; transparent: true");
        hole.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));
        hole.setAttribute("id", "hole");
        container.appendChild(hole);
      }
    }

    function createPiece(r, c) {
      if (r === emptyPos.row && c === emptyPos.col) return;
      const plane = document.createElement("a-plane");
      plane.setAttribute("width", pieceSize);
      plane.setAttribute("height", pieceSize);
      plane.setAttribute("material", `src: images/puzzle/row-${r+1}-column-${c+1}.jpg; side: double`);
      plane.setAttribute("position", getWorldPos(r, c));
      plane.dataset.row = r;
      plane.dataset.col = c;
      plane.dataset.correctRow = r;
      plane.dataset.correctCol = c;
      container.appendChild(plane);
      pieces.push(plane);
      grid[`${r},${c}`] = plane;
    }

    function isAdjacent(r1, c1, r2, c2) {
      return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
    }

    function tryMove(piece) {
      const r = parseInt(piece.dataset.row);
      const c = parseInt(piece.dataset.col);
      if (!isAdjacent(r, c, emptyPos.row, emptyPos.col)) return;

      grid[`${r},${c}`] = null;
      piece.dataset.row = emptyPos.row;
      piece.dataset.col = emptyPos.col;
      grid[`${emptyPos.row},${emptyPos.col}`] = piece;
      emptyPos = { row: r, col: c };

      const targetPos = getWorldPos(piece.dataset.row, piece.dataset.col);
      piece.object3D.position.set(targetPos.x, targetPos.y, targetPos.z);

      const holeEl = document.getElementById("hole");
      if (holeEl) holeEl.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));
      checkSolved();
    }

    function checkSolved() {
      let solved = true;
      for (let p of pieces) {
        if (parseInt(p.dataset.row) !== parseInt(p.dataset.correctRow) ||
            parseInt(p.dataset.col) !== parseInt(p.dataset.correctCol)) {
          solved = false;
          break;
        }
      }
      if (solved) {
        console.log("Puzzle completato!");
        pieces.forEach(p => p.parentNode.removeChild(p));
        const holeEl = document.getElementById("hole");
        if(holeEl) holeEl.parentNode.removeChild(holeEl);
      }
    }

    marker.addEventListener('targetFound', () => {
      console.log("Target trovato!");
      if (pieces.length===0){
        for(let r=0;r<rows;r++){
          for(let c=0;c<cols;c++){
            createPiece(r,c);
          }
        }
        createEmptyHole();
        console.log("Puzzle inizializzato");
      }
    });
  }
});

// Inizializza il componente
document.querySelector('#puzzleJS').setAttribute('init-puzzle', '');
