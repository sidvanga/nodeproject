var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('dummy', ['users']);
var ObjectId = mongojs.ObjectId;
var app = express();


/*
var logger = function(req,res,next){
	console.log('Logging...');
	next();
}

app.use(logger);
*/

//view engine

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));


// Body parser middle ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// set Static Path
app.use(express.static(path.join(__dirname,'public')));

// Global vars

app.use(function(req,res,next){
	res.locals.errors = null;
	next();
});
//Express validator middleware
app.use(expressValidator({
	errorFormatter:function(param,msg,value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;
		while(namespace.length){
			formParam +='[' + namespace.shift() + ']';
		}

		return{
			param : formParam,
			msg : msg,
			value : value
		}
	}

}))

app.get('/',function(req,res){
	db.users.find(function (err, docs) {
			res.render('index',{
			title:'Customers',
			users:docs
		});
	});
}); 


app.get('/manage/users',function(req,res){
		var userid = ObjectId(req.query.userid);
		// var userData = {name:'',mobile:'',email:'',_id:''};
		db.users.find({_id:userid},function(err,docs){
			var docData = {name:'',mobile:'',email:'',_id:''};
				if(docs != ''){
					res.render('manage',{
						users:null,
						userdata:docs[0]	
					});
				} else {
					res.render('manage',{
						users:null,
						userdata:{name:'',mobile:'',email:'',_id:''}	
					});
				}	

			});		
}); 

app.delete('/users/delete/:id',function(req,res){
	db.users.remove({_id:ObjectId(req.params.id)},function(err,result){
		if(err){
			console.log(err);
		}
		res.redirect('/');

	});
}); 


app.post('/manage/users',function(req,res){
	req.checkBody('name', 'Name is required and must contain 3 characters').isLength({ min: 3});
	req.checkBody('mobile', 'Mobile is required and must be 10 digits').isLength({ min: 10,max:10 });
	req.checkBody('email', 'Email is required and should be in a format').isEmail();
	req.checkBody('mobile', 'Mobile number must be a numeric').isNumeric();

	var errors = req.validationErrors();

	if(errors){
		res.render('manage',{
		title:'Customers',
		errors:errors,
		userdata:{name:req.body.name,mobile:req.body.mobile
				,email:req.body.email,_id:req.body.userid},
		users:null
	});
	} else {

		var userData = {
			name:req.body.name,
			mobile:req.body.mobile,
			email:req.body.email
		}	

		var objId = req.body.userid;

		if( objId !='' ){
			db.users.update({_id:ObjectId(objId)},userData,function(err,result){
				if(err){
					console.log(err)
				}
			});

		} else {
			db.users.insert(userData,function(err,result){
				if(err){
					console.log(err)
				}
			});
		}

		// console.log(objId);
res.redirect('/');

	}

}); 


app.listen(3000,function(){
	console.log("server started on 3000");
})