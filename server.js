var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use(express.static(__dirname));
serv.listen(3000);//listen to port 3000
var io = require('socket.io')(serv);
console.log("server connected");

///////////////////////////////////////

function GenerateValidExpression()
{
    var size = Math.round(Math.random() * (50 - 30) + 30);
    if(size % 2 == 1)
        size++;
    
    var s = "";
    while(size--)
    {
        //true means ( , false means )
        var rand = Boolean(Math.round(Math.random()));
        if(rand===true)
            s += '(';
        else
            s += ')';
    }

    return s;
}

function CheckValidExpression(s)
{
    var c = 0;
    for(var i = 0; i<s.length;i++)
    {  
        if(s[i]=='(')
            c++;
        else if(c>0)
            c--;
        else
            return false;
    }
    return c==0;
}

function ToHTML(s)
{
    var output = "";
    for(var i = 0; i < s.length; i++)
    {
        if(i!=0)
            output += "<span class=''>" + s[i] + "</span>";
        else
            output += "<span class='active'>" + s[i] + "</span>";
    }
    return output;
}

io.sockets.on('connection', function (socket) {
    var expression;
    var index = 0;

    do {
        expression = GenerateValidExpression();
    }while(!CheckValidExpression(expression));

    socket.emit("HTMLExpression", {
        html: ToHTML(expression)
    });

    socket.on("RequestDeleteCharacter", function(){
        if(index != 0 && index != expression.length)
        {
            socket.emit("ResponseDeleteCharacter",{
                index: index
            });
            index--;
        }
    });

    socket.on("RequestAddCharacter", function(data){
        if(index != expression.length)
        {
            socket.emit("ResponseAddCharacter",{
                index: index,
                expreesionsize: expression.length,
                valid: (expression.charCodeAt(index) == data.keycode)
            });
            index++;
        }
    });
    




});

