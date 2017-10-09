const fs           = require("fs");
const __PATH__     = require("path");
const ContentTypes = require("./ContentTypes");
const Toolbox      = require("./Toolbox");
const CookieChef   = require("./CookieChef");
const Messages     = require("./Messages");
const {version}    = require("../package.json");
const GET_EXTENSION = (f)=>f.split("/").pop().split("\\").pop().split(".").pop();
module.exports = class {
	constructor(rd,e){
		this.rd = rd;
		this._End = e;
		this._Headers = {};
		this._Cookies = [];
		this._Status = 200;
		this._Encoding = "utf8";
		this._Message = null;
		this._JS_VARS = {};
		this._Body = "";
	}
	End(...ess){
		this.Write(...ess);
		this._Headers["Set-Cookie"] = this._Cookies.map(c=>CookieChef.cook(c));
		if(!this._Headers.hasOwnProperty("Content-Type")){
			this.Header("Content-Type","text/html");
		}
		if(this._Message==null){
			if(Messages.hasOwnProperty(this._Status)){
				this._Message = Messages[this._Status];
			}else{
				this._Message = "OK";
			}
		}
		this._End.apply({},[
			{
				Headers:this._Headers,
				Status:this._Status,
				Encoding:this._Encoding,
				Message:this._Message,
				Body:this._Body
			}
		]);
	}
	Header   (h,v){
		if(typeof h=="string"){
			if(typeof v=="string"||(typeof v=="object"&&Array.isArray(v))){
				this._Headers[h] = v;
			}else{
				for(let p in this.rd.Headers){
					if(p.toUpperCase()==h.toUpperCase()){
						return this.rd.Headers[p];
					}
				}
				return null;
			}
		}
		return this;
	}
	Cookie   (c,v,o){
		if(typeof c=="string"&&c.length>0){
			if(typeof v=="string"&&v.length>0){
				let _CK = {
					Name:c,
					Value:v
				};
				if(typeof o!=="undefined"){
					_CK = Object.assign(o,_CK);
				}
				this._Cookies.push(_CK);
				return this;
			}
			if(typeof v=="undefined"&&this.rd.Cookies.hasOwnProperty(c)){
				return this.rd.Cookies[c];
			}
		}
		return null;
	}
	Status   (s){
		if(typeof s=="undefined"){
			return this._Status;
		}else if(typeof s=="number"){
			this._Status = s;
			return this;
		}
		return false;
	}
	Encoding (e){
		if(typeof e=="undefined"){
			return this._Encoding;
		}else if(typeof e=="string"){
			this._Encoding = e;
			return this;
		}
		return false;
	}
	Write    (...stw){
		for(let i=0;i<stw.length;i++){
			this._Body += stw[i];
		}
		return this;
	}
	Serve    (f="",c=false,v={}){
		if(typeof f=="string"&&typeof c=="boolean"&&typeof v=="object"){
			let fipa = f;
			if(!c){
				fipa = __PATH__.join(this.rd.Base,fipa);
			}
			if(fs.existsSync(fipa)&&fs.statSync(fipa).isFile()){
				if(Object.keys(v).length>0){
					this.Write(new Buffer(fs.readFileSync(fipa)).toString().replace(/\#\[([A-Za-z0-9_$]+)\]/g,(full,var_name)=>v[var_name]));
				}else{
					this.Encoding("base64");
					this.Write(new Buffer(fs.readFileSync(fipa)).toString("base64"));
					let FCT = Toolbox.GetValue(GET_EXTENSION(fipa),ContentTypes);
					if(FCT!==null&&!Toolbox.Has("Content-Type",this._Headers)){
						this.Header("Content-Type",FCT);
					}
				}
				return this;
			}
		}
		return false;
	}
	Message  (m){
		if(typeof m=="undefined"){return this._Message;}
		if(typeof m=="string"&&m.length>0){
			this._Message=m;
			return this;
		}
		return false;
	}
	Error(code){
		if(Messages.hasOwnProperty(code)){
			this.Status(code);
			this.Serve(__PATH__.join(__dirname,"Pages","Error.html"),true,{
				code:code,
				message:Messages[code],
				version
			});
		}
	}
	Field(p){
		if(typeof p=="string"&&p.length>0&&this.rd.Data.hasOwnProperty(p)){
			return this.rd.Data[p];
		}
		return null;
	}
	Parameter(p){
		if(typeof p=="string"&&p.length>0&&this.rd.Parameters.hasOwnProperty(p)){
			return this.rd.Parameters[p];
		}
		return null;
	}
	get Fields(){
		return this.rd.Data;
	}
	get Parameters(){
		return this.rd.Parameters;
	}
	get Headers(){
		return this.rd.Headers;
	}
	get URL(){
		return this.rd.URL;
	}
	get Path(){
		return this.rd.Path;
	}
	get Cookies(){
		return this.rd.Cookies;
	}
	get Raw(){
		return this.rd.Raw;
	}
	get Method(){
		return this.rd.Method;
	}
};