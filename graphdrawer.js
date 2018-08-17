
var input;

function setup() {
  createCanvas(900, 600);  
  stroke(0);     // Set line drawing color to white

  input = createInput();
  input.size(225);
  input.position(15, 65);
  inputT = createP("Wyrazenie f(x)");
  inputT.position(85, 25);

  inputStart = createInput(-4);
  inputStart.position(15, 100);
  inputStart.size(100);
  inputStartT = createP("Start wykresu");
  inputStartT.position(20, 105);

  inputEnd = createInput(4);
  inputEnd.position(15+120, 100);
  inputEnd.size(105);
  inputEndT = createP("Koniec wykresu");
  inputEndT.position(20+120, 105);

  scaleSliderX = createSlider(-3, 3, 0, 0.5);
  scaleSliderXT = createP("Skalowanie X");
  scaleSliderXT.position(45, 150);
  scaleSliderX.position(20, 145);

  scaleSliderY = createSlider(-3, 3, 0, 0.5);
  scaleSliderYT = createP("Skalowanie Y");
  scaleSliderYT.position(45, 150+45);
  scaleSliderY.position(20, 145+45);

  // rSlider = createSlider(0, 255, 100);
  // rSlider.position(20, 100);
  // button = createButton('submit');
  // button.position(input.x + input.width, 65);
  // button.mousePressed(function(){
  //   _start = parseInt(inputStart.value());
  //   _end = parseInt(inputEnd.value());
  //   rysuj(start=_start,end=_end, step=0.01, k=60, funckja=input.value());
  // });

  //  rownanie = "x*(-x)";
  //  onp = toONP(rownanie);
  //  tree = ONPtoTree(onp)
  //  print(tree.getValue(1));
  // rysuj(start= -3,end=3, step=0.01, k=60, funckja=rownanie);
}

function draw() { 
  _start = parseInt(inputStart.value());
  _end = parseInt(inputEnd.value());
  _kx = 60*pow(2,scaleSliderX.value());
  _ky = 60*pow(2,scaleSliderY.value());
  rysuj(start=_start,end=_end, step=0.01, kx=_kx, ky=_ky, funkcja=input.value());
} 



