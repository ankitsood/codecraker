            function test(id, event) {
                var element = document.getElementsByName(id)[0];
                var len = element.value.length + 1;
                var max = element.getAttribute("maxlength");

                var cond = (46 < event.which && event.which < 58) || (46 < event.keyCode && event.keyCode < 58);

                if (!(cond && len <= max)) {
                    event.preventDefault();
                    element.parentNode.nextElementSibling.children[0].focus()
                    return false;
                }           
                if("fifthNum"!= id &&  len == max){

                     element.parentNode.nextElementSibling.children[0].focus();
                     return true;
                }
            }

            function checkNumber(inputArray,outputArray){
                var gameTable=document.getElementById("gameTable");
                var row = gameTable.insertRow(1)

                for (var index = 0; index < inputArray.length; index++) {
                    var inputNum = inputArray[index];
                    var cellObj=row.insertCell(index);
                    cellObj.innerHTML=inputNum      
                    
                }
            }
            function clearFocus(params) {
                
            }