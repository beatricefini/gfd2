document.addEventListener("DOMContentLoaded", () => {
  const modelsContainer = document.getElementById("modelsContainer");

  const rows = 4;
  const cols = 4;

  // Buco iniziale: prima riga, quarta colonna (row-1, col-4)
  let emptyPos = { row: 0, col: 3 };
  const grid = [];

  const pieceSize = 0.25;  // più piccolo
  const pieceGap = 0.01;   // margine tra tasselli

  // Crea i tasselli
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === emptyPos.row && c === emptyPos.col) continue; // salta il buco

      const piece = document.createElement("a-plane");
      piece.setAttribute("width", pieceSize);
      piece.setAttribute("height", pieceSize);

      // r+1 e c+1 perché i file partono da 1
      piece.setAttribute("material", {
        src: `url(images/puzzle/row-${r+1}-column-${c+1}.jpg)`
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

  // Calcola la posizione di un tassello in base a riga/colonna
  function getWorldPos(row, col) {
    const x = (col - (cols - 1) / 2) * (pieceSize + pieceGap);
    const y = ((rows - 1) / 2 - row) * (pieceSize + pieceGap);
    return `${x} ${y} 0`;
  }

  // Salva tassello nella griglia
  function gridKey(r, c, entity) {
    grid[`${r},${c}`] = entity;
  }

  // Muove un tassello nel buco (solo se adiacente)
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

  // Controlla se due celle sono adiacenti (orizzontale o verticale)
  function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  // Verifica se puzzle completato
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

  // Mescola automaticamente
  function shuffle(times = 300) {
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

  shuffle(400); // mescola all'avvio
});
