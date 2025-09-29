document.addEventListener("DOMContentLoaded", () => {
  const marker = document.getElementById("marker");
  const container = document.getElementById("piecesContainer");
  const cameraEl = document.querySelector("a-camera");

  const rows = 4;
  const cols = 4;
  const pieceSize = 0.25;
  const pieceGap = 0.01;

  const grid = [];
  const pieces = [];

  let emptyPos = { row: 0, col: 3 }; // buco iniziale row-1 col-4

  function getWorldPos(row, col) {
    const x = (col - (cols - 1) / 2) * (pieceSize + pieceGap);
    const y = ((rows - 1) / 2 - row) * (pieceSize + pieceGap);
    return { x, y, z: 0.01 }; // piccolo offset per visibilità e click
  }

  function createPiece(r, c) {
    if (r === emptyPos.row && c === emptyPos.col) return;

    const plane = document.createElement("a-plane");
    plane.setAttribute("width", pieceSize);
    plane.setAttribute("height", pieceSize);
    plane.setAttribute("material", { src: `images/puzzle/row-${r+1}-column-${c+1}.jpg` });
    const pos = getWorldPos(r, c);
    plane.setAttribute("position", pos);
    plane.dataset.row = r;
    plane.dataset.col = c;
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
    if (isAdjacent(r, c, emptyPos.row, emptyPos.col)) {
      grid[`${r},${c}`] = null;
      const pos = getWorldPos(emptyPos.row, emptyPos.col);
      piece.setAttribute("position", pos);
      piece.dataset.row = emptyPos.row;
      piece.dataset.col = emptyPos.col;
      grid[`${emptyPos.row},${emptyPos.col}`] = piece;
      emptyPos = { row: r, col: c };
      checkSolved();
    }
  }

  function checkSolved() {
    let solved = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === emptyPos.row && c === emptyPos.col) continue;
        const p = grid[`${r},${c}`];
        if (!p) { solved = false; continue; }
        if (parseInt(p.dataset.row) !== r || parseInt(p.dataset.col) !== c) {
          solved = false;
        }
      }
    }
    if (solved) alert("Puzzle completato 🎉");
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function updateMouse(event) {
    if (event.touches) {
      mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  function onPointerDown(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, cameraEl.getObject3D('camera'));
    const intersects = raycaster.intersectObjects(
      pieces.map(p => p.object3D), true
    );
    if (intersects.length > 0) {
      const p = intersects[0].object.el;
      tryMove(p);
    }
  }

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('touchstart', onPointerDown, { passive: false });

  function shuffle(times = 200) {
    for (let i = 0; i < times; i++) {
      const neighbors = [];
      const { row, col } = emptyPos;
      [[row-1,col],[row+1,col],[row,col-1],[row,col+1]].forEach(([r,c])=>{
        if(grid[`${r},${c}`]) neighbors.push(grid[`${r},${c}`]);
      });
      if (neighbors.length > 0) {
        const piece = neighbors[Math.floor(Math.random() * neighbors.length)];
        tryMove(piece);
      }
    }
  }

  // CREAZIONE E SHUFFLE SOLO DOPO TARGET FOUND
  marker.addEventListener('targetFound', () => {
    pieces.length = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        createPiece(r, c);
      }
    }
    shuffle(200);
  });

});
