document.addEventListener("DOMContentLoaded", () => {
  const modelsContainer = document.getElementById("modelsContainer");

  // Config puzzle (4x4 => 15 pezzi + 1 buco)
  const rows = 4;
  const cols = 4;
  let emptyPos = { row: rows - 1, col: cols - 1 };
  const grid = [];

  // Dimensione tasselli e immagine
  const pieceSize = 0.4;   // più piccolo per 4x4
  const imageUrl = "images/puzzle.jpg";

  // Crea tasselli
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === emptyPos.row && c === emptyPos.col) continue;

      const piece = document.createElement("a-plane");
      piece.setAttribute("width", pieceSize);
      piece.setAttribute("height", pieceSize);
      piece.setAttribute("material", {
        src: `url(${imageUrl})`,
        repeat: `${cols} ${rows}`,
        offset: `${c / cols} ${1 - (r + 1) / rows}`
      });

      piece.setAttribute("position", getWorldPos(r, c));
      piece.classList.add("puzzle-piece");
      piece.dataset.row = r;
      piece.dataset.col = c;

      piece.addEventListener("click", () => tryMove(piece));

      modelsContainer.appendChild(piece);
      gridKey(r, c, piece);
    }
  }

  // Calcola posizione nel mondo
  function getWorldPos(row, col) {
    const x = (col - (cols - 1) / 2) * pieceSize;
    const y = ((rows - 1) / 2 - row) * pieceSize;
    return `${x} ${y} 0`;
  }

  function gridKey(r, c, entity) {
    grid[`${r},${c}`] = entity;
  }

  // Muovi un pezzo nel vuoto
  function tryMove(entity, check = true) {
    const r = parseInt(entity.dataset.row);
    const c = parseInt(entity.dataset.col);

    if (isAdjacent(r, c, emptyPos.row, emptyPos.col)) {
      grid[`${r},${c}`] = null;

      entity.dataset.row = emptyPos.row;
      entity.dataset.col = emptyPos.col;
      entity.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));

      gridKey(emptyPos.row, emptyPos.col, entity);
      emptyPos = { row: r, col: c };

      if (check) checkSolved();
    }
  }

  function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  // Controllo puzzle completato
  function checkSolved() {
    let solved = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === emptyPos.row && c === emptyPos.col) continue;
        const piece = grid[`${r},${c}`];
        if (!piece) { solved = false; continue; }
        if (parseInt(piece.dataset.row) !== r || parseInt(piece.dataset.col) !== c) {
          solved = false;
        }
      }
    }
    if (solved) {
      alert("Puzzle completato 🎉");
    }
  }

  // Shuffle iniziale
  function shuffle(times = 200) {
    for (let i = 0; i < times; i++) {
      const neighbors = [];
      const { row, col } = emptyPos;

      [[row-1,col],[row+1,col],[row,col-1],[row,col+1]].forEach(([r,c])=>{
        if (grid[`${r},${c}`]) neighbors.push(grid[`${r},${c}`]);
      });

      if (neighbors.length > 0) {
        const piece = neighbors[Math.floor(Math.random() * neighbors.length)];
        tryMove(piece, false);
      }
    }
  }

  shuffle(300); // puzzle parte già mescolato
});
