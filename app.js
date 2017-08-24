/**
 * New node file
 */

var express=require('express');
var mongoose=require('mongoose')
var app=express();
var bodyParser=require('body-parser')
var sessions=require('client-sessions')
var bcrypt=require('bcryptjs')
var HashMap=require('hashmap')
app.set('view engine', 'pug')
app.use(sessions({
	cookieName:'session',
	secret:'yuytyutyu1982738129381278927aksjhdjkas',
	duration:30*60*1000,
	activeDuration:10*60*1000,
	
	
}))
app.use(bodyParser.urlencoded({extended :true}))

app.locals.pretty = true;	

mongoose.connect('mongodb://localhost:28017/user')
mongoose.set('debug', true);
var User=mongoose.model('users',new mongoose.Schema({
	id:mongoose.Schema.ObjectId,
	name:String,
	email:	{ type: String, unique: true},
	password:String
})

);

var Game=mongoose.model('games',new mongoose.Schema({
	id:mongoose.Schema.ObjectId,
	numbeOfPlayers:Number,
	gameStartTime:Date,
	gameWinnerUserId:{type:mongoose.Schema.Types.ObjectId,ref:'users'},
	gameTestString:[Number],
	gameCompleted:Boolean,
	gameTimedOut:Boolean
})
);

var GameTry=mongoose.model('gametries',new mongoose.Schema({
	id:mongoose.Schema.ObjectId,
	userId:{type:mongoose.Schema.Types.ObjectId,ref:'users'},
	gameId:{type:mongoose.Schema.Types.ObjectId,ref:'games'},
	tryCount:Number,
	tryTime:Date,
	tryResult:[Number],
	tryData:[Number]
})
);

app.get('/',function(req,res){	
	
	res.render('index', { pageTitle: 'Welcome to Code Cracker',appTitle:'Code Cracker'})
	
});


app.get('/register',function(req,res){	
	
	res.render('register', { pageTitle: 'Register to  Code Cracker',appTitle:'Code Cracker'})
	
	
});
app.post('/register',function(req,res){	
	
	//res.render('register', { pageTitle: 'Register to  Code Cracker',appTitle:'Code Cracker'})
	//res.send(req.body)
	passwdHash=bcrypt.hashSync(req.body.usr_password,bcrypt.genSaltSync(10));
	var user=new User({
		name:req.body.usr_name,
		email:req.body.usr_email,
		password:passwdHash		
		
	})
	user.save(function(err){
		
		if(err){
			console.log(err)
		var error="Somthing bad Happened .PLease try again Later!"
		if(err.code==11000)
		{
			
			error="email already exists please try try forgot password or try another email"
		}
		
		res.render('register',{error:error})
		}else{
			res.redirect('/dashbord')			
		}
		
	})
	
});

app.get('/login',function(req,res){
	res.render('login', { pageTitle: 'Login to  Code Cracker',appTitle:'Code Cracker'})
	
});
app.post('/login',function(req,res){
	User.findOne({email:req.body.usr_email},function(err,usr){
		
	if(!usr||!bcrypt.compareSync(req.body.usr_password,usr.password)){
	res.render('login',{error:"Invalid Username or Password"})
		
	}else{
		req.session.user=usr;
		res.redirect('/dashbord')
		
	}
		
		
	})
	//res.send(req.body)
});
app.get('/dashbord',function(req,res){
	
	if(req.session && req.session.user && req.session.user.email){
		User.findOne({email:req.session.user.email},function(err,usr){
			if(!usr){
				req.session.reset();
				res.redirect('/');
			}else{
				
				res.locals.user=usr;
				res.render('dashbord', { pageTitle: 'Hi'+ req.session.user.name+',Welcome to  Your Game Dashbord!',appTitle:'Code Cracker'})
				
			}
			
		}
		)
		
	}else{
	req.session.reset();
	res.redirect('/');
	}
	//res.send(req.body)
});

