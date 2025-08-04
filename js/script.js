/*
 * Joshua Pendlebury
 * Assignment 3 - COMP1073
 * 2025-08-04
 */

const apiURL = 'https://wordsapiv1.p.rapidapi.com/words/';
const apiKey = '6318468d40msh3a14004dcdaa38ap181f97jsnd10037ee9706';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': apiKey,
		'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
	}
};

const correctLetters = document.getElementById("playerGuess");
const keyboard = document.getElementById("keyboard");
const lifeDisplay = document.getElementById("lives");
const definition = document.getElementById("definition");
const victory = document.getElementById("victory");

const newGameBtn = document.getElementById("newGame");
const definitionBtn = document.getElementById("displayDef");

const guessChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let answerWord;
let answerDef = "";

let guessString = "";
let playerLives = 6;

let gameRunning = true;

async function requestRandomWord(){
    let cURL = `${apiURL}?random=true`;

    let outputJSON;
    await fetch(cURL, options)
        .then(response => {
            return response.json();
        })
        .then(json => {
            setGameVars(json);
        });
}

function setGameVars(json){
    console.log(json)
    answerWord = json.word.toUpperCase();
    if("results" in json){
        answerDef = json.results[0].definition;
    }
    
}

/**
 * Generates all the buttons for the keyboard
 * @returns - list of all key elements
 */
function assembleKeys(){
    for (let char of guessChars){
        let key = document.createElement("button");
        key.value = char;
        key.textContent = char;
        key.classList.add("key");
        keyboard.appendChild(key);
    }
    return document.querySelectorAll(".key");
}

/**
 * Reveals a character from the hidden word
 * @param {string} guessedChar A single character
 */
function revealChar(guessedChar){
    for(let i=0; i<answerWord.length; i++){
        if(guessedChar === answerWord[i].toUpperCase()){
            guessString = replaceAt(guessString, i, guessedChar);
        }
    }
    console.log(guessString);
    correctLetters.textContent = guessString;
}

/**
 * Displays the answer word's definition
 */
function displayDefinition(){
    definition.textContent = answerDef;
}

/**
 * Replaces a character at an index of a string
 * @param {string} str The string you want to replace a character in
 * @param {int} index The index of the character you want to replace
 * @param {string} char The character you want to replace it with
 * @returns {string} Modified string
 */
function replaceAt(str, index, char){
    let outStr = "";
    for(let i=0; i<str.length; i++){
        if(i === index){
            outStr += char;
        }
        else{
            outStr += str[i];
        }
    }
    return outStr;
}

async function newGame(){
    await requestRandomWord();
    
    console.log(answerWord);
    console.log(answerDef);

    playerLives = 6;
    guessString = "";
    gameRunning = true;
    
    for(let char of answerWord){
        if(guessChars.includes(char.toUpperCase())){
            guessString += "_";
        }
        else{
            guessString += char;
        }
    }
    correctLetters.textContent = guessString
    lifeDisplay.textContent = playerLives;
    definition.textContent = "";
    victory.textContent = "";

    allKeys.forEach(function(key) {
        key.classList.remove("correct");
        key.classList.remove("incorrect");
    });
}

/**
 * Code ran when all the players lives have been used
 */
function gameOver(){
    displayDefinition();
    victory.textContent = `You Lose! The word was ${answerWord}.` ;
    gameRunning = false;
}

/**
 * Code ran when the complete word has been guessed
 */
function gameWon(){
    //Disabling all keys
    allKeys.forEach(function(key) {
        key.addEventListener("click", (e) => e.preventDefault());
    });
    displayDefinition();
    victory.textContent = "You Win!";
    gameRunning = false;
}


const allKeys = assembleKeys();
newGame();

//Adding event listeners to all player guess keys
allKeys.forEach(function(key) {
    key.addEventListener("click", function eventHandler(e) {
        e.preventDefault();

        if(gameRunning){
            let guess = key.value;
            console.log(guess);

            if (answerWord.toUpperCase().includes(guess)){
                key.classList.add("correct");
                console.log("correct");
                revealChar(guess);
            }
            else{
                key.classList.add("incorrect");
                console.log("incorrect");
                playerLives --;
                lifeDisplay.textContent = playerLives;
            }

            key.removeEventListener("click", eventHandler);
            key.addEventListener("click", (e) => e.preventDefault());
            if(playerLives <= 0){
                console.log("Defeat");
                gameOver();
            }
            else if(guessString === answerWord){
                console.log("victory")
                gameWon();
            }
        }
        
    });
});

definitionBtn.addEventListener("click", (e) => {
    e.preventDefault();
    displayDefinition();
});