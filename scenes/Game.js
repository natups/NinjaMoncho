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
    this.load.image("cielo", "./assets/Cielo.webp");
    this.load.image("diamante", "./assets/diamond.png");
    this.load.image("ninja", "./assets/Ninja.png");
    this.load.image("plataforma", "./assets/platform.png");
    this.load.image("cuadrado", "./assets/square.png");
    this.load.image("triangulo", "./assets/triangle.png");
    this.load.image("hexagono", "./assets/hexagono.png");
  }


  create() {
    // reescalo y centro el cielo 
    this.add.image(400, 300, "cielo").setScale(2);

    // plataformas
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "plataforma").setScale(2).refreshBody();  // plataforma del suelo
    this.platforms.create(400, 250, "plataforma").setScale(0.6).refreshBody(); // plataforma flotante central
    this.platforms.create(100, 400, "plataforma"); // plataforma lateral izquierda
    this.platforms.create(700, 450, "plataforma"); // plataforma lateral derecha

    // jugador
    this.player = this.physics.add.sprite(400, 300, "ninja"); // sprite del jugador
    this.player.setScale(0.1); // lo achico
    this.player.setBounce(0.2); // rebote 
    this.player.setCollideWorldBounds(true); // no puede salirse de los bordes del mundo

    // colisión entre jugador y plataformas
    this.physics.add.collider(this.player, this.platforms);

    // entradas del teclado (flechas)
    this.cursors = this.input.keyboard.createCursorKeys();

    // inicialización de puntuación
    this.figRecolectadas = []; // Array donde se guardan las figuras recolectadas
    this.puntos = 0;
    this.puntosTexto = this.add.text(16, 16, "Puntos: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // temporizador
    this.timeLeft = 30;
    this.timerText = this.add.text(650, 16, "Tiempo: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // evento que genera figuras con física cada 0.5 segundos
    this.time.addEvent({
      delay: 500,
      callback: () => {
        // tipos de figuras 
        const tipos = ["cuadrado", "triangulo", "diamante", "hexagono"];
        const tipo = Phaser.Utils.Array.GetRandom(tipos); // selección aleatoria
        const x = Phaser.Math.Between(50, 750); // posición X aleatoria

        // creo figura con físicas
        const figura = this.physics.add.image(x, 0, tipo).setScale(0.5);
        figura.tipo = tipo; // guarda el TIPO para referencia

        // le doy un valor de "vida" a acada figura
        if (tipo === "cuadrado") {
          figura.puntosRestantes = 10;
        } else if (tipo === "triangulo") {
          figura.puntosRestantes = 15;
        } else if (tipo === "diamante") {
          figura.puntosRestantes = 25;
        } else if (tipo === "hexagono") {
          figura.puntosRestantes = 10; // se eliminan si los rebotes hacen llegar su valor a 0
        }

        // físicas de la figura
        figura.setVelocityY(Phaser.Math.Between(80, 150)); // velocidad vertical aleatoria
        figura.setBounce(0.5); // rebote
        figura.setCollideWorldBounds(true); 

        // colisión con plataformas --> pierde puntosRestantes con cada rebote
          this.physics.add.collider(figura, this.platforms, () => {
            figura.puntosRestantes -= 5; // Resta vida por cada rebote

            if (figura.puntosRestantes <= 0) {
              figura.destroy(); // desaparece si se agota su "vida"
            }
          });

        // recolectar figura
        this.physics.add.overlap(this.player, figura, () => { // detecta si dos objetos se tocan
          figura.destroy(); // se elimina al ser recolectada
          this.figRecolectadas.push(tipo); // guarda el tipo en el array

          // asigno puntos según el tipo
          let puntosGanados = 0;
          if (tipo === "cuadrado") {
            puntosGanados = 10;
          } else if (tipo === "triangulo") {
            puntosGanados = 15;
          } else if (tipo === "diamante") {
            puntosGanados = 25;
          } else if (tipo === "hexagono") {
            puntosGanados = -10; // descuento por recolectar hexágonos
          }

          // actualizo los puntos
          this.puntos += puntosGanados;
          this.puntosTexto.setText("Puntos: " + this.puntos);

          // verifico la condición de victoria o derrota  --> va a GameOver
          if (this.puntos >= 100) {
            this.scene.start("GameOver", { ganaste: true, puntos: this.puntos });
          }
        });
      },
      loop: true,
    });

    // temporizador descendente: se ejecuta cada segundo
    this.time.addEvent({
      delay: 1000, // cada 1 segundo
      callback: () => {
        this.timeLeft--; // resta 1 segundo
        this.timerText.setText("Tiempo: " + this.timeLeft); // actualiza texto

        // ai se acaba el tiempo, el jugador pierde --> va a GameOver
        if (this.timeLeft <= 0) {
          this.scene.start("GameOver", { ganaste: false, puntos: this.puntos });
        }
      },
      loop: true,
    });
  }


  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300); // mover a la izquierda
      this.player.angle -= 5; // girar en sentido antihorario
    }

    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300); // mover a la derecha
      this.player.angle += 5; // girar en sentido horario
    }
    
    else { // si no se presiona izquierda ni derecha
      this.player.setVelocityX(0); // detener movimiento horizontal
    
      // si el personaje está tocando el suelo, reiniciar el ángulo (dejarlo derecho)
      if (this.player.body.touching.down) {
          this.player.angle = 0;
      }
    }
  
    // salto: si se presiona la flecha arriba y el jugador está en el suelo
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330); // saltar hacia arriba
    }
  }
}
