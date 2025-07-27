const rowBeginningIndexes = [0,3,6];
const rowEndingIndexes = [2,5,8];
const boardSize = 9;
const boardSquareRoot = Math.sqrt(boardSize);
let currentCellId;
let currentBoxIndex;
let currentCellIndex;
let currentPreventingCellId;
let currentAnswerButtonValue;
let totalSeconds = 0;
let timerInterval;
const context = {
    possibleAnswers: ['1','2','3','4','5','6','7','8','9'],
    answerButtons: [
        {answer: '1', count: 3},
        {answer: '2', count: 5},
        {answer: '3', count: 4},
        {answer: '4', count: 4},
        {answer: '5', count: 4},
        {answer: '6', count: 1},
        {answer: '7', count: 1},
        {answer: '8', count: 3},
        {answer: '9', count: 4}
    ],
    writeInState: false,
    // Hard
    // board: [
    //     [{ answer: ''},{answer: '6'},{answer: '9'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: '8'},{answer: ''},{answer: '2'},{answer: ''},{answer: ''},{answer: '3'},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: '3'},{answer: ''},{answer: '5'},{answer: ''},{answer: '9'},{answer: ''},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: '8'},{answer: '3'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '1'}],
    //     [{ answer: ''},{answer: ''},{answer: ''},{answer: '6'},{answer: ''},{answer: '9'},{answer: ''},{answer: ''},{answer: ''}],
    //     [{ answer: '6'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '2'},{answer: '9'},{answer: ''},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: ''},{answer: '7'},{answer: ''},{answer: '3'},{answer: ''},{answer: '5'},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: '7'},{answer: ''},{answer: ''},{answer: '8'},{answer: ''},{answer: '1'},{answer: ''}],
    //     [{ answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: '3'},{answer: '7'},{answer: ''}],
    // ],
    // Easy
    board: [
        [{ answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '9'},{answer: '2'},{answer: '8'},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '4'},{answer: '6'},{answer: ''},{answer: '1'}],
        [{ answer: '5'},{answer: '2'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''}],
        [{ answer: '3'},{answer: ''},{answer: ''},{answer: ''},{answer: '5'},{answer: ''},{answer: ''},{answer: '2'},{answer: '7'}],
        [{ answer: ''},{answer: '8'},{answer: ''},{answer: ''},{answer: '1'},{answer: ''},{answer: ''},{answer: '9'},{answer: ''}],
        [{ answer: '1'},{answer: '9'},{answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: '5'}],
        [{ answer: ''},{answer: ''},{answer: '4'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: '8'},{answer: '3'}],
        [{ answer: '9'},{answer: ''},{answer: '3'},{answer: '2'},{answer: ''},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
        [{ answer: ''},{answer: ''},{answer: '2'},{answer: '3'},{answer: '5'},{answer: ''},{answer: ''},{answer: ''},{answer: ''}],
    ]
};

/**********************************************************************************************/
// Game Logic
const evaluateAnswer = userInput => {
    // Only accept valid numbers as input
    if (!context.possibleAnswers.includes(userInput)) return;

    if (context.writeInState) {
        if (context.board[currentBoxIndex][currentCellIndex].answer) return;
        updateWriteIn(`${currentCellId}~${userInput - 1}`, userInput)
        return;
    }

    // Ignore the same answer being passed-in
    if (context.board[currentBoxIndex][currentCellIndex].answer == userInput) return;

    // Highlight cells preventing userInput
    if (foundInCurrentBox(userInput) || foundHorizontally(userInput) || foundVertically(userInput)) return;

    updateBoard(userInput);

    removeHighlights();

    if (boardComplete()) stopTimer();
}

const foundInCurrentBox = userInput => {
    if (!context.board[currentBoxIndex].some(cell => cell.answer === userInput)) return false;
    
    showPreventingCell(`${currentBoxIndex}~${context.board[currentBoxIndex].indexOf(context.board[currentBoxIndex].find(cell => cell.answer === userInput))}`);
    return true;
}

const foundHorizontally = userInput => {
    let found = false;
    context.horizontalIds.forEach(id => {
        if (checkIds(id, userInput)) {
            found = true;
            return;
        }
    } );
    return found;
}

const foundVertically = userInput => {
    let found = false;
    context.vericalIds.forEach(id => {
        if (checkIds(id, userInput)) {
            found = true;
            return;
        }
    } );
    return found;
}

const checkIds = (currentId, userInput) => {
    let cellIdArray = currentId.split("~");
    let boxToCheck = cellIdArray[0];
    let cellToCheck = cellIdArray[1];
    if (context.board[boxToCheck][cellToCheck].answer != userInput) return false;
    showPreventingCell(currentId);
    return true;
}

