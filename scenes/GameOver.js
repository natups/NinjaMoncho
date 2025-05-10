export default class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "GameOver" });
  }

  init(data) {
    this.ganaste = data.ganaste;
    this.puntos = data.puntos;
  }

  preload() {
    this.load.image("cielo", "./public/assets/Cielo.webp");
  }

  create() {
    // Fondo
    this.add.image(400, 300, "cielo").setScale(2);

    // Mensaje (Victoria o Derrota)
    const mensaje = this.ganaste ? "¡GANASTE!" : "¡PERDISTE!";
    const color = this.ganaste ? "#0f0" : "#f00"; // Color verde si ganó, rojo si perdió

    // Mostrar el mensaje
    this.add.text(300, 200, mensaje, {
      fontSize: "48px",
      fill: color,
    });

    // puntuación final
    this.add.text(280, 270, "Puntuación final: " + this.puntos, {
      fontSize: "32px",
      fill: "#fff",
    });

    // reiniciar el juego
    this.add.text(220, 350, "Presiona ESPACIO para volver a jugar", {
      fontSize: "24px",
      fill: "#fff",
    });

    // presionar la tecla ESPACIO para reiniciar
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("Game"); // Reinicia la escena "Game" (puedes cambiar el nombre si es otro)
    });
  }
}
