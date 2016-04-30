#!/usr/bin/env node
var app = require('commander');
var co = require('co');
var prompt = require('co-prompt');
var request = require('superagent');
var chalk = require('chalk');
var fs = require('fs');
var progress = require('progress');



app
 .arguments('<file>')
 .option('-u, --username <username>', 'The user to authenticate as')
 .option('-p, --password <password>', 'The user\'s password')
 .option('-s, --service <service>','The service you want to connect to')
 .action(function(file) {
 	co(function *(){
 		var username = yield prompt(' username: ');
 		var password = yield prompt.password(' password: ');
		

 		var fileSize = fs.statSync(file).size;
		var fileStream = fs.createReadStream(file);
		var barOpts = {
			width: 20,
			total: fileSize,
			clear: true
		};
		var bar = new progress(' uploading [:bar] :percent :etas', barOpts);
		fileStream.on('data', function (chunk) {
		bar.tick(chunk.length);
		});





		request
		 .post('https://api.bitbucket.org/2.0/snippets/')
		 .auth(username,password)
		 .attach('file',file)
		 .set('Accept','application/json')
		 .end(function(err,res){
		 	if(!err && res.ok){
		 		var link = res.body.links.html.href;
		 		console.log(chalk.bold.green('Snippet created: ' + link));
		 		process.exit(0);
		 	}
		 	var errormsg;
		 	if(res && res.status===401){
		 		errormsg='Bad Username/Password';
		 	}else if(err){
		 		errormsg=err;
		 	}else{
		 		errormsg=res.text;
		 	}
		 	console.error(chalk.bold.red('Error encountered:'+errormsg));
		 	process.exit(1);
		 }) 		
 	});
 })
 .parse(process.argv);