const findHorizontalIndexes = () => {
    context.horizontalIds = [];
    let startingBox = Math.floor(currentBoxIndex / boardSquareRoot) * boardSquareRoot;
    for (let i = 0; i < boardSquareRoot; i++) {
        let startingCell = Math.floor(currentCellIndex / boardSquareRoot) * boardSquareRoot;
        for (let j = 0; j < boardSquareRoot; j++) {
            if (`${startingBox}~${startingCell}` != currentCellId) context.horizontalIds.push(`${startingBox}~${startingCell}`);
            startingCell++;
        }
        startingBox++;
    }
}

const findVerticalIndexes = () => {
    context.vericalIds = [];
    let startingBox = currentBoxIndex % boardSquareRoot;
    for (let i = 0; i < boardSquareRoot; i++) {
        let startingCell = currentCellIndex % boardSquareRoot;
        for (let j = 0; j < boardSquareRoot; j++) {
            if (`${startingBox}~${startingCell}` != currentCellId) context.vericalIds.push(`${startingBox}~${startingCell}`);
            startingCell += boardSquareRoot;
        }
        startingBox += boardSquareRoot;
    }
}

const updateBoard = newValue => {
    document.getElementById(`${currentCellId}~answer`).innerHTML = newValue;
    adjustAnswerCount(context.board[currentBoxIndex][currentCellIndex].answer, newValue);
    context.board[currentBoxIndex][currentCellIndex].answer = newValue;
    if (newValue === currentAnswerButtonValue || !newValue) highlightAnswerButtonValue(document.getElementById(`${currentCellId}`), !newValue);
    clearWriteIns(newValue);
}

// FIXME -- Highlight cell based on option-button selected
const updateWriteIn = (idToUpdate, userInput) => {
    if (!context.board[currentBoxIndex][currentCellIndex].writeIns[userInput - 1]) {
        document.getElementById(idToUpdate).innerHTML = userInput;
        context.board[currentBoxIndex][currentCellIndex].writeIns[userInput - 1] = userInput;
    }
    else {
        document.getElementById(idToUpdate).innerHTML = '';
        context.board[currentBoxIndex][currentCellIndex].writeIns[userInput - 1] = '';
    }
}

// FIXME -- Try to create a function for the clear as it's repeated 3 times
const clearWriteIns = (newValue) => {
    for (let i = 0; i < boardSize; i++) { 
        updateWriteIn(`${currentCellId}~${i}`, '');
        if (context.board[currentBoxIndex][i].writeIns && context.board[currentBoxIndex][i].writeIns[newValue - 1]) {
            document.getElementById(`${currentBoxIndex}~${i}~${newValue - 1}`).innerHTML = '';
            context.board[currentBoxIndex][i].writeIns[newValue - 1] = '';
        }
    };
    let cellIdArray = [];
    let writeInBoxIndex = ''
    let writeInCellIndex = '';
    context.horizontalIds.forEach(id => {
        cellIdArray = id.split("~");
        writeInBoxIndex = cellIdArray[0];
        writeInCellIndex = cellIdArray[1];
        if (context.board[writeInBoxIndex][writeInCellIndex].writeIns && context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1]) {
            document.getElementById(`${writeInBoxIndex}~${writeInCellIndex}~${newValue - 1}`).innerHTML = '';
            context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1] = '';
        }
    });
    context.vericalIds.forEach(id => {
        cellIdArray = id.split("~");
        writeInBoxIndex = cellIdArray[0];
        writeInCellIndex = cellIdArray[1];
        if (context.board[writeInBoxIndex][writeInCellIndex].writeIns && context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1]) {
            document.getElementById(`${writeInBoxIndex}~${writeInCellIndex}~${newValue - 1}`).innerHTML = '';
            context.board[writeInBoxIndex][writeInCellIndex].writeIns[newValue - 1] = '';
        }
    });
}

const adjustAnswerCount = (oldValue, newValue) => {
    let buttonToUpdate;
    if (!oldValue)  {
        context.answerButtons[newValue - 1].count++;
        updateAnswerButton(newValue);
    }
    else if (!newValue) {
        context.answerButtons[oldValue - 1].count--;
        updateAnswerButton(oldValue);
    }
    else {
        context.answerButtons[oldValue - 1].count--;
        updateAnswerButton(oldValue);
        context.answerButtons[newValue - 1].count++;
        updateAnswerButton(newValue);
    }
}

const boardComplete = () => {
    let done = true;
    context.answerButtons.forEach(button => { 
        if (button.count != `${boardSize}`) done = false;
        return;
    })
    return done;
}

const showPreventingCell = cellId => {
    currentPreventingCellId = cellId;
    document.getElementById(cellId).classList.add("preventingCell");
    document.getElementById(cellId).addEventListener("animationend", () => { document.getElementById(cellId).classList.remove("preventingCell") }); 
}

