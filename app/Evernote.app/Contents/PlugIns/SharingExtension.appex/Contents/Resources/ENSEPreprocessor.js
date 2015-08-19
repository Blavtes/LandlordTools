
(function(){var log=(function(){"use strict";function ENSELogHandler(){}
function commonLog(type,msg){console.log(type+": ",msg);}
ENSELogHandler.prototype.warn=function(msg){commonLog('warn',msg);};ENSELogHandler.prototype.error=function(msg){commonLog('error',msg);};ENSELogHandler.prototype.exception=function(msg){commonLog('exception',msg);};return new ENSELogHandler();})();window.Note=function(){this.guid=null;this.title=null;this.content=null;this.contentHash=null;this.contentLength=null;this.created=null;this.updated=null;this.deleted=null;this.active=null;this.updateSequenceNum=null;this.notebookGuid=null;this.tagGuids=null;this.resources=null;this.attributes=null;};window.NoteAttributes=function(){this.subjectDate=null;this.latitude=null;this.longitude=null;this.altitude=null;this.author=null;this.source=null;this.sourceURL=null;this.sourceApplication=null;this.shareDate=null;this.reminderOrder=null;this.reminderDoneTime=null;this.reminderTime=null;this.placeName=null;this.contentClass=null;this.applicationData=null;this.lastEditedBy=null;this.classifications=null;this.creatorId=null;this.lastEditorId=null;this.sharedWithBusiness=null;};window.Resource=function(){this.guid=null;this.noteGuid=null;this.data=null;this.mime=null;this.width=null;this.height=null;this.duration=null;this.active=null;this.recognition=null;this.attributes=null;this.updateSequenceNum=null;this.alternateData=null;};window.ResourceAttributes=function(){this.sourceURL=null;this.timestamp=null;this.latitude=null;this.longitude=null;this.altitude=null;this.cameraMake=null;this.cameraModel=null;this.clientWillIndex=null;this.recoType=null;this.fileName=null;this.attachment=null;this.applicationData=null;};window.Data=function(){this.bodyHash=null;this.size=null;this.body=null;};EDAM_MIME_TYPE_GIF='image/gif';EDAM_MIME_TYPE_JPEG='image/jpeg';EDAM_MIME_TYPE_PNG='image/png';EDAM_MIME_TYPE_PDF='application/pdf';EDAM_MIME_TYPE_DEFAULT='application/octet-stream';Browser=(function(){function ENSEBrowser(){var self=this;self.handlerMap={};self.msgHandler=function(msg){var data=msg.data;var handlers=self.handlerMap[data.name];if(handlers){handlers.forEach(function(handler){handler(data);});}};window.addEventListener("message",self.msgHandler,false);}
ENSEBrowser.prototype.sendToExtension=function(msg){window.parent.postMessage(msg,"*");}
ENSEBrowser.prototype.addMessageHandlers=function(obj){Object.keys(obj).forEach(function(key){var handlers=this.handlerMap[key];if(typeof handlers==='undefined'){handlers=[];this.handlerMap[key]=handlers;}
handlers.push(obj[key]);},this);}
ENSEBrowser.prototype.cleanUp=function(){window.removeEventListener("message",this.msgHandler,false);}
return new ENSEBrowser();})();var GlobalUtils={};(function(){"use strict";GlobalUtils.NOTEBOOK_TYPE_PERSONAL=1;GlobalUtils.NOTEBOOK_TYPE_LINKED=2;GlobalUtils.NOTEBOOK_TYPE_BUSINESS=3;var urlMatcher=/^(.*?):\/\/((www\.)?(.*?))(:\d+)?(\/.*?)(\?.*)?$/;GlobalUtils.componentizeUrl=function(url){var data={protocol:null,domain:null,domainNoWww:null,port:null,path:null,queryString:null};var matches=urlMatcher.exec(url);data.protocol=matches[1];data.domain=matches[2];data.domainNoWww=matches[4];data.port=matches[5];data.path=matches[6];data.queryString=matches[7];return data;};GlobalUtils.localize=function(element){var node=element.nodeName.toLowerCase();if(node=="input"||node=="textarea"){switch(element.type){case"text":if(element.attributes["placeholder"]){var localizedMessage=Browser.i18n.getMessage(element.attributes["placeholder"].value);if(localizedMessage){element.placeholder=localizedMessage;}}
case"textarea":case"button":case"submit":case"search":if(element.attributes["placeholder"]){var localizedMessage=Browser.i18n.getMessage(element.attributes["placeholder"].value);if(localizedMessage){element.placeholder=localizedMessage;}}
if(element.attributes["message"]){var localizedMessage=Browser.i18n.getMessage(element.attributes["message"].value);if(localizedMessage){element.value=localizedMessage;}}
break;case"checkbox":case"password":case"hidden":case"radio":break;default:throw new Error("We need to localize the value of input elements.");}}
else if(element.attributes["message"]){var localizedMessage=Browser.i18n.getMessage(element.attributes["message"].value);if(localizedMessage){element.innerHTML=localizedMessage;}}
if(element.title){var localizedTitle=Browser.i18n.getMessage(element.title);if(localizedTitle){element.title=localizedTitle;}}
for(var i=0;i<element.children.length;i++){GlobalUtils.localize(element.children[i]);}};GlobalUtils.getQueryParams=function(url){var data=GlobalUtils.componentizeUrl(url);var queryString=data.queryString;var params={};if(!queryString){return params;}
queryString=queryString.substr(1);queryString=queryString.split("#")[0];var pairs=queryString.split("&");var i;for(i=0;i<pairs.length;i++){var item=pairs[i].split("=");if(item[1]){item[1]=item[1].replace(/\+/g," ");}
params[item[0].toLowerCase()]=item[1];}
return params;};GlobalUtils.escapeXML=function(str){return str.replace(/&|<|>|"|'/g,function(match){if(match=="&"){return"&amp;";}else if(match=="<"){return"&lt;";}else if(match==">"){return"&gt;";}else if(match=="\""){return"&quot;";}else if(match=="'"){return"&apos;";}});};GlobalUtils.unescapeXML=function(str){return str.replace(/&(amp|lt|gt|quot|apos);/g,function(match){if(match=="&amp;"){return"&";}else if(match=="&lt;"){return"<";}else if(match=="&gt;"){return">";}else if(match=="&quot;"){return"\"";}else if(match=="&apos;"){return"'";}});};GlobalUtils.getNoteURI=function(baseUrl,message,userId,token){return baseUrl+"/SetAuthToken.action?auth="+encodeURIComponent(token)
+"&targetUrl="+encodeURIComponent("/shard/"+message.shardId
+"/nl/"+userId+"/"+message.noteGuid+"/");};GlobalUtils.buildGoogleRegEx=function(){var googleCountryDomains=[".com",".ad",".ae",".com.af",".com.ag",".com.ai",".am",".co.ao",".com.ar",".as",".at",".com.au",".az",".ba",".com.bd",".be",".bf",".bg",".com.bh",".bi",".bj",".com.bn",".com.bo",".com.br",".bs",".co.bw",".by",".com.bz",".ca",".cd",".cf",".cg",".ch",".ci",".co.ck",".cl",".cm",".cn",".com.co",".co.cr",".com.cu",".cv",".com.cy",".cz",".de",".dj",".dk",".dm",".com.do",".dz",".com.ec",".ee",".com.eg",".es",".com.et",".fi",".com.fj",".fm",".fr",".ga",".ge",".gg",".com.gh",".com.gi",".gl",".gm",".gp",".gr",".com.gt",".gy",".com.hk",".hn",".hr",".ht",".hu",".co.id",".ie",".co.il",".im",".co.in",".iq",".is",".it",".je",".com.jm",".jo",".co.jp",".co.ke",".com.kh",".ki",".kg",".co.kr",".com.kw",".kz",".la",".com.lb",".li",".lk",".co.ls",".lt",".lu",".lv",".com.ly",".co.ma",".md",".me",".mg",".mk",".ml",".mn",".ms",".com.mt",".mu",".mv",".mw",".com.mx",".com.my",".co.mz",".com.na",".com.nf",".com.ng",".com.ni",".ne",".nl",".no",".com.np",".nr",".nu",".co.nz",".com.om",".com.pa",".com.pe",".com.ph",".com.pk",".pl",".pn",".com.pr",".ps",".pt",".com.py",".com.qa",".ro",".ru",".rw",".com.sa",".com.sb",".sc",".se",".com.sg",".sh",".si",".sk",".com.sl",".sn",".so",".sm",".st",".com.sv",".td",".tg",".co.th",".com.tj",".tk",".tl",".tm",".tn",".to",".com.tr",".tt",".com.tw",".co.tz",".com.ua",".co.ug",".co.uk",".com.uy",".co.uz",".com.vc",".co.ve",".vg",".co.vi",".com.vn",".vu",".ws",".rs",".co.za",".co.zm",".co.zw",".cat"];for(var i=0;i<googleCountryDomains.length;i++){googleCountryDomains[i]=googleCountryDomains[i].replace(/\./g,"\\.");}
return new RegExp("^https?://www\.google("+googleCountryDomains.join("|")+")/","i");};GlobalUtils.removePunctuation=function(text){var dashes=["-","_","\u2013","\u2014","\u00B7"];var brackets=["\\(","\\)","\\[","\\]","\\{","\\}","\u300A","\u300B","\uFF08","\uFF09","\u3010","\u3011","\u300C","\u300D","\u00BB"];var punc=["\\.","!","\:","\;","\"","\'",",","\\?","\u3002","\u3001","\uFF01","\uFF0C","\uFF1A","\u2026","\u201C","\u201D"];var misc=["@","#","\\$","%","\\^","&","\\*","\\+","=","`","~","/","\\\\","\\|",">","<","\u25CF"];var regex=new RegExp(dashes.join("|")+"|"+brackets.join("|")+"|"+punc.join("|")+"|"+misc.join("|"),"g");return text.replace(regex," ");};GlobalUtils.setupCache=function(obj,maxKeys,maxAge){return function(){function cullCache(userId,key,callback){IDB.deleteGroup(userId,key,"timestamp",IDBKeyRange.upperBound(new Date(new Date()-maxAge),true),callback,function(msg){log.error(msg);});}
obj.get=function(userId,type,key,callback){cullCache(userId,type+obj.idbStoreSuffix,function(){IDB.get(userId,type+obj.idbStoreSuffix,key,function(cached){callback(cached);},function(msg){log.error(msg);});});};obj.add=function(userId,type,key,content){cullCache(userId,type+obj.idbStoreSuffix,function(){content.timestamp=new Date();IDB.set(userId,type+obj.idbStoreSuffix,key,content,function(){IDB.getGroup(userId,type+obj.idbStoreSuffix,null,null,function(records){if(records&&records.length>maxKeys){var minTimestamp;for(var i=0;i<records.length;i++){if(!minTimestamp||records[i].timestamp<minTimestamp){minTimestamp=records[i].timestamp;}}
IDB.deleteGroup(userId,type+obj.idbStoreSuffix,"timestamp",minTimestamp,function(){});}});});},function(msg){log.error(msg);});};}};GlobalUtils.removeControlCharacters=function(str){if(!str){return str;}
return str.replace(/[\u0000-\u0008\u000B-\u001F\u0080-\u009F\uFFF0-\uFFFF]/g,"");};GlobalUtils.createTitleAndLinkPortionOfUrlClipContent=function(title,url){var titleAttr=title?title:Browser.i18n.getMessage("quickNote_untitledNote");var content=document.createElement("div");content.style.whiteSpace="nowrap";var t=document.createElement("div");t.textContent=titleAttr;t.style.fontFamily="Helvetica, Arial, sans-serif";t.style.fontSize="14px";t.style.fontWeight="bold";t.style.color="#0C0C0C";t.style.overflowX="hidden";t.style.textOverflow="ellipsis";t.style.paddingBottom="9px";content.appendChild(t);var d=document.createElement("div");d.style.borderTop="1px solid #D8D8D8";d.style.height="0px";d.style.width="100%";content.appendChild(d);var te=document.createElement("div");te.style.display="inline-block";te.style.verticalAlign="top";te.style.margin="15px 0px 0px 0px";te.style.width="364px";content.appendChild(te);var l=document.createElement("div");l.style.fontFamily="Helvetica, Arial, sans-serif";l.style.fontSize="12px";l.style.color="#0C0C0C";l.style.display="block";te.appendChild(l);var a=document.createElement("a");a.href=url;a.textContent=url;a.style.display="inline-block";a.style.textDecoration="none";a.style.whiteSpace="nowrap";a.style.overflow="hidden";a.style.textOverflow="ellipsis";a.style.color="#0C0C0C";a.style.width="345px";l.appendChild(a);return{content:content,textPortion:te,link:l,url:a};};GlobalUtils.parseOperatingSystem=function(str){try{if(/Windows/i.test(str)){var version=/Windows NT (.+)/.exec(str)[1];switch(version){case"3.1":return"Windows NT 3.1";case"3.5":return"Windows NT 3.5";case"3.51":return"Windows NT 3.51";case"4.0":return"Windows NT 4.0";case"5.0":return"Windows 2000";case"5.01":return"Windows 2000 SP1";case"5.1":return"Windows XP";case"5.2":return"Windows XP x64";case"6.0":return"Windows Vista";case"6.1":return"Windows 7";case"6.2":return"Windows 8";case"6.3":return"Windows 8.1";default:return"Windows";}}else if(/Mac OS X/i.test(str)){return"Mac "+/OS X(.+)/.exec(str)[1].replace(/_/g,".");}else if(/CrOS/i.test(str)){return"Chrome OS "+/CrOS(.+)/.exec(str)[1];}else if(/Linux/i.test(str)){return str;}else if(/FreeBSD/i.test(str)){return str;}
return null;}catch(err){return null;}};GlobalUtils.generateSystemInfo=function(){var browser;if(SAFARI){browser="Safari "+/Version\/(.+?)(\s|$)/.exec(navigator.userAgent)[1];}else if(OPERA){browser="Opera "+/OPR\/(.+?)(\s|$)/.exec(navigator.userAgent)[1]+"/"+/Chrome\/(.+?)(\s|$)/.exec(navigator.userAgent)[1];}else if(YANDEX){browser="Yandex "+/YaBrowser\/(.+?)(\s|$)/.exec(navigator.userAgent)[1]+"/"+/Chrome\/(.+?)(\s|$)/.exec(navigator.userAgent)[1];}else{browser="Chrome "+/Chrome\/(.+?)(\s|$)/.exec(navigator.userAgent)[1];}
var os;var parReg=new RegExp("\\((.+?)\\)","g");var parMatch=parReg.exec(navigator.userAgent);outerloop:while(parMatch){var pieces=parMatch[1].split(/;\s?/);for(var i=0;i<pieces.length;i++){var os=GlobalUtils.parseOperatingSystem(pieces[i]);if(os){break outerloop;}}
parMatch=parReg.exec(navigator.userAgent);}
if(!os){os="Unknown OS";}
if(!browser){browser="Unknown browser";}
return{browser:browser,os:os};};Object.preventExtensions(GlobalUtils);})();(function(a){if(typeof exports==="object"){module.exports=a()}else{if(typeof define==="function"&&define.amd){define("spark-md5",a)}else{var c;try{c=window}catch(b){c=self}c.SparkMD5=a()}}}(function(c){var e=function(s,r){return(s+r)&4294967295},n=function(z,v,u,r,y,w){v=e(e(v,z),e(r,w));return e((v<<y)|(v>>>(32-y)),u)},a=function(v,u,A,z,r,y,w){return n((u&A)|((~u)&z),v,u,r,y,w)},k=function(v,u,A,z,r,y,w){return n((u&z)|(A&(~z)),v,u,r,y,w)},f=function(v,u,A,z,r,y,w){return n(u^A^z,v,u,r,y,w)},p=function(v,u,A,z,r,y,w){return n(A^(u|(~z)),v,u,r,y,w)},d=function(s,u){var t=s[0],r=s[1],w=s[2],v=s[3];t=a(t,r,w,v,u[0],7,-680876936);v=a(v,t,r,w,u[1],12,-389564586);w=a(w,v,t,r,u[2],17,606105819);r=a(r,w,v,t,u[3],22,-1044525330);t=a(t,r,w,v,u[4],7,-176418897);v=a(v,t,r,w,u[5],12,1200080426);w=a(w,v,t,r,u[6],17,-1473231341);r=a(r,w,v,t,u[7],22,-45705983);t=a(t,r,w,v,u[8],7,1770035416);v=a(v,t,r,w,u[9],12,-1958414417);w=a(w,v,t,r,u[10],17,-42063);r=a(r,w,v,t,u[11],22,-1990404162);t=a(t,r,w,v,u[12],7,1804603682);v=a(v,t,r,w,u[13],12,-40341101);w=a(w,v,t,r,u[14],17,-1502002290);r=a(r,w,v,t,u[15],22,1236535329);t=k(t,r,w,v,u[1],5,-165796510);v=k(v,t,r,w,u[6],9,-1069501632);w=k(w,v,t,r,u[11],14,643717713);r=k(r,w,v,t,u[0],20,-373897302);t=k(t,r,w,v,u[5],5,-701558691);v=k(v,t,r,w,u[10],9,38016083);w=k(w,v,t,r,u[15],14,-660478335);r=k(r,w,v,t,u[4],20,-405537848);t=k(t,r,w,v,u[9],5,568446438);v=k(v,t,r,w,u[14],9,-1019803690);w=k(w,v,t,r,u[3],14,-187363961);r=k(r,w,v,t,u[8],20,1163531501);t=k(t,r,w,v,u[13],5,-1444681467);v=k(v,t,r,w,u[2],9,-51403784);w=k(w,v,t,r,u[7],14,1735328473);r=k(r,w,v,t,u[12],20,-1926607734);t=f(t,r,w,v,u[5],4,-378558);v=f(v,t,r,w,u[8],11,-2022574463);w=f(w,v,t,r,u[11],16,1839030562);r=f(r,w,v,t,u[14],23,-35309556);t=f(t,r,w,v,u[1],4,-1530992060);v=f(v,t,r,w,u[4],11,1272893353);w=f(w,v,t,r,u[7],16,-155497632);r=f(r,w,v,t,u[10],23,-1094730640);t=f(t,r,w,v,u[13],4,681279174);v=f(v,t,r,w,u[0],11,-358537222);w=f(w,v,t,r,u[3],16,-722521979);r=f(r,w,v,t,u[6],23,76029189);t=f(t,r,w,v,u[9],4,-640364487);v=f(v,t,r,w,u[12],11,-421815835);w=f(w,v,t,r,u[15],16,530742520);r=f(r,w,v,t,u[2],23,-995338651);t=p(t,r,w,v,u[0],6,-198630844);v=p(v,t,r,w,u[7],10,1126891415);w=p(w,v,t,r,u[14],15,-1416354905);r=p(r,w,v,t,u[5],21,-57434055);t=p(t,r,w,v,u[12],6,1700485571);v=p(v,t,r,w,u[3],10,-1894986606);w=p(w,v,t,r,u[10],15,-1051523);r=p(r,w,v,t,u[1],21,-2054922799);t=p(t,r,w,v,u[8],6,1873313359);v=p(v,t,r,w,u[15],10,-30611744);w=p(w,v,t,r,u[6],15,-1560198380);r=p(r,w,v,t,u[13],21,1309151649);t=p(t,r,w,v,u[4],6,-145523070);v=p(v,t,r,w,u[11],10,-1120210379);w=p(w,v,t,r,u[2],15,718787259);r=p(r,w,v,t,u[9],21,-343485551);s[0]=e(t,s[0]);s[1]=e(r,s[1]);s[2]=e(w,s[2]);s[3]=e(v,s[3])},q=function(t){var u=[],r;for(r=0;r<64;r+=4){u[r>>2]=t.charCodeAt(r)+(t.charCodeAt(r+1)<<8)+(t.charCodeAt(r+2)<<16)+(t.charCodeAt(r+3)<<24)}return u},m=function(r){var t=[],s;for(s=0;s<64;s+=4){t[s>>2]=r[s]+(r[s+1]<<8)+(r[s+2]<<16)+(r[s+3]<<24)}return t},l=function(A){var u=A.length,r=[1732584193,-271733879,-1732584194,271733878],w,t,z,x,y,v;for(w=64;w<=u;w+=64){d(r,q(A.substring(w-64,w)))}A=A.substring(w-64);t=A.length;z=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(w=0;w<t;w+=1){z[w>>2]|=A.charCodeAt(w)<<((w%4)<<3)}z[w>>2]|=128<<((w%4)<<3);if(w>55){d(r,z);for(w=0;w<16;w+=1){z[w]=0}}x=u*8;x=x.toString(16).match(/(.*?)(.{0,8})$/);y=parseInt(x[2],16);v=parseInt(x[1],16)||0;z[14]=y;z[15]=v;d(r,z);return r},o=function(z){var t=z.length,r=[1732584193,-271733879,-1732584194,271733878],v,s,y,w,x,u;for(v=64;v<=t;v+=64){d(r,m(z.subarray(v-64,v)))}z=(v-64)<t?z.subarray(v-64):new Uint8Array(0);s=z.length;y=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(v=0;v<s;v+=1){y[v>>2]|=z[v]<<((v%4)<<3)}y[v>>2]|=128<<((v%4)<<3);if(v>55){d(r,y);for(v=0;v<16;v+=1){y[v]=0}}w=t*8;w=w.toString(16).match(/(.*?)(.{0,8})$/);x=parseInt(w[2],16);u=parseInt(w[1],16)||0;y[14]=x;y[15]=u;d(r,y);return r},j=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],h=function(u){var t="",r;for(r=0;r<4;r+=1){t+=j[(u>>(r*8+4))&15]+j[(u>>(r*8))&15]}return t},b=function(r){var s;for(s=0;s<r.length;s+=1){r[s]=h(r[s])}return r.join("")},i=function(r){return b(l(r))},g=function(){this.reset()};if(i("hello")!=="5d41402abc4b2a76b9719d911017c592"){e=function(r,u){var t=(r&65535)+(u&65535),s=(r>>16)+(u>>16)+(t>>16);return(s<<16)|(t&65535)}}g.prototype.append=function(r){if(/[\u0080-\uFFFF]/.test(r)){r=unescape(encodeURIComponent(r))}this.appendBinary(r);return this};g.prototype.appendBinary=function(t){this._buff+=t;this._length+=t.length;var s=this._buff.length,r;for(r=64;r<=s;r+=64){d(this._state,q(this._buff.substring(r-64,r)))}this._buff=this._buff.substr(r-64);return this};g.prototype.end=function(t){var w=this._buff,v=w.length,u,s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],r;for(u=0;u<v;u+=1){s[u>>2]|=w.charCodeAt(u)<<((u%4)<<3)}this._finish(s,v);r=!!t?this._state:b(this._state);this.reset();return r};g.prototype._finish=function(s,w){var u=w,t,v,r;s[u>>2]|=128<<((u%4)<<3);if(u>55){d(this._state,s);for(u=0;u<16;u+=1){s[u]=0}}t=this._length*8;t=t.toString(16).match(/(.*?)(.{0,8})$/);v=parseInt(t[2],16);r=parseInt(t[1],16)||0;s[14]=v;s[15]=r;d(this._state,s)};g.prototype.reset=function(){this._buff="";this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};g.prototype.destroy=function(){delete this._state;delete this._buff;delete this._length};g.hash=function(t,r){if(/[\u0080-\uFFFF]/.test(t)){t=unescape(encodeURIComponent(t))}var s=l(t);return!!r?s:b(s)};g.hashBinary=function(s,r){var t=l(s);return!!r?t:b(t)};g.ArrayBuffer=function(){this.reset()};g.ArrayBuffer.prototype.append=function(r){var u=this._concatArrayBuffer(this._buff,r),t=u.length,s;this._length+=r.byteLength;for(s=64;s<=t;s+=64){d(this._state,m(u.subarray(s-64,s)))}this._buff=(s-64)<t?u.subarray(s-64):new Uint8Array(0);return this};g.ArrayBuffer.prototype.end=function(t){var w=this._buff,v=w.length,s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],u,r;for(u=0;u<v;u+=1){s[u>>2]|=w[u]<<((u%4)<<3)}this._finish(s,v);r=!!t?this._state:b(this._state);this.reset();return r};g.ArrayBuffer.prototype._finish=g.prototype._finish;g.ArrayBuffer.prototype.reset=function(){this._buff=new Uint8Array(0);this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};g.ArrayBuffer.prototype.destroy=g.prototype.destroy;g.ArrayBuffer.prototype._concatArrayBuffer=function(u,s){var t=u.length,r=new Uint8Array(t+s.byteLength);r.set(u);r.set(new Uint8Array(s),t);return r};g.ArrayBuffer.hash=function(r,s){var t=o(new Uint8Array(r));return!!s?t:b(t)};return g}));function Submitter(hostConnection,submitterCallback){"use strict";var doneProcessing=false;var crossSiteImagesCount=0;var crossSiteImagesCompleted=0;var resources=[];var note=new Note();var skitchNote=false;var hostConnectionID;var awaitingFetchRequests=[];function addByteArrayToNote(byteArray,loc,orig,url,fileName,attachment){if(!note.resources){note.resources=[];}
var mime=getMimeType(byteArray);var resource=buildResource(byteArray.buffer,mime,url,fileName,attachment);note.resources.push(resource);note.content=note.content.slice(0,loc)+buildResourceEmbed(byteArray.buffer,mime,orig)+note.content.slice(loc+orig.length);}
function buildResource(arraybuffer,mime,url,fileName,attachment){var resource=new Resource();resource.data=new Data();resource.data.body=arraybuffer;resource.mime=mime;resource.attributes=new ResourceAttributes();resource.attributes.sourceURL=GlobalUtils.removeControlCharacters(url);resource.attributes.fileName=fileName;if(!fileName&&url){var potentialFileName=/.+\/(.+?)(?:$|\?)/.exec(url);if(potentialFileName){try{resource.attributes.fileName=decodeURIComponent(potentialFileName[1]);}catch(err){if(err.message=="URI malformed"){resource.attributes.fileName=unescape(potentialFileName[1]);}else{throw err;}}}}
if(resource.attributes.fileName&&!hasFileExtension(resource.attributes.fileName,mime)){resource.attributes.fileName+=getFileExtension(mime);}
if(resource.attributes.fileName){resource.attributes.fileName=GlobalUtils.removeControlCharacters(resource.attributes.fileName);}
resource.attributes.attachment=!!attachment;return resource;}
function buildResourceEmbed(arraybuffer,mime,orig){var embed="<en-media type=\"";var hexHash=SparkMD5.ArrayBuffer.hash(arraybuffer);embed+=mime+"\" hash=\""+hexHash+"\"";var attrRegex=/(?:\s|")(style|title|lang|xml:lang|dir|height|width|usemap|align|border|hspace|vspace|longdesc|alt)\s*=\s*"([^"]+)"/ig;var attrMatch=attrRegex.exec(orig);var tagEndIndex=orig.indexOf(">");while(attrMatch&&attrMatch.index<tagEndIndex){if(attrMatch[2].trim()!=""){embed+=" "+attrMatch[1]+"=\""+attrMatch[2]+"\"";}
attrMatch=attrRegex.exec(orig);}
embed+="></en-media>";return embed;}
function createNote(title,tags,comment,url,clipType,noteContent,noteResources){hostConnectionID=hostConnection.registerFetchCallback(function(reply){for(var requestIdx=0;requestIdx<awaitingFetchRequests.length;requestIdx++){var fetchRequest=awaitingFetchRequests[requestIdx];if(fetchRequest.url==reply.url){fetchRequest.callback(reply.data);awaitingFetchRequests.splice(requestIdx,1);return;}}});note.attributes=new NoteAttributes();if(clipType==="clearly"){note.attributes.source="Clearly";}else{note.attributes.source="web.clip";if(clipType==="screenshot"){skitchNote=true;}}
note.attributes.sourceURL=GlobalUtils.removeControlCharacters(url);note.content="<?xml version=\"1.0\" encoding=\"utf-8\"?>"+"<!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">"+"<en-note>";if(comment&&comment.trim()){note.content+=GlobalUtils.escapeXML(comment)+"<hr/>";}
note.content+="<br/>"+noteContent+"<br/></en-note>";var resourceRegex=/<(?:img|embed|div) [^>]*?(src|evernote_attachment_url)="(data:[^>,]+,)?(resource:)?([^">]+)"[^>]*>.*?<\/(?:img|embed|div)>/g;var resourceMatch=resourceRegex.exec(note.content);var index=0;while(resourceMatch){if(resourceMatch[2]){processDataURI(resourceMatch[4],resourceMatch.index,resourceMatch[0],index++);}else if(resourceMatch[3]){processSkitch(noteResources[parseInt(resourceMatch[4])],resourceMatch.index,resourceMatch[0],index++);}else{processHyperlink(resourceMatch[4],resourceMatch.index,resourceMatch[0],resourceMatch[1],index++);}
resourceMatch=resourceRegex.exec(note.content);}
note.title=title;if(tags&&tags.length>0){note.tagNames=tags;}
doneProcessing=true;stepDone();}
function hasFileExtension(fileName,mime){if(mime===EDAM_MIME_TYPE_JPEG){return/\.jpe?g$/.test(fileName);}else if(mime===EDAM_MIME_TYPE_PNG){return/\.png$/.test(fileName);}else if(mime===EDAM_MIME_TYPE_GIF){return/\.gif$/.test(fileName);}else if(mime===EDAM_MIME_TYPE_PDF){return/\.pdf$/.test(fileName);}else if(mime==="image/webp"){return/\.webp$/.test(fileName);}
return true;}
function getFileExtension(mime){if(mime===EDAM_MIME_TYPE_JPEG){return".jpg";}else if(mime===EDAM_MIME_TYPE_PNG){return".png";}else if(mime===EDAM_MIME_TYPE_GIF){return".gif";}else if(mime===EDAM_MIME_TYPE_PDF){return".pdf";}else if(mime==="image/webp"){return".webp";}
return"";}
function getMimeType(bytes){if(bytes[0]===0xFF&&bytes[1]===0xD8&&bytes[2]===0xFF){return EDAM_MIME_TYPE_JPEG;}else if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4E&&bytes[3]===0x47&&bytes[4]===0x0D&&bytes[5]===0x0A&&bytes[6]===0x1A&&bytes[7]===0x0A){return EDAM_MIME_TYPE_PNG;}else if(bytes[0]===0&&bytes[1]===0&&bytes[2]===1&&bytes[3]===0){return EDAM_MIME_TYPE_PNG;}else if(bytes[0]===0x47&&bytes[1]===0x49&&bytes[2]===0x46&&bytes[3]===0x38&&(bytes[4]===0x37||bytes[4]===0x39)&&bytes[5]===0x61){return EDAM_MIME_TYPE_GIF;}else if(bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46){return EDAM_MIME_TYPE_PDF;}else if(bytes[0]===0x52&&bytes[1]===0x49&&bytes[2]===0x46&&bytes[3]===0x46&&bytes[8]===0x57&&bytes[9]===0x45&&bytes[10]===0x42&&bytes[11]===0x50){return"image/webp";}
return EDAM_MIME_TYPE_DEFAULT;}
function processDataURI(base64,loc,orig,index){var src=decodeURIComponent(base64).split("&")[0];var binary=window.atob(src);var u=new Uint8Array(binary.length*2);for(var i=0;i<binary.length;i++){u[i]=binary.charCodeAt(i);}
resources[index]={byteArray:u,loc:loc,orig:orig};}
function convertDataUInt8Array(data){var dataLength=data.length;var array=new Uint8Array(new ArrayBuffer(dataLength));for(var i=0;i<dataLength;i++){array[i]=data.charCodeAt(i);}
return array;}
function processHyperlink(url,loc,orig,sourceAttrName,index){url=GlobalUtils.unescapeXML(url);awaitingFetchRequests.push({url:url,callback:function(data){if(data&&data.length){var dataArray=convertDataUInt8Array(data);resources[index]={byteArray:dataArray,loc:loc,orig:orig,url:url};if(sourceAttrName==="evernote_attachment_url"){resources[index].attachment=true;resources[index].fileName=/evernote_attachment_name="([^"]*)"/.exec(orig)[1];}}else{resources[index]={loc:loc,orig:orig};}
crossSiteImagesCompleted++;stepDone();}});hostConnection.queueFetchRequest(url);crossSiteImagesCount++;}
function processSkitch(data,loc,orig,index){data.bytes.length=data.byteLength;resources[index]={byteArray:new Uint8Array(data.bytes),loc:loc,orig:orig,url:note.attributes.sourceURL};}
function stepDone(){if(doneProcessing&&crossSiteImagesCount===crossSiteImagesCompleted){for(var i=resources.length-1;i>=0;i--){if(resources[i]){if(resources[i].byteArray){addByteArrayToNote(resources[i].byteArray,resources[i].loc,resources[i].orig,resources[i].url,resources[i].fileName,resources[i].attachment);}else if(/(evernote_attachment|^<embed)/.test(resources[i].orig)){note.content=note.content.slice(0,resources[i].loc)+note.content.slice(resources[i].loc+resources[i].orig.length);}}}
note.content=GlobalUtils.removeControlCharacters(note.content);submitterCallback(note);hostConnection.unregisterFetchCallback(hostConnectionID);hostConnectionID=null;}}
this.createNote=createNote;Object.preventExtensions(this);}
Object.preventExtensions(Submitter);if(typeof SAFARI=="undefined"){SAFARI=false;}
if(typeof Browser=="undefined"){Browser={};Browser.sendToExtension=function(msg){window.parent.postMessage(msg,"*");}
var msgMap={};var msgHandler=function(msg){var data=msg.data;if(data&&data.name&&msgMap[data.name]){msgMap[data.name](msg.data);}}
window.addEventListener("message",msgHandler,false);Browser.addMessageHandlers=function(obj){for(var i in obj){msgMap[i]=obj[i];}}}
function HtmlSerializer(){"use strict";var pendingStyleSheets=[];var counters={};var pendingStyleCount=0;var styleSheetList=[];var element;var range;var keepStyle;var callbacks=[];var stylesToRemove=[];var iterationCount=0;var stack=[];var blocked=false;var pseudoElementRules=[];var frameData;var _window;var base=null;var maxStylesToAdd=100;var stylesAdded=[];var allowedElements=["A","ABBR","ACRONYM","ADDRESS","AREA","B","BDO","BIG","BLOCKQUOTE","BR","CAPTION","CENTER","CITE","CODE","COL","COLGROUP","DD","DEL","DFN","DIV","DL","DT","EM","FONT","H1","H2","H3","H4","H5","H6","HR","I","IMG","INS","KBD","LI","MAP","OL","P","PRE","Q","S","SAMP","SMALL","SPAN","STRIKE","STRONG","SUB","SUP","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","TT","U","UL","VAR"];var html5Elements=["ARTICLE","ASIDE","DETAILS","FOOTER","FIGURE","FIGCAPTION","HEADER","HGROUP","NAV","SECTION","SUMMARY",];var disallowedElements=["APPLET","BASE","BASEFONT","BGSOUND","BLINK","BODY","BUTTON","DIR","EMBED","FIELDSET","FORM","FRAME","FRAMESET","HEAD","HTML","IFRAME","ILAYER","INPUT","ISINDEX","LABEL","LAYER","LEGEND","LINK","MARQUEE","MENU","META","NOEMBED","NOFRAMES","NOSCRIPT","OBJECT","OPTGROUP","OPTION","PARAM","PLAINTEXT","SCRIPT","SELECT","STYLE","TEXTAREA","TITLE","XML"];var disallowedAttributes=["id","class","accesskey","data","dynsrc","tabindex","style"];var coreAttrs=["style","title"];var i18nAttrs=["lang","xml:lang","dir"];var focusAttrs=["accesskey","tabindex"];var attrs=["style","title","lang","xml:lang","dir"];var cellHAlignAttrs=["align","char","charoff"];var strippableProperties=["border","border-bottom","border-bottom-color","border-bottom-style","border-bottom-width","border-collapse","border-color","border-left","border-left-color","border-left-style","border-left-width","border-right","border-right-color","border-right-style","border-right-width","border-spacing","border-style","border-top","border-top-color","border-top-style","border-top-width","border-width","bottom","clear","display","float","height","layout-flow","layout-grid","layout-grid-char","layout-grid-char-spacing","layout-grid-line","layout-grid-mode","layout-grid-type","left","margin","margin-bottom","margin-left","margin-right","margin-top","max-height","max-width","min-height","min-width","padding","padding-bottom","padding-left","padding-right","padding-top","position","right","size","table-layout","top","visibility","width","z-index"];function attributeAllowed(tagName,attrName){attrName=attrName.toLowerCase();if(attrName.match(/^on/i))return false;if(attrName.match(/^data-/i))return false;if(disallowedAttributes.indexOf(attrName)>-1)return false;switch(tagName){case"a":if(attrs.indexOf(attrName)>-1||focusAttrs.indexOf(attrName)>-1){return true;}
if(["charset","coords","href","hreflang","name","rel","rev","shape","target","type"].indexOf(attrName)>-1){return true;}
return false;case"abbr":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"acronym":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"address":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"area":if(attrs.indexOf(attrName)>-1||focusAttrs.indexOf(attrName)>-1){return true;}
if(["alt","coords","href","nohref","shape","target"].indexOf(attrName)>-1){return true;}
return false;case"b":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"bdo":if(coreAttrs.indexOf(attrName)>-1){return true;}
if(["dir","lang"].indexOf(attrName)>-1){return true;}
return false;case"big":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"blockquote":if(attrs.indexOf(attrName)>-1){return true;}
if(["cite"].indexOf(attrName)>-1){return true;}
return false;case"br":if(coreAttrs.indexOf(attrName)>-1){return true;}
if(["clear"].indexOf(attrName)>-1){return true;}
return false;case"caption":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"center":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"cite":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"code":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"col":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["span","valign","width"].indexOf(attrName)>-1){return true;}
return false;case"colgroup":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["valign"].indexOf(attrName)>-1){return true;}
return false;case"dd":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"del":if(attrs.indexOf(attrName)>-1){return true;}
if(["cite","datetime"].indexOf(attrName)>-1){return true;}
return false;case"dfn":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"div":if(["evernote_attachment_url","evernote_attachment_name"].indexOf(attrName)>-1){return true;}
if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"dl":if(attrs.indexOf(attrName)>-1){return true;}
if(["compact"].indexOf(attrName)>-1){return true;}
return false;case"dt":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"em":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"font":if(coreAttrs.indexOf(attrName)>-1||i18nAttrs.indexOf(attrName)>-1){return true;}
if(["color","face","size"].indexOf(attrName)>-1){return true;}
return false;case"h1":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"h2":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"h3":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"h4":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"h5":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"h6":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"hr":if(attrs.indexOf(attrName)>-1){return true;}
if(["align","noshade","size","width"].indexOf(attrName)>-1){return true;}
return false;case"i":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"img":if(attrs.indexOf(attrName)>-1){return true;}
if(["align","alt","border","height","hspace","ismap","longdesc","name","src","usemap","vspace","width"].indexOf(attrName)>-1){return true;}
return false;case"ins":if(attrs.indexOf(attrName)>-1){return true;}
if(["cite","datetime"].indexOf(attrName)>-1){return true;}
return false;case"kbd":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"li":if(attrs.indexOf(attrName)>-1){return true;}
if(["type","value"].indexOf(attrName)>-1){return true;}
return false;case"map":if(i18nAttrs.indexOf(attrName)>-1){return true;}
if(["name","title"].indexOf(attrName)>-1){return true;}
return false;case"ol":if(attrs.indexOf(attrName)>-1){return true;}
if(["compact","start","type"].indexOf(attrName)>-1){return true;}
return false;case"p":if(attrs.indexOf(attrName)>-1){return true;}
if(["align"].indexOf(attrName)>-1){return true;}
return false;case"pre":if(attrs.indexOf(attrName)>-1){return true;}
if(["width"].indexOf(attrName)>-1){return true;}
return false;case"q":if(attrs.indexOf(attrName)>-1){return true;}
if(["cite"].indexOf(attrName)>-1){return true;}
return false;case"s":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"samp":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"small":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"span":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"strike":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"strong":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"sub":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"sup":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"table":if(attrs.indexOf(attrName)>-1){return true;}
if(["align","bgcolor","border","cellpadding","cellspacing","summary","width"].indexOf(attrName)>-1){return true;}
return false;case"tbody":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["valign"].indexOf(attrName)>-1){return true;}
return false;case"td":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["abbr","bgcolor","colspan","height","nowrap","rowspan","valign","width"].indexOf(attrName)>-1){return true;}
return false;case"tfoot":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["valign"].indexOf(attrName)>-1){return true;}
return false;case"th":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["abbr","bgcolor","colspan","height","nowrap","rowspan","valign","width"].indexOf(attrName)>-1){return true;}
return false;case"thead":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["valign"].indexOf(attrName)>-1){return true;}
return false;case"tr":if(attrs.indexOf(attrName)>-1||cellHAlignAttrs.indexOf(attrName)>-1){return true;}
if(["bgcolor","valign"].indexOf(attrName)>-1){return true;}
return false;case"tt":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"u":if(attrs.indexOf(attrName)>-1){return true;}
return false;case"ul":if(attrs.indexOf(attrName)>-1){return true;}
if(["compact","type"].indexOf(attrName)>-1){return true;}
return false;case"var":if(attrs.indexOf(attrName)>-1){return true;}
return false;}}
function nodeAllowed(nodeName){nodeName=nodeName.toUpperCase();return(disallowedElements.indexOf(nodeName)==-1);}
function transformNode(node){var nodeName=node.nodeName;nodeName=nodeName.toUpperCase();if(nodeName=="INPUT"&&node.type&&node.type.toLowerCase()=="image"){return"img";}
if(nodeName=="BODY")return"div";if(nodeName=="HTML")return"div";if(nodeName=="FORM")return"div";if(nodeName=="LABEL")return"span";if(nodeName=="FIELDSET")return"div";if(nodeName=="LEGEND")return"span";if(nodeName=="IFRAME")return"div";if(nodeName=="EMBED")return"div";if(nodeName=="CANVAS")return"img";if(nodeName=="VIDEO")return"img";if(nodeName=="HIGHLIGHT")return"span";if(html5Elements.indexOf(nodeName)>-1){return"div";}
if(!nodeAllowed(nodeName)){return nodeName.toLowerCase();}
if(allowedElements.indexOf(nodeName)==-1){return"span";}
return nodeName.toLowerCase();}
Browser.addMessageHandlers({content_textResource:msgHandlerTextResource});function serialize(_element,_range,_keepStyle,callback,_frameData,win){try{_window=win;if(!_window){_window=window;}
if(callback){callbacks.push(callback);}
if(!blocked){blocked=true;element=_element;range=_range;keepStyle=_keepStyle;frameData=_frameData;checkStyleSheets();}
else{log.warn("Called serialize while blocked. Added callback but won't change base element.");}}catch(err){doneRecursing(null,err);}}
function checkStyleSheet(sheet){if(!usableMedia(sheet)){return;}
if(stylesAdded.length>=maxStylesToAdd){log.warn("Hit style cap of "+maxStylesToAdd+" styles. Stopping.");return;}
if(!sheet.cssRules&&sheet.href){styleSheetList.push({href:sheet.href,owner:sheet.ownerNode});pendingStyleCount++;stylesAdded.push(sheet.href);pendingStyleSheets.push(sheet.href);Browser.sendToExtension({name:"main_getTextResource",href:sheet.href});return;}
var rules=sheet.cssRules;var path=null;if(sheet.ownerNode&&sheet.ownerNode.dataset&&sheet.ownerNode.dataset["evernoteOriginatingUrl"]){var pathMatch=/(.+)\//.exec(sheet.ownerNode.dataset["evernoteOriginatingUrl"]);if(pathMatch){path=pathMatch[1];}}
for(var j=0;j<rules.length;j++){if(rules[j].type==CSSRule.IMPORT_RULE){if(!rules[j].styleSheet){continue;}
var href=rules[j].styleSheet.href;if(!/^https?:\/\//.test(rules[j].href)&&!/^\/\//.test(rules[j].href)){if(path){if(rules[j].href[0]==="/"){href=path+rules[j].href;}else{href=path+"/"+rules[j].href;}}}
if(stylesAdded.indexOf(href)!=-1){continue;}
styleSheetList.push({href:href,owner:sheet.ownerNode});pendingStyleCount++;stylesAdded.push(href);pendingStyleSheets.push(href);Browser.sendToExtension({name:"main_getTextResource",href:href});}else if(rules[j].type==CSSRule.MEDIA_RULE){if(usableMedia(rules[j])){styleSheetList.push(rules[j]);}}}
styleSheetList.push(sheet);}
function checkStyleSheets(){pendingStyleCount=0;stylesAdded=[];counters={};base=document.getElementsByTagName("base")[0];for(var i=0;i<_window.document.styleSheets.length;i++){checkStyleSheet(_window.document.styleSheets[i]);}
if(pendingStyleCount==0){startRecurse(element);}}
function reconstituteUrl(base,match,url){var reconstituted;url=url.trim();if(url.match(/^http/i)){reconstituted=url;}
else if(url.match(/^\//)){reconstituted=base.replace(/^(.*?:\/\/[^\/]+).*$/,"$1")+url;}
else{reconstituted=base.replace(/^(.*\/)/,"$1")+url;}
reconstituted="url('"+reconstituted+"')";return reconstituted;}
function preProcessStyle(styleText,originatingSheetHref){var pageBase=_window.document.location.href.replace(/[^\/]+$/,"");var styleBase=originatingSheetHref.replace(/[^\/]+$/,"");if(pageBase==styleBase){return styleText;}
function reconstitute(){var args=[styleBase];for(var i=0;i<arguments.length;i++)args.push(arguments[i]);return reconstituteUrl.apply(this,args);}
if(styleText){styleText=styleText.replace(/url\(["']?(.*?)["']?\)/g,reconstitute);}
return styleText;}
var outstandingStyleSheets=[];var styleInterval=0;function pollForStyleSheets(){if(styleInterval)return;styleInterval=setInterval(function(){try{if(stylesAdded.length>=maxStylesToAdd){cancelPollForStyleSheets();startRecurse(element);return;}
OUTER:for(var i=0;i<outstandingStyleSheets.length;i++){var style=outstandingStyleSheets[i][0];var idx=outstandingStyleSheets[i][1];for(var j=0;j<_window.document.styleSheets.length;j++){var sheet=_window.document.styleSheets[j];if(sheet.ownerNode===style){styleSheetList[idx]=sheet;checkStyleSheet(_window.document.styleSheets[j]);outstandingStyleSheets.splice(i,1);pendingStyleCount--;break OUTER;}}}
if(pendingStyleCount==0){cancelPollForStyleSheets();startRecurse(element);}}catch(err){doneRecursing(null,err);}},100);}
function cancelPollForStyleSheets(){if(styleInterval){clearInterval(styleInterval);styleInterval=0;}}
function msgHandlerTextResource(request,sender,sendResponse){try{var sheetIndex=pendingStyleSheets.indexOf(request.href);if(sheetIndex==-1){if(pendingStyleSheets.length)
return;}
else{pendingStyleSheets.splice(sheetIndex,1);}
for(var i=0;i<styleSheetList.length;i++){var sheet=styleSheetList[i];if(sheet.href===request.href){var styleText=preProcessStyle(request.responseText,sheet.href);var style=_window.document.createElement("style");style.type="text/css";style.textContent=styleText;style.dataset["evernoteOriginatingUrl"]=sheet.href;var savedStyles=[];for(var j=0;j<_window.document.styleSheets.length;j++){savedStyles.push(_window.document.styleSheets[j]);}
if(sheet.owner){sheet.owner.parentNode.insertBefore(style,sheet.owner);}
else{_window.document.head.appendChild(style);}
stylesToRemove.push(style);outstandingStyleSheets.push([style,i]);pollForStyleSheets();return;}}}catch(err){doneRecursing(null,err);}}
function usableMedia(stylesheet){if(stylesheet.media&&stylesheet.media.length){for(var j=0;j<stylesheet.media.length;j++){var m=stylesheet.media[j].toLowerCase();if(m.match(/\bscreen\b/i)||m.match(/\ball\b/i)){return true;}}
return false;}
return true;}
function postProcessStyles(){pseudoElementRules=[];for(var i=0;i<styleSheetList.length;i++){var sheet=styleSheetList[i];if(!sheet.cssRules){continue;}
for(var j=0;j<sheet.cssRules.length;j++){var rule=sheet.cssRules[j];if(rule.selectorText&&rule.selectorText.match(/(:?:before)|(:?:after)/)){pseudoElementRules.push(rule);}}}}
function startRecurse(el){setTimeout(function(){try{postProcessStyles();stack=[];stack.push({element:el,string:"",i:0,after:null});recurse();}catch(err){doneRecursing(null,err);}},300);}
function escapeHTML(str){return GlobalUtils.escapeXML(str);}
function shouldSerializeYoutubeVideo(el){return typeof el.id=="string"&&(el.id=="movie_player")&&_window.document.location.href.match(/v=(.*?)(&|$)/);}
function serializeYoutubeVideo(el){if(shouldSerializeYoutubeVideo(el)){var vidId=_window.document.location.href.match(/v=(.*?)(&|$)/)[1];return"<a href=\""+GlobalUtils.escapeXML(_window.document.location.href)+"\" target=\"_blank\">"
+"<img src=\"http://img.youtube.com/vi/"+vidId+"/0.jpg\"></img></a>";}
return"";}
function addPicEmbeddedYoutubeVideo(el){try{if(el.getAttribute("type")==="application/x-shockwave-flash"&&el.getAttribute("flashvars")){var match=/iurlsd=(.+?)(&|$)/.exec(el.getAttribute("flashvars"));if(!match){match=/iurl=(.+?)(&|$)/.exec(el.getAttribute("flashvars"));}
if(match){el.style.backgroundImage="url("+decodeURIComponent(match[1])+")";el.style.backgroundPosition="50%";el.style.backgroundRepeat="no-repeat";}
match=/video_id=(.+?)(&|$)/.exec(el.getAttribute("flashvars"));if(match){var ytLink=document.createElement("a");ytLink.href="https://www.youtube.com/watch?v="+match[1];ytLink.target="_blank";ytLink.style.display="block";ytLink.style.width="100%";ytLink.style.height="100%";el.appendChild(ytLink);}}}catch(err){log.warn("problem with adding pic to embedded youtube video");}}
function serializeIframe(el){if(el.nodeName.toLowerCase()!="iframe"){return null;}
var contents="";if(el.dataset&&el.dataset.en_id){if(frameData&&frameData[el.dataset.en_id]){contents=frameData[el.dataset.en_id];var style=resolveStyle(el);if(el.width)style.map.width={value:el.width+"px"};if(el.height)style.map.height={value:el.height+"px"};if(!style.map.position||style.map.position.value==="static"){style.map.position={value:"relative"};}
var styleStr="";for(var i in style.map){styleStr+=i+":"+style.map[i].value+";";}
if(styleStr){styleStr=" style=\""+escapeAttr(styleStr)+"\"";}
else{styleStr="";}
var div="<div"+styleStr+">"+contents+"</div>";return div;}}
return null;}
function checkValidDlChild(el){if(el.parentNode&&el!=element){var parentName=el.parentNode.nodeName;parentName=parentName.toLowerCase();if(parentName=="dl"){var normalized=transformNode(el);if(normalized!="dd"&&normalized!="dt"){return false;}}}
return true;}
function recurse(){iterationCount++;if(iterationCount%500==0){setTimeout(function(){try{recurse();}catch(err){doneRecursing(null,err);}},25);return;}
var f=stack[stack.length-1];if(!f){doneRecursing("");}
if(f.i==0){if(!nodeAllowed(transformNode(f.element))){stack.pop();recurse();return;}
if(!checkValidDlChild(f.element)){log.warn("discarding invalid DL child \""+f.element.nodeName+"\"");stack.pop();recurse();return;}
if(range&&f.element!=range.commonAncestorContainer&&!range.intersectsNode(f.element)){stack.pop();recurse();return;}
if(range&&f.element===range.endContainer&&range.endOffset===0){stack.pop();recurse();return;}
if(["evernoteClipperResult","evernoteAuthTools","evernoteFilingTools","evernoteGlobalTools","evernoteUserTools","evernoteShareTools","evernoteEmailSharing","evernoteOptionsPage","evernoteClearlyArticle"].indexOf(f.element.id)>-1){stack.pop();recurse();return;}
var ytvid=serializeYoutubeVideo(f.element);if(ytvid){f.string+=ytvid;stack.pop();if(stack.length){stack[stack.length-1].string=f.string;recurse();}
else{doneRecursing(f.string);}
return;}
var iframe=serializeIframe(f.element);if(iframe){f.string+=iframe;stack.pop();if(stack.length){stack[stack.length-1].string=f.string;recurse();}
else{doneRecursing(f.string);}
return;}
var style={};if(keepStyle){addPicEmbeddedYoutubeVideo(f.element);if(f.element.nodeName==="HIGHLIGHT"){style={style:" style=\"x-evernote:highlighted;background-color:#F6EE96;\""};}else{style=resolveStyle(f.element);}
if(style.after)f.after=style.after;}
if(style.map&&style.map.display&&style.map.display.value=="none"){stack.pop();recurse();return;}
var nodeName=transformNode(f.element);f.string+="<"+nodeName;specifyImgDims(f.element);if(f.element.nodeName=="CANVAS"){try{f.string+=" src=\""+f.element.toDataURL()+"\"";}catch(err){}}else if(f.element.nodeName=="VIDEO"){if(f.element.poster){f.string+=" src=\""+GlobalUtils.escapeXML(f.element.poster)+"\"";}}
if(f.element.attributes&&f.element.attributes.length){for(f.i=0;f.i<f.element.attributes.length;f.i++){if(attributeAllowed(nodeName,f.element.attributes[f.i].name)&&!(f.element.nodeName=="VIDEO"&&f.element.attributes[f.i].name=="src")){f.string+=" "+transformAttribute(f.element,f.element.attributes[f.i]);}}}
if(keepStyle&&nodeName!="map"){f.string+=style.style;}else if(f.element.nodeName=="HIGHLIGHT"){f.string+=" style=\"x-evernote:highlighted;background-color:#F6EE96;\"";}
f.string+=">";if(keepStyle){if(style.before){f.string+=style.before;}}
f.i=0;}
while(f.i<f.element.childNodes.length){if(f.element.childNodes[f.i].nodeType==Node.TEXT_NODE){var text;if(range&&f.element.childNodes[f.i]===range.startContainer){text=escapeHTML(f.element.childNodes[f.i].textContent.substr(range.startOffset));}
else if(range&&f.element.childNodes[f.i]===range.endContainer){text=escapeHTML(f.element.childNodes[f.i].textContent.substr(0,range.endOffset));}
else if(range&&!range.intersectsNode(f.element.childNodes[f.i])){text="";}
else{text=escapeHTML(f.element.childNodes[f.i].textContent);}
f.string+=text;f.i++;}
else if(f.element.childNodes[f.i].nodeType==Node.ELEMENT_NODE&&childrenAllowed(f.element)){stack.push({element:f.element.childNodes[f.i],string:f.string,i:0,after:null});f.i++;recurse();return;}
else{f.i++;}}
if(keepStyle){if(f.after){f.string+=f.after;}}
f.string+="</"+transformNode(f.element)+">";stack.pop();if(stack.length){stack[stack.length-1].string=f.string;recurse();}
else{doneRecursing(f.string);}}
function childrenAllowed(el){if(el.nodeName=="VIDEO"){return false;}
return true;}
function rebackgroudifyCss(map){if(map["background-position"]&&map["background-repeat"]){if(map["background-position"].trim()=="0px 50%"&&map["background-repeat"].trim()=="initial initial"){for(var prop in map){if(prop.match(/background/)){delete map[prop];}}
map["background"]="0";}}}
function parseCssText(str){var val={};var props=str.split(/;(?!.[^\(]+?\))\s*/);for(var i=0;i<props.length;i++){props[i]=props[i].trim();if(props[i]){var splitIdx=props[i].indexOf(":");var name=props[i].substr(0,splitIdx).trim();var value=props[i].substr(splitIdx+1).trim();if(name&&value){var regex=new RegExp("(url\\(.+?\\))","g");var match=regex.exec(value);var valueCopy=value;while(match){var orig=match[1];var updated=orig;if(/url\(.+?(data:.+?;.+?,.+?)\)/.test(updated)){updated="url("+/url\(.+?(data:.+?;.+?,.+?)\)/.exec(updated)[1]+")";}
if(/url\(\/\/(.+?)\)/.test(updated)){updated="url(http://"+/url\(\/\/(.+?)\)/.exec(updated)[1]+")";}
if(/url\((.+?)\)/.test(updated)){updated="url("+GlobalUtils.escapeXML(GlobalUtils.unescapeXML(/url\((.+?)\)/.exec(updated)[1]))+")";}
valueCopy=valueCopy.replace(orig,updated);match=regex.exec(value);}
value=valueCopy;val[name.toLowerCase()]=value;}}}
rebackgroudifyCss(val);return val;}
function objectifyCssRule(rule){var styleMap={};if(rule.style.cssText){var styles;if(!rule.style.savedCssObj){rule.style.savedCssObj=parseCssText(rule.style.cssText);}
styles=rule.style.savedCssObj;for(var k in styles){styleMap[k]=styles[k];}}
return styleMap;}
function specifyImgDims(el){if(el.nodeName.toLowerCase()=="img"){if(!el.attributes.width){el.setAttribute("width",el.width);}
if(!el.attributes.height){el.setAttribute("height",el.height);}}}
function convertHTMLAttributesToCSSAttributes(el){if(el.style){if(el.hasAttribute("background")){el.style.backgroundImage="url("+el.getAttribute("background")+")";}
if(el.hasAttribute("bgcolor")){el.style.backgroundColor=el.getAttribute("bgcolor");}
if(el.hasAttribute("text")){el.style.color=el.getAttribute("text");}}}
function getSelectorSpecificity(sel){var matchers={"ids":{"regex":/#[A-Z]+/ig,"count":0},"classes":{"regex":/\.[A-Z]+/ig,"count":0},"attrs":{"regex":/\[.*?\]/g,"count":0},"pseudos":{"regex":/:+[A-Z]+/ig,"count":0},"pseudoEls":{"regex":/:+(first-line|first-letter|before|after)/ig,"count":0},"types":{"regex":/(^|\s)[A-Z]+/ig,"count":0}}
for(var i in matchers){var re=matchers[i].regex;while(re.exec(sel)){matchers[i].count++;}}
matchers.pseudoClasses={};matchers.pseudoClasses.count=matchers.pseudos.count-matchers.pseudoEls.count;var first=matchers.ids.count;var second=matchers.classes.count+matchers.attrs.count+matchers.pseudoClasses.count;var third=matchers.types.count+matchers.pseudoEls.count;var score=(first*256*256)+(second*256)+third;return score;}
function splitSelectorList(sel){var sels=[];var lastStart=0;var i=0;var quoted="";for(i=0;i<sel.length;i++){if(!quoted){if(sel[i]=="'"||sel[i]=="\""){quoted=sel[i];}
else if(sel[i]==","){sels.push(sel.substring(lastStart,i).trim());lastStart=i+1;}}
else{if(sel[i]==quoted){quoted="";}}}
sels.push(sel.substr(lastStart).trim());return sels;}
var inheritableCSSProperties={'border-collapse':true,'border-spacing':true,'caption-side':true,'color':true,'cursor':true,'direction':true,'empty-cells':true,'font-family':true,'font-size':true,'font-style':true,'font-variant':true,'font-weight':true,'font':true,'letter-spacing':true,'line-height':true,'list-style-image':true,'list-style-position':true,'list-style-type':true,'list-style':true,'orphans':true,'quotes':true,'text-align':true,'text-indent':true,'text-transform':true,'visibility':true,'white-space':true,'widows':true,'word-spacing':true};function cssPropertyIsInheritable(property){if(inheritableCSSProperties[property.toLowerCase()]){return true;}
return false;}
function fixQuirksModeTableInheritance(el,map){var nodeName=el.nodeName.toLowerCase();if(nodeName=="table"||nodeName=="caption"){if(_window.document.compatMode=="CSS1Compat"){map["font-size"]={value:"inherit",score:0};map["font-weight"]={value:"inherit",score:0};map["font-style"]={value:"inherit",score:0};map["font-variant"]={value:"inherit",score:0};}}}
function clearOverridden(name,map){if(name=="padding"){delete map["padding-top"];delete map["padding-bottom"];delete map["padding-left"];delete map["padding-right"];}else if(name=="margin"){delete map["margin-top"];delete map["margin-bottom"];delete map["margin-left"];delete map["margin-right"];}else if(name=="background"){delete map["background-color"];delete map["background-position"];delete map["background-size"];delete map["background-repeat"];delete map["background-origin"];delete map["background-clip"];delete map["background-attachment"];delete map["background-image"];clearOverridden("background-position",map);clearOverridden("background-repeat",map);}else if(name=="background-position"){delete map["background-position-x"];delete map["background-position-y"];}else if(name=="background-repeat"){delete map["background-repeat-x"];delete map["background-repeat-y"];}else if(name=="border"){delete map["border-width"];delete map["border-style"];delete map["border-color"];clearOverridden("border-top",map);clearOverridden("border-right",map);clearOverridden("border-bottom",map);clearOverridden("border-left",map);}else if(name=="border-top"){delete map["border-top-width"];delete map["border-top-style"];delete map["border-top-color"];}else if(name=="border-right"){delete map["border-right-width"];delete map["border-right-style"];delete map["border-right-color"];}else if(name=="border-bottom"){delete map["border-bottom-width"];delete map["border-bottom-style"];delete map["border-bottom-color"];}else if(name=="border-left"){delete map["border-left-width"];delete map["border-left-style"];delete map["border-left-color"];}}
function resolveStyle(el,stripStyleList){convertHTMLAttributesToCSSAttributes(el);var style="";var originalStyle=null;var before={};var after={};if(el.attributes&&el.attributes.style){originalStyle=parseCssText(el.attributes.style.value);}
var styleMap={};fixQuirksModeTableInheritance(el,styleMap);var rules;rules=_window.getMatchedCSSRules(el);if(rules&&rules.length){for(var i=0;i<rules.length;i++){var specScore=0;var ignoreVisited=false;if(rules[i].selectorText.match(/:visited/i)){ignoreVisited=true;}
var selectors=splitSelectorList(rules[i].selectorText);for(var j=0;j<selectors.length;j++){var matches;try{matches=el.webkitMatchesSelector(selectors[j]);}
catch(e){log.warn("Couldn't match against selector "+selectors[j]+" in: "+rules[i].selectorText);log.exception(e);}
if(matches){ignoreVisited=false;var possibleSpec=getSelectorSpecificity(selectors[j]);if(possibleSpec>=specScore){specScore=possibleSpec;}}}
if(ignoreVisited){continue;}
var ruleObj=objectifyCssRule(rules[i]);if(ruleObj["counter-reset"]){var counterResetParts=ruleObj["counter-reset"].split(/\s+/);if(counterResetParts.length>0){var crp=0;while(crp<counterResetParts.length){if(/^\d+$/.test(counterResetParts[crp+1])){counters[counterResetParts[crp]]=parseInt(counterResetParts[crp+1]);crp+=2;}else{counters[counterResetParts[crp++]]=0;}}}}
if(ruleObj["counter-increment"]){var counterIncParts=ruleObj["counter-increment"].split(/\s+/);if(counterIncParts.length>0){var cip=0;while(cip<counterIncParts.length){if(!counters[counterIncParts[cip]]){counters[counterIncParts[cip]]=0;}
if(/^\d+$/.test(counterIncParts[cip+1])){counters[counterIncParts[cip]]+=parseInt(counterIncParts[cip+1]);cip+=2;}else{counters[counterIncParts[cip++]]++;}}}}
for(var k in ruleObj){var jsPropName=k.replace(/^-/,"").replace(/-[a-z]/g,function(str){return str[1].toUpperCase();});if(!rules[i].style[jsPropName]||jsPropName==="counterIncrement"||jsPropName==="counterReset"){continue;}
var oldScore=0;if(styleMap[k]){oldScore=styleMap[k].score;}
var ruleScore=specScore;if(ruleObj[k].match(/!important\s*$/i)){ruleScore+=(256*256*256);ruleObj[k]=ruleObj[k].replace(/\s*!important\s*$/i,"");}
if(ruleScore>=oldScore){clearOverridden(k,styleMap);styleMap[k]={value:ruleObj[k],score:ruleScore};}}}}
for(var i=0;i<pseudoElementRules.length;i++){var rule=pseudoElementRules[i];var match;if(el.webkitMatchesSelector){try{match=el.webkitMatchesSelector(rule.selectorText.replace(/(:?:before)|(:?:after)/g,""));}
catch(e){}}
if(match){var matchBefore=false;var matchAfter=false;if(rule.selectorText.match(/:?:before/)){matchBefore=true;}
if(rule.selectorText.match(/:?:after/)){matchAfter=true;}
for(var k in styleMap){if(matchBefore&&cssPropertyIsInheritable(k)){before[k]=styleMap[k].value;}
if(matchAfter&&cssPropertyIsInheritable(k)){after[k]=styleMap[k].value;}}
var generated=objectifyCssRule(rule);for(var k in generated){if(matchBefore){before[k]=generated[k];}
if(matchAfter){after[k]=generated[k];}}}}
var sections=[before,after];for(var entry=0;entry<sections.length;entry++){var map=sections[entry];var pseudoStyle="";var content="";var count=0;if(map["counter-reset"]){var counterResetParts=map["counter-reset"].split(/\s+/);var crp=0;while(crp<counterResetParts.length){if(/^\d+$/.test(counterResetParts[crp+1])){counters[counterResetParts[crp]]=parseInt(counterResetParts[crp+1]);crp+=2;}else{counters[counterResetParts[crp++]]=0;}}}
if(map["counter-increment"]){var counterIncParts=map["counter-increment"].split(/\s+/);var cip=0;while(cip<counterIncParts.length){if(!counters[counterIncParts[cip]]){counters[counterIncParts[cip]]=0;}
if(/^\d+$/.test(counterIncParts[cip+1])){counters[counterIncParts[cip]]+=parseInt(counterIncParts[cip+1]);cip+=2;}else{counters[counterIncParts[cip++]]++;}}}
for(var j in map){if(j=="content"){var content=map[j];content=content.trim();content=content.replace(/\s+!important$/,"");if(content=="none")content="\"\"";if(content.match(/^'/)){content=content.replace(/^'(.*?)'.*/,"$1");}
else if(content.match(/^"/)){content=content.replace(/^"(.*?)".*/,"$1");}
if(content.match(/^url\((.*)\)/)){var contentUrl=content.match(/^url\((.*)\)/)[1];content="<img src='"+contentUrl+"'></img>";}else if(content.match(/^\s*counter\(.*?\)/)){var counterName=content.match(/^\s*counter\((.*?)\)/)[1].split(",")[0];if(typeof counters[counterName]==="number"){content=GlobalUtils.escapeXML(""+counters[counterName]);}}else if(content.match(/^\s*attr\((.*?)\)/)){var attrName=content.match(/^\s*attr\((.*?)\)/)[1];if(el.getAttribute(attrName)){content=GlobalUtils.escapeXML(""+el.getAttribute(attrName));}else{content="";}}else if(content.match(/^\s*-webkit-image-set\(.+\)/)){pseudoStyle+="background:"+content+";";content="";}}else if(j!=="counter-reset"&&j!=="counter-increment"){pseudoStyle+=j+":"+map[j]+";";}
count++;}
if(count){pseudoStyle="<span style=\""+pseudoStyle+"\">"+content+"</span>";if(entry==0){before=pseudoStyle;}
else{after=pseudoStyle;}}}
if(typeof before!="string")before=null;if(typeof after!="string")after=null;if(el==element){stripStyleList=strippableProperties;}
if(stripStyleList){for(var i=0;i<stripStyleList.length;i++){if(styleMap[stripStyleList[i]]){delete styleMap[stripStyleList[i]];}}}
fixHeight(el,styleMap);fixUserSelect(styleMap);if(originalStyle){var matcher=/url\(['"]?(.*?)['"]?\)/i;for(var k in originalStyle){if(matcher.test(originalStyle[k])){var url=matcher.exec(originalStyle[k])[1];var linkBase=_window.document.location.href;if(base&&base.href){linkBase=base.href;}
var fixed=reconstituteUrl(linkBase,match,url);originalStyle[k]=originalStyle[k].replace("url(\""+url+"\")",fixed).replace("url('"+url+"')",fixed).replace("url("+url+")",fixed);}
styleMap[k]={value:originalStyle[k]};}}
for(var i in styleMap){style+=i+":"+styleMap[i].value+";";}
if(style){style=" style=\""+escapeAttr(style)+"\"";}
else{style="";}
return{style:style,before:before,after:after,map:styleMap};}
function fixHeight(el,styleMap){if(styleMap["height"]&&styleMap["height"].value.match(/%$/)){var fixed=styleMap["height"].value;try{if(_window.getComputedStyle(el).position!="fixed"){var containingHeight=_window.getComputedStyle(el.parentNode).height;if(!containingHeight){fixed="auto";}}}
catch(e){}
styleMap["height"].value=fixed;}}
function fixUserSelect(styleMap){var selectProps=["-webkit-user-select","-moz-user-select","-ms-user-select","user-select","-webkit-user-modify","-moz-user-modify","-ms-user-modify","user-modify"];for(var i=0;i<selectProps;i++){if(styleMap[selectProps[i]]){delete styleMap[selectProps[i]];}}}
function transformAttribute(element,attrObj){var val=null;if(attrObj.name.toLowerCase()=="href"){var href=element.href.animVal?element.href.animVal:element.href;if(href&&href.match(/^javascript/i)){href="#";}else if(!/^https?:\/\//.test(href)){href=element.baseURI+href;}
val=escapeAttr(href);}
else if(attrObj.name.toLowerCase()=="src"){var src=element.src;if(attrObj.value.trim()==""){src="";}
if(src&&src.match(/^javascript/i))src="#";src=convertImgSrcToBase64IfPossible(element,src);val=escapeAttr(src);}
if(val===null){val=escapeAttr(attrObj.value.replace(/\u000A/g,""));}
return attrObj.name+"=\""+val+"\"";}
function convertImgSrcToBase64IfPossible(element,src,naturalSize){if(!element){return src;}
var win=_window||window;if(element.nodeName=="IMG"&&/^https?:\/\//i.test(src)&&!/\.gif($|\?)/i.test(src)&&(element.naturalWidth||element.naturalHeight)){var imgOrigin=/^(https?:\/\/.[^\/]+)\/?/.exec(src)[1];if(imgOrigin===win.document.location.origin){var canvas=win.document.createElement("canvas");canvas.width=(naturalSize?element.naturalWidth:element.width)||1;canvas.height=(naturalSize?element.naturalHeight:element.height)||1;canvas.getContext("2d").drawImage(element,0,0,(naturalSize?element.naturalWidth:element.width),(naturalSize?element.naturalHeight:element.height));try{if(/\.jpe?g$/.test(src)){return canvas.toDataURL("image/jpeg");}else{return canvas.toDataURL("image/png");}}catch(err){if(err.code!=18){throw err;}
return src;}finally{canvas=null;}}else{return src;}}else if(!element.naturalWidth||!element.naturalHeight){return"";}else{return src;}}
function restoreAncestors(){var front="";var back="";var current=element.parentNode;while(current&&current.parentNode){var style=resolveStyle(current,strippableProperties).style;var type=transformNode(current);if(nodeAllowed(type)){front="<"+type+style+">"+front;back=back+"</"+type+">";}
current=current.parentNode;}
front="<div style=\"font-size: 16px\">"+front;back=back+"</div>";return{front:front,back:back};}
function doneRecursing(str,error){blocked=false;if(!error){var ancestors={front:"",back:""};if(keepStyle){ancestors=restoreAncestors();}
str=ancestors.front+str+ancestors.back;}
for(var i=0;i<stylesToRemove.length;i++){stylesToRemove[i].parentNode.removeChild(stylesToRemove[i]);}
stylesToRemove=[];for(var i=0;i<callbacks.length;i++){try{callbacks[i](str,error);}
catch(e){log.warn("Couldn't run 'serialize' callback: "+e.stack||e.trace);}}
callbacks=[];}
function escapeAttr(str){if(!str)return"";return GlobalUtils.escapeXML(str);}
this.convertImgSrcToBase64IfPossible=convertImgSrcToBase64IfPossible;this.serialize=serialize;Object.preventExtensions(this);}
Object.preventExtensions(HtmlSerializer);var ENSEClipperMessageHandler=(function(){"use strict";function ENSEClipperMessageHandler(hostConnection){this.hostConnection=hostConnection;this.fetchCallback=null;this.listener=null;this.registerFetchCallback();this.registerListener();}
ENSEClipperMessageHandler.prototype.registerFetchCallback=function(){var self=this;if(this.fetchCallback){throw"Fetch callback is already registered";}
this.fetchCallback=function(reply){var response={name:"content_textResource",href:reply.url,responseText:reply.data};self.postMessageReply(response);};this.hostConnection.registerFetchCallback(this.fetchCallback);};ENSEClipperMessageHandler.prototype.registerListener=function(){var self=this;if(this.listener){throw"Listener is already registered";}
this.listener=function(message){self.messageHandler(message);};window.addEventListener("message",this.listener,false);};ENSEClipperMessageHandler.prototype.postMessageReply=function(message){window.parent.postMessage(message,"*");};ENSEClipperMessageHandler.prototype.messageHandler=function(message){var data=message.data;if(!data){return;}
switch(data.name){case'main_getTextResource':this.main_getTextResource(data);break;}};ENSEClipperMessageHandler.prototype.main_getTextResource=function(request){this.hostConnection.queueFetchRequest(request.href);};return ENSEClipperMessageHandler;})();var ENSEHostConnection=(function(){"use strict";var LOCALHOST_WS_PREFIX='ws://127.0.0.1:';var PORT_SEARCH_START=13230;var PORT_SEARCH_COUNT=10;var PORT_SEARCH_TIMEOUT_MS=50;var RECONNECT_TIMEOUT_MS=500;function ENSEHostConnection(token){this.token=token;this.webSocket=null;this.keepAlive=false;this.messageOutQueue=[];this.fetchCallbacks={};this.nextFetchCallbackID=0;}
ENSEHostConnection.findAvailablePort=function(portCallback){function checkPort(portNumber,checkCallback){function cleanup(){if(webSocket!==null){webSocket.close();webSocket=null;}
if(timeoutId!==null){window.clearTimeout(timeoutId);timeoutId=null;}}
function reportPort(success){cleanup();if(checkCallback){checkCallback(portNumber,success);}
checkCallback=undefined;}
var timeoutId=window.setTimeout(function(){timeoutId=null;reportPort(false);},PORT_SEARCH_TIMEOUT_MS);var webSocket=new WebSocket(LOCALHOST_WS_PREFIX+portNumber);var successOnClose=true;webSocket.onerror=function(){successOnClose=false;};webSocket.onopen=function(){successOnClose=false;webSocket.close();webSocket=null;};webSocket.onclose=function(){reportPort(successOnClose);};}
var currentPort=null;function tryNextPort(){currentPort=(currentPort===null)?PORT_SEARCH_START:(currentPort+1);if(currentPort>=PORT_SEARCH_START+PORT_SEARCH_COUNT){portCallback(undefined);return;}
checkPort(currentPort,function(checkedPort,success){if(success){portCallback(checkedPort);}else{tryNextPort();}});}
tryNextPort();};ENSEHostConnection.prototype.queueFetchRequest=function(url){this.messageOutQueue.push({'command':'fetch','token':this.token,'url':url});this.flushFetchQueue();};ENSEHostConnection.prototype.queueShareRequest=function(serializedContent,enex){this.messageOutQueue.push({'command':'share','token':this.token,'html':serializedContent,'enex':enex});this.flushFetchQueue();};ENSEHostConnection.prototype.registerFetchCallback=function(fetchCallback){var callbackID=this.nextFetchCallbackID++;this.fetchCallbacks[callbackID]=fetchCallback;return callbackID;};ENSEHostConnection.prototype.unregisterFetchCallback=function(fetchCallbackID){if(!this.fetchCallbacks[fetchCallbackID]){throw"Unknown callback ID";}
delete this.fetchCallbacks[fetchCallbackID];};ENSEHostConnection.prototype.flushFetchQueue=function(){if(!this.webSocket||this.webSocket.readyState!=WebSocket.OPEN){return;}
this.messageOutQueue.forEach(function(request){this.webSocket.send(JSON.stringify(request));},this);this.messageOutQueue=[];this.performDisconnectIfNotNeeded();};ENSEHostConnection.prototype.dispatchFetchReply=function(fetchReply){var reply={'url':fetchReply['url'],'data':atob(fetchReply['data'])};Object.keys(this.fetchCallbacks).forEach(function(callbackID){this.fetchCallbacks[callbackID](reply);},this);};ENSEHostConnection.prototype.connect=function(portNumber){var self=this;var socketUrl=LOCALHOST_WS_PREFIX+portNumber;this.keepAlive=true;function doConnect(){self.webSocket=new WebSocket(socketUrl);self.webSocket.onopen=function(){self.flushFetchQueue();};self.webSocket.onclose=function(){self.webSocket=null;if(self.keepOpen()){window.setTimeout(function(){doConnect();},RECONNECT_TIMEOUT_MS);}};self.webSocket.onmessage=function(event){var message=JSON.parse(event.data);switch(message.command){case'fetch':self.dispatchFetchReply(message);break;default:console.log("Unknown message received:",message);break;}};}
doConnect();};ENSEHostConnection.prototype.keepOpen=function(){return this.keepAlive||this.messageOutQueue.length;};ENSEHostConnection.prototype.performDisconnectIfNotNeeded=function(){if(!this.keepOpen()&&this.webSocket){this.webSocket.close();this.webSocket=null;}};ENSEHostConnection.prototype.disconnect=function(){this.keepAlive=false;this.performDisconnectIfNotNeeded();};return ENSEHostConnection;})();ENSUUID=(function(){"use strict";function UUID(bytes){this._value=(bytes&&bytes.length==16)?bytes:UUID._generateUUID();}
UUID._generateUUID=function(){var UUIDArray=new ArrayBuffer(16);var UUID32=new Uint32Array(UUIDArray);for(var i=0;i<4;i++){UUID32[i]=Math.random()*0x100000000;}
var UUID=new Uint8Array(UUIDArray);UUID[6]=0x40|(UUID[6]&0x0F);UUID[8]=0x80|(UUID[8]&0x3F);return UUID;};UUID.prototype.isEqual=function(target){if(target instanceof UUID){var i=this._value.length;if(target.data().length!==i){return false;}
while(i--){if(this._value[i]!==target.data()[i]){return false;}}
return true;}
return false;};UUID.prototype.data=function(){return this._value;};UUID.prototype.toString=function(){var output='';for(var i=0,n=this._value.length;i<n;++i){if(i%2==0&&i>=4&&i<=10){output+='-';}
if(this._value[i]<0x10){output+='0';}
output+=this._value[i].toString(16);}
return output;};return UUID;})();var ENSENoteSerializer=(function(){"use strict";function formatTimeStamp(date){function pad(number){var r=String(number);if(r.length===1){r='0'+r;}
return r;}
return date.getUTCFullYear()
+pad(date.getUTCMonth()+1)
+pad(date.getUTCDate())
+'T'
+pad(date.getUTCHours())
+pad(date.getUTCMinutes())
+pad(date.getUTCSeconds())
+'Z';}
function base64FromArrayBuffer(arrayBuffer){var arrayString='';var offset=0;var uInt8Buffer=new Uint8Array(arrayBuffer);var bytesLeft=uInt8Buffer.byteLength;while(bytesLeft>0){var nextChunk=Math.min(bytesLeft,0x1000);var slice=uInt8Buffer.subarray(offset,offset+nextChunk);arrayString+=String.fromCharCode.apply(null,slice);offset+=nextChunk;bytesLeft-=nextChunk;}
return btoa(arrayString);}
function ENSENoteSerializer(note){this.note=note;this.timestamp=formatTimeStamp(new Date());}
ENSENoteSerializer.prototype.serializeResourceAttributes=function(resource){var serializedAttributes="";var attributes=resource.attributes;if(attributes.sourceURL){serializedAttributes+='<source-url>'+GlobalUtils.escapeXML(attributes.sourceURL)+'</source-url>';}
serializedAttributes+='<timestamp>'+GlobalUtils.escapeXML(this.timestamp)+'</timestamp>';if(attributes.fileName){serializedAttributes+='<file-name>'+GlobalUtils.escapeXML(attributes.fileName)+'</file-name>';}
return'<resource-attributes>'+serializedAttributes+'</resource-attributes>';};ENSENoteSerializer.prototype.serializeResource=function(resource){var serializedResource='';if(resource.data&&resource.data.body){serializedResource+='<data encoding="base64">\n';var base64Data=base64FromArrayBuffer(resource.data.body);base64Data.match(/.{1,80}/g).forEach(function(dataChunk){serializedResource+=dataChunk+'\n';});serializedResource+='</data>\n';}
if(resource.mime){serializedResource+='<mime>';serializedResource+=GlobalUtils.escapeXML(resource.mime);serializedResource+='</mime>';}
if(resource.width){serializedResource+='<width>';serializedResource+=GlobalUtils.escapeXML(resource.width);serializedResource+='</width>';}
if(resource.height){serializedResource+='<height>';serializedResource+=GlobalUtils.escapeXML(resource.height);serializedResource+='</height>';}
if(resource.duration){serializedResource+='<duration>';serializedResource+=GlobalUtils.escapeXML(resource.duration);serializedResource+='</duration>';}
serializedResource+=this.serializeResourceAttributes(resource);return'<resource>'+serializedResource+'</resource>';};ENSENoteSerializer.prototype.serializeNoteAttributes=function(){var serializedAttributes='';var attributes=this.note.attributes;if(attributes.source){serializedAttributes+='<source>'+GlobalUtils.escapeXML(attributes.source)+'</source>';}
if(attributes.sourceURL){serializedAttributes+='<source-url>'+GlobalUtils.escapeXML(attributes.sourceURL)+'</source-url>';}
return'<note-attributes>'+serializedAttributes+'</note-attributes>';};ENSENoteSerializer.prototype.serialize=function(){var noteENEX='';noteENEX+='<?xml version="1.0" encoding="UTF-8"?>\n';noteENEX+='<!DOCTYPE en-export SYSTEM "http://xml.evernote.com/pub/evernote-export3.dtd">\n';noteENEX+='<en-export export-date="'+GlobalUtils.escapeXML(this.timestamp)+'" ';noteENEX+='application="Evernote" version="Evernote Share Extension">\n';noteENEX+='<note>\n';if(this.note.title){noteENEX+='<title>'+GlobalUtils.escapeXML(this.note.title)+'</title>\n';}
noteENEX+='<content><![CDATA[';noteENEX+=this.note.content.replace(/]]>/g,']] >');noteENEX+=']]></content>\n';noteENEX+='<created>'+GlobalUtils.escapeXML(this.timestamp)+'</created>\n';noteENEX+='<updated>'+GlobalUtils.escapeXML(this.timestamp)+'</updated>\n';noteENEX+=this.serializeNoteAttributes();this.note.resources.forEach(function(resource){noteENEX+=this.serializeResource(resource)+'\n';},this);noteENEX+='</note>';noteENEX+='</en-export>';return noteENEX;};return ENSENoteSerializer;})();(function(){"use strict";function ENSEPreprocessor(){this.token=(new ENSUUID()).toString();this.hostConnection=null;this.clipperMessageHandler=null;this.mainSerializer=null;this.iframeSerializers=[];this.submitter=null;this.frameData={};}
ENSEPreprocessor.prototype.setupConnection=function(portNumber){this.hostConnection=new ENSEHostConnection(this.token);this.hostConnection.connect(portNumber);this.clipperMessageHandler=new ENSEClipperMessageHandler(this.hostConnection);};ENSEPreprocessor.prototype.serializeContent=function(){var iframes=document.getElementsByTagName('iframe');for(var i=0;i<iframes.length;i++){try{var iframe=iframes[i];var frameId="iframe_"+i;var content=iframe.contentWindow.document.body;iframe.dataset.en_id=frameId;var serializer=new HtmlSerializer();this.iframeSerializers.push(serializer);serializer.serialize(content,null,true,this.iframeSerializeCallback(frameId),null,iframe.contentWindow);}catch(error){}}
if(this.iframeSerializers.length==0){this.mainSerializer=new HtmlSerializer();this.mainSerializer.serialize(window.document.body,null,true,this.mainFrameSerializeCallback(),null,null);}};ENSEPreprocessor.prototype.iframeSerializeCallback=function(frameId){var self=this;return function(outHTML,error){if(error){console.log('Serialization error: ',error);}
self.frameData[frameId]=outHTML;if(Object.keys(self.frameData).length==self.iframeSerializers.length){self.mainSerializer=new HtmlSerializer();self.mainSerializer.serialize(window.document.body,null,true,self.mainFrameSerializeCallback(),self.frameData,null);}}};ENSEPreprocessor.prototype.mainFrameSerializeCallback=function(){var self=this;return function(outHTML,error){Browser.cleanUp();if(error){console.log('Serialization error: ',error);return;}
function submitterCallback(noteObject){var noteSerializer=new ENSENoteSerializer(noteObject);var noteENEX=noteSerializer.serialize();self.hostConnection.queueShareRequest(outHTML,noteENEX);self.hostConnection.disconnect();}
self.submitter=new Submitter(self.hostConnection,submitterCallback);self.submitter.createNote(document.title,null,null,document.baseURI,null,outHTML,null);}};ENSEPreprocessor.prototype.connectAndSerialize=function(portNumber){var self=this;window.setTimeout(function(){self.setupConnection(portNumber);self.serializeContent();},200);};ENSEPreprocessor.prototype.run=function(environment){var self=this;function isPDFContent(){var href=location.href;var element=document.querySelector('embed[src^="'+href+'"]');if(element&&element.type=='application/pdf'){return true;}
return false;}
ENSEHostConnection.findAvailablePort(function(portNumber){var reply={"token":self.token,"title":document.title,"base_url":document.baseURI,"is_pdf_document":isPDFContent(),"user_agent":navigator.userAgent,"port_number":portNumber};environment.completionFunction(reply);if(portNumber){self.connectAndSerialize(portNumber);}});};window.ExtensionPreprocessingJS=new ENSEPreprocessor();})();})();