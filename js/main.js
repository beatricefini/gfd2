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
  let emptyPos = { row: 2, col: 0 }; // buco in basso a sinistra

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
    plane.setAttribute("material", { src: `images/puzzle/row-${r+1}-column-${c+1}.jpg` });
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
    const startPos = piece.object3D.position.clone();
    const duration = 250;
    const startTime = performance.now();
    function easeOutQuad(t) { return t*(2-t); }
    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easeOutQuad(t);
      piece.object3D.position.lerpVectors(startPos, targetPos, easedT);
      if (t < 1) requestAnimationFrame(animate);
      else {
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
      pieces.forEach(p => { if(p.parentNode) p.parentNode.removeChild(p); });
      const holeEl = document.getElementById("hole");
      if (holeEl) holeEl.parentNode.removeChild(holeEl);

      const fullImage = document.createElement("a-plane");
      fullImage.setAttribute("width", pieceSize*cols + pieceGap*(cols-1));
      fullImage.setAttribute("height", pieceSize*rows + pieceGap*(rows-1));
      fullImage.setAttribute("material", { src: "images/puzzle.jpg", opacity: 1, transparent: true });
      fullImage.setAttribute("position", { x: 0, y: 0, z: 0.02 });
      container.appendChild(fullImage);

      fullImage.setAttribute("animation__float", {
        property: "position",
        dir: "alternate",
        dur: 1500,
        easing: "easeInOutSine",
        loop: true,
        to: `0 0.2 0.02`
      });

      setTimeout(() => {
        fullImage.removeAttribute("animation__float");
        fullImage.setAttribute("rotation", { x:0, y:0, z:0 });
        fullImage.setAttribute("animation__scale", {
          property: "scale",
          to: "0.3 0.3 1",
          dur: 1000,
          easing: "easeInOutQuad"
        });

        setTimeout(() => {
          fullImage.setAttribute("animation__opacity", {
            property: "material.opacity",
            to: 0.5,
            dur: 500,
            easing: "easeInOutQuad"
          });

          // --- Modello Cinema ---
          const baseHeight = -0.25;
          const cinemaModel = document.createElement('a-entity');
          cinemaModel.setAttribute('gltf-model', '#cinemaModel');
          cinemaModel.setAttribute('position', { x: 0, y: -1, z: 0.5 });
          cinemaModel.setAttribute('scale', { x: 2, y: 2, z: 2 });
          container.appendChild(cinemaModel);

          // --- Testo "1960" ---
          const text1960 = document.createElement('a-text');
          text1960.setAttribute('value', '1960');
          text1960.setAttribute('align', 'center');
          text1960.setAttribute('anchor', 'center');
          text1960.setAttribute('color', '#000000');
          text1960.setAttribute('font', 'roboto');
          text1960.setAttribute('position', { x:0, y: baseHeight+0.5, z: 0.5 });
          text1960.setAttribute('scale', '0.35 0.35 0.35');
          text1960.setAttribute('opacity', '0');
          text1960.setAttribute('shader', 'msdf');
          text1960.setAttribute('negate', 'false');
          text1960.setAttribute('animation__fadein', {
            property: 'opacity',
            from: 0,
            to: 1,
            dur: 800,
            easing: 'easeInQuad',
            delay: 200
          });
          container.appendChild(text1960);

          // --- Testo "New facade" ---
          const textFacade = document.createElement('a-text');
          textFacade.setAttribute('value', 'New facade');
          textFacade.setAttribute('align', 'center');
          textFacade.setAttribute('anchor', 'center');
          textFacade.setAttribute('color', '#000000');
          textFacade.setAttribute('font', 'roboto');
          textFacade.setAttribute('position', { x:0, y: baseHeight+0.35, z: 0.5 });
          textFacade.setAttribute('scale', '0.25 0.25 0.25');
          textFacade.setAttribute('opacity', '0');
          textFacade.setAttribute('shader', 'msdf');
          textFacade.setAttribute('negate', 'false');
          textFacade.setAttribute('animation__fadein', {
            property: 'opacity',
            from: 0,
            to: 1,
            dur: 800,
            easing: 'easeInQuad',
            delay: 1200
          });
          container.appendChild(textFacade);

          console.log("Modello cinema e testi visualizzati davanti alla foto semi-trasparente.");
        }, 1000);
      }, 3000);
    }
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function updateMouse(event) {
    if(event.touches){
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
    if(intersects.length>0){
      tryMove(intersects[0].object.el);
    }
  }

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('touchstart', onPointerDown, { passive:false });

  function shuffle(times=10) {
    for (let i=0;i<times;i++){
      const neighbors = [];
      const { row, col } = emptyPos;
      [[row-1,col],[row+1,col],[row,col-1],[row,col+1]].forEach(([r,c])=>{
        if(grid[`${r},${c}`]) neighbors.push(grid[`${r},${c}`]);
      });
      if(neighbors.length>0){
        const piece = neighbors[Math.floor(Math.random()*neighbors.length)];
        tryMove(piece);
      }
    }
  }

  marker.addEventListener('targetFound', () => {
    if(pieces.length===0){
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          createPiece(r,c);
        }
      }
      createEmptyHole();
      shuffle(10);
      console.log("Puzzle inizializzato e mescolato (super facile, buco in basso a sinistra).");
    } else {
      const holeEl = document.getElementById("hole");
      if(holeEl) holeEl.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));
      console.log("Marker riapparso, puzzle conservato.");
    }
  });

});

