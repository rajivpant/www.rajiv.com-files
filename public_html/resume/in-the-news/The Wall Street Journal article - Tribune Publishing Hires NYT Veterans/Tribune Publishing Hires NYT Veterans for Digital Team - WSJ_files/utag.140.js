//tealium universal tag - utag.140 ut4.0.201505051448, Copyright 2015 Tealium.com Inc. All Rights Reserved.
var __reach_config={};try{(function(id,loader,u){try{u=utag.o[loader].sender[id]={}}catch(e){u=utag.sender[id]};u.ev={'view':1};u.qsp_delim="&";u.kvp_delim="=";u.pid="53289f5897b0c91974000045";u.base_url="//d8rk54i4mohrb.cloudfront.net/js/reach.js";u.map={"dom.url":"url","dom.domain":"domain","dom.title":"title","ignore_errors":"ignore_errors","tags_SR":"tags","channels_SR":"channels","publishDate_SR":"date"};u.extend=[function(a,b){try{if(1){b['channels_SR']='WSJ | Vertical';b['tags_SR']='WSJ | Vertical-E | Supply Chain Logistics';b['publishDate_SR']='2015-04-30 00:00:00 UTC';b['ignore_errors']='false'}}catch(e){utag.DB(e)}}];u.send=function(a,b,c,d,e,f){if(u.ev[a]||typeof u.ev.all!="undefined"){__reach_config={};for(c=0;c<u.extend.length;c++){try{d=u.extend[c](a,b);if(d==false)return}catch(e){}};for(d in utag.loader.GV(u.map)){if(typeof b[d]!=="undefined"&&b[d]!==""){e=u.map[d].split(",");for(f=0;f<e.length;f++){if(b[d]instanceof Array){__reach_config[e[f]]=b[d].slice(0);}else if((e[f]=="authors"||e[f]=="channels"||e[f]=="tags")&&b[d].indexOf("|")){__reach_config[e[f]]=b[d].split("|");}else{__reach_config[e[f]]=b[d];}}}}
if(u.pid!=""&&typeof __reach_config.pid=="undefined"){__reach_config.pid=u.pid;}
d='tealium_tag_19041';if(document.getElementById(d)){SPR.Reach.collect(__reach_config);}else{c=document.createElement('script');c.type='text/javascript';c.async=true;c.id=d;c.src=u.base_url;f=document.getElementsByTagName('head')[0];f.appendChild(c);}}}
try{utag.o[loader].loader.LOAD(id)}catch(e){utag.loader.LOAD(id)}})('140','wsjdn.wsjarticles');}catch(e){}