function rysuj(start= -3,end=3, step=0.01, kx=60, ky=60, funkcja){
  background(255);
  onp = toONP(funkcja);
  tree = ONPtoTree(onp);
  if(!tree)
    return;
  k = [kx,ky];
  var prev_y = null;
  var prev_dy = null;
  var prev_x = null;


  var yMax = -Infinity;
  var yMin = Infinity;

  stroke(0);
  line(width/2,0,width/2,height); //os y
  line(0,height/2,width,height/2); //os x

  stroke("black"); //legend
  text('Funkcja', 800, 50);
  text('Pochodna', 800, 70);
  stroke("blue");
  line(770,50-5,790,50-5);
  stroke("red");
  line(770,70-5,790,70-5);

  for(var i=start; i<=end; i+=step){
    var y = tree.resetAndGet(i);
    var dy = tree.getDerivative();

    if(y=="error")
      break;
    y=max(-10000, min(y,10000));
    dy=max(-10000, min(dy,10000));
    yMax = max(yMax, y);
    yMin = min(yMin, y);

    y = adjustY(y,k);
    dy = adjustY(dy,k);
    var x = adjustX(i,k);
    if(prev_y!=null)
    {
      stroke("blue");
      line(x,y,prev_x,prev_y);
      stroke("red");
      line(x,dy,prev_x,prev_dy);
    }
    prev_x = x;
    prev_y = y;
    prev_dy = dy;
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
  return k[0]*x+width/2;
}

function adjustY(y,k){
  return -k[1]*y+height/2;
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
        if(!this.leftChild)
          return "error";
        var leftValue = this.leftChild.getValue(x);
        if(leftValue=="error")
          return "error";
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
        if(!this.leftChild || !this.rightChild)
          return "error";
        var leftValue = this.leftChild.getValue(x);
        var rightValue = this.rightChild.getValue(x);
        if(leftValue=="error" || rightValue=="error"){
          return "error";
        }
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

  this.getDerivative = function(){
      log("xd");
      if(this.type==Type.CONST){
        return 0;
      }
      else if(this.type==Type.VARIABLE){
        return 1;
      }
      else if(this.type==Type.SINGLE){
        result = 0;
        if(!this.leftChild)
          return "error";
        var leftValue = this.leftChild.getValue(0);
        var leftDerivative = this.leftChild.getDerivative();
        if(leftValue=="error")
          return "error";
        switch(this.content){
          case "sin":
            result = cos(leftValue);
            break;
          case "cos":
            result = -sin(leftValue);
            break;
          case "tg":
          case "tan":
            result = 1/pow(cos(leftValue),2);
            break;
          case "ctg":
          case "ctan":
            result = -1/pow(sin(leftValue),2);
            break;
          case "ln":
          case "log":
            result = 1/leftValue;
            break;
          case "abs":
            if(leftValue>0)
              result = leftValue;
            else if (leftValue<0)
              result = -leftValue;
            else
              result = 0;
            break;
          case "sqrt":
            result = 1/(2*leftValue);
            break;
        }
        return result*leftDerivative;
      }
      else if(this.type==Type.DOUBLE){
        if(!this.leftChild || !this.rightChild)
          return "error";
        var rightValue = this.leftChild.getValue(0);
        var leftValue = this.rightChild.getValue(0);
        var rightDerivative = this.leftChild.getDerivative();
        var leftDerivative = this.rightChild.getDerivative();
        if(leftValue=="error" || rightValue=="error"){
          return "error";
        }
        result = 0;
        switch(this.content){
          case "+":
            result =leftDerivative + rightDerivative;
            break;
          case "-":
            result = leftDerivative - rightDerivative;
            break;
          case "*":
            result = leftDerivative*rightValue + leftValue*rightDerivative;
            break;
          case "/":
            result = (leftDerivative*rightValue - leftValue*rightDerivative)/pow(rightValue,2);
            break;
          case "^":
            result = pow(leftValue,rightValue)*(rightValue*leftDerivative/abs(leftValue) +
                                                rightDerivative*log(abs(leftValue)) 
                                              )
            if(leftValue<0) //multiply by -1 if base is negative
              result *= -1;
            break;
        }
        return result;
      }
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

String.prototype.replaceAll = function(search,replace) {
  if (replace === undefined) {
      return this.toString();
  }

  return this.replace(new RegExp(search, 'g'), replace);
  // return this.split(search).join(replace);
}

function parser(input){
  this.input = input;

  //process
  this.input = "("+this.input+")";
  this.input = this.input.replaceAll(" ", ""); //usun spacje
  this.input = this.input.replaceAll("\\(-","(0-"); //0 przed minusami
  this.input = this.input.replaceAll("([)0-9])\\(","$1*("); //mnozenie miedzy liczbami i nawiasami
  this.input = this.input.replaceAll("([^a-zA-Z][a-zA-Z])\\(","$1*(");
  this.input = this.input.replaceAll("([0-9])([a-zA-Z])","$1*$2");
  this.input = this.input.replaceAll("e", "2.71828182846");
  this.input = this.input.replaceAll("pi", "3.14159265359");
  // print(this.input);

  this.index = 0;
  this.getNext = function(){
    if(this.index>=this.input.length)
      return null;
    aktualnyZnak = this.input[this.index];
    if(isDigit(aktualnyZnak))
    {
      liczba = parseInt(aktualnyZnak);
      ilePoPrzecinku = 0;
      while(true)
      {
        this.index++;
        aktualnyZnak = this.input[this.index];
        if(isDigit(aktualnyZnak)){
          if(ilePoPrzecinku<1)
            liczba = liczba*10+parseInt(aktualnyZnak);
          else{
            liczba = liczba+parseInt(aktualnyZnak)/pow(10,ilePoPrzecinku++);
          }
          continue;
        }
        else if(aktualnyZnak=="." || aktualnyZnak==","){
          ilePoPrzecinku = 1;
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
    if(wejscie==null) return wyjscie.concat(stos.reverse());
    
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

