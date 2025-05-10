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
    this.load.image("hexagono", "./public/assets/hexagono.png");
  }


  create() {
    // Fondo de cielo reescalado y centrado
    this.add.image(400, 300, "cielo").setScale(2);

    // Grupo de plataformas estáticas y posicionamiento
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "plataforma").setScale(2).refreshBody();  // Plataforma del suelo
    this.platforms.create(400, 250, "plataforma").setScale(0.6).refreshBody(); // Plataforma flotante central
    this.platforms.create(100, 400, "plataforma"); // Plataforma lateral izquierda
    this.platforms.create(700, 450, "plataforma"); // Plataforma lateral derecha

    // Configuración del jugador
    this.player = this.physics.add.sprite(400, 300, "ninja"); // Añade sprite del jugador
    this.player.setScale(0.1); // Escala del jugador
    this.player.setBounce(0.2); // Rebote al caer
    this.player.setCollideWorldBounds(true); // No puede salirse de los bordes del mundo

    // Colisión entre jugador y plataformas
    this.physics.add.collider(this.player, this.platforms);

    // Captura de entradas del teclado (flechas)
    this.cursors = this.input.keyboard.createCursorKeys();

    // Inicialización de puntuación
    this.figRecolectadas = []; // Array donde se guardan las figuras recolectadas
    this.puntos = 0;
    this.puntosTexto = this.add.text(16, 16, "Puntos: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // Inicialización del temporizador de juego
    this.timeLeft = 30;
    this.timerText = this.add.text(650, 16, "Tiempo: 0", {
      fontSize: "20px",
      fill: "#fff",
    });

    // Evento que genera figuras con física cada 0.5 segundos
    this.time.addEvent({
      delay: 500,
      callback: () => {
        // Tipos de figuras disponibles
        const tipos = ["cuadrado", "triangulo", "diamante", "hexagono"];
        const tipo = Phaser.Utils.Array.GetRandom(tipos); // Selección aleatoria
        const x = Phaser.Math.Between(50, 750); // Posición X aleatoria

        // Creación de figura con física
        const figura = this.physics.add.image(x, 0, tipo).setScale(0.5);
        figura.tipo = tipo; // Guarda el tipo para referencia

        // Asignación de "vida" (puntosRestantes) según tipo
        if (tipo === "cuadrado") {
          figura.puntosRestantes = 10;
        } else if (tipo === "triangulo") {
          figura.puntosRestantes = 15;
        } else if (tipo === "diamante") {
          figura.puntosRestantes = 25;
        } else if (tipo === "hexagono") {
          figura.puntosRestantes = 10; // Se eliminará luego de suficientes rebotes
        }

        // Físicas de la figura
        figura.setVelocityY(Phaser.Math.Between(80, 150)); // Velocidad vertical aleatoria
        figura.setBounce(0.5); // Rebote
        figura.setCollideWorldBounds(true); // Rebota contra los bordes

        // Colisión con plataformas: pierde puntosRestantes con cada rebote
        if (figura.puntosRestantes !== undefined) {
          this.physics.add.collider(figura, this.platforms, () => {
            figura.puntosRestantes -= 5; // Resta vida por cada rebote
            figura.setTint(0xffaaaa); // Feedback visual

            if (figura.puntosRestantes <= 0) {
              figura.destroy(); // Desaparece si se agota su "vida"
            }
          });
        }

        // Superposición con el jugador: recolecta figura
        this.physics.add.overlap(this.player, figura, () => {
          figura.destroy(); // Se elimina al ser recolectada
          this.figRecolectadas.push(tipo); // Guarda el tipo en el array

          // Asignación de puntos según el tipo
          let puntosGanados = 0;
          if (tipo === "cuadrado") {
            puntosGanados = 10;
          } else if (tipo === "triangulo") {
            puntosGanados = 15;
          } else if (tipo === "diamante") {
            puntosGanados = 25;
          } else if (tipo === "hexagono") {
            puntosGanados = -10; // Penalización por recolectar hexágonos
          }

          // Actualiza los puntos
          this.puntos += puntosGanados;
          this.puntosTexto.setText("Puntos: " + this.puntos);

          // Verifica condición de victoria
          if (this.puntos >= 100) {
            this.add.text(300, 300, "¡GANASTE!", {
              fontSize: "40px",
              fill: "#0f0",
            });
            this.scene.pause(); // Detiene el juego
          }
        });
      },
      loop: true,
    });

    // Temporizador descendente: se ejecuta cada segundo
    this.time.addEvent({
      delay: 1000, // Cada 1 segundo
      callback: () => {
        this.timeLeft--; // Resta 1 segundo
        this.timerText.setText("Tiempo: " + this.timeLeft); // Actualiza texto

        // Si se acaba el tiempo, el jugador pierde
        if (this.timeLeft <= 0) {
          this.player.setTint(0xff0000); // Cambio de color al jugador
          this.add.text(300, 300, "¡PERDISTE!", {
            fontSize: "40px",
            fill: "#f00",
          });
          this.scene.pause(); // Detiene el juego
        }
      },
      loop: true,
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
