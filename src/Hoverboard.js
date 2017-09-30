const fs           = require("fs");
const url          = require("url");
const qs           = require("querystring");
const http         = require("http");
const https        = require("https");
const {ActualPath} = require("./Toolbox");
const Controller   = require("./Controller");
const CookieChef   = require("./CookieChef");
const __PATH__     = require("path");
const {version}    = require("../package.json");
module.exports     = class {
	constructor(options){
		this.config = {
			port        : 5000,
			https_port  : 3000,
			host        : "127.0.0.1",
			encrypted   : false,
			tls_options : {}
		};
		this._index        = null;
		this._indexRoutes  = [];
		this._main = (c)=>c.End();
		this.endpoints    = [];
		this.server       = null;
		this.https_server = null;
		this._NotFound    = c=>{c.Error(404);c.End();};
		this._base = null;
	}
	index(f){
		if((typeof f!=="function"&&typeof f!=="string")||(typeof f=="string"&&f.length==0)){return false;}
		if(typeof f=="string"){
			let tfp = __PATH__.join(this.__BASE__,f);
			if(fs.existsSync(tfp)&&
			   fs.statSync(tfp).isFile()){
				this._index = tfp;
				return this;
			}
		}else if(typeof f=="function"){
			return this.main(f);
		}
		return false;
	}
	indexRoute(r){
		if(typeof r=="string"&&r.length>0){
			this._indexRoutes.push(ActualPath(r).toLowerCase());
			return this;
		}else if(typeof r=="object"&&r!==null&&r instanceof RegExp){
			this._indexRoutes.push(r);
			return this;
		}
		return false;
	}
	main(c){
		if(typeof c=="function"){
			this._main = c;
			return this;
		}
		return false;
	}
	endpoint(s,c){
		if(((typeof s=="string"&&s.length>0&&ActualPath(s)!=="/")||(typeof s=="object"&&s!==null&&s instanceof RegExp))&&typeof c=="function"){
			let apoas = typeof s=="string"?ActualPath(s).toLowerCase():s;
			if(typeof apoas=="string"&&apoas.charAt(0)=="/"){
				apoas = apoas.slice(1);
			}
			this.endpoints.push({
				Path:apoas,
				Controller:c
			});
			return this;
		}
		return false;
	}
	base(b){
		if(typeof b=="string"&&b.length>0&&fs.existsSync(b)&&fs.statSync(b).isDirectory()&&this._base==null){
			this._base = b;
			return this;
		}
		return false;
	}
	set(p,v){
		if(typeof p=="string"&&
		   this.config.hasOwnProperty(p)&&
		   typeof(this.config[p])==typeof(v)){
				this.config[p]=v;
				return this;
		}
		return false;
	}
	notFound(n){
		if(typeof n=="function"){
			this._NotFound = n;
			return this;
		}
		return false;
	}
	request(path,method,data,headers,protocol,full_path,raw){
		return new Promise((resolve,reject)=>{
			let pu = url.parse(path,true);
			let cont_inq = this.getController(pu.pathname);
			let host = "null";
			let cookies = "";
			for(let p in headers){
				if(p.toUpperCase()=="HOST"){
					host = headers[p];
				}else if(p.toUpperCase()=="COOKIE"){
					cookies = headers[p];
				}
			}
			cookies = CookieChef.eat(cookies);
			let HTTP_CONTROLLER = new Controller({
				Headers:Object.assign({},headers),
				Data:Object.assign({},data),
				Parameters:Object.assign({},pu.query),
				Method:method,
				Path:pu.pathname,
				URL:protocol+"://"+host+full_path,
				Cookies:Object.assign({},cookies),
				Base:this.__BASE__,
				Raw:raw
			},resolve);
			let pupaac = ActualPath(pu.pathname);
			if(this._index!==null&&pupaac=="/"||this._indexRoutes.indexOf(pupaac)>-1||this._indexRoutes.map(r=>typeof r=="object"&&r.test(pupaac)).indexOf(true)>-1){
				HTTP_CONTROLLER.Serve(this._index,true);
			}
			cont_inq.apply({},[HTTP_CONTROLLER]);
		});
	}
	servers(){
		let server_callback = (req,res)=>{
			let body = "";
			let method = req.method.toUpperCase();
			let protocol = "http"+((typeof req.connection.encrypted!=="undefined")?"s":"");
			req.on("data",chunk=>{
				body+=chunk;
			}).on("end",()=>{
				let request_data = qs.parse(body);
				let _url = ActualPath(req.url);
				if(_url!=="/"){
					_url = _url.slice(1);
				}
				this.request(_url,req.method.toUpperCase(),request_data,req.headers,protocol,req.url).then(results=>{
					res.writeHead(results.Status,results.Message,results.Headers);
					if(results.Body.length>0){
						res.end(results.Body,results.Encoding);
					}else{
						res.end();
					}
				}).catch(r=>{
					res.end("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>HTTP Error 500</title></head><body><h1>HTTP Error 500</h1><h2>Internal Server Error</h2></body></html>");
				});
			});
		};
		let ss = {
			http:http.createServer(server_callback)
		};
		if(this.config.encrypted){
			ss.https = https.createServer(server_callback,this.config.tls_options);
		}
		return ss;
	}
	start(){
		let servers = this.servers();
		this.server = servers.http;
		if(servers.hasOwnProperty("https")){
			this.https_server = servers.https;
			servers.https.listen(this.config.https_port,this.config.host);
		}
		servers.http.listen(this.config.port,this.config.host);
	}
	public(f="",u){
		if(typeof f!=="string"&&f.length>0){return false;}
		let fupatofo = __PATH__.join(this.__BASE__,f);
		if(fs.existsSync(fupatofo)){
			let n = typeof u=="string"?ActualPath(u):__PATH__.basename(fupatofo);
			if(n.charAt(0)=="/"){
				n = n.slice(1);
			}
			let fst = fs.statSync(fupatofo);
			if(fst.isDirectory()){
				this.endpoint(new RegExp(n+"(\\\/.*)?"),c=>{
					let supa = __PATH__.join(fupatofo,c.Path.slice(n.length));
					if(fs.existsSync(supa)){
						c.Serve(supa,true);
					}else{
						c.Error(404);
					}
					c.End();
				});
				return this;
			}else if(fst.isFile()){
				this.endpoint(n,c=>{
					c.Serve(fupatofo,true);
					c.End();
				});
				return this;
			}
		}
		return false;
	}
	getController(p){
		let psap = ActualPath(p).toLowerCase();
		if(typeof p=="string"&&p.length>0){
			if(psap=="/"||this._indexRoutes.indexOf(psap.toLowerCase())>-1||this._indexRoutes.map(r=>typeof r=="object"&&r.test(psap)).indexOf(true)>-1){
				return this._main;
			}else{
				for(let i=0;i<this.endpoints.length;i++){
					if((typeof this.endpoints[i].Path=="string"&&this.endpoints[i].Path==psap)||(typeof this.endpoints[i].Path=="object"&&this.endpoints[i].Path.test(psap))){
						return this.endpoints[i].Controller;
					}
				}
			}
		}
		return this._NotFound;
	}
	get __BASE__(){
		return ((this._base==null)?"":this._base);
	}
};