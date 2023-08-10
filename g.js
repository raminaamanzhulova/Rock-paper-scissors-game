const crypto = require('crypto');

class MoveGenerator {
    constructor(moves) {
        this.moves = moves;
    }

    generateMove() {
        const randomIndex = Math.floor(Math.random() * this.moves.length);
        return this.moves[randomIndex];
    }
}

class Game {
    constructor(moves) {
        this.moveGenerator = new MoveGenerator(moves);
        this.key = crypto.randomBytes(32);
    }
}

class Rules {
    constructor(moves) {
        this.moves = moves;
    }

    determineWinner(playerMove, compMove) {
        const playerIndex = this.moves.indexOf(playerMove);
        const compIndex = this.moves.indexOf(compMove);
        const half = Math.floor(this.moves.length / 2);

        if ((compIndex + half) % this.moves.length === playerIndex) {
            return 'You win!';
        } else if ((playerIndex + half) % this.moves.length === compIndex) {
            return 'Computer wins!';
        } else {
            return 'Draw!';
        }
    }
}

class HMACCalc {
    constructor(key) {
        this.key = key;
    }

    calcHMAC(message) {
        const hmac = crypto.createHmac('sha3-256', this.key);
        hmac.update(message);
        return hmac.digest('hex');
    }
}

class GameTable {
    constructor(moves) {
        this.moves = moves;
    }

    generateTable() {
        const table = [['Moves']];
        for (const move of this.moves) {
            table[0].push(move);
        }

        for (let i = 0; i < this.moves.length; i++) {
            const row = [this.moves[i]];
            for (let j = 0; j < this.moves.length; j++) {
                if (i === j) {
                    row.push('Draw');
                } else if ((j + 1) % this.moves.length === i) {
                    row.push('Win');
                } else {
                    row.push('Lose');
                }
            }
            table.push(row);
        }
        return table;
    }
}

const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size !== moves.length) {
    console.error('Incorrect arguments. Please provide an odd number of non-repeating moves.');
    console.error('Example: node game.js rock paper scissors');
    process.exit(1);
}

const game = new Game(moves);
const rules = new Rules(moves);
const hmacCalc = new HMACCalc(game.key);
const table = new GameTable(moves);

console.log(`HMAC: ${hmacCalc.calcHMAC(game.moveGenerator.generateMove())}`);
console.log('Available moves:');
moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
console.log('0 - exit');
console.log('? - help');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter your move: ', (choice) => {
    if (choice === '?') {
        const formattedTable = table.generateTable().map(row => row.join('\t')).join('\n');
        console.log(formattedTable);
        process.exit(0);
    } else if (choice === '0') {
        readline.close();
    } else if (!isNaN(choice) && parseInt(choice) >= 1 && parseInt(choice) <= moves.length) {
        const playerMove = moves[parseInt(choice) - 1];
        const computerMove = game.moveGenerator.generateMove();
        console.log(`Your move: ${playerMove}`);
        console.log(`Computer move: ${computerMove}`);
        console.log(rules.determineWinner(playerMove, computerMove));
        console.log(`HMAC key: ${game.key.toString('hex')}`);
        readline.close();
    } else {
        console.error('Invalid input. Please enter a valid move number or "0" to exit.');
        readline.close();
    }
});
