    var fullSquareArray = [];
    var fullRowArray = [];
    var fullColumnArray = []; 
    var fullRegionArray = [];
    var numberPad;
    var selectedRegion;
    var selectedSquare;

$(document).ready(function(){
    
    //Classes====================================================================================================================================
    
    class Square {
        constructor(xPos, yPos, region, id) {
            this.colID = xPos;
            this.rowID = yPos;
            this.regionID = region;
            this.selector = "#" + id;
            this.tempVal = -1;
            this.locked = false;
            this.value = -1;
        }
        updateValue(newVal){ //Takes new value, updates current value, checks for errors
            this.value = newVal;
            this.realValue();
            this.errorCheckBoard();
        }
        numberPadValue(){ //Sets all squares in caller's region to their numberpad values;
            $(this.selector).text(this.tempVal);
        }
        realValue(){
            if(this.value != -1){
                $(this.selector).text(this.value);//regions columsn
                
            } else {
                $(this.selector).text("");
            }
            
        }
        
        errorCheckBoard(){
            $('button').removeClass('infected');
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
        }
        
    }
    
    //Execution==================================================================================================================================
    numberPad = false;
    for(var i = 0; i < 9; i++){
        fullRowArray.push(new Array(9));
        fullColumnArray.push(new Array(9));
        fullRegionArray.push([]);
    }
    
    $('body').append(newEmptyBoardStringDos());
    loadBoard("puzzle_03.json");
    
    $('button').on('click', function(){
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
    
    
//    function loadBoard(srcPath){
//        $.getJSON(srcPath)
//        .done(function(data){ //data.grid_data[regionID][squareID].val
//            
//            $.each(data.grid_data, function(reg, arr){
//                for(var i = 0; i < 9; i++){
//                    if(arr[i].val != -1){
//                        fullRegionArray[reg][i].updateValue(arr[i].val);
//                        fullRegionArray[reg][i].locked = true;
//                        $(fullRegionArray[reg][i].selector).addClass('locked');
//                    }
//                }
//            });
//            borderize();
//        })
//        .fail(function(){
//            //Fails to load grid_data from json
//        });
//        
//    }
    
    function loadBoard(srcPath){
        $.getJSON(srcPath)
        .done(function(data){
            $.each(data, function(id, val){
                if(val != -1){
                    fullSquareArray[id].updateValue(val);
                    fullSquareArray[id].locked = true;
                    $(fullSquareArray[id].selector).addClass('locked');
                }
            });
            borderize();
        })
        .fail(function(){
            //json load failed
        });
    }
    
    function newEmptyBoardStringDos(){
        
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
                var thisSquare = new Square(x, y, regionID, id);
                fullSquareArray.push(thisSquare);
                fullRowArray[y][x] = thisSquare;
                fullColumnArray[x][y] = thisSquare;
                fullRegionArray[thisSquare.regionID].push(thisSquare);
                thisSquare.tempVal = fullRegionArray[thisSquare.regionID].length;
                id++;
            }
            htmlBuildString += "<br>";
        }
        
        htmlBuildString += "</div>";
        return htmlBuildString;
        
    }
    
    function borderize(){
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
    
    function hasDuplicates(arr){
        
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

});




//JSON EXTRACT CODE
//  for(var selector="#f",jsonData="{",idIndex=0,row=0;9>row;row++)for(var col=0;9>col;col++){var out=$(selector+col+row).getAttribute("value");out||(out="-1"),jsonData+='"'+idIndex+'":"'+out+'"',80!=idIndex&&(jsonData+=","),idIndex++}jsonData+="}",console.log(jsonData);
