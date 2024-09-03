const tela = document.getElementById('gameCanvas');
const contexto = tela.getContext('2d');
const larguraTela = tela.width;
const alturaTela = tela.height;
const numeroDeFaixas = 3;
const larguraFaixa = 40;

const larguraTotalFaixas = larguraFaixa * numeroDeFaixas;
const deslocamentoFaixa = (larguraTela - larguraTotalFaixas) / 2;

const imagemFundo = new Image();
imagemFundo.src = 'images/background.png';
const imagemJogador = new Image();
imagemJogador.src = 'images/player.png';
const imagemObstaculo1 = new Image();
imagemObstaculo1.src = 'images/caminhao.png';
const imagemObstaculo2 = new Image();
imagemObstaculo2.src = 'images/caminhao2.png';

let obstaculosUltrapassados = 0;
let velocidadeObstaculos = 2;
let intervaloAumentoVelocidade = 5;
let velocidadeCenario = 0;
let estadoJogo = 'inicio';
let apelidoJogador = '';
const placares = [];

const musicaFundo = new Audio('musicas/batata.mp3');
musicaFundo.loop = true;
musicaFundo.volume = 0.5;

musicaFundo.play().catch(error => {
    console.error("Erro ao tentar tocar a música de fundo:", error);
});

const teclas = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function desenharTelaInicial() {
    contexto.clearRect(0, 0, larguraTela, alturaTela);


    contexto.fillStyle = 'black';
    contexto.fillRect(0, 0, larguraTela, alturaTela);


    contexto.fillStyle = 'white';
    contexto.font = '18px Arial';
    contexto.textAlign = 'center';
    contexto.fillText('Apelido:', larguraTela / 2, alturaTela / 2 - 50);

    contexto.font = '24px Arial';
    contexto.fillText(apelidoJogador, larguraTela / 2, alturaTela / 2);

    contexto.font = '14px Arial';
    contexto.fillText('Enter para começar', larguraTela / 2, alturaTela / 2 + 40);
}


function desenharPlacar() {
    contexto.fillStyle = 'white';
    contexto.font = '16px Arial';
    contexto.textAlign = 'left';
    contexto.fillText(obstaculosUltrapassados, 10, 20);
}

class Jogador {
    constructor() {
        this.largura = 9;
        this.altura = 14;
        this.faixa = Math.floor(numeroDeFaixas / 2);
        this.x = this.obterPosicaoFaixa();
        this.y = alturaTela - this.altura - 10;
        this.velocidade = 2;
    }

    obterPosicaoFaixa() {
        return deslocamentoFaixa + this.faixa * larguraFaixa + larguraFaixa / 2 - this.largura / 2;
    }

    moverEsquerda() {
        if (this.faixa > 0) {
            this.faixa -= 1;
            this.x = this.obterPosicaoFaixa();
        }
    }

    moverDireita() {
        if (this.faixa < numeroDeFaixas - 1) {
            this.faixa += 1;
            this.x = this.obterPosicaoFaixa();
        }
    }

    moverCima() {
        if (this.y > 0) {
            this.y -= this.velocidade;
        }
    }

    moverBaixo() {
        if (this.y < alturaTela - this.altura) {
            this.y += this.velocidade;
        }
    }

    atualizar() {
        this.x = this.obterPosicaoFaixa();
        if (teclas.ArrowUp) this.moverCima();
        if (teclas.ArrowDown) this.moverBaixo();
    }

    desenhar() {
        contexto.drawImage(imagemJogador, this.x, this.y, this.largura, this.altura);
    }
}

class Obstaculo {
    constructor() {
        this.largura = 13;
        this.altura = 25;
        this.faixa = Math.floor(Math.random() * numeroDeFaixas);
        this.x = this.obterPosicaoFaixa();
        this.y = -this.altura;
        this.dy = velocidadeObstaculos;
        this.imagem = Math.random() < 0.5 ? imagemObstaculo1 : imagemObstaculo2;
    }

    obterPosicaoFaixa() {
        return deslocamentoFaixa + this.faixa * larguraFaixa + larguraFaixa / 2 - this.largura / 2;
    }

    atualizar() {
        this.y += this.dy;
    }

    desenhar() {
        contexto.drawImage(this.imagem, this.x, this.y, this.largura, this.altura);
    }

    foraDaTela() {
        return this.y > alturaTela;
    }
}

const obstaculos = [];
const jogador = new Jogador();

function verificarColisao(jogador, obstaculo) {
    return (
        jogador.x < obstaculo.x + obstaculo.largura &&
        jogador.x + jogador.largura > obstaculo.x &&
        jogador.y < obstaculo.y + obstaculo.altura &&
        jogador.y + jogador.altura > obstaculo.y
    );
}

const alturaFundo = alturaTela;

function desenharFundo() {
    velocidadeCenario += velocidadeObstaculos / 2;
    if (velocidadeCenario >= alturaFundo) {
        velocidadeCenario = 0;
    }

    contexto.drawImage(imagemFundo, 0, velocidadeCenario - alturaFundo, larguraTela, alturaFundo);
    contexto.drawImage(imagemFundo, 0, velocidadeCenario, larguraTela, alturaFundo);
}

function loopJogo() {
    contexto.clearRect(0, 0, larguraTela, alturaTela);
    musicaFundo.play();

    if (estadoJogo === 'inicio') {
        desenharTelaInicial();
    } else if (estadoJogo === 'jogando') {
        desenharFundo();
        jogador.atualizar();
        jogador.desenhar();
        desenharPlacar();

        if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 30) {
            if (Math.random() < 0.03) {
                obstaculos.push(new Obstaculo());
            }
        }

        obstaculos.forEach((obstaculo, indice) => {
            obstaculo.atualizar();
            obstaculo.desenhar();

            if (verificarColisao(jogador, obstaculo)) {
                estadoJogo = 'fimDeJogo';
                alert("Fim de Jogo! Carros Ultrapassados: " + obstaculosUltrapassados);
                placares.push({ apelido: apelidoJogador, pontuacao: obstaculosUltrapassados });
                obstaculosUltrapassados = 0;
                velocidadeObstaculos = 2;
                obstaculos.length = 0;
                apelidoJogador = '';
            }

            if (obstaculo.foraDaTela()) {
                obstaculos.splice(indice, 1);
                obstaculosUltrapassados++;

                if (obstaculosUltrapassados % intervaloAumentoVelocidade === 0) {
                    velocidadeObstaculos += 0.5;
                }
            }
        });
    } else if (estadoJogo === 'fimDeJogo') {
        desenharTelaInicial();
    }

    requestAnimationFrame(loopJogo);
}

document.addEventListener('keydown', (e) => {
    if (estadoJogo === 'inicio') {
        if (e.key === 'Enter' && apelidoJogador.length === 3) {
            estadoJogo = 'jogando';
        } else if (e.key.length === 1 && apelidoJogador.length < 3) {
            apelidoJogador += e.key.toUpperCase();
        } else if (e.key === 'Backspace' && apelidoJogador.length > 0) {
            apelidoJogador = apelidoJogador.slice(0, -1);
        }
    } else if (estadoJogo === 'jogando') {
        if (e.key === 'ArrowLeft') jogador.moverEsquerda();
        if (e.key === 'ArrowRight') jogador.moverDireita();
        if (e.key === 'ArrowUp') teclas.ArrowUp = true;
        if (e.key === 'ArrowDown') teclas.ArrowDown = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') teclas.ArrowUp = false;
    if (e.key === 'ArrowDown') teclas.ArrowDown = false;
});

loopJogo();