const removeHighlights =() => {
    document.getElementById(currentCellId).classList.remove('selected');
    document.querySelectorAll('.highlighted').forEach(element => element.classList.remove('highlighted'));
    currentCellId = '';
}

const highlightCell = cellId => {
    if (!document.getElementById(cellId).classList.contains('starter') && cellId != currentCellId) document.getElementById(cellId).classList.add('highlighted');
}

const highlightAnswerButtonValue = (element, remove) => {
    if (remove) {
        element.classList.remove('answer-button-selected');
        return;
    }

    element.classList.add('answer-button-selected');
}
/**********************************************************************************************/

/*--------------------------------------------------------------------------------------------*/
// Buttons
const clickAnswerButton = answerButton => {
    document.querySelectorAll('.answer-button-selected').forEach(element => element.classList.remove('answer-button-selected'));
    highlightAnswerButtonValue(answerButton);
    currentAnswerButtonValue = answerButton.id.split("~")[1];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (context.board[i][j].answer === currentAnswerButtonValue) {
                highlightAnswerButtonValue(document.getElementById(`${i}~${j}`));
                break;
            }

            if ((context.board[i][j].writeIns && context.board[i][j].writeIns[currentAnswerButtonValue - 1])) highlightAnswerButtonValue(document.getElementById(`${i}~${j}`));
        }
    }
}

const updateAnswerButton = answerButtonLabel => {
    document.getElementById(`answer-count~${answerButtonLabel}`).innerHTML = context.answerButtons[answerButtonLabel - 1].count;
    if (document.getElementById(`answer-count~${answerButtonLabel}`).innerHTML != `${boardSize}`) document.getElementById(`answer-button~${answerButtonLabel}`).classList.remove('answer-button-done');
    if (document.getElementById(`answer-count~${answerButtonLabel}`).innerHTML == `${boardSize}`) document.getElementById(`answer-button~${answerButtonLabel}`).classList.add('answer-button-done');
}

const toggleWriteIn = writeInButton => {
    context.writeInState = !context.writeInState;
    writeInButton.classList.toggle('option-button-selected');
}
/*--------------------------------------------------------------------------------------------*/

/*============================================================================================*/
//Board Creation

// Create Write-In arrays
context.board.forEach(box => {
    box.forEach(cell => { if (!cell.answer) cell.writeIns = Array.from({ length: boardSize }, () => '') })
});
/*============================================================================================*/

const templateElement = document.getElementById("templateHB");
const templateSource = templateElement.innerHTML;
const template = Handlebars.compile(templateSource);

// *********************************************************************************************************
// Handlebar Helpers
Handlebars.registerHelper('beginRow'      ,   function(index) { return rowBeginningIndexes.includes(index) } ); // Returns TRUE if starting a row
Handlebars.registerHelper('endRow'        ,   function(index) { return rowEndingIndexes.includes(index)    } ); // Returns TRUE if ending a row
Handlebars.registerHelper('startingValue' ,   function(value) { return value                               } ); // Returns TRUE if value is populated at the start
// *********************************************************************************************************
const compiledHtml = template(context);
document.getElementById("gameArea").innerHTML = compiledHtml;
startTimer();

// Logic for clicking on a cell
addEventListener("keydown",  (event) => { if (currentBoxIndex && currentCellIndex && event.key == 'Backspace') updateBoard('') });
addEventListener("keypress", (event) => { if (currentBoxIndex && currentCellIndex) evaluateAnswer(event.key) });

const selectCell = clickedCell => {
    const cellIdArray = clickedCell.id.split("~");
    currentBoxIndex = cellIdArray[0];
    currentCellIndex = cellIdArray[1];

    //Remove highlights by clicking on the same cell (not sure if I want to keep this functionality)
    if (currentCellId && clickedCell.id == currentCellId) {
        removeHighlights();
        return;
    }

    //Reset cell styles
    if (currentCellId && clickedCell.id != currentCellId) document.getElementById(currentCellId).classList.remove('selected');
    document.querySelectorAll('.highlighted').forEach(element => element.classList.remove('highlighted'));
    
    // Track current cell
    currentCellId = clickedCell.id;

    findHorizontalIndexes();
    findVerticalIndexes();

    clickedCell.classList.add('selected');
    context.horizontalIds.forEach(id => highlightCell(id));
    context.vericalIds.forEach(id => highlightCell(id));
    for (let i = 0; i < boardSize; i++) highlightCell(`${currentBoxIndex}~${i}`);
    
    //console.log(context);
}

function startTimer() {
    timerInterval = setInterval(countUp, 1000); // Update every 1000 milliseconds (1 second)
}

function countUp() {
    totalSeconds++;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    document.getElementById("timer").innerHTML = `${formattedMinutes}:${formattedSeconds}`;
}

function stopTimer() {
    clearInterval(timerInterval); // Stop the timer
}