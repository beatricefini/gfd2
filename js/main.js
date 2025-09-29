document.addEventListener("DOMContentLoaded", () => {
  const marker = document.getElementById("marker");
  const container = document.getElementById("piecesContainer");
  const cameraEl = document.querySelector("a-camera");

  const rows = 3;
  const cols = 3;
  const pieceSize = 0.3;
  const pieceGap = 0.01;

  const grid = [];
  const pieces = [];

  // Buco iniziale in basso a sinistra
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
      hole.setAttribute("material", { color: "#555555", opacity: 0.3, transparent: true });
      const pos = getWorldPos(emptyPos.row, emptyPos.col);
      hole.setAttribute("position", pos);
      hole.setAttribute("id", "hole");
      container.appendChild(hole);
    }
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
    const startPos = piece.object3D.position.clone();
    const duration = 250; // ms
    const startTime = performance.now();

    function easeOutQuad(t) { return t*(2-t); }

    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easeOutQuad(t);
      piece.object3D.position.lerpVectors(startPos, targetPos, easedT);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        const holeEl = document.getElementById("hole");
        if (holeEl) holeEl.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));
        console.log(`Pezzo mosso: row=${piece.dataset.row}, col=${piece.dataset.col}`);
        checkSolved();
      }
    }
    animate();
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
      console.log("Puzzle completato! 🎉");

      // Nascondi i pezzi e il buco
      pieces.forEach(p => { if(p.parentNode) p.parentNode.removeChild(p); });
      const holeEl = document.getElementById("hole");
      if (holeEl) holeEl.parentNode.removeChild(holeEl);

      // Mostra la foto completa
      const fullImage = document.createElement("a-plane");
      fullImage.setAttribute("width", pieceSize*cols + pieceGap*(cols-1));
      fullImage.setAttribute("height", pieceSize*rows + pieceGap*(rows-1));
      fullImage.setAttribute("material", { src: "images/puzzle.jpg" });
      fullImage.setAttribute("position", { x: 0, y: 0, z: 0.02 });
      container.appendChild(fullImage);

      // Animazione fluttuante
      fullImage.setAttribute("animation__float", {
        property: "position",
        dir: "alternate",
        dur: 1500,
        easing: "easeInOutSine",
        loop: true,
        to: `0 0.2 0.02`
      });
    }
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

  function shuffle(times = 10) { // meno mosse → super facile
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

  marker.addEventListener('targetFound', () => {
    if (pieces.length === 0) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          createPiece(r, c);
        }
      }
      createEmptyHole();
      shuffle(10);
      console.log("Puzzle inizializzato e mescolato (super facile, buco in basso a sinistra).");
    } else {
      const holeEl = document.getElementById("hole");
      if (holeEl) holeEl.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));
      console.log("Marker riapparso, puzzle conservato.");
    }
  });

});

