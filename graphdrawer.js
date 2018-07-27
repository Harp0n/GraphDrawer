


function setup() {
  createCanvas(900, 600);  
  stroke(0);     // Set line drawing color to white

  input = createInput();
  input.position(20, 65);

  button = createButton('submit');
  button.position(input.x + input.width, 65);
  button.mousePressed(function(){
    rysuj(start= -3,end=3, step=0.01, k=60, funckja=input.value());
  });

  // rownanie = "sin(x)+cos(x)";
  // onp = toONP(rownanie);
  // tree = ONPtoTree(onp)
  // rysuj(start= -3,end=3, step=0.01, k=60, funckja=rownanie);
}

function draw() { 
} 



function rysuj(start= -3,end=3, step=0.01, k=60, funkcja){
  background(255);
  print(funkcja);
  onp = toONP(funkcja);
  tree = ONPtoTree(onp);

  var prev_y = null;
  var prev_x = null;
  var yMax = -Infinity;
  var yMin = Infinity;

  stroke(0);
  line(width/2,0,width/2,height); //os y
  line(0,height/2,width,height/2); //os x
  stroke("blue");

  for(var i=start; i<=end; i+=step){
    var y = tree.resetAndGet(i);
    yMax = max(yMax, y);
    yMin = min(yMin, y);

    var y = adjustY(y,k);
    var x = adjustX(i,k);
    if(prev_y!=null)
      line(x,y,prev_x,prev_y);
    prev_x = x;
    prev_y = y;
  }

  stroke(0);
  //liczby na osi ox
  for(var x=floor(start); x<=ceil(end); x+=1){
      text(x.toString(), adjustX(x,k), adjustY(0,k)+11);
  }
  //liczby na osi oy
  for(var y=floor(yMin); y<=ceil(yMax); y+=1){
    text(y.toString(), adjustX(0,k)+2, adjustY(y,k));
  }
}

function adjustX(x,k){
  return k*x+width/2;
}

function adjustY(y,k){
  return -k*y+height/2;
}

const Type = {
  CONST: 'const',
  VARIABLE: 'variable',
  SINGLE: 'single operator',
  DOUBLE: 'double operator'
}

function Node(content){
  this.content = content;
  if(isSingleOperator(content))
    this.type=Type.SINGLE;
  else if(isDoubleOperator(content))
    this.type=Type.DOUBLE;
  else if(isLetter(content))
    this.type=Type.VARIABLE;
  else
    this.type = Type.CONST;
  this.value = null;
  this.leftChild = null;
  this.rightChild = null;

  // this.value;
  //this.derivative;
  this.resetValue = function(){
    this.value = null;
    if(this.leftChild!=null)
      this.leftChild.resetValue();
    if(this.rightChild!=null)
      this.rightChild.resetValue();
    return true;
  }

  this.getValue = function(x){
    if(this.value==null){
      if(this.type==Type.CONST){
        this.value = this.content
      }
      else if(this.type==Type.VARIABLE){
        this.value = x;
      }
      else if(this.type==Type.SINGLE){
        var leftValue = this.leftChild.getValue(x);
        switch(this.content){
          case "sin":
            this.value = sin(leftValue);
            break;
          case "cos":
            this.value = cos(leftValue);
            break;
          case "tg":
          case "tan":
            this.value = tan(leftValue);
            break;
          case "ctg":
          case "ctan":
            this.value = 1/tan(leftValue);
            break;
          case "ln":
          case "log":
            this.value = log(leftValue);
            break;
          case "abs":
            this.value = abs(leftValue);
            break;
          case "sqrt":
            this.value = sqrt(leftValue);
            break;
        }
      }
      else if(this.type==Type.DOUBLE){
        var leftValue = this.leftChild.getValue(x);
        var rightValue = this.rightChild.getValue(x);
        switch(this.content){
          case "+":
            this.value = rightValue + leftValue;
            break;
          case "-":
            this.value = rightValue - leftValue;
            break;
          case "*":
            this.value = rightValue * leftValue;
            break;
          case "/":
            this.value = rightValue / leftValue;
            break;
          case "^":
            this.value = pow(rightValue,leftValue);
            break;
        }
      }

      return this.value;
    }

    else return this.value;
  }

  this.resetAndGet = function(x){
    this.resetValue();
    return this.getValue(x);
  }

}

function isDigit(char){
  var wynik = parseInt(char);
  if(isNaN(wynik))
    return false;
  return true;
}