app.get('/join_game_single',function(req,res){
	//createSession();
	//if user is not logged in Ask him to login
	//
	if(req.session && req.session.user && req.session.user.email){
		User.findOne({email:req.session.user.email},function(err,usr){
			if(!usr){
				req.session.reset();
				res.redirect('/');
			}else{
				
				res.locals.user=usr;
				req.session.user=usr;
				//res.render('dashbord', { pageTitle: 'Hi'+ req.session.user.name+',Welcome to  Your Game Dashbord!',appTitle:'Code Cracker'})
				//does  user already have  a game ?
				if(req.session.game && req.session.game.singlegame && req.session.game.singlegame._id){
							
				GameTry.find({	userId:req.session.user._id,gameId:req.session.game.singlegame._id},function(error,tries){
						res.render('single_game', {game:req.session.game,tryList:tries})
					});
				
				}
				else{
					
					//Create a new game for the user
				
				var objectToSave={
						//userId:usr._id,
						numbeOfPlayers:1,
						gameStartTime:new Date(),
						gameWinnerUserId:null,
						gameTestString:returnRandomArray(5),
						gameCompleted:false,
						gameTimedOut:false
					}
				var gameObj=new Game(objectToSave)
				
				gameObj.save(function(err,game){
					console.log(err)
					if(err){
					var error="Something bad Happened .Unable to Create Game"
					
					res.render('dashbord',{error:error})
				}else{
						req.session.game={};						
						req.session.game.singlegame=game;
						req.session.game.singlegame.tryCount=0;
						res.render('single_game')
					}
				
				});	
				
				//res.send("it is good to see you here");
				
				
				}
				
				//Write common code for Returned game of for a new game..
				//Add a UI table and keep adding frozen rows the last one should be editable 
				//the validate button of the row should give results
				// the r
				//req.session.game.single
				
				
			}
			
		});
		
	}
	else{
		req.session.reset();
		res.redirect('/');
		}
	
});

app.post('/join_game_single',function name(req,res) {
	var inputArray=[req.body.firstNum,req.body.secondNum,req.body.thirdNum,req.body.fourthNum,req.body.fifthNum];
	req.session.game.singlegame.tryCount++;
	var result= checkNumber(inputArray,req.session.game.singlegame.gameTestString);
  
	var gameTryObj={
	userId:req.session.user._id,
	gameId:req.session.game.singlegame._id,
	tryCount:req.session.game.singlegame.tryCount,
	tryTime:new Date(),
	tryResult:result,
	tryData:inputArray
};
var mGameTryObj=new GameTry(gameTryObj);
 mGameTryObj.save(function (err,gameTry) {
// 		if(err){
// 					var error="Something bad Happened .Unable to Play  Game Please Restart"
					
// 					res.render('dashbord',{error:error})
// 				}else{
					GameTry.find({	userId:req.session.user._id,	gameId:req.session.game.singlegame._id},function(error,tries){
						res.render('single_game', {game:req.session.game,tryList:tries})
					});
					// }
});
	
});
app.post('/leave_game',function(req,res){
	
	
});

app.get('/single_game',function(req,res){
	
	
});
app.get('/single_game',function(req,res){
	
	
});

app.get('/getGameState',function(req,res){
	
	
});
app.get('/getUserList',function(req,res){
	
	
});
app.get('/logout',function(req,res){
	
	req.session.reset();
	res.redirect('/');
});

// return array of Random number

var getFreshNumberArray= function getFreshNumberArray(){
	var  seedNumberArray = new Array(1,2,3,4,5,6,7,8,9)
	return seedNumberArray.slice(0);
	
}
function returnRandomArray(length){
	var returnArray=[];
	if(length>9){
		return null;
	//we are not spporting more than nine chars	
	}
	
	var localArray=getFreshNumberArray()
	console.log(localArray)
	for(i=0;i<length;i++)
	{
		console.log(localArray.length-i)
		var randomIntVal=randomInt(localArray.length-i)
		returnArray.push(localArray.splice(randomIntVal,1)[0]);
	}
	
	return returnArray
	
	
}



function randomInt (length) {
	if((Math.floor(Math.random())*121)%2==1){
		
		 return Math.floor((Math.random()*length))
	}
	else{
		 return Math.ceil((Math.random()*length))
	}
	
   
    
}
function checkNumber(inputArray,checkArray)
{
	//get an array of number and  check Array 
	//Use a hashmap to get the value of  right and wrong

var map = new HashMap();
//multiply by 5 if in checkarray
//multiply by 2 if in inputarray
//right are if found at same place
var rightCount=0;
var wrongCount=0;
for (var index = 0; index < inputArray.length; index++) {
	var inputElem=inputArray[index];
	var checkElem=checkArray[index]+"";
	if(inputElem==checkElem){
		rightCount++
	}
	else{
		var checkMapVal=map.get(checkElem);
		var inputMapVal=map.get(inputElem);
		if(!checkMapVal){
			map.set(checkElem,5)
		}else{
			map.set(checkElem,(checkMapVal*5))
		}
		if(!inputMapVal){
			map.set(inputElem,2)
		}else{
			map.set(inputElem,(inputMapVal*2))
		}
	}
	
}

map.forEach(function(value, key) {
    
	var prespectiveVal=Math.floor(Math.log10(value))
	while(prespectiveVal>0){
	if(value % Math.pow(10,prespectiveVal)==0){
		break;
	}else{
		prespectiveVal--;
	}
	}
	
	wrongCount+=prespectiveVal;
});
	return([rightCount,wrongCount]);
}

app.listen(3500, function () {
  console.log('PROD app listening on port 3500!')
})
