// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("Game");
  }

  init() {
    // this is called before the scene is created
    // init variables
    // take data passed from other scenes
    // data object param {}
  }

  preload() { // cargo los assets
    this.load.image("cielo", "./public/assets/Cielo.webp");
    this.load.image("diamante", "./public/assets/diamond.png");
    this.load.image("ninja", "./public/assets/Ninja.png");
    this.load.image("plataforma", "./public/assets/platform.png");
    this.load.image("cuadrado", "./public/assets/Square.png");
    this.load.image("triangulo", "./public/assets/Triangle.png");
  }

  create() {
    // cielo reescalado
    this.add.image(400, 300, "cielo").setScale(2);

    // plataforma reescalada
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "plataforma").setScale(2).refreshBody();
    this.platforms.create(400, 250, "plataforma").setScale(0.6).refreshBody();
    this.platforms.create(100, 400, "plataforma");
    this.platforms.create(700, 450, "plataforma");


    // caracteristicas del jugador
    this.player = this.physics.add.sprite(400, 300, "ninja");
    this.player.setScale(0.1); // hago mas chico al personaje
    this.player.setBounce(0.2); // genero un rebote
    this.player.setCollideWorldBounds(true); // impido que el jugador salga de los limites de la pantalla del juego
    this.physics.add.collider(this.player, this.platforms); // hace que el jugador colisione con las plataformas

    this.cursors = this.input.keyboard.createCursorKeys(); // agrego las teclas de flechas para usarlas en update

    // uso un array vacío para guardar las figuras recolectadas
    this.figRecolectadas = [];

    // agrego los puntos del jugador
    this.puntos = 0;
    this.puntosTexto = this.add.text(16, 16, "Puntos: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // agrego el tiempo del jugador
    this.timeLeft = 30;
    this.timerText = this.add.text(650, 16, "Tiempo: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // creo un evento que se repite cada 0.5 segundos
    this.time.addEvent({
      delay: 500, // 0.5 segundos
      callback: () => { // el callback, es una función que se ejecuta después del tiempo de espera
        const tipos = ["cuadrado", "triangulo", "diamante"]; // lista de posibles tipos de figuras que pueden aparecer
        const tipo = Phaser.Utils.Array.GetRandom(tipos); // selecciona aleatoriamente un tipo de figura de la lista
        const x = Phaser.Math.Between(50, 750); // elige una posición horizontal aleatoria entre 50 y 750 píxeles
        const figura = this.physics.add.image(x, 0, tipo).setScale(0.5); // crea la figura en la posición x, empezando desde arriba (y = 0)
        figura.tipo = tipo; // guarda el tipo de figura como una propiedad del objeto

        // asigno puntos iniciales según el tipo
        if (tipo === "cuadrado") {
          figura.puntosRestantes = 10;
        } else if (tipo === "triangulo") {
          figura.puntosRestantes = 15;
        } else if (tipo === "diamante") {
          figura.puntosRestantes = 25;
        }

        figura.setVelocityY(Phaser.Math.Between(80, 150)); // hace que la figura caiga con una velocidad vertical aleatoria
        figura.setBounce(0.5); // hace que la figura rebote
        figura.setCollideWorldBounds(true); // hace que la figura no se salga de los límites

        // 👇 Rebote: pierde 5 puntos cada vez que toca la plataforma
        this.physics.add.collider(figura, this.platforms, () => {
          figura.puntosRestantes -= 5;
          figura.setTint(0xffaaaa); // efecto visual (opcional)
            if (figura.puntosRestantes <= 0) {
              figura.destroy();
            }
        });

        // detecta colisión entre el jugador y la figura
        this.physics.add.overlap(this.player, figura, () => {
          figura.destroy(); // cuando colisionan, se destruye la figura (como si el jugador la recolectara)
          this.figRecolectadas.push(tipo); // Guardo el tipo de figura recolectada en el array

          // Determinar cuántos puntos se obtienen según el tipo
          let puntosGanados = 0;
          if (tipo === "cuadrado") {
            puntosGanados = 10;
          } else if (tipo === "triangulo") {
            puntosGanados = 15;
          } else if (tipo === "diamante") {
            puntosGanados = 25;
          }

          // suma los puntos y actualiza el texto en pantalla
          this.puntos += puntosGanados;
          this.puntosTexto.setText("Puntos: " + this.puntos);

          // Si hay al menos 2 de cada tipo, muestra mensaje de victoria y pausa la escena
          if (this.puntos >= 100) {
            this.add.text(300, 300, "¡GANASTE!", {
              fontSize: "40px",
              fill: "#0f0"
            });
            this.scene.pause(); // detiene la escena (termina el juego)
          }
        });
      },
      loop: true, // hace que este evento se repita continuamente
    });

    // Temporizador descendente (MEJORA 1)
    this.time.addEvent({
      delay: 1000, // establece un retraso de 1000 milisegundos (1 segundo) entre cada evento
      callback: () => { // función que se ejecuta en cada evento
        this.timeLeft--; // disminuye el valor del timepo en 1 segundo
        this.timerText.setText("Tiempo: " + this.timeLeft); // actualiza el texto en pantalla para mostrar el tiempo restante

        // verifico si el tiempo llego a 0
        if (this.timeLeft <= 0) {
          this.player.setTint(0xff0000); // pinto al persoanje de rojo al perder
          this.add.text(300, 300, "¡PERDISTE!", { // muestro el mensaje en el centro de la pantalla
            fontSize: "40px",
            fill: "#f00"
          });
          this.scene.pause(); // pauso la escena, terminando el juego
        }
      },
      loop: true, // se repite indefinidamente cada segundo
    });
  }

  update() {
    // Movimiento hacia la izquierda
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300); // mover a la izquierda
      this.player.angle -= 5; // girar en sentido antihorario
    }

    // Movimiento hacia la derecha
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300); // mover a la derecha
      this.player.angle += 5; // girar en sentido horario
    }
    
    else { // Si no se presiona izquierda ni derecha
      this.player.setVelocityX(0); // detener movimiento horizontal
    
      // Si el personaje está tocando el suelo, reiniciar el ángulo (dejarlo derecho)
      if (this.player.body.touching.down) {
          this.player.angle = 0;
      }
    }
  
    // Salto: si se presiona la flecha arriba y el jugador está en el suelo
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330); // saltar hacia arriba
    }
  }
}
