document.addEventListener("DOMContentLoaded", () => {
  const marker = document.getElementById("marker");
  const container = document.getElementById("piecesContainer");
  const cameraEl = document.querySelector("a-camera");

  const rows = 3;
  const cols = 3;
  const pieceSize = 0.3;
  const pieceGap = 0.01;

  let grid = {};
  let pieces = [];
  let emptyPos = { row: 2, col: 0 }; // buco in basso a sinistra

  function getWorldPos(row, col) {
    return {
      x: (col - (cols-1)/2) * (pieceSize + pieceGap),
      y: ((rows-1)/2 - row) * (pieceSize + pieceGap),
      z: 0
    };
  }

  function createPiece(row, col) {
    if(row === emptyPos.row && col === emptyPos.col) return;
    const piece = document.createElement("a-plane");
    piece.setAttribute("width", pieceSize);
    piece.setAttribute("height", pieceSize);
    piece.setAttribute("src", `images/row-${row+1}-column-${col+1}.png`);
    const pos = getWorldPos(row, col);
    piece.setAttribute("position", pos);
    piece.object3D.userData = { row, col };
    container.appendChild(piece);
    pieces.push(piece);
    grid[`${row},${col}`] = piece;
  }

  function createEmptyHole() {
    const pos = getWorldPos(emptyPos.row, emptyPos.col);
    const hole = document.createElement("a-plane");
    hole.setAttribute("id", "hole");
    hole.setAttribute("width", pieceSize);
    hole.setAttribute("height", pieceSize);
    hole.setAttribute("color", "#ffffff");
    hole.setAttribute("position", pos);
    container.appendChild(hole);
  }

  function tryMove(piece) {
    const { row, col } = piece.object3D.userData;
    const dr = Math.abs(row - emptyPos.row);
    const dc = Math.abs(col - emptyPos.col);
    if((dr+dc) === 1) {
      const targetPos = { row: emptyPos.row, col: emptyPos.col };
      const holeEl = document.getElementById("hole");
      const piecePos = getWorldPos(targetPos.row, targetPos.col);
      const holePos = getWorldPos(row, col);

      piece.setAttribute("animation__move", {
        property: "position",
        to: `${piecePos.x} ${piecePos.y} ${piecePos.z}`,
        dur: 300,
        easing: "easeInOutQuad"
      });
      holeEl.setAttribute("animation__move", {
        property: "position",
        to: `${holePos.x} ${holePos.y} ${holePos.z}`,
        dur: 300,
        easing: "easeInOutQuad"
      });

      grid[`${row},${col}`] = null;
      grid[`${targetPos.row},${targetPos.col}`] = piece;
      piece.object3D.userData = { ...targetPos };
      emptyPos = { row, col };

      checkWin();
    }
  }

  function checkWin() {
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(r===emptyPos.row && c===emptyPos.col) continue;
        const piece = grid[`${r},${c}`];
        if(!piece) return;
        const { row, col } = piece.object3D.userData;
        if(row!==r || col!==c) return;
      }
    }
    console.log("Puzzle completato!");

    // Mostra immagine finale
    const fullImage = document.createElement("a-plane");
    fullImage.setAttribute("src", "images/puzzle.jpg");
    fullImage.setAttribute("width", rows*pieceSize);
    fullImage.setAttribute("height", cols*pieceSize);
    fullImage.setAttribute("position", "0 0 0");
    container.appendChild(fullImage);

    fullImage.setAttribute("animation__float", {
      property: "position",
      dir: "alternate",
      dur: 1000,
      easing: "easeInOutSine",
      loop: true,
      to: `0 0.2 0`
    });

    setTimeout(() => {
      fullImage.removeAttribute("animation__float");
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

        // Aggiungi modello cinema
        const baseHeight = -0.25;
        const cinemaModel = document.createElement('a-entity');
        cinemaModel.setAttribute('gltf-model', '#cinemaModel');
        cinemaModel.setAttribute('position', { x: 0, y: baseHeight, z: 0.5 });
        cinemaModel.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
        container.appendChild(cinemaModel);

        // Testo "1960"
        const text1960 = document.createElement('a-text');
        text1960.setAttribute('value', '1960');
        text1960.setAttribute('align', 'center');
        text1960.setAttribute('anchor', 'center');
        text1960.setAttribute('color', '#000000');
        text1960.setAttribute('font', 'roboto');
        text1960.setAttribute('position', { x: 0, y: baseHeight + 0.5, z: 0.5 });
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

        // Testo "New facade"
        const textFacade = document.createElement('a-text');
        textFacade.setAttribute('value', 'New facade');
        textFacade.setAttribute('align', 'center');
        textFacade.setAttribute('anchor', 'center');
        textFacade.setAttribute('color', '#000000');
        textFacade.setAttribute('font', 'roboto');
        textFacade.setAttribute('position', { x: 0, y: baseHeight + 0.35, z: 0.5 });
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

      }, 1000);
    }, 3000);
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
      // --- Mostra immagine count2 ---
      const countImage = document.createElement("a-image");
      countImage.setAttribute("src", "#count2");
      countImage.setAttribute("position", "0 0 0");
      countImage.setAttribute("scale", "1 1 1");
      countImage.setAttribute("opacity", "0");
      container.appendChild(countImage);

      // fade in
      countImage.setAttribute("animation__fadein", {
        property: "opacity",
        from: 0,
        to: 1,
        dur: 800,
        easing: "easeInOutQuad"
      });

      // fade out dopo 3s
      setTimeout(() => {
        countImage.setAttribute("animation__fadeout", {
          property: "opacity",
          from: 1,
          to: 0,
          dur: 800,
          easing: "easeInOutQuad"
        });
      }, 3000);

      // rimuovi immagine e avvia puzzle
      setTimeout(() => {
        if(countImage.parentNode) countImage.parentNode.removeChild(countImage);
        for(let r=0;r<rows;r++){
          for(let c=0;c<cols;c++){
            createPiece(r,c);
          }
        }
        createEmptyHole();
        shuffle(10);
        console.log("Puzzle avviato dopo l'immagine iniziale.");
      }, 3800);

    } else {
      const holeEl = document.getElementById("hole");
      if(holeEl) holeEl.setAttribute("position", getWorldPos(emptyPos.row, emptyPos.col));
      console.log("Marker riapparso, puzzle conservato.");
    }
  });

});
