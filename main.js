const rowBeginningIndexes = [0,3,6];
const rowEndingIndexes = [2,5,8];
const context = {
    currentCellId: '',
    currentPreventingCellId: '',
    possibleAnswers: ['1','2','3','4','5','6','7','8','9'],
    board: [
        ['','6','9','','','','1','',''],['','8','','2','','','3','',''],['','3','','5','','9','','',''],
        ['','','8','3','','','','','1'],['','','','6','','9','','',''],['6','','','','','2','9','',''],
        ['','','','7','','3','','5',''],['','','7','','','8','','1',''],['','','4','','','','3','7','']
    ]
};

/**********************************************************************************************/
// Game Logic
const evaluateAnswer = userInput => {
    //console.log(userInput);

    // Only accept valid numbers as input
    if (!context.possibleAnswers.includes(userInput)) return;

    // Ignore the same answer being passed-in
    if (context.board[context.currentBoxIndex][context.currentCellIndex] == userInput) return;

    // 1) Same box
    // 2) Horizontally
    // 3) Vertically
    if (foundInCurrentBox(userInput) || foundHorizontally(userInput) || foundVertically(userInput)) return;

    updateBoard(userInput);
}

const foundInCurrentBox = userInput => {
    if (!context.board[context.currentBoxIndex].includes(userInput)) return false;
    
    highlightCell(`${context.currentBoxIndex}~${context.board[context.currentBoxIndex].indexOf(userInput)}`);
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
    if (context.board[boxToCheck][cellToCheck] != userInput) return false;
    highlightCell(currentId);
    return true;
}

const findHorizontalIndexes = () => {
    context.horizontalIds = [];
    let startingBox = Math.floor(context.currentBoxIndex / 3) * 3;
    for (let i = 0; i < 3; i++) {
        let startingCell = Math.floor(context.currentCellIndex / 3) * 3;
        for (let j = 0; j < 3; j++) {
            if (`${startingBox}~${startingCell}` != context.currentCellId) context.horizontalIds.push(`${startingBox}~${startingCell}`);
            startingCell++;
        }
        startingBox++;
    }
}

const findVerticalIndexes = () => {
    context.vericalIds = [];
    let startingBox = context.currentBoxIndex % 3;
    for (let i = 0; i < 3; i++) {
        let startingCell = context.currentCellIndex % 3;
        for (let j = 0; j < 3; j++) {
            if (`${startingBox}~${startingCell}` != context.currentCellId) context.vericalIds.push(`${startingBox}~${startingCell}`);
            startingCell += 3;
        }
        startingBox += 3;
    }
}

const updateBoard = newValue => {
    document.getElementById(context.currentCellId).innerHTML = newValue;
    context.board[context.currentBoxIndex][context.currentCellIndex] = newValue;
}

const highlightCell = cellId => {
    //document.getElementById(cellId).style.borderColor = 'red';
    //if (context.currentPreventingCellId && cellId != context.currentPreventingCellId) document.getElementById(context.currentPreventingCellId).style.border = '1px solid gray';
    context.currentPreventingCellId = cellId;
    //document.getElementById(cellId).style.border = '2px solid red';
    document.getElementById(cellId).classList.add("preventingCell");
    document.getElementById(cellId).addEventListener("animationend", () => { document.getElementById(cellId).classList.remove("preventingCell") }); 
}
/**********************************************************************************************/

//const createOrRefreshBoard = () => {
const templateElement = document.getElementById("templateHB");
const templateSource = templateElement.innerHTML;
const template = Handlebars.compile(templateSource);

// *********************************************************************************************************
// Handlebar Helpers
Handlebars.registerHelper('beginRow'      ,   function(index) { return rowBeginningIndexes.includes(index) } );
Handlebars.registerHelper('endRow'        ,   function(index) { return rowEndingIndexes.includes(index)    } );
Handlebars.registerHelper('startingValue' ,   function(value) { return value                               } );
// *********************************************************************************************************

const compiledHtml = template(context);
document.getElementById("gameArea").innerHTML = compiledHtml;
//}

//createOrRefreshBoard();

// Logic for clicking on a cell
const elements = document.querySelectorAll('.cell');

elements.forEach((clickedCell) => {
    clickedCell.addEventListener('click', () => {
        const cellIdArray = clickedCell.id.split("~");
        context.currentBoxIndex = cellIdArray[0];
        context.currentCellIndex = cellIdArray[1];

        //Reset cell styles
        if (context.currentCellId && clickedCell.id != context.currentCellId) document.getElementById(context.currentCellId).classList.remove('highlighted');
        //if (context.currentPreventingCellId) document.getElementById(context.currentPreventingCellId).style.border = '1px solid gray';
        
        // Track current cell
        context.currentCellId = clickedCell.id;

        findHorizontalIndexes();
        findVerticalIndexes();

        //if (clickedCell.style.backgroundColor != 'lightgray') clickedCell.style.backgroundColor = 'Yellow';
        clickedCell.classList.add('highlighted');
        
        addEventListener("keydown",  (event) => { if (event.key == 'Backspace') updateBoard('') });
        addEventListener("keypress", (event) => { evaluateAnswer(event.key) });

        //console.log(context);
    })
});