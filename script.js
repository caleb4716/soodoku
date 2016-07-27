    var fullSquareArray = [];
    var fullRowArray = [];
    var fullColumnArray = []; 
    var fullRegionArray = [];
    var numberPad;
    var selectedRegion;
    var selectedSquare;
    var currentDifficulty;
    var currentPuzzleId;

    var easyCount;
    var mediumCount;
    var difficultCount;
    var impossibleCount;

//Following is not good. Keep even # of json in each difficulty dir, hardcode here for randomized puzzle picking within dir
var puzzleCount = 8;

$(document).ready(function(){
    
    //Classes====================================================================================================================================
    
    var Square = function(xPos, yPos, region, id){
        this.colID = xPos;
        this.rowID = yPos;
        this.regionID = region;
        this.selector = "#" + id;
        this.tempVal = -1;
        this.locked = false;
        this.value = -1;
    }
    
    Square.prototype.updateValue = function(newVal){
        this.value = newVal;
        this.realValue();
        this.errorCheckBoard();
    } 
    
    Square.prototype.numberPadValue = function(){ //Updates square to display numberpad (tempVal) value
        $(this.selector).text(this.tempVal);
    }
    Square.prototype.realValue = function(){ //Update display to reflect squares real value
        if(this.value != -1){
            $(this.selector).text(this.value);
                
        } else {
            $(this.selector).text("");
        }
            
    }
        
    Square.prototype.errorCheckBoard = function(){
        $('.square').removeClass('infected');
        var infected = new Array();
        for(var i = 0; i < 9; i++){
            if(hasDuplicates(fullRegionArray[i])){
                infected.push(fullRegionArray[i]);
            }
            if(hasDuplicates(fullColumnArray[i])){
                infected.push(fullColumnArray[i]);
            }
            if(hasDuplicates(fullRowArray[i])){
                infected.push(fullRowArray[i]);
            }
        }
        for(var i = 0; i < infected.length; i++){
            for(var ii = 0; ii < infected[i].length; ii++){
                $(infected[i][ii].selector).addClass('infected');
            }
        }
        if(infected.length == 0){ //this is wrongly firing victories. needs fixing
            for(var i = 0; i < fullSquareArray.length; i++){
                if(fullSquareArray[i].value == -1){
                    break;
                } else if(i = 80){
                    victory();
                }
            }
        }
        
    }
    
    //Execution==================================================================================================================================
    numberPad = false;
    for(var i = 0; i < 9; i++){
        fullRowArray.push(new Array(9));
        fullColumnArray.push(new Array(9));
        fullRegionArray.push([]);
    }
    
    $('#puzzle-div').append(newEmptyBoardStringDos());
    loadInitializeChooseButtons();
    currentDifficulty = ""
    currentPuzzleId = "";
    setSquareListeners();
    
    
    //Listeners================================================================================================================================
    function setSquareListeners(){
        $('.square').on('click', function(){
        clickedSquare = fullSquareArray[$(this).attr('id')];
        if(numberPad){
            numberPad = false;
            if(clickedSquare.regionID == selectedRegion){
                selectedSquare.updateValue(clickedSquare.tempVal);
            } else {
                //not matching region
            }
            for(var i = 0; i < 9; i++){
                fullRegionArray[selectedRegion][i].realValue();
                $(fullRegionArray[selectedRegion][i].selector).toggleClass("numberpad");
            }
        } else {
            if(!clickedSquare.locked){
                if(clickedSquare.value == -1){
                    numberPad = true;
                    selectedSquare = clickedSquare;
                    selectedRegion = clickedSquare.regionID;
                    for(var i = 0; i < 9; i++){
                        fullRegionArray[selectedRegion][i].numberPadValue();
                        $(fullRegionArray[selectedRegion][i].selector).toggleClass("numberpad");     
                    }
                } else {
                    clickedSquare.updateValue(-1);
                }
                
            }
            
        }
        
    });
    }
    
    $('#btn-reset').on('click', function(){
        
        clearAndSetBoard(currentDifficulty, currentPuzzleId);
        
    });
    
    $('.btn-difficulty-select').on('click', function(){
        var difficulty = $(this).attr('id');
        if(difficulty == 'random'){
            var dirID = Math.floor((Math.random() * 4) + 1);
            switch(dirID) {
                case 1:
                    difficulty = 'easy';
                    break;
                case 2:
                    difficulty = 'medium';
                    break;
                case 3:
                    difficulty = 'difficult';
                    break;
                case 4:
                    difficulty = 'impossible';
                    break;
            }
        }
        var puzzleID = Math.floor((Math.random() * puzzleCount) + 1);
        clearAndSetBoard(difficulty, puzzleID);
    });
    
    function updateDifficultyFooter(dif, id){
//        var str = "Difficulty: " + dif + " | Board ID: " + id;
//        $('#difficulty-label').text(str);
        var lblType;
        switch(dif){
            case "easy":
                lblType = "-success";
                break;
            case "medium":
                lblType = "-warning";
                break;
            case "difficult":
                lblType = "-danger";
                break;
            case "impossible":
                lblType = "-default";
                break;
        }
        var htmlInsert = "<span class='label label" + lblType + "' >" + dif + "</span> #" + id;
        $('#difficulty-label').html(htmlInsert);
    }
    
    function loadBoard(difficulty, id){ //loads (id - 1)
        
        $.getJSON('json/puzzle-data.json')
        .done(function(data){
            console.log(difficulty + " " + id);
            $.each(data, function(dif_key, val){
                if(dif_key == difficulty){
                    //val[id - 1] references what used to be the data in the old individual board json files
                    $.each(val[id - 1], function(sqr_id, value){
                        if(value != -1){
                            fullSquareArray[sqr_id].updateValue(value);
                            fullSquareArray[sqr_id].locked = true;
                            $(fullSquareArray[sqr_id].selector).addClass('locked');
                        }
                    });
                }
            });
            borderize();
        })
        .fail(function(){
            //JSON load failure
        });
    }
    
    function newEmptyBoardStringDos(){ //Builds and returns new html string for insertion into DOM
        
        var htmlBuildString = "<div id='board'>";
        var id = 0;
        
        for(var y = 0; y < 9; y++){
            
            for(var x = 0; x < 9; x++){
                htmlBuildString += "<button class='square' id='" + id + "' xPos='" + x + "' yPos='" + y + "'></button>"
                var regionID;
                if(y < 3){
                    if(x < 3){regionID = 0;}
                    else if(x < 6){regionID = 1;}
                    else{regionID = 2;}
                }
                else if(y < 6){
                    if(x < 3){regionID = 3;}
                    else if(x < 6){regionID = 4;}
                    else{regionID = 5;}
                }
                else{
                    if(x < 3){regionID = 6;}
                    else if(x < 6){regionID = 7;}
                    else{regionID = 8;}
                }
                registerNewSquare(x,y,regionID,id);
                id++;
            }
            htmlBuildString += "<br>";
        }
        
        htmlBuildString += "</div>";
        return htmlBuildString;
        
    }
    
    function clearAndSetBoard(dif, id){
        fullSquareArray = [];
        
        for(var i = 0; i < 9; i++){
            fullRegionArray[i] = [];
            for(var ii = 0; ii < 9; ii++){
                fullColumnArray[i][ii] = null;
                fullRowArray[i][ii] = null;
            }
        }
        
        numberPad = false;
        selectedRegion = null;
        selectedSquare = null;
        $('#board').remove();
        $('#puzzle-div').append(newEmptyBoardStringDos());
        loadBoard(dif, id);
        setSquareListeners();
        currentPuzzleId = id;
        currentDifficulty = dif;
        updateDifficultyFooter(currentDifficulty, currentPuzzleId);
    }
    
    
    function registerNewSquare(x, y, regionID, id){ //Builds new square with passed info, registers with all tracking arrays, sets TempVal
        var thisSquare = new Square(x, y, regionID, id);
        fullSquareArray.push(thisSquare);
        fullRowArray[y][x] = thisSquare;
        fullColumnArray[x][y] = thisSquare;
        fullRegionArray[thisSquare.regionID].push(thisSquare);
        thisSquare.tempVal = fullRegionArray[thisSquare.regionID].length;   
    }
    
    function borderize(){ //Manipulates css to visually establish region boundaries
        for(var i = 0; i < 9; i++){
            $(fullColumnArray[0][i].selector).css("border-left", "3px solid black");
            $(fullColumnArray[2][i].selector).css("border-right", "3px solid black");
            $(fullColumnArray[5][i].selector).css("border-right", "3px solid black");
            $(fullColumnArray[8][i].selector).css("border-right", "3px solid black");
            $(fullRowArray[0][i].selector).css("border-top", "3px solid black");
            $(fullRowArray[2][i].selector).css("border-bottom", "3px solid black");
            $(fullRowArray[5][i].selector).css("border-bottom", "3px solid black");
            $(fullRowArray[8][i].selector).css("border-bottom", "3px solid black");
            
        }
    }
    
    function hasDuplicates(arr){ //Takes an array, returns if array contains duplicate values or not
        
        var dupes = false;
        var valArr = new Array();
        for(var i = 0; i < arr.length; i++){
            valArr[i] = arr[i].value;
        }
        
        valArr.sort(function(a,b){return a-b});
        for(var i = 0; i < (valArr.length - 1); i++){
            if(valArr[i] != -1){
                if(valArr[i] == valArr[i + 1]){
                    dupes = true;
                    break;
                }
            }
        }
        
        return dupes;
        
    }
    
    function victory(){ // this function should be called when all squares are filled and no errors are detected
        console.log('Victory detected');
    }
    
    function loadInitializeChooseButtons(){
        
        $.getJSON('json/puzzle-data.json')
        .done(function(data){
            
            $.each(data, function(key, val){
                var puzzleCount = val.length;
                switch(key){
                    case "easy":
                        easyCount = puzzleCount;
                        break;
                    case "medium":
                        mediumCount = puzzleCount;
                        break;
                    case "difficult":
                        difficultCount = puzzleCount;
                        break;
                    case "impossible":
                        impossibleCount = puzzleCount;
                        break;
                }
            });
            //HTML Building for specific board pick modal
            var $insertPoint = $("#choose-panel");
            var inputString = "<span class='label label-success label-choose'>Easy</span>";
            for(var i = 1; i < easyCount+1; i++){
                inputString += "<button class='btn-choose-easy' id='easy-" + i + "' data-dismiss='modal'>" + i + "</button>";
            }
            inputString += "<span class='label label-warning label-choose'>Medium</span>";
            for(var i = 1; i < mediumCount+1; i++){
                inputString += "<button class='btn-choose-medium' id='medium-" + i + "' data-dismiss='modal'>" + i + "</button>";
            }
            inputString += "<span class='label label-danger label-choose'>Difficult</span>";
            for(var i = 1; i < difficultCount+1; i++){
                inputString += "<button class='btn-choose-difficult' id='difficult-" + i + "' data-dismiss='modal'>" + i + "</button>";
            }
            inputString += "<span class='label label-default label-choose'>Impossible</span>";
            for(var i = 1; i < impossibleCount+1; i++){
                inputString += "<button class='btn-choose-impossible' id='impossible-" + i + "' data-dismiss='modal'>" + i + "</button>";
            }
            $insertPoint.append(inputString);
            $(".btn-choose-easy, .btn-choose-medium, .btn-choose-difficult, .btn-choose-impossible").on('click', function(){
                var idData = $(this).attr('id').split('-');
                clearAndSetBoard(idData[0], idData[1]); //Passes difficulty and id stored in buttons id
            });
            
            
        })
        .fail(function(){
            
        });
        
    }

});


//JSON EXTRACT CODE
//  for(var selector="#f",jsonData="{",idIndex=0,row=0;9>row;row++)for(var col=0;9>col;col++){var out=$(selector+col+row).getAttribute("value");out||(out="-1"),jsonData+='"'+idIndex+'":"'+out+'"',80!=idIndex&&(jsonData+=","),idIndex++}jsonData+="}",console.log(jsonData);


