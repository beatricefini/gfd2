document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 main.js avviato");

  const container = document.getElementById('modelsContainer');
  const marker = document.getElementById("marker");
  const sceneEl = document.querySelector("a-scene");

  if (!container) {
    console.error("❌ modelsContainer non trovato!");
    return;
  }

  // --- Sequenza modelli AR ---
  function initModelsSequence() {
    const models = [
      '#piece1','#piece2','#piece3','#piece4','#piece5','#piece6','#piece7'
    ];
    let currentIndex = 0;

    const baseHeight = -0.5;
    const baseScale = 0.7;
    const scaleOffset = 0.1;
    const popupDuration = 800;
    const stabilizeDuration = 600;
    const reversePopDuration = 400;

    // Video HTML per piece7
    const video7 = document.createElement('video');
    video7.id = "video7";
    video7.src = "video/piece7.mp4";
    video7.loop = true;
    video7.autoplay = false;
    video7.playsInline = true;
    video7.webkitPlaysInline = true;
    document.body.appendChild(video7);

    // Testo iniziale "Tap the screen..."
    const startText = document.createElement('a-text');
    startText.setAttribute('value', 'Tap the screen\nto create your\nown little cinema');
    startText.setAttribute('align', 'center');
    startText.setAttribute('color', '#000000');
    startText.setAttribute('font', 'roboto');
    startText.setAttribute('position', { x:0, y:baseHeight+0.8, z:0 });
    startText.setAttribute('scale', { x:1, y:1, z:1 });
    startText.setAttribute('width','2');
    container.appendChild(startText);

    let firstClick = true;

    window.addEventListener('click', () => {
      if(firstClick){
        startText.setAttribute('visible','false');
        firstClick=false;
        return;
      }
      if(currentIndex >= models.length) return;

      const piece = document.createElement('a-entity');
      piece.setAttribute('gltf-model', models[currentIndex]);

      // Scala casuale
      const finalScale = baseScale + (Math.random()-0.5)*scaleOffset;
      piece.setAttribute('scale', { x: finalScale, y: finalScale, z: finalScale });

      // Posizione pavimento + offset casuale
      const offsetX = (Math.random()-0.5)*0.2;
      const offsetZ = (Math.random()-0.5)*0.2;
      piece.setAttribute('position', { x: offsetX, y: baseHeight, z: offsetZ });

      // Rotazione iniziale instabile
      const rotX = (Math.random()-0.5)*20;
      const rotY = (Math.random()-0.5)*20;
      piece.setAttribute('rotation', { x: rotX, y: rotY, z: 0 });

      // Animazioni pop-up e stabilizzazione
      piece.setAttribute('animation__popup', {
        property: 'position',
        from: `0 ${baseHeight-1} 0`,
        to: `0 ${baseHeight} 0`,
        dur: popupDuration,
        easing: 'easeOutElastic'
      });
      piece.setAttribute('animation__stabilize', {
        property: 'rotation',
        to: '0 0 0',
        dur: stabilizeDuration,
        easing: 'easeOutQuad',
        delay: 300
      });

      // Gestione video piece7
      if(currentIndex === models.length-1){
        piece.id = "piece7";
        piece.addEventListener('model-loaded', () => {
          setTimeout(() => {
            const mesh = piece.getObject3D('mesh');
            if(mesh){
              mesh.traverse(node => {
                if(node.isMesh){
                  const videoTexture = new THREE.VideoTexture(video7);
                  videoTexture.flipY = false;
                  videoTexture.center.set(0.5,0.5);
                  videoTexture.repeat.x = -1;
                  node.material.map = videoTexture;
                  node.material.needsUpdate = true;
                }
              });
            }
            video7.play().catch(e => console.error("❌ Impossibile avviare video piece7:", e));
            setTimeout(removeAllPiecesAndShowFinal, 4000);
          }, 3000);
        });
      }

      container.appendChild(piece);
      currentIndex++;
    });

    // Rimuove tutti i pezzi e mostra modello finale
    function removeAllPiecesAndShowFinal(){
      const pieces = Array.from(container.querySelectorAll('a-entity[gltf-model]'));
      pieces.forEach((piece,i) => {
        piece.setAttribute('animation__shrink',{
          property:'scale',
          to:'0 0 0',
          dur: reversePopDuration,
          easing:'easeInBack',
          delay: i*150
        });
        setTimeout(()=>piece.remove(), reversePopDuration + i*150 + 50);
      });
      const totalDelay = pieces.length*150 + reversePopDuration + 200;
      setTimeout(createFinalModel, totalDelay);
    }

    // Modello finale con testi
    function createFinalModel(){
      const finalModel = document.createElement('a-entity');
      finalModel.setAttribute('gltf-model','#pieceCinema');
      finalModel.setAttribute('scale','0 0 0');
      finalModel.setAttribute('position',{x:0.25,y:baseHeight,z:0});
      finalModel.setAttribute('animation__pop',{
        property:'scale',
        from:'0 0 0',
        to:'2 2 2',
        dur:1200,
        easing:'easeOutElastic'
      });
      container.appendChild(finalModel);

      // Testi finali
      const text1994 = document.createElement('a-text');
      text1994.setAttribute('value','1994');
      text1994.setAttribute('align','center');
      text1994.setAttribute('anchor','center');
      text1994.setAttribute('color','#000000');
      text1994.setAttribute('font','roboto');
      text1994.setAttribute('position',{x:0,y:baseHeight+0.7,z:0});
      text1994.setAttribute('scale','0.7 0.7 0.7');
      text1994.setAttribute('opacity','0');
      text1994.setAttribute('shader','msdf');
      text1994.setAttribute('negate','false');
      text1994.setAttribute('animation__fadein',{
        property:'opacity',
        from:0,
        to:1,
        dur:800,
        easing:'easeInQuad',
        delay:200
      });
      container.appendChild(text1994);

      const textRenovation = document.createElement('a-text');
      textRenovation.setAttribute('value','Renovation');
      textRenovation.setAttribute('align','center');
      textRenovation.setAttribute('anchor','center');
      textRenovation.setAttribute('color','#000000');
      textRenovation.setAttribute('font','roboto');
      textRenovation.setAttribute('position',{x:0,y:baseHeight+0.55,z:0});
      textRenovation.setAttribute('scale','0.4 0.4 0.4');
      textRenovation.setAttribute('opacity','0');
      textRenovation.setAttribute('shader','msdf');
      textRenovation.setAttribute('negate','false');
      textRenovation.setAttribute('animation__fadein',{
        property:'opacity',
        from:0,
        to:1,
        dur:800,
        easing:'easeInQuad',
        delay:1200
      });
      container.appendChild(textRenovation);

      // Overlay finale outro4.png
      setTimeout(() => {
        const outroOverlay = document.createElement('div');
        outroOverlay.id = "outroOverlay";
        outroOverlay.className = "overlay";
        const img = document.createElement('img');
        img.src = "images/outro4.png";
        outroOverlay.appendChild(img);
        document.body.appendChild(outroOverlay);
        setTimeout(()=>outroOverlay.classList.add("show"), 100);
      }, 10000);
    }
  }

  // Inizializza sequenza modelli quando il marker viene trovato
  marker.addEventListener('targetFound', () => {
    initModelsSequence();
  });
});