function isLetter(char){
  if((char>='a'&&char<='z')||(char>='A'&&char<='Z'))
    return true;
  return false;
}

function isBracket(char){
  if(char == "(" || char == ")")
    return true;
  return false;
}

function isDoubleOperator(input){
  if(["+","-","*","/","^"].includes(input))
    return true;
  return false;
}

function isSingleOperator(input){
  if(input.length>1 && !isDigit(input))
    return true;
  return false;
}

function isOperator(input){
  if(isSingleOperator(input) || isDoubleOperator(input))
    return true;
  return false;
}

function isValue(input){
  if(Number.isInteger(input)||(!isOperator(input) && !isBracket(input)))
    return true;
  return false;
}

function parser(input){
  this.input = input;
  this.input = this.input.replace(/ /g,"");
  this.index = 0;
  this.getNext = function(){
    if(this.index>=this.input.length)
      return false;
    aktualnyZnak = this.input[this.index];
    if(isDigit(aktualnyZnak))
    {
      liczba = parseInt(aktualnyZnak);
      while(true)
      {
        this.index++;
        aktualnyZnak = this.input[this.index];
        if(isDigit(aktualnyZnak)){
          liczba = liczba*10+parseInt(aktualnyZnak);
          continue;
        }
        else return liczba;
      }
    }
    else if(isLetter(aktualnyZnak))
    {
      ciag = aktualnyZnak;
      while(true)
      {
        this.index++;
        aktualnyZnak = this.input[this.index];
        if(isLetter(aktualnyZnak)){
          ciag += aktualnyZnak;
          continue;
        }
        else return ciag;
      }
    }
    else{
      this.index++;
      return aktualnyZnak;
    }
  }
} 

function priorytet(znak){
  switch(znak){
    case '(':     //dla tych 0 
      return 0;
    case '+':     //dla tych 1 
    case '-':    
    case ')':
      return 1;
    case '*':     //dla tych 2 
    case '/': 
    case '%': 
      return 2;
    case '^':     //dla tych 3
      return 3;
    case 'sin':     //dla tych 4 to sa wszystkie funkcje przyjmujace tylko jeden argument
    case 'cos':
    case 'tg':
    case 'tan':
    case 'ctg':
    case 'ctan':
    case 'log':
    case 'ln':
    case 'abs':
    case 'sqrt':
      return 4;
    default:
      return 4;
  }
}

function toONP(input){
  var p = new parser(input);
  var wejscie;
  var wyjscie = [];
  // var wynik = "";
  var stos = [];
  while(true){
    wejscie = p.getNext();
    if(!wejscie) return wyjscie.concat(stos.reverse());
    
    if(isValue(wejscie)){
      // wynik+=wejscie.toString();
      wyjscie.push(wejscie);
    }

    else if(wejscie=="("){
      stos.push(wejscie);
    }

    else if(wejscie==")"){
      if(stos.length>0){
        while(true){
          var zdjety = stos.pop();
          if(zdjety!="("){
            // wynik+=zdjety.toString();
            wyjscie.push(zdjety);
          }
          else break;
        }
      }
    }

    else if(isOperator(wejscie)){
      if(stos.length==0||priorytet(wejscie)>priorytet(stos[stos.length-1])){
        stos.push(wejscie);
      }
      else{
        var zdjety;
        while(true){
          if(stos.length==0) break;
          zdjety = stos.pop();
          if(priorytet(wejscie)<=priorytet(zdjety)){
            // wynik+=zdjety.toString();
            wyjscie.push(zdjety);
            continue;
          }
          else break;
        }
        if(priorytet(wejscie)>priorytet(zdjety))
          stos.push(zdjety);
        stos.push(wejscie);
      }
    }
  }
}

function ONPtoTree(onp){
  stos = [];
  for(var i=0; i<onp.length; i++){
    var nowyNode = new Node(onp[i]);
    if(nowyNode.type == Type.DOUBLE){
      var left  = stos.pop();
      var right = stos.pop();
      nowyNode.leftChild  = left;
      nowyNode.rightChild = right;
      stos.push(nowyNode);
    }
    else if(nowyNode.type == Type.SINGLE){
      var left  = stos.pop();
      nowyNode.leftChild  = left;
      nowyNode.rightChild = null;
      stos.push(nowyNode);
    }
    else{
      nowyNode.leftChild  = null;
      nowyNode.rightChild = null;
      stos.push(nowyNode);
    }
  }
  return stos[0];

}

