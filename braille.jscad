///////// Copied from: https://github.com/ojsc/opentype.jscad

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Font3D=f()}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){const _CSGDEBUG=false;const defaultResolution2D=32;const defaultResolution3D=12;const EPS=1e-5;const angleEPS=.1;const areaEPS=.5*EPS*EPS*Math.sin(angleEPS);const all=0;const top=1;const bottom=2;const left=3;const right=4;const front=5;const back=6;let staticTag=1;const getTag=()=>staticTag++;module.exports={_CSGDEBUG:_CSGDEBUG,defaultResolution2D:defaultResolution2D,defaultResolution3D:defaultResolution3D,EPS:EPS,angleEPS:angleEPS,areaEPS:areaEPS,all:all,top:top,bottom:bottom,left:left,right:right,front:front,back:back,staticTag:staticTag,getTag:getTag}},{}],2:[function(require,module,exports){const{EPS:EPS}=require("../constants");const{solve2Linear:solve2Linear}=require("../utils");const linesIntersect=function(p0start,p0end,p1start,p1end){if(p0end.equals(p1start)||p1end.equals(p0start)){let d=p1end.minus(p1start).unit().plus(p0end.minus(p0start).unit()).length();if(d<EPS){return true}}else{let d0=p0end.minus(p0start);let d1=p1end.minus(p1start);if(Math.abs(d0.cross(d1))<1e-9)return false;let alphas=solve2Linear(-d0.x,d1.x,-d0.y,d1.y,p0start.x-p1start.x,p0start.y-p1start.y);if(alphas[0]>1e-6&&alphas[0]<.999999&&alphas[1]>1e-5&&alphas[1]<.999999)return true}return false};module.exports={linesIntersect:linesIntersect}},{"../constants":1,"../utils":3}],3:[function(require,module,exports){function fnNumberSort(a,b){return a-b}function fnSortByIndex(a,b){return a.index-b.index}const IsFloat=function(n){return!isNaN(n)||n===Infinity||n===-Infinity};const solve2Linear=function(a,b,c,d,u,v){let det=a*d-b*c;let invdet=1/det;let x=u*d-b*v;let y=-u*c+a*v;x*=invdet;y*=invdet;return[x,y]};function insertSorted(array,element,comparefunc){let leftbound=0;let rightbound=array.length;while(rightbound>leftbound){let testindex=Math.floor((leftbound+rightbound)/2);let testelement=array[testindex];let compareresult=comparefunc(element,testelement);if(compareresult>0){leftbound=testindex+1}else{rightbound=testindex}}array.splice(leftbound,0,element)}const interpolateBetween2DPointsForY=function(point1,point2,y){let f1=y-point1.y;let f2=point2.y-point1.y;if(f2<0){f1=-f1;f2=-f2}let t;if(f1<=0){t=0}else if(f1>=f2){t=1}else if(f2<1e-10){t=.5}else{t=f1/f2}let result=point1.x+t*(point2.x-point1.x);return result};function isCAG(object){if(!("sides"in object)){return false}if(!("length"in object.sides)){return false}return true}function isCSG(object){if(!("polygons"in object)){return false}if(!("length"in object.polygons)){return false}return true}module.exports={fnNumberSort:fnNumberSort,fnSortByIndex:fnSortByIndex,IsFloat:IsFloat,solve2Linear:solve2Linear,insertSorted:insertSorted,interpolateBetween2DPointsForY:interpolateBetween2DPointsForY,isCAG:isCAG,isCSG:isCSG}},{}],4:[function(require,module,exports){const{areaEPS:areaEPS}=require("../constants");const{linesIntersect:linesIntersect}=require("../math/lineUtils");const isCAGValid=function(CAG){let errors=[];if(CAG.isSelfIntersecting(true)){errors.push("Self intersects")}let pointcount={};CAG.sides.map(function(side){function mappoint(p){let tag=p.x+" "+p.y;if(!(tag in pointcount))pointcount[tag]=0;pointcount[tag]++}mappoint(side.vertex0.pos);mappoint(side.vertex1.pos)});for(let tag in pointcount){let count=pointcount[tag];if(count&1){errors.push("Uneven number of sides ("+count+") for point "+tag)}}let area=CAG.area();if(area<areaEPS){errors.push("Area is "+area)}if(errors.length>0){let ertxt="";errors.map(function(err){ertxt+=err+"\n"});throw new Error(ertxt)}};const isSelfIntersecting=function(cag,debug){let numsides=cag.sides.length;for(let i=0;i<numsides;i++){let side0=cag.sides[i];for(let ii=i+1;ii<numsides;ii++){let side1=cag.sides[ii];if(linesIntersect(side0.vertex0.pos,side0.vertex1.pos,side1.vertex0.pos,side1.vertex1.pos)){if(debug){console.log("side "+i+": "+side0);console.log("side "+ii+": "+side1)}return true}}}return false};const hasPointInside=function(cag,p0){let p1=null;let p2=null;let inside=false;cag.sides.forEach(side=>{p1=side.vertex0.pos;p2=side.vertex1.pos;if(hasPointInside.c1(p0,p1,p2)&&hasPointInside.c2(p0,p1,p2)){inside=!inside}});return inside};hasPointInside.c1=((p0,p1,p2)=>p1.y>p0.y!==p2.y>p0.y);hasPointInside.c2=((p0,p1,p2)=>p0.x<(p2.x-p1.x)*(p0.y-p1.y)/(p2.y-p1.y)+p1.x);const contains=function(cag1,cag2){for(let i=0,il=cag2.sides.length;i<il;i++){if(!hasPointInside(cag1,cag2.sides[i].vertex0.pos)){return false}}return true};module.exports={isCAGValid:isCAGValid,isSelfIntersecting:isSelfIntersecting,hasPointInside:hasPointInside,contains:contains}},{"../constants":1,"../math/lineUtils":2}],5:[function(require,module,exports){(function(Buffer){(function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?factory(exports):typeof define==="function"&&define.amd?define(["exports"],factory):factory(global.opentype={})})(this,function(exports){"use strict";if(!String.prototype.codePointAt){(function(){var defineProperty=function(){try{var object={};var $defineProperty=Object.defineProperty;var result=$defineProperty(object,object,object)&&$defineProperty}catch(error){}return result}();var codePointAt=function(position){if(this==null){throw TypeError()}var string=String(this);var size=string.length;var index=position?Number(position):0;if(index!=index){index=0}if(index<0||index>=size){return undefined}var first=string.charCodeAt(index);var second;if(first>=55296&&first<=56319&&size>index+1){second=string.charCodeAt(index+1);if(second>=56320&&second<=57343){return(first-55296)*1024+second-56320+65536}}return first};if(defineProperty){defineProperty(String.prototype,"codePointAt",{value:codePointAt,configurable:true,writable:true})}else{String.prototype.codePointAt=codePointAt}})()}var TINF_OK=0;var TINF_DATA_ERROR=-3;function Tree(){this.table=new Uint16Array(16);this.trans=new Uint16Array(288)}function Data(source,dest){this.source=source;this.sourceIndex=0;this.tag=0;this.bitcount=0;this.dest=dest;this.destLen=0;this.ltree=new Tree;this.dtree=new Tree}var sltree=new Tree;var sdtree=new Tree;var length_bits=new Uint8Array(30);var length_base=new Uint16Array(30);var dist_bits=new Uint8Array(30);var dist_base=new Uint16Array(30);var clcidx=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);var code_tree=new Tree;var lengths=new Uint8Array(288+32);function tinf_build_bits_base(bits,base,delta,first){var i,sum;for(i=0;i<delta;++i){bits[i]=0}for(i=0;i<30-delta;++i){bits[i+delta]=i/delta|0}for(sum=first,i=0;i<30;++i){base[i]=sum;sum+=1<<bits[i]}}function tinf_build_fixed_trees(lt,dt){var i;for(i=0;i<7;++i){lt.table[i]=0}lt.table[7]=24;lt.table[8]=152;lt.table[9]=112;for(i=0;i<24;++i){lt.trans[i]=256+i}for(i=0;i<144;++i){lt.trans[24+i]=i}for(i=0;i<8;++i){lt.trans[24+144+i]=280+i}for(i=0;i<112;++i){lt.trans[24+144+8+i]=144+i}for(i=0;i<5;++i){dt.table[i]=0}dt.table[5]=32;for(i=0;i<32;++i){dt.trans[i]=i}}var offs=new Uint16Array(16);function tinf_build_tree(t,lengths,off,num){var i,sum;for(i=0;i<16;++i){t.table[i]=0}for(i=0;i<num;++i){t.table[lengths[off+i]]++}t.table[0]=0;for(sum=0,i=0;i<16;++i){offs[i]=sum;sum+=t.table[i]}for(i=0;i<num;++i){if(lengths[off+i]){t.trans[offs[lengths[off+i]]++]=i}}}function tinf_getbit(d){if(!d.bitcount--){d.tag=d.source[d.sourceIndex++];d.bitcount=7}var bit=d.tag&1;d.tag>>>=1;return bit}function tinf_read_bits(d,num,base){if(!num){return base}while(d.bitcount<24){d.tag|=d.source[d.sourceIndex++]<<d.bitcount;d.bitcount+=8}var val=d.tag&65535>>>16-num;d.tag>>>=num;d.bitcount-=num;return val+base}function tinf_decode_symbol(d,t){while(d.bitcount<24){d.tag|=d.source[d.sourceIndex++]<<d.bitcount;d.bitcount+=8}var sum=0,cur=0,len=0;var tag=d.tag;do{cur=2*cur+(tag&1);tag>>>=1;++len;sum+=t.table[len];cur-=t.table[len]}while(cur>=0);d.tag=tag;d.bitcount-=len;return t.trans[sum+cur]}function tinf_decode_trees(d,lt,dt){var hlit,hdist,hclen;var i,num,length;hlit=tinf_read_bits(d,5,257);hdist=tinf_read_bits(d,5,1);hclen=tinf_read_bits(d,4,4);for(i=0;i<19;++i){lengths[i]=0}for(i=0;i<hclen;++i){var clen=tinf_read_bits(d,3,0);lengths[clcidx[i]]=clen}tinf_build_tree(code_tree,lengths,0,19);for(num=0;num<hlit+hdist;){var sym=tinf_decode_symbol(d,code_tree);switch(sym){case 16:var prev=lengths[num-1];for(length=tinf_read_bits(d,2,3);length;--length){lengths[num++]=prev}break;case 17:for(length=tinf_read_bits(d,3,3);length;--length){lengths[num++]=0}break;case 18:for(length=tinf_read_bits(d,7,11);length;--length){lengths[num++]=0}break;default:lengths[num++]=sym;break}}tinf_build_tree(lt,lengths,0,hlit);tinf_build_tree(dt,lengths,hlit,hdist)}function tinf_inflate_block_data(d,lt,dt){while(1){var sym=tinf_decode_symbol(d,lt);if(sym===256){return TINF_OK}if(sym<256){d.dest[d.destLen++]=sym}else{var length,dist,offs;var i;sym-=257;length=tinf_read_bits(d,length_bits[sym],length_base[sym]);dist=tinf_decode_symbol(d,dt);offs=d.destLen-tinf_read_bits(d,dist_bits[dist],dist_base[dist]);for(i=offs;i<offs+length;++i){d.dest[d.destLen++]=d.dest[i]}}}}function tinf_inflate_uncompressed_block(d){var length,invlength;var i;while(d.bitcount>8){d.sourceIndex--;d.bitcount-=8}length=d.source[d.sourceIndex+1];length=256*length+d.source[d.sourceIndex];invlength=d.source[d.sourceIndex+3];invlength=256*invlength+d.source[d.sourceIndex+2];if(length!==(~invlength&65535)){return TINF_DATA_ERROR}d.sourceIndex+=4;for(i=length;i;--i){d.dest[d.destLen++]=d.source[d.sourceIndex++]}d.bitcount=0;return TINF_OK}function tinf_uncompress(source,dest){var d=new Data(source,dest);var bfinal,btype,res;do{bfinal=tinf_getbit(d);btype=tinf_read_bits(d,2,0);switch(btype){case 0:res=tinf_inflate_uncompressed_block(d);break;case 1:res=tinf_inflate_block_data(d,sltree,sdtree);break;case 2:tinf_decode_trees(d,d.ltree,d.dtree);res=tinf_inflate_block_data(d,d.ltree,d.dtree);break;default:res=TINF_DATA_ERROR}if(res!==TINF_OK){throw new Error("Data error")}}while(!bfinal);if(d.destLen<d.dest.length){if(typeof d.dest.slice==="function"){return d.dest.slice(0,d.destLen)}else{return d.dest.subarray(0,d.destLen)}}return d.dest}tinf_build_fixed_trees(sltree,sdtree);tinf_build_bits_base(length_bits,length_base,4,3);tinf_build_bits_base(dist_bits,dist_base,2,1);length_bits[28]=0;length_base[28]=258;var tinyInflate=tinf_uncompress;function derive(v0,v1,v2,v3,t){return Math.pow(1-t,3)*v0+3*Math.pow(1-t,2)*t*v1+3*(1-t)*Math.pow(t,2)*v2+Math.pow(t,3)*v3}function BoundingBox(){this.x1=Number.NaN;this.y1=Number.NaN;this.x2=Number.NaN;this.y2=Number.NaN}BoundingBox.prototype.isEmpty=function(){return isNaN(this.x1)||isNaN(this.y1)||isNaN(this.x2)||isNaN(this.y2)};BoundingBox.prototype.addPoint=function(x,y){if(typeof x==="number"){if(isNaN(this.x1)||isNaN(this.x2)){this.x1=x;this.x2=x}if(x<this.x1){this.x1=x}if(x>this.x2){this.x2=x}}if(typeof y==="number"){if(isNaN(this.y1)||isNaN(this.y2)){this.y1=y;this.y2=y}if(y<this.y1){this.y1=y}if(y>this.y2){this.y2=y}}};BoundingBox.prototype.addX=function(x){this.addPoint(x,null)};BoundingBox.prototype.addY=function(y){this.addPoint(null,y)};BoundingBox.prototype.addBezier=function(x0,y0,x1,y1,x2,y2,x,y){var this$1=this;var p0=[x0,y0];var p1=[x1,y1];var p2=[x2,y2];var p3=[x,y];this.addPoint(x0,y0);this.addPoint(x,y);for(var i=0;i<=1;i++){var b=6*p0[i]-12*p1[i]+6*p2[i];var a=-3*p0[i]+9*p1[i]-9*p2[i]+3*p3[i];var c=3*p1[i]-3*p0[i];if(a===0){if(b===0){continue}var t=-c/b;if(0<t&&t<1){if(i===0){this$1.addX(derive(p0[i],p1[i],p2[i],p3[i],t))}if(i===1){this$1.addY(derive(p0[i],p1[i],p2[i],p3[i],t))}}continue}var b2ac=Math.pow(b,2)-4*c*a;if(b2ac<0){continue}var t1=(-b+Math.sqrt(b2ac))/(2*a);if(0<t1&&t1<1){if(i===0){this$1.addX(derive(p0[i],p1[i],p2[i],p3[i],t1))}if(i===1){this$1.addY(derive(p0[i],p1[i],p2[i],p3[i],t1))}}var t2=(-b-Math.sqrt(b2ac))/(2*a);if(0<t2&&t2<1){if(i===0){this$1.addX(derive(p0[i],p1[i],p2[i],p3[i],t2))}if(i===1){this$1.addY(derive(p0[i],p1[i],p2[i],p3[i],t2))}}}};BoundingBox.prototype.addQuad=function(x0,y0,x1,y1,x,y){var cp1x=x0+2/3*(x1-x0);var cp1y=y0+2/3*(y1-y0);var cp2x=cp1x+1/3*(x-x0);var cp2y=cp1y+1/3*(y-y0);this.addBezier(x0,y0,cp1x,cp1y,cp2x,cp2y,x,y)};function Path(){this.commands=[];this.fill="black";this.stroke=null;this.strokeWidth=1}Path.prototype.moveTo=function(x,y){this.commands.push({type:"M",x:x,y:y})};Path.prototype.lineTo=function(x,y){this.commands.push({type:"L",x:x,y:y})};Path.prototype.curveTo=Path.prototype.bezierCurveTo=function(x1,y1,x2,y2,x,y){this.commands.push({type:"C",x1:x1,y1:y1,x2:x2,y2:y2,x:x,y:y})};Path.prototype.quadTo=Path.prototype.quadraticCurveTo=function(x1,y1,x,y){this.commands.push({type:"Q",x1:x1,y1:y1,x:x,y:y})};Path.prototype.close=Path.prototype.closePath=function(){this.commands.push({type:"Z"})};Path.prototype.extend=function(pathOrCommands){if(pathOrCommands.commands){pathOrCommands=pathOrCommands.commands}else if(pathOrCommands instanceof BoundingBox){var box=pathOrCommands;this.moveTo(box.x1,box.y1);this.lineTo(box.x2,box.y1);this.lineTo(box.x2,box.y2);this.lineTo(box.x1,box.y2);this.close();return}Array.prototype.push.apply(this.commands,pathOrCommands)};Path.prototype.getBoundingBox=function(){var this$1=this;var box=new BoundingBox;var startX=0;var startY=0;var prevX=0;var prevY=0;for(var i=0;i<this.commands.length;i++){var cmd=this$1.commands[i];switch(cmd.type){case"M":box.addPoint(cmd.x,cmd.y);startX=prevX=cmd.x;startY=prevY=cmd.y;break;case"L":box.addPoint(cmd.x,cmd.y);prevX=cmd.x;prevY=cmd.y;break;case"Q":box.addQuad(prevX,prevY,cmd.x1,cmd.y1,cmd.x,cmd.y);prevX=cmd.x;prevY=cmd.y;break;case"C":box.addBezier(prevX,prevY,cmd.x1,cmd.y1,cmd.x2,cmd.y2,cmd.x,cmd.y);prevX=cmd.x;prevY=cmd.y;break;case"Z":prevX=startX;prevY=startY;break;default:throw new Error("Unexpected path command "+cmd.type)}}if(box.isEmpty()){box.addPoint(0,0)}return box};Path.prototype.draw=function(ctx){var this$1=this;ctx.beginPath();for(var i=0;i<this.commands.length;i+=1){var cmd=this$1.commands[i];if(cmd.type==="M"){ctx.moveTo(cmd.x,cmd.y)}else if(cmd.type==="L"){ctx.lineTo(cmd.x,cmd.y)}else if(cmd.type==="C"){ctx.bezierCurveTo(cmd.x1,cmd.y1,cmd.x2,cmd.y2,cmd.x,cmd.y)}else if(cmd.type==="Q"){ctx.quadraticCurveTo(cmd.x1,cmd.y1,cmd.x,cmd.y)}else if(cmd.type==="Z"){ctx.closePath()}}if(this.fill){ctx.fillStyle=this.fill;ctx.fill()}if(this.stroke){ctx.strokeStyle=this.stroke;ctx.lineWidth=this.strokeWidth;ctx.stroke()}};Path.prototype.toPathData=function(decimalPlaces){var this$1=this;decimalPlaces=decimalPlaces!==undefined?decimalPlaces:2;function floatToString(v){if(Math.round(v)===v){return""+Math.round(v)}else{return v.toFixed(decimalPlaces)}}function packValues(){var arguments$1=arguments;var s="";for(var i=0;i<arguments.length;i+=1){var v=arguments$1[i];if(v>=0&&i>0){s+=" "}s+=floatToString(v)}return s}var d="";for(var i=0;i<this.commands.length;i+=1){var cmd=this$1.commands[i];if(cmd.type==="M"){d+="M"+packValues(cmd.x,cmd.y)}else if(cmd.type==="L"){d+="L"+packValues(cmd.x,cmd.y)}else if(cmd.type==="C"){d+="C"+packValues(cmd.x1,cmd.y1,cmd.x2,cmd.y2,cmd.x,cmd.y)}else if(cmd.type==="Q"){d+="Q"+packValues(cmd.x1,cmd.y1,cmd.x,cmd.y)}else if(cmd.type==="Z"){d+="Z"}}return d};Path.prototype.toSVG=function(decimalPlaces){var svg='<path d="';svg+=this.toPathData(decimalPlaces);svg+='"';if(this.fill&&this.fill!=="black"){if(this.fill===null){svg+=' fill="none"'}else{svg+=' fill="'+this.fill+'"'}}if(this.stroke){svg+=' stroke="'+this.stroke+'" stroke-width="'+this.strokeWidth+'"'}svg+="/>";return svg};Path.prototype.toDOMElement=function(decimalPlaces){var temporaryPath=this.toPathData(decimalPlaces);var newPath=document.createElementNS("http://www.w3.org/2000/svg","path");newPath.setAttribute("d",temporaryPath);return newPath};function fail(message){throw new Error(message)}function argument(predicate,message){if(!predicate){fail(message)}}var check={fail:fail,argument:argument,assert:argument};var LIMIT16=32768;var LIMIT32=2147483648;var decode={};var encode={};var sizeOf={};function constant(v){return function(){return v}}encode.BYTE=function(v){check.argument(v>=0&&v<=255,"Byte value should be between 0 and 255.");return[v]};sizeOf.BYTE=constant(1);encode.CHAR=function(v){return[v.charCodeAt(0)]};sizeOf.CHAR=constant(1);encode.CHARARRAY=function(v){var b=[];for(var i=0;i<v.length;i+=1){b[i]=v.charCodeAt(i)}return b};sizeOf.CHARARRAY=function(v){return v.length};encode.USHORT=function(v){return[v>>8&255,v&255]};sizeOf.USHORT=constant(2);encode.SHORT=function(v){if(v>=LIMIT16){v=-(2*LIMIT16-v)}return[v>>8&255,v&255]};sizeOf.SHORT=constant(2);encode.UINT24=function(v){return[v>>16&255,v>>8&255,v&255]};sizeOf.UINT24=constant(3);encode.ULONG=function(v){return[v>>24&255,v>>16&255,v>>8&255,v&255]};sizeOf.ULONG=constant(4);encode.LONG=function(v){if(v>=LIMIT32){v=-(2*LIMIT32-v)}return[v>>24&255,v>>16&255,v>>8&255,v&255]};sizeOf.LONG=constant(4);encode.FIXED=encode.ULONG;sizeOf.FIXED=sizeOf.ULONG;encode.FWORD=encode.SHORT;sizeOf.FWORD=sizeOf.SHORT;encode.UFWORD=encode.USHORT;sizeOf.UFWORD=sizeOf.USHORT;encode.LONGDATETIME=function(v){return[0,0,0,0,v>>24&255,v>>16&255,v>>8&255,v&255]};sizeOf.LONGDATETIME=constant(8);encode.TAG=function(v){check.argument(v.length===4,"Tag should be exactly 4 ASCII characters.");return[v.charCodeAt(0),v.charCodeAt(1),v.charCodeAt(2),v.charCodeAt(3)]};sizeOf.TAG=constant(4);encode.Card8=encode.BYTE;sizeOf.Card8=sizeOf.BYTE;encode.Card16=encode.USHORT;sizeOf.Card16=sizeOf.USHORT;encode.OffSize=encode.BYTE;sizeOf.OffSize=sizeOf.BYTE;encode.SID=encode.USHORT;sizeOf.SID=sizeOf.USHORT;encode.NUMBER=function(v){if(v>=-107&&v<=107){return[v+139]}else if(v>=108&&v<=1131){v=v-108;return[(v>>8)+247,v&255]}else if(v>=-1131&&v<=-108){v=-v-108;return[(v>>8)+251,v&255]}else if(v>=-32768&&v<=32767){return encode.NUMBER16(v)}else{return encode.NUMBER32(v)}};sizeOf.NUMBER=function(v){return encode.NUMBER(v).length};encode.NUMBER16=function(v){return[28,v>>8&255,v&255]};sizeOf.NUMBER16=constant(3);encode.NUMBER32=function(v){return[29,v>>24&255,v>>16&255,v>>8&255,v&255]};sizeOf.NUMBER32=constant(5);encode.REAL=function(v){var value=v.toString();var m=/\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(value);if(m){var epsilon=parseFloat("1e"+((m[2]?+m[2]:0)+m[1].length));value=(Math.round(v*epsilon)/epsilon).toString()}var nibbles="";for(var i=0,ii=value.length;i<ii;i+=1){var c=value[i];if(c==="e"){nibbles+=value[++i]==="-"?"c":"b"}else if(c==="."){nibbles+="a"}else if(c==="-"){nibbles+="e"}else{nibbles+=c}}nibbles+=nibbles.length&1?"f":"ff";var out=[30];for(var i$1=0,ii$1=nibbles.length;i$1<ii$1;i$1+=2){out.push(parseInt(nibbles.substr(i$1,2),16))}return out};sizeOf.REAL=function(v){return encode.REAL(v).length};encode.NAME=encode.CHARARRAY;sizeOf.NAME=sizeOf.CHARARRAY;encode.STRING=encode.CHARARRAY;sizeOf.STRING=sizeOf.CHARARRAY;decode.UTF8=function(data,offset,numBytes){var codePoints=[];var numChars=numBytes;for(var j=0;j<numChars;j++,offset+=1){codePoints[j]=data.getUint8(offset)}return String.fromCharCode.apply(null,codePoints)};decode.UTF16=function(data,offset,numBytes){var codePoints=[];var numChars=numBytes/2;for(var j=0;j<numChars;j++,offset+=2){codePoints[j]=data.getUint16(offset)}return String.fromCharCode.apply(null,codePoints)};encode.UTF16=function(v){var b=[];for(var i=0;i<v.length;i+=1){var codepoint=v.charCodeAt(i);b[b.length]=codepoint>>8&255;b[b.length]=codepoint&255}return b};sizeOf.UTF16=function(v){return v.length*2};var eightBitMacEncodings={"x-mac-croatian":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø"+"¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ","x-mac-cyrillic":"АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњ"+"јЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю","x-mac-gaelic":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæø"+"ṁṖṗɼƒſṠ«»… ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ","x-mac-greek":"Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩ"+"άΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ­","x-mac-icelandic":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø"+"¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ","x-mac-inuit":"ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗ"+"ᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł","x-mac-ce":"ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅ"+"ņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ",macintosh:"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø"+"¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ","x-mac-romanian":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș"+"¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ","x-mac-turkish":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø"+"¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ"};decode.MACSTRING=function(dataView,offset,dataLength,encoding){var table=eightBitMacEncodings[encoding];if(table===undefined){return undefined}var result="";for(var i=0;i<dataLength;i++){var c=dataView.getUint8(offset+i);if(c<=127){result+=String.fromCharCode(c)}else{result+=table[c&127]}}return result};var macEncodingTableCache=typeof WeakMap==="function"&&new WeakMap;var macEncodingCacheKeys;var getMacEncodingTable=function(encoding){if(!macEncodingCacheKeys){macEncodingCacheKeys={};for(var e in eightBitMacEncodings){macEncodingCacheKeys[e]=new String(e)}}var cacheKey=macEncodingCacheKeys[encoding];if(cacheKey===undefined){return undefined}if(macEncodingTableCache){var cachedTable=macEncodingTableCache.get(cacheKey);if(cachedTable!==undefined){return cachedTable}}var decodingTable=eightBitMacEncodings[encoding];if(decodingTable===undefined){return undefined}var encodingTable={};for(var i=0;i<decodingTable.length;i++){encodingTable[decodingTable.charCodeAt(i)]=i+128}if(macEncodingTableCache){macEncodingTableCache.set(cacheKey,encodingTable)}return encodingTable};encode.MACSTRING=function(str,encoding){var table=getMacEncodingTable(encoding);if(table===undefined){return undefined}var result=[];for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);if(c>=128){c=table[c];if(c===undefined){return undefined}}result[i]=c}return result};sizeOf.MACSTRING=function(str,encoding){var b=encode.MACSTRING(str,encoding);if(b!==undefined){return b.length}else{return 0}};function isByteEncodable(value){return value>=-128&&value<=127}function encodeVarDeltaRunAsZeroes(deltas,pos,result){var runLength=0;var numDeltas=deltas.length;while(pos<numDeltas&&runLength<64&&deltas[pos]===0){++pos;++runLength}result.push(128|runLength-1);return pos}function encodeVarDeltaRunAsBytes(deltas,offset,result){var runLength=0;var numDeltas=deltas.length;var pos=offset;while(pos<numDeltas&&runLength<64){var value=deltas[pos];if(!isByteEncodable(value)){break}if(value===0&&pos+1<numDeltas&&deltas[pos+1]===0){break}++pos;++runLength}result.push(runLength-1);for(var i=offset;i<pos;++i){result.push(deltas[i]+256&255)}return pos}function encodeVarDeltaRunAsWords(deltas,offset,result){var runLength=0;var numDeltas=deltas.length;var pos=offset;while(pos<numDeltas&&runLength<64){var value=deltas[pos];if(value===0){break}if(isByteEncodable(value)&&pos+1<numDeltas&&isByteEncodable(deltas[pos+1])){break}++pos;++runLength}result.push(64|runLength-1);for(var i=offset;i<pos;++i){var val=deltas[i];result.push(val+65536>>8&255,val+256&255)}return pos}encode.VARDELTAS=function(deltas){var pos=0;var result=[];while(pos<deltas.length){var value=deltas[pos];if(value===0){pos=encodeVarDeltaRunAsZeroes(deltas,pos,result)}else if(value>=-128&&value<=127){pos=encodeVarDeltaRunAsBytes(deltas,pos,result)}else{pos=encodeVarDeltaRunAsWords(deltas,pos,result)}}return result};encode.INDEX=function(l){var offset=1;var offsets=[offset];var data=[];for(var i=0;i<l.length;i+=1){var v=encode.OBJECT(l[i]);Array.prototype.push.apply(data,v);offset+=v.length;offsets.push(offset)}if(data.length===0){return[0,0]}var encodedOffsets=[];var offSize=1+Math.floor(Math.log(offset)/Math.log(2))/8|0;var offsetEncoder=[undefined,encode.BYTE,encode.USHORT,encode.UINT24,encode.ULONG][offSize];for(var i$1=0;i$1<offsets.length;i$1+=1){var encodedOffset=offsetEncoder(offsets[i$1]);Array.prototype.push.apply(encodedOffsets,encodedOffset)}return Array.prototype.concat(encode.Card16(l.length),encode.OffSize(offSize),encodedOffsets,data)};sizeOf.INDEX=function(v){return encode.INDEX(v).length};encode.DICT=function(m){var d=[];var keys=Object.keys(m);var length=keys.length;for(var i=0;i<length;i+=1){var k=parseInt(keys[i],0);var v=m[k];d=d.concat(encode.OPERAND(v.value,v.type));d=d.concat(encode.OPERATOR(k))}return d};sizeOf.DICT=function(m){return encode.DICT(m).length};encode.OPERATOR=function(v){if(v<1200){return[v]}else{return[12,v-1200]}};encode.OPERAND=function(v,type){var d=[];if(Array.isArray(type)){for(var i=0;i<type.length;i+=1){check.argument(v.length===type.length,"Not enough arguments given for type"+type);d=d.concat(encode.OPERAND(v[i],type[i]))}}else{if(type==="SID"){d=d.concat(encode.NUMBER(v))}else if(type==="offset"){d=d.concat(encode.NUMBER32(v))}else if(type==="number"){d=d.concat(encode.NUMBER(v))}else if(type==="real"){d=d.concat(encode.REAL(v))}else{throw new Error("Unknown operand type "+type)}}return d};encode.OP=encode.BYTE;sizeOf.OP=sizeOf.BYTE;var wmm=typeof WeakMap==="function"&&new WeakMap;encode.CHARSTRING=function(ops){if(wmm){var cachedValue=wmm.get(ops);if(cachedValue!==undefined){return cachedValue}}var d=[];var length=ops.length;for(var i=0;i<length;i+=1){var op=ops[i];d=d.concat(encode[op.type](op.value))}if(wmm){wmm.set(ops,d)}return d};sizeOf.CHARSTRING=function(ops){return encode.CHARSTRING(ops).length};encode.OBJECT=function(v){var encodingFunction=encode[v.type];check.argument(encodingFunction!==undefined,"No encoding function for type "+v.type);return encodingFunction(v.value)};sizeOf.OBJECT=function(v){var sizeOfFunction=sizeOf[v.type];check.argument(sizeOfFunction!==undefined,"No sizeOf function for type "+v.type);return sizeOfFunction(v.value)};encode.TABLE=function(table){var d=[];var length=table.fields.length;var subtables=[];var subtableOffsets=[];for(var i=0;i<length;i+=1){var field=table.fields[i];var encodingFunction=encode[field.type];check.argument(encodingFunction!==undefined,"No encoding function for field type "+field.type+" ("+field.name+")");var value=table[field.name];if(value===undefined){value=field.value}var bytes=encodingFunction(value);if(field.type==="TABLE"){subtableOffsets.push(d.length);d=d.concat([0,0]);subtables.push(bytes)}else{d=d.concat(bytes)}}for(var i$1=0;i$1<subtables.length;i$1+=1){var o=subtableOffsets[i$1];var offset=d.length;check.argument(offset<65536,"Table "+table.tableName+" too big.");d[o]=offset>>8;d[o+1]=offset&255;d=d.concat(subtables[i$1])}return d};sizeOf.TABLE=function(table){var numBytes=0;var length=table.fields.length;for(var i=0;i<length;i+=1){var field=table.fields[i];var sizeOfFunction=sizeOf[field.type];check.argument(sizeOfFunction!==undefined,"No sizeOf function for field type "+field.type+" ("+field.name+")");var value=table[field.name];if(value===undefined){value=field.value}numBytes+=sizeOfFunction(value);if(field.type==="TABLE"){numBytes+=2}}return numBytes};encode.RECORD=encode.TABLE;sizeOf.RECORD=sizeOf.TABLE;encode.LITERAL=function(v){return v};sizeOf.LITERAL=function(v){return v.length};function Table(tableName,fields,options){var this$1=this;for(var i=0;i<fields.length;i+=1){var field=fields[i];this$1[field.name]=field.value}this.tableName=tableName;this.fields=fields;if(options){var optionKeys=Object.keys(options);for(var i$1=0;i$1<optionKeys.length;i$1+=1){var k=optionKeys[i$1];var v=options[k];if(this$1[k]!==undefined){this$1[k]=v}}}}Table.prototype.encode=function(){return encode.TABLE(this)};Table.prototype.sizeOf=function(){return sizeOf.TABLE(this)};function ushortList(itemName,list,count){if(count===undefined){count=list.length}var fields=new Array(list.length+1);fields[0]={name:itemName+"Count",type:"USHORT",value:count};for(var i=0;i<list.length;i++){fields[i+1]={name:itemName+i,type:"USHORT",value:list[i]}}return fields}function tableList(itemName,records,itemCallback){var count=records.length;var fields=new Array(count+1);fields[0]={name:itemName+"Count",type:"USHORT",value:count};for(var i=0;i<count;i++){fields[i+1]={name:itemName+i,type:"TABLE",value:itemCallback(records[i],i)}}return fields}function recordList(itemName,records,itemCallback){var count=records.length;var fields=[];fields[0]={name:itemName+"Count",type:"USHORT",value:count};for(var i=0;i<count;i++){fields=fields.concat(itemCallback(records[i],i))}return fields}function Coverage(coverageTable){if(coverageTable.format===1){Table.call(this,"coverageTable",[{name:"coverageFormat",type:"USHORT",value:1}].concat(ushortList("glyph",coverageTable.glyphs)))}else{check.assert(false,"Can't create coverage table format 2 yet.")}}Coverage.prototype=Object.create(Table.prototype);Coverage.prototype.constructor=Coverage;function ScriptList(scriptListTable){Table.call(this,"scriptListTable",recordList("scriptRecord",scriptListTable,function(scriptRecord,i){var script=scriptRecord.script;var defaultLangSys=script.defaultLangSys;check.assert(!!defaultLangSys,"Unable to write GSUB: script "+scriptRecord.tag+" has no default language system.");return[{name:"scriptTag"+i,type:"TAG",value:scriptRecord.tag},{name:"script"+i,type:"TABLE",value:new Table("scriptTable",[{name:"defaultLangSys",type:"TABLE",value:new Table("defaultLangSys",[{name:"lookupOrder",type:"USHORT",value:0},{name:"reqFeatureIndex",type:"USHORT",value:defaultLangSys.reqFeatureIndex}].concat(ushortList("featureIndex",defaultLangSys.featureIndexes)))}].concat(recordList("langSys",script.langSysRecords,function(langSysRecord,i){var langSys=langSysRecord.langSys;return[{name:"langSysTag"+i,type:"TAG",value:langSysRecord.tag},{name:"langSys"+i,type:"TABLE",value:new Table("langSys",[{name:"lookupOrder",type:"USHORT",value:0},{name:"reqFeatureIndex",type:"USHORT",value:langSys.reqFeatureIndex}].concat(ushortList("featureIndex",langSys.featureIndexes)))}]})))}]}))}ScriptList.prototype=Object.create(Table.prototype);ScriptList.prototype.constructor=ScriptList;function FeatureList(featureListTable){Table.call(this,"featureListTable",recordList("featureRecord",featureListTable,function(featureRecord,i){var feature=featureRecord.feature;return[{name:"featureTag"+i,type:"TAG",value:featureRecord.tag},{name:"feature"+i,type:"TABLE",value:new Table("featureTable",[{name:"featureParams",type:"USHORT",value:feature.featureParams}].concat(ushortList("lookupListIndex",feature.lookupListIndexes)))}]}))}FeatureList.prototype=Object.create(Table.prototype);FeatureList.prototype.constructor=FeatureList;function LookupList(lookupListTable,subtableMakers){Table.call(this,"lookupListTable",tableList("lookup",lookupListTable,function(lookupTable){var subtableCallback=subtableMakers[lookupTable.lookupType];check.assert(!!subtableCallback,"Unable to write GSUB lookup type "+lookupTable.lookupType+" tables.");return new Table("lookupTable",[{name:"lookupType",type:"USHORT",value:lookupTable.lookupType},{name:"lookupFlag",type:"USHORT",value:lookupTable.lookupFlag}].concat(tableList("subtable",lookupTable.subtables,subtableCallback)))}))}LookupList.prototype=Object.create(Table.prototype);LookupList.prototype.constructor=LookupList;var table={Table:Table,Record:Table,Coverage:Coverage,ScriptList:ScriptList,FeatureList:FeatureList,LookupList:LookupList,ushortList:ushortList,tableList:tableList,recordList:recordList};function getByte(dataView,offset){return dataView.getUint8(offset)}function getUShort(dataView,offset){return dataView.getUint16(offset,false)}function getShort(dataView,offset){return dataView.getInt16(offset,false)}function getULong(dataView,offset){return dataView.getUint32(offset,false)}function getFixed(dataView,offset){var decimal=dataView.getInt16(offset,false);var fraction=dataView.getUint16(offset+2,false);return decimal+fraction/65535}function getTag(dataView,offset){var tag="";for(var i=offset;i<offset+4;i+=1){tag+=String.fromCharCode(dataView.getInt8(i))}return tag}function getOffset(dataView,offset,offSize){var v=0;for(var i=0;i<offSize;i+=1){v<<=8;v+=dataView.getUint8(offset+i)}return v}function getBytes(dataView,startOffset,endOffset){var bytes=[];for(var i=startOffset;i<endOffset;i+=1){bytes.push(dataView.getUint8(i))}return bytes}function bytesToString(bytes){var s="";for(var i=0;i<bytes.length;i+=1){s+=String.fromCharCode(bytes[i])}return s}var typeOffsets={byte:1,uShort:2,short:2,uLong:4,fixed:4,longDateTime:8,tag:4};function Parser(data,offset){this.data=data;this.offset=offset;this.relativeOffset=0}Parser.prototype.parseByte=function(){var v=this.data.getUint8(this.offset+this.relativeOffset);this.relativeOffset+=1;return v};Parser.prototype.parseChar=function(){var v=this.data.getInt8(this.offset+this.relativeOffset);this.relativeOffset+=1;return v};Parser.prototype.parseCard8=Parser.prototype.parseByte;Parser.prototype.parseUShort=function(){var v=this.data.getUint16(this.offset+this.relativeOffset);this.relativeOffset+=2;return v};Parser.prototype.parseCard16=Parser.prototype.parseUShort;Parser.prototype.parseSID=Parser.prototype.parseUShort;Parser.prototype.parseOffset16=Parser.prototype.parseUShort;Parser.prototype.parseShort=function(){var v=this.data.getInt16(this.offset+this.relativeOffset);this.relativeOffset+=2;return v};Parser.prototype.parseF2Dot14=function(){var v=this.data.getInt16(this.offset+this.relativeOffset)/16384;this.relativeOffset+=2;return v};Parser.prototype.parseULong=function(){var v=getULong(this.data,this.offset+this.relativeOffset);this.relativeOffset+=4;return v};Parser.prototype.parseOffset32=Parser.prototype.parseULong;Parser.prototype.parseFixed=function(){var v=getFixed(this.data,this.offset+this.relativeOffset);this.relativeOffset+=4;return v};Parser.prototype.parseString=function(length){var dataView=this.data;var offset=this.offset+this.relativeOffset;var string="";this.relativeOffset+=length;for(var i=0;i<length;i++){string+=String.fromCharCode(dataView.getUint8(offset+i))}return string};Parser.prototype.parseTag=function(){return this.parseString(4)};Parser.prototype.parseLongDateTime=function(){var v=getULong(this.data,this.offset+this.relativeOffset+4);v-=2082844800;this.relativeOffset+=8;return v};Parser.prototype.parseVersion=function(minorBase){var major=getUShort(this.data,this.offset+this.relativeOffset);var minor=getUShort(this.data,this.offset+this.relativeOffset+2);this.relativeOffset+=4;if(minorBase===undefined){minorBase=4096}return major+minor/minorBase/10};Parser.prototype.skip=function(type,amount){if(amount===undefined){amount=1}this.relativeOffset+=typeOffsets[type]*amount};Parser.prototype.parseULongList=function(count){if(count===undefined){count=this.parseULong()}var offsets=new Array(count);var dataView=this.data;var offset=this.offset+this.relativeOffset;for(var i=0;i<count;i++){offsets[i]=dataView.getUint32(offset);offset+=4}this.relativeOffset+=count*4;return offsets};Parser.prototype.parseOffset16List=Parser.prototype.parseUShortList=function(count){if(count===undefined){count=this.parseUShort()}var offsets=new Array(count);var dataView=this.data;var offset=this.offset+this.relativeOffset;for(var i=0;i<count;i++){offsets[i]=dataView.getUint16(offset);offset+=2}this.relativeOffset+=count*2;return offsets};Parser.prototype.parseShortList=function(count){var list=new Array(count);var dataView=this.data;var offset=this.offset+this.relativeOffset;for(var i=0;i<count;i++){list[i]=dataView.getInt16(offset);offset+=2}this.relativeOffset+=count*2;return list};Parser.prototype.parseByteList=function(count){var list=new Array(count);var dataView=this.data;var offset=this.offset+this.relativeOffset;for(var i=0;i<count;i++){list[i]=dataView.getUint8(offset++)}this.relativeOffset+=count;return list};Parser.prototype.parseList=function(count,itemCallback){var this$1=this;if(!itemCallback){itemCallback=count;count=this.parseUShort()}var list=new Array(count);for(var i=0;i<count;i++){list[i]=itemCallback.call(this$1)}return list};Parser.prototype.parseList32=function(count,itemCallback){var this$1=this;if(!itemCallback){itemCallback=count;count=this.parseULong()}var list=new Array(count);for(var i=0;i<count;i++){list[i]=itemCallback.call(this$1)}return list};Parser.prototype.parseRecordList=function(count,recordDescription){var this$1=this;if(!recordDescription){recordDescription=count;count=this.parseUShort()}var records=new Array(count);var fields=Object.keys(recordDescription);for(var i=0;i<count;i++){var rec={};for(var j=0;j<fields.length;j++){var fieldName=fields[j];var fieldType=recordDescription[fieldName];rec[fieldName]=fieldType.call(this$1)}records[i]=rec}return records};Parser.prototype.parseRecordList32=function(count,recordDescription){var this$1=this;if(!recordDescription){recordDescription=count;count=this.parseULong()}var records=new Array(count);var fields=Object.keys(recordDescription);for(var i=0;i<count;i++){var rec={};for(var j=0;j<fields.length;j++){var fieldName=fields[j];var fieldType=recordDescription[fieldName];rec[fieldName]=fieldType.call(this$1)}records[i]=rec}return records};Parser.prototype.parseStruct=function(description){var this$1=this;if(typeof description==="function"){return description.call(this)}else{var fields=Object.keys(description);var struct={};for(var j=0;j<fields.length;j++){var fieldName=fields[j];var fieldType=description[fieldName];struct[fieldName]=fieldType.call(this$1)}return struct}};Parser.prototype.parseValueRecord=function(valueFormat){if(valueFormat===undefined){valueFormat=this.parseUShort()}if(valueFormat===0){return}var valueRecord={};if(valueFormat&1){valueRecord.xPlacement=this.parseShort()}if(valueFormat&2){valueRecord.yPlacement=this.parseShort()}if(valueFormat&4){valueRecord.xAdvance=this.parseShort()}if(valueFormat&8){valueRecord.yAdvance=this.parseShort()}if(valueFormat&16){valueRecord.xPlaDevice=undefined;this.parseShort()}if(valueFormat&32){valueRecord.yPlaDevice=undefined;this.parseShort()}if(valueFormat&64){valueRecord.xAdvDevice=undefined;this.parseShort()}if(valueFormat&128){valueRecord.yAdvDevice=undefined;this.parseShort()}return valueRecord};Parser.prototype.parseValueRecordList=function(){var this$1=this;var valueFormat=this.parseUShort();var valueCount=this.parseUShort();var values=new Array(valueCount);for(var i=0;i<valueCount;i++){values[i]=this$1.parseValueRecord(valueFormat)}return values};Parser.prototype.parsePointer=function(description){var structOffset=this.parseOffset16();if(structOffset>0){return new Parser(this.data,this.offset+structOffset).parseStruct(description)}return undefined};Parser.prototype.parsePointer32=function(description){var structOffset=this.parseOffset32();if(structOffset>0){return new Parser(this.data,this.offset+structOffset).parseStruct(description)}return undefined};Parser.prototype.parseListOfLists=function(itemCallback){var this$1=this;var offsets=this.parseOffset16List();var count=offsets.length;var relativeOffset=this.relativeOffset;var list=new Array(count);for(var i=0;i<count;i++){var start=offsets[i];if(start===0){list[i]=undefined;continue}this$1.relativeOffset=start;if(itemCallback){var subOffsets=this$1.parseOffset16List();var subList=new Array(subOffsets.length);for(var j=0;j<subOffsets.length;j++){this$1.relativeOffset=start+subOffsets[j];subList[j]=itemCallback.call(this$1)}list[i]=subList}else{list[i]=this$1.parseUShortList()}}this.relativeOffset=relativeOffset;return list};Parser.prototype.parseCoverage=function(){var this$1=this;var startOffset=this.offset+this.relativeOffset;var format=this.parseUShort();var count=this.parseUShort();if(format===1){return{format:1,glyphs:this.parseUShortList(count)}}else if(format===2){var ranges=new Array(count);for(var i=0;i<count;i++){ranges[i]={start:this$1.parseUShort(),end:this$1.parseUShort(),index:this$1.parseUShort()}}return{format:2,ranges:ranges}}throw new Error("0x"+startOffset.toString(16)+": Coverage format must be 1 or 2.")};Parser.prototype.parseClassDef=function(){var startOffset=this.offset+this.relativeOffset;var format=this.parseUShort();if(format===1){return{format:1,startGlyph:this.parseUShort(),classes:this.parseUShortList()}}else if(format===2){return{format:2,ranges:this.parseRecordList({start:Parser.uShort,end:Parser.uShort,classId:Parser.uShort})}}throw new Error("0x"+startOffset.toString(16)+": ClassDef format must be 1 or 2.")};Parser.list=function(count,itemCallback){return function(){return this.parseList(count,itemCallback)}};Parser.list32=function(count,itemCallback){return function(){return this.parseList32(count,itemCallback)}};Parser.recordList=function(count,recordDescription){return function(){return this.parseRecordList(count,recordDescription)}};Parser.recordList32=function(count,recordDescription){return function(){return this.parseRecordList32(count,recordDescription)}};Parser.pointer=function(description){return function(){return this.parsePointer(description)}};Parser.pointer32=function(description){return function(){return this.parsePointer32(description)}};Parser.tag=Parser.prototype.parseTag;Parser.byte=Parser.prototype.parseByte;Parser.uShort=Parser.offset16=Parser.prototype.parseUShort;Parser.uShortList=Parser.prototype.parseUShortList;Parser.uLong=Parser.offset32=Parser.prototype.parseULong;Parser.uLongList=Parser.prototype.parseULongList;Parser.struct=Parser.prototype.parseStruct;Parser.coverage=Parser.prototype.parseCoverage;Parser.classDef=Parser.prototype.parseClassDef;var langSysTable={reserved:Parser.uShort,reqFeatureIndex:Parser.uShort,featureIndexes:Parser.uShortList};Parser.prototype.parseScriptList=function(){return this.parsePointer(Parser.recordList({tag:Parser.tag,script:Parser.pointer({defaultLangSys:Parser.pointer(langSysTable),langSysRecords:Parser.recordList({tag:Parser.tag,langSys:Parser.pointer(langSysTable)})})}))||[]};Parser.prototype.parseFeatureList=function(){return this.parsePointer(Parser.recordList({tag:Parser.tag,feature:Parser.pointer({featureParams:Parser.offset16,lookupListIndexes:Parser.uShortList})}))||[]};Parser.prototype.parseLookupList=function(lookupTableParsers){return this.parsePointer(Parser.list(Parser.pointer(function(){var lookupType=this.parseUShort();check.argument(1<=lookupType&&lookupType<=9,"GPOS/GSUB lookup type "+lookupType+" unknown.");var lookupFlag=this.parseUShort();var useMarkFilteringSet=lookupFlag&16;return{lookupType:lookupType,lookupFlag:lookupFlag,subtables:this.parseList(Parser.pointer(lookupTableParsers[lookupType])),markFilteringSet:useMarkFilteringSet?this.parseUShort():undefined}})))||[]};Parser.prototype.parseFeatureVariationsList=function(){return this.parsePointer32(function(){var majorVersion=this.parseUShort();var minorVersion=this.parseUShort();check.argument(majorVersion===1&&minorVersion<1,"GPOS/GSUB feature variations table unknown.");var featureVariations=this.parseRecordList32({conditionSetOffset:Parser.offset32,featureTableSubstitutionOffset:Parser.offset32});return featureVariations})||[]};var parse={getByte:getByte,getCard8:getByte,getUShort:getUShort,getCard16:getUShort,getShort:getShort,getULong:getULong,getFixed:getFixed,getTag:getTag,getOffset:getOffset,getBytes:getBytes,bytesToString:bytesToString,Parser:Parser};function parseCmapTableFormat12(cmap,p){p.parseUShort();cmap.length=p.parseULong();cmap.language=p.parseULong();var groupCount;cmap.groupCount=groupCount=p.parseULong();cmap.glyphIndexMap={};for(var i=0;i<groupCount;i+=1){var startCharCode=p.parseULong();var endCharCode=p.parseULong();var startGlyphId=p.parseULong();for(var c=startCharCode;c<=endCharCode;c+=1){cmap.glyphIndexMap[c]=startGlyphId;startGlyphId++}}}function parseCmapTableFormat4(cmap,p,data,start,offset){cmap.length=p.parseUShort();cmap.language=p.parseUShort();var segCount;cmap.segCount=segCount=p.parseUShort()>>1;p.skip("uShort",3);cmap.glyphIndexMap={};var endCountParser=new parse.Parser(data,start+offset+14);var startCountParser=new parse.Parser(data,start+offset+16+segCount*2);var idDeltaParser=new parse.Parser(data,start+offset+16+segCount*4);var idRangeOffsetParser=new parse.Parser(data,start+offset+16+segCount*6);var glyphIndexOffset=start+offset+16+segCount*8;for(var i=0;i<segCount-1;i+=1){var glyphIndex=void 0;var endCount=endCountParser.parseUShort();var startCount=startCountParser.parseUShort();var idDelta=idDeltaParser.parseShort();var idRangeOffset=idRangeOffsetParser.parseUShort();for(var c=startCount;c<=endCount;c+=1){if(idRangeOffset!==0){glyphIndexOffset=idRangeOffsetParser.offset+idRangeOffsetParser.relativeOffset-2;glyphIndexOffset+=idRangeOffset;glyphIndexOffset+=(c-startCount)*2;glyphIndex=parse.getUShort(data,glyphIndexOffset);if(glyphIndex!==0){glyphIndex=glyphIndex+idDelta&65535}}else{glyphIndex=c+idDelta&65535}cmap.glyphIndexMap[c]=glyphIndex}}}function parseCmapTable(data,start){var cmap={};cmap.version=parse.getUShort(data,start);check.argument(cmap.version===0,"cmap table version should be 0.");cmap.numTables=parse.getUShort(data,start+2);var offset=-1;for(var i=cmap.numTables-1;i>=0;i-=1){var platformId=parse.getUShort(data,start+4+i*8);var encodingId=parse.getUShort(data,start+4+i*8+2);if(platformId===3&&(encodingId===0||encodingId===1||encodingId===10)||platformId===0&&(encodingId===0||encodingId===1||encodingId===2||encodingId===3||encodingId===4)){offset=parse.getULong(data,start+4+i*8+4);break}}if(offset===-1){throw new Error("No valid cmap sub-tables found.")}var p=new parse.Parser(data,start+offset);cmap.format=p.parseUShort();if(cmap.format===12){parseCmapTableFormat12(cmap,p)}else if(cmap.format===4){parseCmapTableFormat4(cmap,p,data,start,offset)}else{throw new Error("Only format 4 and 12 cmap tables are supported (found format "+cmap.format+").")}return cmap}function addSegment(t,code,glyphIndex){t.segments.push({end:code,start:code,delta:-(code-glyphIndex),offset:0,glyphIndex:glyphIndex})}function addTerminatorSegment(t){t.segments.push({end:65535,start:65535,delta:1,offset:0})}function makeCmapTable(glyphs){var isPlan0Only=true;var i;for(i=glyphs.length-1;i>0;i-=1){var g=glyphs.get(i);if(g.unicode>65535){console.log("Adding CMAP format 12 (needed!)");isPlan0Only=false;break}}var cmapTable=[{name:"version",type:"USHORT",value:0},{name:"numTables",type:"USHORT",value:isPlan0Only?1:2},{name:"platformID",type:"USHORT",value:3},{name:"encodingID",type:"USHORT",value:1},{name:"offset",type:"ULONG",value:isPlan0Only?12:12+8}];if(!isPlan0Only){cmapTable=cmapTable.concat([{name:"cmap12PlatformID",type:"USHORT",value:3},{name:"cmap12EncodingID",type:"USHORT",value:10},{name:"cmap12Offset",type:"ULONG",value:0}])}cmapTable=cmapTable.concat([{name:"format",type:"USHORT",value:4},{name:"cmap4Length",type:"USHORT",value:0},{name:"language",type:"USHORT",value:0},{name:"segCountX2",type:"USHORT",value:0},{name:"searchRange",type:"USHORT",value:0},{name:"entrySelector",type:"USHORT",value:0},{name:"rangeShift",type:"USHORT",value:0}]);var t=new table.Table("cmap",cmapTable);t.segments=[];for(i=0;i<glyphs.length;i+=1){var glyph=glyphs.get(i);for(var j=0;j<glyph.unicodes.length;j+=1){addSegment(t,glyph.unicodes[j],i)}t.segments=t.segments.sort(function(a,b){return a.start-b.start})}addTerminatorSegment(t);var segCount=t.segments.length;var segCountToRemove=0;var endCounts=[];var startCounts=[];var idDeltas=[];var idRangeOffsets=[];var glyphIds=[];var cmap12Groups=[];for(i=0;i<segCount;i+=1){var segment=t.segments[i];if(segment.end<=65535&&segment.start<=65535){endCounts=endCounts.concat({name:"end_"+i,type:"USHORT",value:segment.end});startCounts=startCounts.concat({name:"start_"+i,type:"USHORT",value:segment.start});idDeltas=idDeltas.concat({name:"idDelta_"+i,type:"SHORT",value:segment.delta});idRangeOffsets=idRangeOffsets.concat({name:"idRangeOffset_"+i,type:"USHORT",value:segment.offset});if(segment.glyphId!==undefined){glyphIds=glyphIds.concat({name:"glyph_"+i,type:"USHORT",value:segment.glyphId})}}else{segCountToRemove+=1}if(!isPlan0Only&&segment.glyphIndex!==undefined){cmap12Groups=cmap12Groups.concat({name:"cmap12Start_"+i,type:"ULONG",value:segment.start});cmap12Groups=cmap12Groups.concat({name:"cmap12End_"+i,type:"ULONG",value:segment.end});cmap12Groups=cmap12Groups.concat({name:"cmap12Glyph_"+i,type:"ULONG",value:segment.glyphIndex})}}t.segCountX2=(segCount-segCountToRemove)*2;t.searchRange=Math.pow(2,Math.floor(Math.log(segCount-segCountToRemove)/Math.log(2)))*2;t.entrySelector=Math.log(t.searchRange/2)/Math.log(2);t.rangeShift=t.segCountX2-t.searchRange;t.fields=t.fields.concat(endCounts);t.fields.push({name:"reservedPad",type:"USHORT",value:0});t.fields=t.fields.concat(startCounts);t.fields=t.fields.concat(idDeltas);t.fields=t.fields.concat(idRangeOffsets);t.fields=t.fields.concat(glyphIds);t.cmap4Length=14+endCounts.length*2+2+startCounts.length*2+idDeltas.length*2+idRangeOffsets.length*2+glyphIds.length*2;if(!isPlan0Only){var cmap12Length=16+cmap12Groups.length*4;t.cmap12Offset=12+2*2+4+t.cmap4Length;t.fields=t.fields.concat([{name:"cmap12Format",type:"USHORT",value:12},{name:"cmap12Reserved",type:"USHORT",value:0},{name:"cmap12Length",type:"ULONG",value:cmap12Length},{name:"cmap12Language",type:"ULONG",value:0},{name:"cmap12nGroups",type:"ULONG",value:cmap12Groups.length/3}]);t.fields=t.fields.concat(cmap12Groups)}return t}var cmap={parse:parseCmapTable,make:makeCmapTable};var cffStandardStrings=[".notdef","space","exclam","quotedbl","numbersign","dollar","percent","ampersand","quoteright","parenleft","parenright","asterisk","plus","comma","hyphen","period","slash","zero","one","two","three","four","five","six","seven","eight","nine","colon","semicolon","less","equal","greater","question","at","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","bracketleft","backslash","bracketright","asciicircum","underscore","quoteleft","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","braceleft","bar","braceright","asciitilde","exclamdown","cent","sterling","fraction","yen","florin","section","currency","quotesingle","quotedblleft","guillemotleft","guilsinglleft","guilsinglright","fi","fl","endash","dagger","daggerdbl","periodcentered","paragraph","bullet","quotesinglbase","quotedblbase","quotedblright","guillemotright","ellipsis","perthousand","questiondown","grave","acute","circumflex","tilde","macron","breve","dotaccent","dieresis","ring","cedilla","hungarumlaut","ogonek","caron","emdash","AE","ordfeminine","Lslash","Oslash","OE","ordmasculine","ae","dotlessi","lslash","oslash","oe","germandbls","onesuperior","logicalnot","mu","trademark","Eth","onehalf","plusminus","Thorn","onequarter","divide","brokenbar","degree","thorn","threequarters","twosuperior","registered","minus","eth","multiply","threesuperior","copyright","Aacute","Acircumflex","Adieresis","Agrave","Aring","Atilde","Ccedilla","Eacute","Ecircumflex","Edieresis","Egrave","Iacute","Icircumflex","Idieresis","Igrave","Ntilde","Oacute","Ocircumflex","Odieresis","Ograve","Otilde","Scaron","Uacute","Ucircumflex","Udieresis","Ugrave","Yacute","Ydieresis","Zcaron","aacute","acircumflex","adieresis","agrave","aring","atilde","ccedilla","eacute","ecircumflex","edieresis","egrave","iacute","icircumflex","idieresis","igrave","ntilde","oacute","ocircumflex","odieresis","ograve","otilde","scaron","uacute","ucircumflex","udieresis","ugrave","yacute","ydieresis","zcaron","exclamsmall","Hungarumlautsmall","dollaroldstyle","dollarsuperior","ampersandsmall","Acutesmall","parenleftsuperior","parenrightsuperior","266 ff","onedotenleader","zerooldstyle","oneoldstyle","twooldstyle","threeoldstyle","fouroldstyle","fiveoldstyle","sixoldstyle","sevenoldstyle","eightoldstyle","nineoldstyle","commasuperior","threequartersemdash","periodsuperior","questionsmall","asuperior","bsuperior","centsuperior","dsuperior","esuperior","isuperior","lsuperior","msuperior","nsuperior","osuperior","rsuperior","ssuperior","tsuperior","ff","ffi","ffl","parenleftinferior","parenrightinferior","Circumflexsmall","hyphensuperior","Gravesmall","Asmall","Bsmall","Csmall","Dsmall","Esmall","Fsmall","Gsmall","Hsmall","Ismall","Jsmall","Ksmall","Lsmall","Msmall","Nsmall","Osmall","Psmall","Qsmall","Rsmall","Ssmall","Tsmall","Usmall","Vsmall","Wsmall","Xsmall","Ysmall","Zsmall","colonmonetary","onefitted","rupiah","Tildesmall","exclamdownsmall","centoldstyle","Lslashsmall","Scaronsmall","Zcaronsmall","Dieresissmall","Brevesmall","Caronsmall","Dotaccentsmall","Macronsmall","figuredash","hypheninferior","Ogoneksmall","Ringsmall","Cedillasmall","questiondownsmall","oneeighth","threeeighths","fiveeighths","seveneighths","onethird","twothirds","zerosuperior","foursuperior","fivesuperior","sixsuperior","sevensuperior","eightsuperior","ninesuperior","zeroinferior","oneinferior","twoinferior","threeinferior","fourinferior","fiveinferior","sixinferior","seveninferior","eightinferior","nineinferior","centinferior","dollarinferior","periodinferior","commainferior","Agravesmall","Aacutesmall","Acircumflexsmall","Atildesmall","Adieresissmall","Aringsmall","AEsmall","Ccedillasmall","Egravesmall","Eacutesmall","Ecircumflexsmall","Edieresissmall","Igravesmall","Iacutesmall","Icircumflexsmall","Idieresissmall","Ethsmall","Ntildesmall","Ogravesmall","Oacutesmall","Ocircumflexsmall","Otildesmall","Odieresissmall","OEsmall","Oslashsmall","Ugravesmall","Uacutesmall","Ucircumflexsmall","Udieresissmall","Yacutesmall","Thornsmall","Ydieresissmall","001.000","001.001","001.002","001.003","Black","Bold","Book","Light","Medium","Regular","Roman","Semibold"];var cffStandardEncoding=["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","space","exclam","quotedbl","numbersign","dollar","percent","ampersand","quoteright","parenleft","parenright","asterisk","plus","comma","hyphen","period","slash","zero","one","two","three","four","five","six","seven","eight","nine","colon","semicolon","less","equal","greater","question","at","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","bracketleft","backslash","bracketright","asciicircum","underscore","quoteleft","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","braceleft","bar","braceright","asciitilde","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","exclamdown","cent","sterling","fraction","yen","florin","section","currency","quotesingle","quotedblleft","guillemotleft","guilsinglleft","guilsinglright","fi","fl","","endash","dagger","daggerdbl","periodcentered","","paragraph","bullet","quotesinglbase","quotedblbase","quotedblright","guillemotright","ellipsis","perthousand","","questiondown","","grave","acute","circumflex","tilde","macron","breve","dotaccent","dieresis","","ring","cedilla","","hungarumlaut","ogonek","caron","emdash","","","","","","","","","","","","","","","","","AE","","ordfeminine","","","","","Lslash","Oslash","OE","ordmasculine","","","","","","ae","","","","dotlessi","","","lslash","oslash","oe","germandbls"];var cffExpertEncoding=["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","space","exclamsmall","Hungarumlautsmall","","dollaroldstyle","dollarsuperior","ampersandsmall","Acutesmall","parenleftsuperior","parenrightsuperior","twodotenleader","onedotenleader","comma","hyphen","period","fraction","zerooldstyle","oneoldstyle","twooldstyle","threeoldstyle","fouroldstyle","fiveoldstyle","sixoldstyle","sevenoldstyle","eightoldstyle","nineoldstyle","colon","semicolon","commasuperior","threequartersemdash","periodsuperior","questionsmall","","asuperior","bsuperior","centsuperior","dsuperior","esuperior","","","isuperior","","","lsuperior","msuperior","nsuperior","osuperior","","","rsuperior","ssuperior","tsuperior","","ff","fi","fl","ffi","ffl","parenleftinferior","","parenrightinferior","Circumflexsmall","hyphensuperior","Gravesmall","Asmall","Bsmall","Csmall","Dsmall","Esmall","Fsmall","Gsmall","Hsmall","Ismall","Jsmall","Ksmall","Lsmall","Msmall","Nsmall","Osmall","Psmall","Qsmall","Rsmall","Ssmall","Tsmall","Usmall","Vsmall","Wsmall","Xsmall","Ysmall","Zsmall","colonmonetary","onefitted","rupiah","Tildesmall","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","exclamdownsmall","centoldstyle","Lslashsmall","","","Scaronsmall","Zcaronsmall","Dieresissmall","Brevesmall","Caronsmall","","Dotaccentsmall","","","Macronsmall","","","figuredash","hypheninferior","","","Ogoneksmall","Ringsmall","Cedillasmall","","","","onequarter","onehalf","threequarters","questiondownsmall","oneeighth","threeeighths","fiveeighths","seveneighths","onethird","twothirds","","","zerosuperior","onesuperior","twosuperior","threesuperior","foursuperior","fivesuperior","sixsuperior","sevensuperior","eightsuperior","ninesuperior","zeroinferior","oneinferior","twoinferior","threeinferior","fourinferior","fiveinferior","sixinferior","seveninferior","eightinferior","nineinferior","centinferior","dollarinferior","periodinferior","commainferior","Agravesmall","Aacutesmall","Acircumflexsmall","Atildesmall","Adieresissmall","Aringsmall","AEsmall","Ccedillasmall","Egravesmall","Eacutesmall","Ecircumflexsmall","Edieresissmall","Igravesmall","Iacutesmall","Icircumflexsmall","Idieresissmall","Ethsmall","Ntildesmall","Ogravesmall","Oacutesmall","Ocircumflexsmall","Otildesmall","Odieresissmall","OEsmall","Oslashsmall","Ugravesmall","Uacutesmall","Ucircumflexsmall","Udieresissmall","Yacutesmall","Thornsmall","Ydieresissmall"];var standardNames=[".notdef",".null","nonmarkingreturn","space","exclam","quotedbl","numbersign","dollar","percent","ampersand","quotesingle","parenleft","parenright","asterisk","plus","comma","hyphen","period","slash","zero","one","two","three","four","five","six","seven","eight","nine","colon","semicolon","less","equal","greater","question","at","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","bracketleft","backslash","bracketright","asciicircum","underscore","grave","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","braceleft","bar","braceright","asciitilde","Adieresis","Aring","Ccedilla","Eacute","Ntilde","Odieresis","Udieresis","aacute","agrave","acircumflex","adieresis","atilde","aring","ccedilla","eacute","egrave","ecircumflex","edieresis","iacute","igrave","icircumflex","idieresis","ntilde","oacute","ograve","ocircumflex","odieresis","otilde","uacute","ugrave","ucircumflex","udieresis","dagger","degree","cent","sterling","section","bullet","paragraph","germandbls","registered","copyright","trademark","acute","dieresis","notequal","AE","Oslash","infinity","plusminus","lessequal","greaterequal","yen","mu","partialdiff","summation","product","pi","integral","ordfeminine","ordmasculine","Omega","ae","oslash","questiondown","exclamdown","logicalnot","radical","florin","approxequal","Delta","guillemotleft","guillemotright","ellipsis","nonbreakingspace","Agrave","Atilde","Otilde","OE","oe","endash","emdash","quotedblleft","quotedblright","quoteleft","quoteright","divide","lozenge","ydieresis","Ydieresis","fraction","currency","guilsinglleft","guilsinglright","fi","fl","daggerdbl","periodcentered","quotesinglbase","quotedblbase","perthousand","Acircumflex","Ecircumflex","Aacute","Edieresis","Egrave","Iacute","Icircumflex","Idieresis","Igrave","Oacute","Ocircumflex","apple","Ograve","Uacute","Ucircumflex","Ugrave","dotlessi","circumflex","tilde","macron","breve","dotaccent","ring","cedilla","hungarumlaut","ogonek","caron","Lslash","lslash","Scaron","scaron","Zcaron","zcaron","brokenbar","Eth","eth","Yacute","yacute","Thorn","thorn","minus","multiply","onesuperior","twosuperior","threesuperior","onehalf","onequarter","threequarters","franc","Gbreve","gbreve","Idotaccent","Scedilla","scedilla","Cacute","cacute","Ccaron","ccaron","dcroat"];function DefaultEncoding(font){this.font=font}DefaultEncoding.prototype.charToGlyphIndex=function(c){var code=c.codePointAt(0);var glyphs=this.font.glyphs;if(glyphs){for(var i=0;i<glyphs.length;i+=1){var glyph=glyphs.get(i);for(var j=0;j<glyph.unicodes.length;j+=1){if(glyph.unicodes[j]===code){return i}}}}return null};function CmapEncoding(cmap){this.cmap=cmap}CmapEncoding.prototype.charToGlyphIndex=function(c){return this.cmap.glyphIndexMap[c.codePointAt(0)]||0};function CffEncoding(encoding,charset){this.encoding=encoding;this.charset=charset}CffEncoding.prototype.charToGlyphIndex=function(s){var code=s.codePointAt(0);var charName=this.encoding[code];return this.charset.indexOf(charName)};function GlyphNames(post){var this$1=this;switch(post.version){case 1:this.names=standardNames.slice();break;case 2:this.names=new Array(post.numberOfGlyphs);for(var i=0;i<post.numberOfGlyphs;i++){if(post.glyphNameIndex[i]<standardNames.length){this$1.names[i]=standardNames[post.glyphNameIndex[i]]}else{this$1.names[i]=post.names[post.glyphNameIndex[i]-standardNames.length]}}break;case 2.5:this.names=new Array(post.numberOfGlyphs);for(var i$1=0;i$1<post.numberOfGlyphs;i$1++){this$1.names[i$1]=standardNames[i$1+post.glyphNameIndex[i$1]]}break;case 3:this.names=[];break;default:this.names=[];break}}GlyphNames.prototype.nameToGlyphIndex=function(name){return this.names.indexOf(name)};GlyphNames.prototype.glyphIndexToName=function(gid){return this.names[gid]};function addGlyphNames(font){var glyph;var glyphIndexMap=font.tables.cmap.glyphIndexMap;var charCodes=Object.keys(glyphIndexMap);for(var i=0;i<charCodes.length;i+=1){var c=charCodes[i];var glyphIndex=glyphIndexMap[c];glyph=font.glyphs.get(glyphIndex);glyph.addUnicode(parseInt(c))}for(var i$1=0;i$1<font.glyphs.length;i$1+=1){glyph=font.glyphs.get(i$1);if(font.cffEncoding){if(font.isCIDFont){glyph.name="gid"+i$1}else{glyph.name=font.cffEncoding.charset[i$1]}}else if(font.glyphNames.names){glyph.name=font.glyphNames.glyphIndexToName(i$1)}}}function line(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}var draw={line:line};function getPathDefinition(glyph,path){var _path=path||new Path;return{configurable:true,get:function(){if(typeof _path==="function"){_path=_path()}return _path},set:function(p){_path=p}}}function Glyph(options){this.bindConstructorValues(options)}Glyph.prototype.bindConstructorValues=function(options){this.index=options.index||0;this.name=options.name||null;this.unicode=options.unicode||undefined;this.unicodes=options.unicodes||options.unicode!==undefined?[options.unicode]:[];if(options.xMin){this.xMin=options.xMin}if(options.yMin){this.yMin=options.yMin}if(options.xMax){this.xMax=options.xMax}if(options.yMax){this.yMax=options.yMax}if(options.advanceWidth){this.advanceWidth=options.advanceWidth}Object.defineProperty(this,"path",getPathDefinition(this,options.path))};Glyph.prototype.addUnicode=function(unicode){if(this.unicodes.length===0){this.unicode=unicode}this.unicodes.push(unicode)};Glyph.prototype.getBoundingBox=function(){return this.path.getBoundingBox()};Glyph.prototype.getPath=function(x,y,fontSize,options,font){x=x!==undefined?x:0;y=y!==undefined?y:0;fontSize=fontSize!==undefined?fontSize:72;var commands;var hPoints;if(!options){options={}}var xScale=options.xScale;var yScale=options.yScale;if(options.hinting&&font&&font.hinting){hPoints=this.path&&font.hinting.exec(this,fontSize)}if(hPoints){commands=font.hinting.getCommands(hPoints);x=Math.round(x);y=Math.round(y);xScale=yScale=1}else{commands=this.path.commands;var scale=1/this.path.unitsPerEm*fontSize;if(xScale===undefined){xScale=scale}if(yScale===undefined){yScale=scale}}var p=new Path;for(var i=0;i<commands.length;i+=1){var cmd=commands[i];if(cmd.type==="M"){p.moveTo(x+cmd.x*xScale,y+-cmd.y*yScale)}else if(cmd.type==="L"){p.lineTo(x+cmd.x*xScale,y+-cmd.y*yScale)}else if(cmd.type==="Q"){p.quadraticCurveTo(x+cmd.x1*xScale,y+-cmd.y1*yScale,x+cmd.x*xScale,y+-cmd.y*yScale)}else if(cmd.type==="C"){p.curveTo(x+cmd.x1*xScale,y+-cmd.y1*yScale,x+cmd.x2*xScale,y+-cmd.y2*yScale,x+cmd.x*xScale,y+-cmd.y*yScale)}else if(cmd.type==="Z"){p.closePath()}}return p};Glyph.prototype.getContours=function(){var this$1=this;if(this.points===undefined){return[]}var contours=[];var currentContour=[];for(var i=0;i<this.points.length;i+=1){var pt=this$1.points[i];currentContour.push(pt);if(pt.lastPointOfContour){contours.push(currentContour);currentContour=[]}}check.argument(currentContour.length===0,"There are still points left in the current contour.");return contours};Glyph.prototype.getMetrics=function(){var commands=this.path.commands;var xCoords=[];var yCoords=[];for(var i=0;i<commands.length;i+=1){var cmd=commands[i];if(cmd.type!=="Z"){xCoords.push(cmd.x);yCoords.push(cmd.y)}if(cmd.type==="Q"||cmd.type==="C"){xCoords.push(cmd.x1);yCoords.push(cmd.y1)}if(cmd.type==="C"){xCoords.push(cmd.x2);yCoords.push(cmd.y2)}}var metrics={xMin:Math.min.apply(null,xCoords),yMin:Math.min.apply(null,yCoords),xMax:Math.max.apply(null,xCoords),yMax:Math.max.apply(null,yCoords),leftSideBearing:this.leftSideBearing};if(!isFinite(metrics.xMin)){metrics.xMin=0}if(!isFinite(metrics.xMax)){metrics.xMax=this.advanceWidth}if(!isFinite(metrics.yMin)){metrics.yMin=0}if(!isFinite(metrics.yMax)){metrics.yMax=0}metrics.rightSideBearing=this.advanceWidth-metrics.leftSideBearing-(metrics.xMax-metrics.xMin);return metrics};Glyph.prototype.draw=function(ctx,x,y,fontSize,options){this.getPath(x,y,fontSize,options).draw(ctx)};Glyph.prototype.drawPoints=function(ctx,x,y,fontSize){function drawCircles(l,x,y,scale){var PI_SQ=Math.PI*2;ctx.beginPath();for(var j=0;j<l.length;j+=1){ctx.moveTo(x+l[j].x*scale,y+l[j].y*scale);ctx.arc(x+l[j].x*scale,y+l[j].y*scale,2,0,PI_SQ,false)}ctx.closePath();ctx.fill()}x=x!==undefined?x:0;y=y!==undefined?y:0;fontSize=fontSize!==undefined?fontSize:24;var scale=1/this.path.unitsPerEm*fontSize;var blueCircles=[];var redCircles=[];var path=this.path;for(var i=0;i<path.commands.length;i+=1){var cmd=path.commands[i];if(cmd.x!==undefined){blueCircles.push({x:cmd.x,y:-cmd.y})}if(cmd.x1!==undefined){redCircles.push({x:cmd.x1,y:-cmd.y1})}if(cmd.x2!==undefined){redCircles.push({x:cmd.x2,y:-cmd.y2})}}ctx.fillStyle="blue";drawCircles(blueCircles,x,y,scale);ctx.fillStyle="red";drawCircles(redCircles,x,y,scale)};Glyph.prototype.drawMetrics=function(ctx,x,y,fontSize){var scale;x=x!==undefined?x:0;y=y!==undefined?y:0;fontSize=fontSize!==undefined?fontSize:24;scale=1/this.path.unitsPerEm*fontSize;ctx.lineWidth=1;ctx.strokeStyle="black";draw.line(ctx,x,-1e4,x,1e4);draw.line(ctx,-1e4,y,1e4,y);var xMin=this.xMin||0;var yMin=this.yMin||0;var xMax=this.xMax||0;var yMax=this.yMax||0;var advanceWidth=this.advanceWidth||0;ctx.strokeStyle="blue";draw.line(ctx,x+xMin*scale,-1e4,x+xMin*scale,1e4);draw.line(ctx,x+xMax*scale,-1e4,x+xMax*scale,1e4);draw.line(ctx,-1e4,y+-yMin*scale,1e4,y+-yMin*scale);draw.line(ctx,-1e4,y+-yMax*scale,1e4,y+-yMax*scale);ctx.strokeStyle="green";draw.line(ctx,x+advanceWidth*scale,-1e4,x+advanceWidth*scale,1e4)};function defineDependentProperty(glyph,externalName,internalName){Object.defineProperty(glyph,externalName,{get:function(){glyph.path;return glyph[internalName]},set:function(newValue){glyph[internalName]=newValue},enumerable:true,configurable:true})}function GlyphSet(font,glyphs){var this$1=this;this.font=font;this.glyphs={};if(Array.isArray(glyphs)){for(var i=0;i<glyphs.length;i++){this$1.glyphs[i]=glyphs[i]}}this.length=glyphs&&glyphs.length||0}GlyphSet.prototype.get=function(index){if(typeof this.glyphs[index]==="function"){this.glyphs[index]=this.glyphs[index]()}return this.glyphs[index]};GlyphSet.prototype.push=function(index,loader){this.glyphs[index]=loader;this.length++};function glyphLoader(font,index){return new Glyph({index:index,font:font})}function ttfGlyphLoader(font,index,parseGlyph,data,position,buildPath){return function(){var glyph=new Glyph({index:index,font:font});glyph.path=function(){parseGlyph(glyph,data,position);var path=buildPath(font.glyphs,glyph);path.unitsPerEm=font.unitsPerEm;return path};defineDependentProperty(glyph,"xMin","_xMin");defineDependentProperty(glyph,"xMax","_xMax");defineDependentProperty(glyph,"yMin","_yMin");defineDependentProperty(glyph,"yMax","_yMax");return glyph}}function cffGlyphLoader(font,index,parseCFFCharstring,charstring){return function(){var glyph=new Glyph({index:index,font:font});glyph.path=function(){var path=parseCFFCharstring(font,glyph,charstring);path.unitsPerEm=font.unitsPerEm;return path};return glyph}}var glyphset={GlyphSet:GlyphSet,glyphLoader:glyphLoader,ttfGlyphLoader:ttfGlyphLoader,cffGlyphLoader:cffGlyphLoader};function equals(a,b){if(a===b){return true}else if(Array.isArray(a)&&Array.isArray(b)){if(a.length!==b.length){return false}for(var i=0;i<a.length;i+=1){if(!equals(a[i],b[i])){return false}}return true}else{return false}}function calcCFFSubroutineBias(subrs){var bias;if(subrs.length<1240){bias=107}else if(subrs.length<33900){bias=1131}else{bias=32768}return bias}function parseCFFIndex(data,start,conversionFn){var offsets=[];var objects=[];var count=parse.getCard16(data,start);var objectOffset;var endOffset;if(count!==0){var offsetSize=parse.getByte(data,start+2);objectOffset=start+(count+1)*offsetSize+2;var pos=start+3;for(var i=0;i<count+1;i+=1){offsets.push(parse.getOffset(data,pos,offsetSize));pos+=offsetSize}endOffset=objectOffset+offsets[count]}else{endOffset=start+2}for(var i$1=0;i$1<offsets.length-1;i$1+=1){var value=parse.getBytes(data,objectOffset+offsets[i$1],objectOffset+offsets[i$1+1]);if(conversionFn){value=conversionFn(value)}objects.push(value)}return{objects:objects,startOffset:start,endOffset:endOffset}}function parseFloatOperand(parser){var s="";var eof=15;var lookup=["0","1","2","3","4","5","6","7","8","9",".","E","E-",null,"-"];while(true){var b=parser.parseByte();var n1=b>>4;var n2=b&15;if(n1===eof){break}s+=lookup[n1];if(n2===eof){break}s+=lookup[n2]}return parseFloat(s)}function parseOperand(parser,b0){var b1;var b2;var b3;var b4;if(b0===28){b1=parser.parseByte();b2=parser.parseByte();return b1<<8|b2}if(b0===29){b1=parser.parseByte();b2=parser.parseByte();b3=parser.parseByte();b4=parser.parseByte();return b1<<24|b2<<16|b3<<8|b4}if(b0===30){return parseFloatOperand(parser)}if(b0>=32&&b0<=246){return b0-139}if(b0>=247&&b0<=250){b1=parser.parseByte();return(b0-247)*256+b1+108}if(b0>=251&&b0<=254){b1=parser.parseByte();return-(b0-251)*256-b1-108}throw new Error("Invalid b0 "+b0)}function entriesToObject(entries){var o={};for(var i=0;i<entries.length;i+=1){var key=entries[i][0];var values=entries[i][1];var value=void 0;if(values.length===1){value=values[0]}else{value=values}if(o.hasOwnProperty(key)&&!isNaN(o[key])){throw new Error("Object "+o+" already has key "+key)}o[key]=value}return o}function parseCFFDict(data,start,size){start=start!==undefined?start:0;var parser=new parse.Parser(data,start);var entries=[];var operands=[];size=size!==undefined?size:data.length;while(parser.relativeOffset<size){var op=parser.parseByte();if(op<=21){if(op===12){op=1200+parser.parseByte()}entries.push([op,operands]);operands=[]}else{operands.push(parseOperand(parser,op))}}return entriesToObject(entries)}function getCFFString(strings,index){if(index<=390){index=cffStandardStrings[index]}else{index=strings[index-391]}return index}function interpretDict(dict,meta,strings){var newDict={};var value;for(var i=0;i<meta.length;i+=1){var m=meta[i];if(Array.isArray(m.type)){var values=[];values.length=m.type.length;for(var j=0;j<m.type.length;j++){value=dict[m.op]!==undefined?dict[m.op][j]:undefined;if(value===undefined){value=m.value!==undefined&&m.value[j]!==undefined?m.value[j]:null}if(m.type[j]==="SID"){value=getCFFString(strings,value)}values[j]=value}newDict[m.name]=values}else{value=dict[m.op];if(value===undefined){value=m.value!==undefined?m.value:null}if(m.type==="SID"){value=getCFFString(strings,value)}newDict[m.name]=value}}return newDict}function parseCFFHeader(data,start){var header={};header.formatMajor=parse.getCard8(data,start);header.formatMinor=parse.getCard8(data,start+1);header.size=parse.getCard8(data,start+2);header.offsetSize=parse.getCard8(data,start+3);header.startOffset=start;header.endOffset=start+4;return header}var TOP_DICT_META=[{name:"version",op:0,type:"SID"},{name:"notice",op:1,type:"SID"},{name:"copyright",op:1200,type:"SID"},{name:"fullName",op:2,type:"SID"},{name:"familyName",op:3,type:"SID"},{name:"weight",op:4,type:"SID"},{name:"isFixedPitch",op:1201,type:"number",value:0},{name:"italicAngle",op:1202,type:"number",value:0},{name:"underlinePosition",op:1203,type:"number",value:-100},{name:"underlineThickness",op:1204,type:"number",value:50},{name:"paintType",op:1205,type:"number",value:0},{name:"charstringType",op:1206,type:"number",value:2},{name:"fontMatrix",op:1207,type:["real","real","real","real","real","real"],value:[.001,0,0,.001,0,0]},{name:"uniqueId",op:13,type:"number"},{name:"fontBBox",op:5,type:["number","number","number","number"],value:[0,0,0,0]},{name:"strokeWidth",op:1208,type:"number",value:0},{name:"xuid",op:14,type:[],value:null},{name:"charset",op:15,type:"offset",value:0},{name:"encoding",op:16,type:"offset",value:0},{name:"charStrings",op:17,type:"offset",value:0},{name:"private",op:18,type:["number","offset"],value:[0,0]},{name:"ros",op:1230,type:["SID","SID","number"]},{name:"cidFontVersion",op:1231,type:"number",value:0},{name:"cidFontRevision",op:1232,type:"number",value:0},{name:"cidFontType",op:1233,type:"number",value:0},{name:"cidCount",op:1234,type:"number",value:8720},{name:"uidBase",op:1235,type:"number"},{name:"fdArray",op:1236,type:"offset"},{name:"fdSelect",op:1237,type:"offset"},{name:"fontName",op:1238,type:"SID"}];var PRIVATE_DICT_META=[{name:"subrs",op:19,type:"offset",value:0},{name:"defaultWidthX",op:20,type:"number",value:0},{name:"nominalWidthX",op:21,type:"number",value:0}];function parseCFFTopDict(data,strings){var dict=parseCFFDict(data,0,data.byteLength);return interpretDict(dict,TOP_DICT_META,strings)}function parseCFFPrivateDict(data,start,size,strings){var dict=parseCFFDict(data,start,size);return interpretDict(dict,PRIVATE_DICT_META,strings)}function gatherCFFTopDicts(data,start,cffIndex,strings){var topDictArray=[];for(var iTopDict=0;iTopDict<cffIndex.length;iTopDict+=1){var topDictData=new DataView(new Uint8Array(cffIndex[iTopDict]).buffer);var topDict=parseCFFTopDict(topDictData,strings);topDict._subrs=[];topDict._subrsBias=0;var privateSize=topDict.private[0];var privateOffset=topDict.private[1];if(privateSize!==0&&privateOffset!==0){var privateDict=parseCFFPrivateDict(data,privateOffset+start,privateSize,strings);topDict._defaultWidthX=privateDict.defaultWidthX;topDict._nominalWidthX=privateDict.nominalWidthX;if(privateDict.subrs!==0){var subrOffset=privateOffset+privateDict.subrs;var subrIndex=parseCFFIndex(data,subrOffset+start);topDict._subrs=subrIndex.objects;topDict._subrsBias=calcCFFSubroutineBias(topDict._subrs)}topDict._privateDict=privateDict}topDictArray.push(topDict)}return topDictArray}function parseCFFCharset(data,start,nGlyphs,strings){var sid;var count;var parser=new parse.Parser(data,start);nGlyphs-=1;var charset=[".notdef"];var format=parser.parseCard8();if(format===0){for(var i=0;i<nGlyphs;i+=1){sid=parser.parseSID();charset.push(getCFFString(strings,sid))}}else if(format===1){while(charset.length<=nGlyphs){sid=parser.parseSID();count=parser.parseCard8();for(var i$1=0;i$1<=count;i$1+=1){charset.push(getCFFString(strings,sid));sid+=1}}}else if(format===2){while(charset.length<=nGlyphs){sid=parser.parseSID();count=parser.parseCard16();for(var i$2=0;i$2<=count;i$2+=1){charset.push(getCFFString(strings,sid));sid+=1}}}else{throw new Error("Unknown charset format "+format)}return charset}function parseCFFEncoding(data,start,charset){var code;var enc={};var parser=new parse.Parser(data,start);var format=parser.parseCard8();if(format===0){var nCodes=parser.parseCard8();for(var i=0;i<nCodes;i+=1){code=parser.parseCard8();enc[code]=i}}else if(format===1){var nRanges=parser.parseCard8();code=1;for(var i$1=0;i$1<nRanges;i$1+=1){var first=parser.parseCard8();var nLeft=parser.parseCard8();for(var j=first;j<=first+nLeft;j+=1){enc[j]=code;code+=1}}}else{throw new Error("Unknown encoding format "+format)}return new CffEncoding(enc,charset)}function parseCFFCharstring(font,glyph,code){var c1x;var c1y;var c2x;var c2y;var p=new Path;var stack=[];var nStems=0;var haveWidth=false;var open=false;var x=0;var y=0;var subrs;var subrsBias;var defaultWidthX;var nominalWidthX;if(font.isCIDFont){var fdIndex=font.tables.cff.topDict._fdSelect[glyph.index];var fdDict=font.tables.cff.topDict._fdArray[fdIndex];subrs=fdDict._subrs;subrsBias=fdDict._subrsBias;defaultWidthX=fdDict._defaultWidthX;nominalWidthX=fdDict._nominalWidthX}else{subrs=font.tables.cff.topDict._subrs;subrsBias=font.tables.cff.topDict._subrsBias;defaultWidthX=font.tables.cff.topDict._defaultWidthX;nominalWidthX=font.tables.cff.topDict._nominalWidthX}var width=defaultWidthX;function newContour(x,y){if(open){p.closePath()}p.moveTo(x,y);open=true}function parseStems(){var hasWidthArg;hasWidthArg=stack.length%2!==0;if(hasWidthArg&&!haveWidth){width=stack.shift()+nominalWidthX}nStems+=stack.length>>1;stack.length=0;haveWidth=true}function parse$$1(code){var b1;var b2;var b3;var b4;var codeIndex;var subrCode;var jpx;var jpy;var c3x;var c3y;var c4x;var c4y;var i=0;while(i<code.length){var v=code[i];i+=1;switch(v){case 1:parseStems();break;case 3:parseStems();break;case 4:if(stack.length>1&&!haveWidth){width=stack.shift()+nominalWidthX;haveWidth=true}y+=stack.pop();newContour(x,y);break;case 5:while(stack.length>0){x+=stack.shift();y+=stack.shift();p.lineTo(x,y)}break;case 6:while(stack.length>0){x+=stack.shift();p.lineTo(x,y);if(stack.length===0){break}y+=stack.shift();p.lineTo(x,y)}break;case 7:while(stack.length>0){y+=stack.shift();p.lineTo(x,y);if(stack.length===0){break}x+=stack.shift();p.lineTo(x,y)}break;case 8:while(stack.length>0){c1x=x+stack.shift();c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x+stack.shift();y=c2y+stack.shift();p.curveTo(c1x,c1y,c2x,c2y,x,y)}break;case 10:codeIndex=stack.pop()+subrsBias;subrCode=subrs[codeIndex];if(subrCode){parse$$1(subrCode)}break;case 11:return;case 12:v=code[i];i+=1;switch(v){case 35:c1x=x+stack.shift();c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();jpx=c2x+stack.shift();jpy=c2y+stack.shift();c3x=jpx+stack.shift();c3y=jpy+stack.shift();c4x=c3x+stack.shift();c4y=c3y+stack.shift();x=c4x+stack.shift();y=c4y+stack.shift();stack.shift();p.curveTo(c1x,c1y,c2x,c2y,jpx,jpy);p.curveTo(c3x,c3y,c4x,c4y,x,y);break;case 34:c1x=x+stack.shift();c1y=y;c2x=c1x+stack.shift();c2y=c1y+stack.shift();jpx=c2x+stack.shift();jpy=c2y;c3x=jpx+stack.shift();c3y=c2y;c4x=c3x+stack.shift();c4y=y;x=c4x+stack.shift();p.curveTo(c1x,c1y,c2x,c2y,jpx,jpy);p.curveTo(c3x,c3y,c4x,c4y,x,y);break;case 36:c1x=x+stack.shift();c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();jpx=c2x+stack.shift();jpy=c2y;c3x=jpx+stack.shift();c3y=c2y;c4x=c3x+stack.shift();c4y=c3y+stack.shift();x=c4x+stack.shift();p.curveTo(c1x,c1y,c2x,c2y,jpx,jpy);p.curveTo(c3x,c3y,c4x,c4y,x,y);break;case 37:c1x=x+stack.shift();c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();jpx=c2x+stack.shift();jpy=c2y+stack.shift();c3x=jpx+stack.shift();c3y=jpy+stack.shift();c4x=c3x+stack.shift();c4y=c3y+stack.shift();if(Math.abs(c4x-x)>Math.abs(c4y-y)){x=c4x+stack.shift()}else{y=c4y+stack.shift()}p.curveTo(c1x,c1y,c2x,c2y,jpx,jpy);p.curveTo(c3x,c3y,c4x,c4y,x,y);break;default:console.log("Glyph "+glyph.index+": unknown operator "+1200+v);stack.length=0}break;case 14:if(stack.length>0&&!haveWidth){width=stack.shift()+nominalWidthX;haveWidth=true}if(open){p.closePath();open=false}break;case 18:parseStems();break;case 19:case 20:parseStems();i+=nStems+7>>3;break;case 21:if(stack.length>2&&!haveWidth){width=stack.shift()+nominalWidthX;haveWidth=true}y+=stack.pop();x+=stack.pop();newContour(x,y);break;case 22:if(stack.length>1&&!haveWidth){width=stack.shift()+nominalWidthX;haveWidth=true}x+=stack.pop();newContour(x,y);break;case 23:parseStems();break;case 24:while(stack.length>2){c1x=x+stack.shift();c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x+stack.shift();y=c2y+stack.shift();p.curveTo(c1x,c1y,c2x,c2y,x,y)}x+=stack.shift();y+=stack.shift();p.lineTo(x,y);break;case 25:while(stack.length>6){x+=stack.shift();y+=stack.shift();p.lineTo(x,y)}c1x=x+stack.shift();c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x+stack.shift();y=c2y+stack.shift();p.curveTo(c1x,c1y,c2x,c2y,x,y);break;case 26:if(stack.length%2){x+=stack.shift()}while(stack.length>0){c1x=x;c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x;y=c2y+stack.shift();p.curveTo(c1x,c1y,c2x,c2y,x,y)}break;case 27:if(stack.length%2){y+=stack.shift()}while(stack.length>0){c1x=x+stack.shift();c1y=y;c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x+stack.shift();y=c2y;p.curveTo(c1x,c1y,c2x,c2y,x,y)}break;case 28:b1=code[i];b2=code[i+1];stack.push((b1<<24|b2<<16)>>16);i+=2;break;case 29:codeIndex=stack.pop()+font.gsubrsBias;subrCode=font.gsubrs[codeIndex];if(subrCode){parse$$1(subrCode)}break;case 30:while(stack.length>0){c1x=x;c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x+stack.shift();y=c2y+(stack.length===1?stack.shift():0);p.curveTo(c1x,c1y,c2x,c2y,x,y);if(stack.length===0){break}c1x=x+stack.shift();c1y=y;c2x=c1x+stack.shift();c2y=c1y+stack.shift();y=c2y+stack.shift();x=c2x+(stack.length===1?stack.shift():0);p.curveTo(c1x,c1y,c2x,c2y,x,y)}break;case 31:while(stack.length>0){c1x=x+stack.shift();c1y=y;c2x=c1x+stack.shift();c2y=c1y+stack.shift();y=c2y+stack.shift();x=c2x+(stack.length===1?stack.shift():0);p.curveTo(c1x,c1y,c2x,c2y,x,y);if(stack.length===0){break}c1x=x;c1y=y+stack.shift();c2x=c1x+stack.shift();c2y=c1y+stack.shift();x=c2x+stack.shift();y=c2y+(stack.length===1?stack.shift():0);p.curveTo(c1x,c1y,c2x,c2y,x,y)}break;default:if(v<32){console.log("Glyph "+glyph.index+": unknown operator "+v)}else if(v<247){stack.push(v-139)}else if(v<251){b1=code[i];i+=1;stack.push((v-247)*256+b1+108)}else if(v<255){b1=code[i];i+=1;stack.push(-(v-251)*256-b1-108)}else{b1=code[i];b2=code[i+1];b3=code[i+2];b4=code[i+3];i+=4;stack.push((b1<<24|b2<<16|b3<<8|b4)/65536)}}}}parse$$1(code);glyph.advanceWidth=width;return p}function parseCFFFDSelect(data,start,nGlyphs,fdArrayCount){var fdSelect=[];var fdIndex;var parser=new parse.Parser(data,start);var format=parser.parseCard8();if(format===0){for(var iGid=0;iGid<nGlyphs;iGid++){fdIndex=parser.parseCard8();if(fdIndex>=fdArrayCount){throw new Error("CFF table CID Font FDSelect has bad FD index value "+fdIndex+" (FD count "+fdArrayCount+")")}fdSelect.push(fdIndex)}}else if(format===3){var nRanges=parser.parseCard16();var first=parser.parseCard16();if(first!==0){throw new Error("CFF Table CID Font FDSelect format 3 range has bad initial GID "+first)}var next;for(var iRange=0;iRange<nRanges;iRange++){fdIndex=parser.parseCard8();next=parser.parseCard16();if(fdIndex>=fdArrayCount){throw new Error("CFF table CID Font FDSelect has bad FD index value "+fdIndex+" (FD count "+fdArrayCount+")")}if(next>nGlyphs){throw new Error("CFF Table CID Font FDSelect format 3 range has bad GID "+next)}for(;first<next;first++){fdSelect.push(fdIndex)}first=next}if(next!==nGlyphs){throw new Error("CFF Table CID Font FDSelect format 3 range has bad final GID "+next)}}else{throw new Error("CFF Table CID Font FDSelect table has unsupported format "+format)}return fdSelect}function parseCFFTable(data,start,font){font.tables.cff={};var header=parseCFFHeader(data,start);var nameIndex=parseCFFIndex(data,header.endOffset,parse.bytesToString);var topDictIndex=parseCFFIndex(data,nameIndex.endOffset);var stringIndex=parseCFFIndex(data,topDictIndex.endOffset,parse.bytesToString);var globalSubrIndex=parseCFFIndex(data,stringIndex.endOffset);font.gsubrs=globalSubrIndex.objects;font.gsubrsBias=calcCFFSubroutineBias(font.gsubrs);var topDictArray=gatherCFFTopDicts(data,start,topDictIndex.objects,stringIndex.objects);if(topDictArray.length!==1){throw new Error("CFF table has too many fonts in 'FontSet' - count of fonts NameIndex.length = "+topDictArray.length)}var topDict=topDictArray[0];font.tables.cff.topDict=topDict;if(topDict._privateDict){font.defaultWidthX=topDict._privateDict.defaultWidthX;font.nominalWidthX=topDict._privateDict.nominalWidthX}if(topDict.ros[0]!==undefined&&topDict.ros[1]!==undefined){font.isCIDFont=true}if(font.isCIDFont){var fdArrayOffset=topDict.fdArray;var fdSelectOffset=topDict.fdSelect;if(fdArrayOffset===0||fdSelectOffset===0){throw new Error("Font is marked as a CID font, but FDArray and/or FDSelect information is missing")}fdArrayOffset+=start;var fdArrayIndex=parseCFFIndex(data,fdArrayOffset);var fdArray=gatherCFFTopDicts(data,start,fdArrayIndex.objects,stringIndex.objects);topDict._fdArray=fdArray;fdSelectOffset+=start;topDict._fdSelect=parseCFFFDSelect(data,fdSelectOffset,font.numGlyphs,fdArray.length)}var privateDictOffset=start+topDict.private[1];var privateDict=parseCFFPrivateDict(data,privateDictOffset,topDict.private[0],stringIndex.objects);font.defaultWidthX=privateDict.defaultWidthX;font.nominalWidthX=privateDict.nominalWidthX;if(privateDict.subrs!==0){var subrOffset=privateDictOffset+privateDict.subrs;var subrIndex=parseCFFIndex(data,subrOffset);font.subrs=subrIndex.objects;font.subrsBias=calcCFFSubroutineBias(font.subrs)}else{font.subrs=[];font.subrsBias=0}var charStringsIndex=parseCFFIndex(data,start+topDict.charStrings);font.nGlyphs=charStringsIndex.objects.length;var charset=parseCFFCharset(data,start+topDict.charset,font.nGlyphs,stringIndex.objects);if(topDict.encoding===0){font.cffEncoding=new CffEncoding(cffStandardEncoding,charset)}else if(topDict.encoding===1){font.cffEncoding=new CffEncoding(cffExpertEncoding,charset)}else{font.cffEncoding=parseCFFEncoding(data,start+topDict.encoding,charset)}font.encoding=font.encoding||font.cffEncoding;font.glyphs=new glyphset.GlyphSet(font);for(var i=0;i<font.nGlyphs;i+=1){var charString=charStringsIndex.objects[i];font.glyphs.push(i,glyphset.cffGlyphLoader(font,i,parseCFFCharstring,charString))}}function encodeString(s,strings){var sid;var i=cffStandardStrings.indexOf(s);if(i>=0){sid=i}i=strings.indexOf(s);if(i>=0){sid=i+cffStandardStrings.length}else{sid=cffStandardStrings.length+strings.length;strings.push(s)}return sid}function makeHeader(){return new table.Record("Header",[{name:"major",type:"Card8",value:1},{name:"minor",type:"Card8",value:0},{name:"hdrSize",type:"Card8",value:4},{name:"major",type:"Card8",value:1}])}function makeNameIndex(fontNames){var t=new table.Record("Name INDEX",[{name:"names",type:"INDEX",value:[]}]);t.names=[];for(var i=0;i<fontNames.length;i+=1){t.names.push({name:"name_"+i,type:"NAME",value:fontNames[i]})}return t}function makeDict(meta,attrs,strings){var m={};for(var i=0;i<meta.length;i+=1){var entry=meta[i];var value=attrs[entry.name];if(value!==undefined&&!equals(value,entry.value)){if(entry.type==="SID"){value=encodeString(value,strings)}m[entry.op]={name:entry.name,type:entry.type,value:value}}}return m}function makeTopDict(attrs,strings){var t=new table.Record("Top DICT",[{name:"dict",type:"DICT",value:{}}]);t.dict=makeDict(TOP_DICT_META,attrs,strings);return t}function makeTopDictIndex(topDict){var t=new table.Record("Top DICT INDEX",[{name:"topDicts",type:"INDEX",value:[]}]);t.topDicts=[{name:"topDict_0",type:"TABLE",value:topDict}];return t}function makeStringIndex(strings){var t=new table.Record("String INDEX",[{name:"strings",type:"INDEX",value:[]}]);t.strings=[];for(var i=0;i<strings.length;i+=1){t.strings.push({name:"string_"+i,type:"STRING",value:strings[i]})}return t}function makeGlobalSubrIndex(){return new table.Record("Global Subr INDEX",[{name:"subrs",type:"INDEX",value:[]}])}function makeCharsets(glyphNames,strings){var t=new table.Record("Charsets",[{name:"format",type:"Card8",value:0}]);for(var i=0;i<glyphNames.length;i+=1){var glyphName=glyphNames[i];var glyphSID=encodeString(glyphName,strings);t.fields.push({name:"glyph_"+i,type:"SID",value:glyphSID})}return t}function glyphToOps(glyph){var ops=[];var path=glyph.path;ops.push({name:"width",type:"NUMBER",value:glyph.advanceWidth});var x=0;var y=0;for(var i=0;i<path.commands.length;i+=1){var dx=void 0;var dy=void 0;var cmd=path.commands[i];if(cmd.type==="Q"){var _13=1/3;var _23=2/3;cmd={type:"C",x:cmd.x,y:cmd.y,x1:_13*x+_23*cmd.x1,y1:_13*y+_23*cmd.y1,x2:_13*cmd.x+_23*cmd.x1,y2:_13*cmd.y+_23*cmd.y1}}if(cmd.type==="M"){dx=Math.round(cmd.x-x);dy=Math.round(cmd.y-y);ops.push({name:"dx",type:"NUMBER",value:dx});ops.push({name:"dy",type:"NUMBER",value:dy});ops.push({name:"rmoveto",type:"OP",value:21});x=Math.round(cmd.x);y=Math.round(cmd.y)}else if(cmd.type==="L"){dx=Math.round(cmd.x-x);dy=Math.round(cmd.y-y);ops.push({name:"dx",type:"NUMBER",value:dx});ops.push({name:"dy",type:"NUMBER",value:dy});ops.push({name:"rlineto",type:"OP",value:5});x=Math.round(cmd.x);y=Math.round(cmd.y)}else if(cmd.type==="C"){var dx1=Math.round(cmd.x1-x);var dy1=Math.round(cmd.y1-y);var dx2=Math.round(cmd.x2-cmd.x1);var dy2=Math.round(cmd.y2-cmd.y1);dx=Math.round(cmd.x-cmd.x2);dy=Math.round(cmd.y-cmd.y2);ops.push({name:"dx1",type:"NUMBER",value:dx1});ops.push({name:"dy1",type:"NUMBER",value:dy1});ops.push({name:"dx2",type:"NUMBER",value:dx2});ops.push({name:"dy2",type:"NUMBER",value:dy2});ops.push({name:"dx",type:"NUMBER",value:dx});ops.push({name:"dy",type:"NUMBER",value:dy});ops.push({name:"rrcurveto",type:"OP",value:8});x=Math.round(cmd.x);y=Math.round(cmd.y)}}ops.push({name:"endchar",type:"OP",value:14});return ops}function makeCharStringsIndex(glyphs){var t=new table.Record("CharStrings INDEX",[{name:"charStrings",type:"INDEX",value:[]}]);for(var i=0;i<glyphs.length;i+=1){var glyph=glyphs.get(i);var ops=glyphToOps(glyph);t.charStrings.push({name:glyph.name,type:"CHARSTRING",value:ops})}return t}function makePrivateDict(attrs,strings){var t=new table.Record("Private DICT",[{name:"dict",type:"DICT",value:{}}]);t.dict=makeDict(PRIVATE_DICT_META,attrs,strings);return t}function makeCFFTable(glyphs,options){var t=new table.Table("CFF ",[{name:"header",type:"RECORD"},{name:"nameIndex",type:"RECORD"},{name:"topDictIndex",type:"RECORD"},{name:"stringIndex",type:"RECORD"},{name:"globalSubrIndex",type:"RECORD"},{name:"charsets",type:"RECORD"},{name:"charStringsIndex",type:"RECORD"},{name:"privateDict",type:"RECORD"}]);var fontScale=1/options.unitsPerEm;var attrs={version:options.version,fullName:options.fullName,familyName:options.familyName,weight:options.weightName,fontBBox:options.fontBBox||[0,0,0,0],fontMatrix:[fontScale,0,0,fontScale,0,0],charset:999,encoding:0,charStrings:999,private:[0,999]};var privateAttrs={};var glyphNames=[];var glyph;for(var i=1;i<glyphs.length;i+=1){glyph=glyphs.get(i);glyphNames.push(glyph.name)}var strings=[];t.header=makeHeader();t.nameIndex=makeNameIndex([options.postScriptName]);var topDict=makeTopDict(attrs,strings);t.topDictIndex=makeTopDictIndex(topDict);t.globalSubrIndex=makeGlobalSubrIndex();t.charsets=makeCharsets(glyphNames,strings);t.charStringsIndex=makeCharStringsIndex(glyphs);t.privateDict=makePrivateDict(privateAttrs,strings);t.stringIndex=makeStringIndex(strings);var startOffset=t.header.sizeOf()+t.nameIndex.sizeOf()+t.topDictIndex.sizeOf()+t.stringIndex.sizeOf()+t.globalSubrIndex.sizeOf();attrs.charset=startOffset;attrs.encoding=0;attrs.charStrings=attrs.charset+t.charsets.sizeOf();attrs.private[1]=attrs.charStrings+t.charStringsIndex.sizeOf();topDict=makeTopDict(attrs,strings);t.topDictIndex=makeTopDictIndex(topDict);return t}var cff={parse:parseCFFTable,make:makeCFFTable};function parseHeadTable(data,start){var head={};var p=new parse.Parser(data,start);head.version=p.parseVersion();head.fontRevision=Math.round(p.parseFixed()*1e3)/1e3;head.checkSumAdjustment=p.parseULong();head.magicNumber=p.parseULong();check.argument(head.magicNumber===1594834165,"Font header has wrong magic number.");head.flags=p.parseUShort();head.unitsPerEm=p.parseUShort();head.created=p.parseLongDateTime();head.modified=p.parseLongDateTime();head.xMin=p.parseShort();head.yMin=p.parseShort();head.xMax=p.parseShort();head.yMax=p.parseShort();head.macStyle=p.parseUShort();head.lowestRecPPEM=p.parseUShort();head.fontDirectionHint=p.parseShort();head.indexToLocFormat=p.parseShort();head.glyphDataFormat=p.parseShort();return head}function makeHeadTable(options){var timestamp=Math.round((new Date).getTime()/1e3)+2082844800;var createdTimestamp=timestamp;if(options.createdTimestamp){createdTimestamp=options.createdTimestamp+2082844800}return new table.Table("head",[{name:"version",type:"FIXED",value:65536},{name:"fontRevision",type:"FIXED",value:65536},{name:"checkSumAdjustment",type:"ULONG",value:0},{name:"magicNumber",type:"ULONG",value:1594834165},{name:"flags",type:"USHORT",value:0},{name:"unitsPerEm",type:"USHORT",value:1e3},{name:"created",type:"LONGDATETIME",value:createdTimestamp},{name:"modified",type:"LONGDATETIME",value:timestamp},{name:"xMin",type:"SHORT",value:0},{name:"yMin",type:"SHORT",value:0},{name:"xMax",type:"SHORT",value:0},{name:"yMax",type:"SHORT",value:0},{name:"macStyle",type:"USHORT",value:0},{name:"lowestRecPPEM",type:"USHORT",value:0},{name:"fontDirectionHint",type:"SHORT",value:2},{name:"indexToLocFormat",type:"SHORT",value:0},{name:"glyphDataFormat",type:"SHORT",value:0}],options)}var head={parse:parseHeadTable,make:makeHeadTable};function parseHheaTable(data,start){var hhea={};var p=new parse.Parser(data,start);hhea.version=p.parseVersion();hhea.ascender=p.parseShort();hhea.descender=p.parseShort();hhea.lineGap=p.parseShort();hhea.advanceWidthMax=p.parseUShort();hhea.minLeftSideBearing=p.parseShort();hhea.minRightSideBearing=p.parseShort();hhea.xMaxExtent=p.parseShort();hhea.caretSlopeRise=p.parseShort();hhea.caretSlopeRun=p.parseShort();hhea.caretOffset=p.parseShort();p.relativeOffset+=8;hhea.metricDataFormat=p.parseShort();hhea.numberOfHMetrics=p.parseUShort();return hhea}function makeHheaTable(options){return new table.Table("hhea",[{name:"version",type:"FIXED",value:65536},{name:"ascender",type:"FWORD",value:0},{name:"descender",type:"FWORD",value:0},{name:"lineGap",type:"FWORD",value:0},{name:"advanceWidthMax",type:"UFWORD",value:0},{name:"minLeftSideBearing",type:"FWORD",value:0},{name:"minRightSideBearing",type:"FWORD",value:0},{name:"xMaxExtent",type:"FWORD",value:0},{name:"caretSlopeRise",type:"SHORT",value:1},{name:"caretSlopeRun",type:"SHORT",value:0},{name:"caretOffset",type:"SHORT",value:0},{name:"reserved1",type:"SHORT",value:0},{name:"reserved2",type:"SHORT",value:0},{name:"reserved3",type:"SHORT",value:0},{name:"reserved4",type:"SHORT",value:0},{name:"metricDataFormat",type:"SHORT",value:0},{name:"numberOfHMetrics",type:"USHORT",value:0}],options)}var hhea={parse:parseHheaTable,make:makeHheaTable};function parseHmtxTable(data,start,numMetrics,numGlyphs,glyphs){var advanceWidth;var leftSideBearing;var p=new parse.Parser(data,start);for(var i=0;i<numGlyphs;i+=1){if(i<numMetrics){advanceWidth=p.parseUShort();leftSideBearing=p.parseShort()}var glyph=glyphs.get(i);glyph.advanceWidth=advanceWidth;glyph.leftSideBearing=leftSideBearing}}function makeHmtxTable(glyphs){var t=new table.Table("hmtx",[]);for(var i=0;i<glyphs.length;i+=1){var glyph=glyphs.get(i);var advanceWidth=glyph.advanceWidth||0;var leftSideBearing=glyph.leftSideBearing||0;t.fields.push({name:"advanceWidth_"+i,type:"USHORT",value:advanceWidth});t.fields.push({name:"leftSideBearing_"+i,type:"SHORT",value:leftSideBearing})}return t}var hmtx={parse:parseHmtxTable,make:makeHmtxTable};function makeLtagTable(tags){var result=new table.Table("ltag",[{name:"version",type:"ULONG",value:1},{name:"flags",type:"ULONG",value:0},{name:"numTags",type:"ULONG",value:tags.length}]);var stringPool="";var stringPoolOffset=12+tags.length*4;for(var i=0;i<tags.length;++i){var pos=stringPool.indexOf(tags[i]);if(pos<0){pos=stringPool.length;stringPool+=tags[i]}result.fields.push({name:"offset "+i,type:"USHORT",value:stringPoolOffset+pos});result.fields.push({name:"length "+i,type:"USHORT",value:tags[i].length})}result.fields.push({name:"stringPool",type:"CHARARRAY",value:stringPool});return result}function parseLtagTable(data,start){var p=new parse.Parser(data,start);var tableVersion=p.parseULong();check.argument(tableVersion===1,"Unsupported ltag table version.");p.skip("uLong",1);var numTags=p.parseULong();var tags=[];for(var i=0;i<numTags;i++){var tag="";var offset=start+p.parseUShort();var length=p.parseUShort();for(var j=offset;j<offset+length;++j){tag+=String.fromCharCode(data.getInt8(j))}tags.push(tag)}return tags}var ltag={make:makeLtagTable,parse:parseLtagTable};function parseMaxpTable(data,start){var maxp={};var p=new parse.Parser(data,start);maxp.version=p.parseVersion();maxp.numGlyphs=p.parseUShort();if(maxp.version===1){maxp.maxPoints=p.parseUShort();maxp.maxContours=p.parseUShort();maxp.maxCompositePoints=p.parseUShort();maxp.maxCompositeContours=p.parseUShort();maxp.maxZones=p.parseUShort();maxp.maxTwilightPoints=p.parseUShort();maxp.maxStorage=p.parseUShort();maxp.maxFunctionDefs=p.parseUShort();maxp.maxInstructionDefs=p.parseUShort();maxp.maxStackElements=p.parseUShort();maxp.maxSizeOfInstructions=p.parseUShort();maxp.maxComponentElements=p.parseUShort();maxp.maxComponentDepth=p.parseUShort()}return maxp}function makeMaxpTable(numGlyphs){return new table.Table("maxp",[{name:"version",type:"FIXED",value:20480},{name:"numGlyphs",type:"USHORT",value:numGlyphs}])}var maxp={parse:parseMaxpTable,make:makeMaxpTable};var nameTableNames=["copyright","fontFamily","fontSubfamily","uniqueID","fullName","version","postScriptName","trademark","manufacturer","designer","description","manufacturerURL","designerURL","license","licenseURL","reserved","preferredFamily","preferredSubfamily","compatibleFullName","sampleText","postScriptFindFontName","wwsFamily","wwsSubfamily"];var macLanguages={0:"en",1:"fr",2:"de",3:"it",4:"nl",5:"sv",6:"es",7:"da",8:"pt",9:"no",10:"he",11:"ja",12:"ar",13:"fi",14:"el",15:"is",16:"mt",17:"tr",18:"hr",19:"zh-Hant",20:"ur",21:"hi",22:"th",23:"ko",24:"lt",25:"pl",26:"hu",27:"es",28:"lv",29:"se",30:"fo",31:"fa",32:"ru",33:"zh",34:"nl-BE",35:"ga",36:"sq",37:"ro",38:"cz",39:"sk",40:"si",41:"yi",42:"sr",43:"mk",44:"bg",45:"uk",46:"be",47:"uz",48:"kk",49:"az-Cyrl",50:"az-Arab",51:"hy",52:"ka",53:"mo",54:"ky",55:"tg",56:"tk",57:"mn-CN",58:"mn",59:"ps",60:"ks",61:"ku",62:"sd",63:"bo",64:"ne",65:"sa",66:"mr",67:"bn",68:"as",69:"gu",70:"pa",71:"or",72:"ml",73:"kn",74:"ta",75:"te",76:"si",77:"my",78:"km",79:"lo",80:"vi",81:"id",82:"tl",83:"ms",84:"ms-Arab",85:"am",86:"ti",87:"om",88:"so",89:"sw",90:"rw",91:"rn",92:"ny",93:"mg",94:"eo",128:"cy",129:"eu",130:"ca",131:"la",132:"qu",133:"gn",134:"ay",135:"tt",136:"ug",137:"dz",138:"jv",139:"su",140:"gl",141:"af",142:"br",143:"iu",144:"gd",145:"gv",146:"ga",147:"to",148:"el-polyton",149:"kl",150:"az",151:"nn"};var macLanguageToScript={0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:5,11:1,12:4,13:0,14:6,15:0,16:0,17:0,18:0,19:2,20:4,21:9,22:21,23:3,24:29,25:29,26:29,27:29,28:29,29:0,30:0,31:4,32:7,33:25,34:0,35:0,36:0,37:0,38:29,39:29,40:0,41:5,42:7,43:7,44:7,45:7,46:7,47:7,48:7,49:7,50:4,51:24,52:23,53:7,54:7,55:7,56:7,57:27,58:7,59:4,60:4,61:4,62:4,63:26,64:9,65:9,66:9,67:13,68:13,69:11,70:10,71:12,72:17,73:16,74:14,75:15,76:18,77:19,78:20,79:22,80:30,81:0,82:0,83:0,84:4,85:28,86:28,87:28,88:0,89:0,90:0,91:0,92:0,93:0,94:0,128:0,129:0,130:0,131:0,132:0,133:0,134:0,135:7,136:4,137:26,138:0,139:0,140:0,141:0,142:0,143:28,144:0,145:0,146:0,147:0,148:6,149:0,150:0,151:0};var windowsLanguages={1078:"af",1052:"sq",1156:"gsw",1118:"am",5121:"ar-DZ",15361:"ar-BH",3073:"ar",2049:"ar-IQ",11265:"ar-JO",13313:"ar-KW",12289:"ar-LB",4097:"ar-LY",6145:"ary",8193:"ar-OM",16385:"ar-QA",1025:"ar-SA",10241:"ar-SY",7169:"aeb",14337:"ar-AE",9217:"ar-YE",1067:"hy",1101:"as",2092:"az-Cyrl",1068:"az",1133:"ba",1069:"eu",1059:"be",2117:"bn",1093:"bn-IN",8218:"bs-Cyrl",5146:"bs",1150:"br",1026:"bg",1027:"ca",3076:"zh-HK",5124:"zh-MO",2052:"zh",4100:"zh-SG",1028:"zh-TW",1155:"co",1050:"hr",4122:"hr-BA",1029:"cs",1030:"da",1164:"prs",1125:"dv",2067:"nl-BE",1043:"nl",3081:"en-AU",10249:"en-BZ",4105:"en-CA",9225:"en-029",16393:"en-IN",6153:"en-IE",8201:"en-JM",17417:"en-MY",5129:"en-NZ",13321:"en-PH",18441:"en-SG",7177:"en-ZA",11273:"en-TT",2057:"en-GB",1033:"en",12297:"en-ZW",1061:"et",1080:"fo",1124:"fil",1035:"fi",2060:"fr-BE",3084:"fr-CA",1036:"fr",5132:"fr-LU",6156:"fr-MC",4108:"fr-CH",1122:"fy",1110:"gl",1079:"ka",3079:"de-AT",1031:"de",5127:"de-LI",4103:"de-LU",2055:"de-CH",1032:"el",1135:"kl",1095:"gu",1128:"ha",1037:"he",1081:"hi",1038:"hu",1039:"is",1136:"ig",1057:"id",1117:"iu",2141:"iu-Latn",2108:"ga",1076:"xh",1077:"zu",1040:"it",2064:"it-CH",1041:"ja",1099:"kn",1087:"kk",1107:"km",1158:"quc",1159:"rw",1089:"sw",1111:"kok",1042:"ko",1088:"ky",1108:"lo",1062:"lv",1063:"lt",2094:"dsb",1134:"lb",1071:"mk",2110:"ms-BN",1086:"ms",1100:"ml",1082:"mt",1153:"mi",1146:"arn",1102:"mr",1148:"moh",1104:"mn",2128:"mn-CN",1121:"ne",1044:"nb",2068:"nn",1154:"oc",1096:"or",1123:"ps",1045:"pl",1046:"pt",2070:"pt-PT",1094:"pa",1131:"qu-BO",2155:"qu-EC",3179:"qu",1048:"ro",1047:"rm",1049:"ru",9275:"smn",4155:"smj-NO",5179:"smj",3131:"se-FI",1083:"se",2107:"se-SE",8251:"sms",6203:"sma-NO",7227:"sms",1103:"sa",7194:"sr-Cyrl-BA",3098:"sr",6170:"sr-Latn-BA",2074:"sr-Latn",1132:"nso",1074:"tn",1115:"si",1051:"sk",1060:"sl",11274:"es-AR",16394:"es-BO",13322:"es-CL",9226:"es-CO",5130:"es-CR",7178:"es-DO",12298:"es-EC",17418:"es-SV",4106:"es-GT",18442:"es-HN",2058:"es-MX",19466:"es-NI",6154:"es-PA",15370:"es-PY",10250:"es-PE",20490:"es-PR",3082:"es",1034:"es",21514:"es-US",14346:"es-UY",8202:"es-VE",2077:"sv-FI",1053:"sv",1114:"syr",1064:"tg",2143:"tzm",1097:"ta",1092:"tt",1098:"te",1054:"th",1105:"bo",1055:"tr",1090:"tk",1152:"ug",1058:"uk",1070:"hsb",1056:"ur",2115:"uz-Cyrl",1091:"uz",1066:"vi",1106:"cy",1160:"wo",1157:"sah",1144:"ii",1130:"yo"};function getLanguageCode(platformID,languageID,ltag){switch(platformID){case 0:if(languageID===65535){return"und"}else if(ltag){return ltag[languageID]}break;case 1:return macLanguages[languageID];case 3:return windowsLanguages[languageID]}return undefined}var utf16="utf-16";var macScriptEncodings={0:"macintosh",1:"x-mac-japanese",2:"x-mac-chinesetrad",3:"x-mac-korean",6:"x-mac-greek",7:"x-mac-cyrillic",9:"x-mac-devanagai",10:"x-mac-gurmukhi",11:"x-mac-gujarati",12:"x-mac-oriya",13:"x-mac-bengali",14:"x-mac-tamil",15:"x-mac-telugu",16:"x-mac-kannada",17:"x-mac-malayalam",18:"x-mac-sinhalese",19:"x-mac-burmese",20:"x-mac-khmer",21:"x-mac-thai",22:"x-mac-lao",23:"x-mac-georgian",24:"x-mac-armenian",25:"x-mac-chinesesimp",26:"x-mac-tibetan",27:"x-mac-mongolian",28:"x-mac-ethiopic",29:"x-mac-ce",30:"x-mac-vietnamese",31:"x-mac-extarabic"};var macLanguageEncodings={15:"x-mac-icelandic",17:"x-mac-turkish",18:"x-mac-croatian",24:"x-mac-ce",25:"x-mac-ce",26:"x-mac-ce",27:"x-mac-ce",28:"x-mac-ce",30:"x-mac-icelandic",37:"x-mac-romanian",38:"x-mac-ce",39:"x-mac-ce",40:"x-mac-ce",143:"x-mac-inuit",146:"x-mac-gaelic"};function getEncoding(platformID,encodingID,languageID){switch(platformID){case 0:return utf16;case 1:return macLanguageEncodings[languageID]||macScriptEncodings[encodingID];case 3:if(encodingID===1||encodingID===10){return utf16}break}return undefined}function parseNameTable(data,start,ltag){var name={};var p=new parse.Parser(data,start);var format=p.parseUShort();var count=p.parseUShort();var stringOffset=p.offset+p.parseUShort();for(var i=0;i<count;i++){var platformID=p.parseUShort();var encodingID=p.parseUShort();var languageID=p.parseUShort();var nameID=p.parseUShort();var property=nameTableNames[nameID]||nameID;var byteLength=p.parseUShort();var offset=p.parseUShort();var language=getLanguageCode(platformID,languageID,ltag);var encoding=getEncoding(platformID,encodingID,languageID);if(encoding!==undefined&&language!==undefined){var text=void 0;if(encoding===utf16){text=decode.UTF16(data,stringOffset+offset,byteLength)}else{text=decode.MACSTRING(data,stringOffset+offset,byteLength,encoding)}if(text){var translations=name[property];if(translations===undefined){translations=name[property]={}}translations[language]=text}}}var langTagCount=0;if(format===1){langTagCount=p.parseUShort()}return name}function reverseDict(dict){var result={};for(var key in dict){result[dict[key]]=parseInt(key)}return result}function makeNameRecord(platformID,encodingID,languageID,nameID,length,offset){return new table.Record("NameRecord",[{name:"platformID",type:"USHORT",value:platformID},{name:"encodingID",type:"USHORT",value:encodingID},{name:"languageID",type:"USHORT",value:languageID},{name:"nameID",type:"USHORT",value:nameID},{name:"length",type:"USHORT",value:length},{name:"offset",type:"USHORT",value:offset}])}function findSubArray(needle,haystack){var needleLength=needle.length;var limit=haystack.length-needleLength+1;loop:for(var pos=0;pos<limit;pos++){for(;pos<limit;pos++){for(var k=0;k<needleLength;k++){if(haystack[pos+k]!==needle[k]){continue loop}}return pos}}return-1}function addStringToPool(s,pool){var offset=findSubArray(s,pool);if(offset<0){offset=pool.length;var i=0;var len=s.length;for(;i<len;++i){pool.push(s[i])}}return offset}function makeNameTable(names,ltag){var nameID;var nameIDs=[];var namesWithNumericKeys={};var nameTableIds=reverseDict(nameTableNames);for(var key in names){var id=nameTableIds[key];if(id===undefined){id=key}nameID=parseInt(id);if(isNaN(nameID)){throw new Error('Name table entry "'+key+'" does not exist, see nameTableNames for complete list.')}namesWithNumericKeys[nameID]=names[key];nameIDs.push(nameID)}var macLanguageIds=reverseDict(macLanguages);var windowsLanguageIds=reverseDict(windowsLanguages);var nameRecords=[];var stringPool=[];for(var i=0;i<nameIDs.length;i++){nameID=nameIDs[i];var translations=namesWithNumericKeys[nameID];for(var lang in translations){var text=translations[lang];var macPlatform=1;var macLanguage=macLanguageIds[lang];var macScript=macLanguageToScript[macLanguage];var macEncoding=getEncoding(macPlatform,macScript,macLanguage);var macName=encode.MACSTRING(text,macEncoding);if(macName===undefined){macPlatform=0;macLanguage=ltag.indexOf(lang);if(macLanguage<0){macLanguage=ltag.length;ltag.push(lang)}macScript=4;macName=encode.UTF16(text)}var macNameOffset=addStringToPool(macName,stringPool);nameRecords.push(makeNameRecord(macPlatform,macScript,macLanguage,nameID,macName.length,macNameOffset));var winLanguage=windowsLanguageIds[lang];if(winLanguage!==undefined){var winName=encode.UTF16(text);var winNameOffset=addStringToPool(winName,stringPool);nameRecords.push(makeNameRecord(3,1,winLanguage,nameID,winName.length,winNameOffset))}}}nameRecords.sort(function(a,b){return a.platformID-b.platformID||a.encodingID-b.encodingID||a.languageID-b.languageID||a.nameID-b.nameID});var t=new table.Table("name",[{name:"format",type:"USHORT",value:0},{name:"count",type:"USHORT",value:nameRecords.length},{name:"stringOffset",type:"USHORT",value:6+nameRecords.length*12}]);for(var r=0;r<nameRecords.length;r++){t.fields.push({name:"record_"+r,type:"RECORD",value:nameRecords[r]})}t.fields.push({name:"strings",type:"LITERAL",value:stringPool});return t}var _name={parse:parseNameTable,make:makeNameTable};var unicodeRanges=[{begin:0,end:127},{begin:128,end:255},{begin:256,end:383},{begin:384,end:591},{begin:592,end:687},{begin:688,end:767},{begin:768,end:879},{begin:880,end:1023},{begin:11392,end:11519},{begin:1024,end:1279},{begin:1328,end:1423},{begin:1424,end:1535},{begin:42240,end:42559},{begin:1536,end:1791},{begin:1984,end:2047},{begin:2304,end:2431},{begin:2432,end:2559},{begin:2560,end:2687},{begin:2688,end:2815},{begin:2816,end:2943},{begin:2944,end:3071},{begin:3072,end:3199},{begin:3200,end:3327},{begin:3328,end:3455},{begin:3584,end:3711},{begin:3712,end:3839},{begin:4256,end:4351},{begin:6912,end:7039},{begin:4352,end:4607},{begin:7680,end:7935},{begin:7936,end:8191},{begin:8192,end:8303},{begin:8304,end:8351},{begin:8352,end:8399},{begin:8400,end:8447},{begin:8448,end:8527},{begin:8528,end:8591},{begin:8592,end:8703},{begin:8704,end:8959},{begin:8960,end:9215},{begin:9216,end:9279},{begin:9280,end:9311},{begin:9312,end:9471},{begin:9472,end:9599},{begin:9600,end:9631},{begin:9632,end:9727},{begin:9728,end:9983},{begin:9984,end:10175},{begin:12288,end:12351},{begin:12352,end:12447},{begin:12448,end:12543},{begin:12544,end:12591},{begin:12592,end:12687},{begin:43072,end:43135},{begin:12800,end:13055},{begin:13056,end:13311},{begin:44032,end:55215},{begin:55296,end:57343},{begin:67840,end:67871},{begin:19968,end:40959},{begin:57344,end:63743},{begin:12736,end:12783},{begin:64256,end:64335},{begin:64336,end:65023},{begin:65056,end:65071},{begin:65040,end:65055},{begin:65104,end:65135},{begin:65136,end:65279},{begin:65280,end:65519},{begin:65520,end:65535},{begin:3840,end:4095},{begin:1792,end:1871},{begin:1920,end:1983},{begin:3456,end:3583},{begin:4096,end:4255},{begin:4608,end:4991},{begin:5024,end:5119},{begin:5120,end:5759},{begin:5760,end:5791},{begin:5792,end:5887},{begin:6016,end:6143},{begin:6144,end:6319},{begin:10240,end:10495},{begin:40960,end:42127},{begin:5888,end:5919},{begin:66304,end:66351},{begin:66352,end:66383},{begin:66560,end:66639},{begin:118784,end:119039},{begin:119808,end:120831},{begin:1044480,end:1048573},{begin:65024,end:65039},{begin:917504,end:917631},{begin:6400,end:6479},{begin:6480,end:6527},{begin:6528,end:6623},{begin:6656,end:6687},{begin:11264,end:11359},{begin:11568,end:11647},{begin:19904,end:19967},{begin:43008,end:43055},{begin:65536,end:65663},{begin:65856,end:65935},{begin:66432,end:66463},{begin:66464,end:66527},{begin:66640,end:66687},{begin:66688,end:66735},{begin:67584,end:67647},{begin:68096,end:68191},{begin:119552,end:119647},{begin:73728,end:74751},{begin:119648,end:119679},{begin:7040,end:7103},{begin:7168,end:7247},{begin:7248,end:7295},{begin:43136,end:43231},{begin:43264,end:43311},{begin:43312,end:43359},{begin:43520,end:43615},{begin:65936,end:65999},{begin:66e3,end:66047},{begin:66208,end:66271},{begin:127024,end:127135}];function getUnicodeRange(unicode){for(var i=0;i<unicodeRanges.length;i+=1){var range=unicodeRanges[i];if(unicode>=range.begin&&unicode<range.end){return i}}return-1}function parseOS2Table(data,start){var os2={};var p=new parse.Parser(data,start);os2.version=p.parseUShort();os2.xAvgCharWidth=p.parseShort();os2.usWeightClass=p.parseUShort();os2.usWidthClass=p.parseUShort();os2.fsType=p.parseUShort();os2.ySubscriptXSize=p.parseShort();os2.ySubscriptYSize=p.parseShort();os2.ySubscriptXOffset=p.parseShort();os2.ySubscriptYOffset=p.parseShort();os2.ySuperscriptXSize=p.parseShort();os2.ySuperscriptYSize=p.parseShort();os2.ySuperscriptXOffset=p.parseShort();os2.ySuperscriptYOffset=p.parseShort();os2.yStrikeoutSize=p.parseShort();os2.yStrikeoutPosition=p.parseShort();os2.sFamilyClass=p.parseShort();os2.panose=[];for(var i=0;i<10;i++){os2.panose[i]=p.parseByte()}os2.ulUnicodeRange1=p.parseULong();os2.ulUnicodeRange2=p.parseULong();os2.ulUnicodeRange3=p.parseULong();os2.ulUnicodeRange4=p.parseULong();os2.achVendID=String.fromCharCode(p.parseByte(),p.parseByte(),p.parseByte(),p.parseByte());os2.fsSelection=p.parseUShort();os2.usFirstCharIndex=p.parseUShort();os2.usLastCharIndex=p.parseUShort();os2.sTypoAscender=p.parseShort();os2.sTypoDescender=p.parseShort();os2.sTypoLineGap=p.parseShort();os2.usWinAscent=p.parseUShort();os2.usWinDescent=p.parseUShort();if(os2.version>=1){os2.ulCodePageRange1=p.parseULong();os2.ulCodePageRange2=p.parseULong()}if(os2.version>=2){os2.sxHeight=p.parseShort();os2.sCapHeight=p.parseShort();os2.usDefaultChar=p.parseUShort();os2.usBreakChar=p.parseUShort();os2.usMaxContent=p.parseUShort()}return os2}function makeOS2Table(options){return new table.Table("OS/2",[{name:"version",type:"USHORT",value:3},{name:"xAvgCharWidth",type:"SHORT",value:0},{name:"usWeightClass",type:"USHORT",value:0},{name:"usWidthClass",type:"USHORT",value:0},{name:"fsType",type:"USHORT",value:0},{name:"ySubscriptXSize",type:"SHORT",value:650},{name:"ySubscriptYSize",type:"SHORT",value:699},{name:"ySubscriptXOffset",type:"SHORT",value:0},{name:"ySubscriptYOffset",type:"SHORT",value:140},{name:"ySuperscriptXSize",type:"SHORT",value:650},{name:"ySuperscriptYSize",type:"SHORT",value:699},{name:"ySuperscriptXOffset",type:"SHORT",value:0},{name:"ySuperscriptYOffset",type:"SHORT",value:479},{name:"yStrikeoutSize",type:"SHORT",value:49},{name:"yStrikeoutPosition",type:"SHORT",value:258},{name:"sFamilyClass",type:"SHORT",value:0},{name:"bFamilyType",type:"BYTE",value:0},{name:"bSerifStyle",type:"BYTE",value:0},{name:"bWeight",type:"BYTE",value:0},{name:"bProportion",type:"BYTE",value:0},{name:"bContrast",type:"BYTE",value:0},{name:"bStrokeVariation",type:"BYTE",value:0},{name:"bArmStyle",type:"BYTE",value:0},{name:"bLetterform",type:"BYTE",value:0},{name:"bMidline",type:"BYTE",value:0},{name:"bXHeight",type:"BYTE",value:0},{name:"ulUnicodeRange1",type:"ULONG",value:0},{name:"ulUnicodeRange2",type:"ULONG",value:0},{name:"ulUnicodeRange3",type:"ULONG",value:0},{name:"ulUnicodeRange4",type:"ULONG",value:0},{name:"achVendID",type:"CHARARRAY",value:"XXXX"},{name:"fsSelection",type:"USHORT",value:0},{name:"usFirstCharIndex",type:"USHORT",value:0},{name:"usLastCharIndex",type:"USHORT",value:0},{name:"sTypoAscender",type:"SHORT",value:0},{name:"sTypoDescender",type:"SHORT",value:0},{name:"sTypoLineGap",type:"SHORT",value:0},{name:"usWinAscent",type:"USHORT",value:0},{name:"usWinDescent",type:"USHORT",value:0},{name:"ulCodePageRange1",type:"ULONG",value:0},{name:"ulCodePageRange2",type:"ULONG",value:0},{name:"sxHeight",type:"SHORT",value:0},{name:"sCapHeight",type:"SHORT",value:0},{name:"usDefaultChar",type:"USHORT",value:0},{name:"usBreakChar",type:"USHORT",value:0},{name:"usMaxContext",type:"USHORT",value:0}],options)}var os2={parse:parseOS2Table,make:makeOS2Table,unicodeRanges:unicodeRanges,getUnicodeRange:getUnicodeRange};function parsePostTable(data,start){var post={};var p=new parse.Parser(data,start);post.version=p.parseVersion();post.italicAngle=p.parseFixed();post.underlinePosition=p.parseShort();post.underlineThickness=p.parseShort();post.isFixedPitch=p.parseULong();post.minMemType42=p.parseULong();post.maxMemType42=p.parseULong();post.minMemType1=p.parseULong();post.maxMemType1=p.parseULong();switch(post.version){case 1:post.names=standardNames.slice();break;case 2:post.numberOfGlyphs=p.parseUShort();post.glyphNameIndex=new Array(post.numberOfGlyphs);for(var i=0;i<post.numberOfGlyphs;i++){post.glyphNameIndex[i]=p.parseUShort()}post.names=[];for(var i$1=0;i$1<post.numberOfGlyphs;i$1++){if(post.glyphNameIndex[i$1]>=standardNames.length){var nameLength=p.parseChar();post.names.push(p.parseString(nameLength))}}break;case 2.5:post.numberOfGlyphs=p.parseUShort();post.offset=new Array(post.numberOfGlyphs);for(var i$2=0;i$2<post.numberOfGlyphs;i$2++){post.offset[i$2]=p.parseChar()}break}return post}function makePostTable(){return new table.Table("post",[{name:"version",type:"FIXED",value:196608},{name:"italicAngle",type:"FIXED",value:0},{name:"underlinePosition",type:"FWORD",value:0},{name:"underlineThickness",type:"FWORD",value:0},{name:"isFixedPitch",type:"ULONG",value:0},{name:"minMemType42",type:"ULONG",value:0},{name:"maxMemType42",type:"ULONG",value:0},{name:"minMemType1",type:"ULONG",value:0},{name:"maxMemType1",type:"ULONG",value:0}])}var post={parse:parsePostTable,make:makePostTable};var subtableParsers=new Array(9);subtableParsers[1]=function parseLookup1(){var start=this.offset+this.relativeOffset;var substFormat=this.parseUShort();if(substFormat===1){return{substFormat:1,coverage:this.parsePointer(Parser.coverage),deltaGlyphId:this.parseUShort()}}else if(substFormat===2){return{substFormat:2,coverage:this.parsePointer(Parser.coverage),substitute:this.parseOffset16List()}}check.assert(false,"0x"+start.toString(16)+": lookup type 1 format must be 1 or 2.")};subtableParsers[2]=function parseLookup2(){var substFormat=this.parseUShort();check.argument(substFormat===1,"GSUB Multiple Substitution Subtable identifier-format must be 1");return{substFormat:substFormat,coverage:this.parsePointer(Parser.coverage),sequences:this.parseListOfLists()}};subtableParsers[3]=function parseLookup3(){var substFormat=this.parseUShort();check.argument(substFormat===1,"GSUB Alternate Substitution Subtable identifier-format must be 1");return{substFormat:substFormat,coverage:this.parsePointer(Parser.coverage),alternateSets:this.parseListOfLists()}};subtableParsers[4]=function parseLookup4(){var substFormat=this.parseUShort();check.argument(substFormat===1,"GSUB ligature table identifier-format must be 1");return{substFormat:substFormat,coverage:this.parsePointer(Parser.coverage),ligatureSets:this.parseListOfLists(function(){return{ligGlyph:this.parseUShort(),components:this.parseUShortList(this.parseUShort()-1)}})}};var lookupRecordDesc={sequenceIndex:Parser.uShort,lookupListIndex:Parser.uShort};subtableParsers[5]=function parseLookup5(){var start=this.offset+this.relativeOffset;var substFormat=this.parseUShort();if(substFormat===1){return{substFormat:substFormat,coverage:this.parsePointer(Parser.coverage),ruleSets:this.parseListOfLists(function(){var glyphCount=this.parseUShort();var substCount=this.parseUShort();return{input:this.parseUShortList(glyphCount-1),lookupRecords:this.parseRecordList(substCount,lookupRecordDesc)}})}}else if(substFormat===2){return{substFormat:substFormat,coverage:this.parsePointer(Parser.coverage),classDef:this.parsePointer(Parser.classDef),classSets:this.parseListOfLists(function(){var glyphCount=this.parseUShort();var substCount=this.parseUShort();return{classes:this.parseUShortList(glyphCount-1),lookupRecords:this.parseRecordList(substCount,lookupRecordDesc)}})}}else if(substFormat===3){var glyphCount=this.parseUShort();var substCount=this.parseUShort();return{substFormat:substFormat,coverages:this.parseList(glyphCount,Parser.pointer(Parser.coverage)),lookupRecords:this.parseRecordList(substCount,lookupRecordDesc)}}check.assert(false,"0x"+start.toString(16)+": lookup type 5 format must be 1, 2 or 3.")};subtableParsers[6]=function parseLookup6(){var start=this.offset+this.relativeOffset;var substFormat=this.parseUShort();if(substFormat===1){return{substFormat:1,coverage:this.parsePointer(Parser.coverage),chainRuleSets:this.parseListOfLists(function(){return{backtrack:this.parseUShortList(),input:this.parseUShortList(this.parseShort()-1),lookahead:this.parseUShortList(),lookupRecords:this.parseRecordList(lookupRecordDesc)}})}}else if(substFormat===2){return{substFormat:2,coverage:this.parsePointer(Parser.coverage),backtrackClassDef:this.parsePointer(Parser.classDef),inputClassDef:this.parsePointer(Parser.classDef),lookaheadClassDef:this.parsePointer(Parser.classDef),chainClassSet:this.parseListOfLists(function(){return{backtrack:this.parseUShortList(),input:this.parseUShortList(this.parseShort()-1),lookahead:this.parseUShortList(),lookupRecords:this.parseRecordList(lookupRecordDesc)}})}}else if(substFormat===3){return{substFormat:3,backtrackCoverage:this.parseList(Parser.pointer(Parser.coverage)),inputCoverage:this.parseList(Parser.pointer(Parser.coverage)),lookaheadCoverage:this.parseList(Parser.pointer(Parser.coverage)),lookupRecords:this.parseRecordList(lookupRecordDesc)}}check.assert(false,"0x"+start.toString(16)+": lookup type 6 format must be 1, 2 or 3.")};subtableParsers[7]=function parseLookup7(){var substFormat=this.parseUShort();check.argument(substFormat===1,"GSUB Extension Substitution subtable identifier-format must be 1");var extensionLookupType=this.parseUShort();var extensionParser=new Parser(this.data,this.offset+this.parseULong());return{substFormat:1,lookupType:extensionLookupType,extension:subtableParsers[extensionLookupType].call(extensionParser)}};subtableParsers[8]=function parseLookup8(){var substFormat=this.parseUShort();check.argument(substFormat===1,"GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1");return{substFormat:substFormat,coverage:this.parsePointer(Parser.coverage),backtrackCoverage:this.parseList(Parser.pointer(Parser.coverage)),lookaheadCoverage:this.parseList(Parser.pointer(Parser.coverage)),substitutes:this.parseUShortList()}};function parseGsubTable(data,start){start=start||0;var p=new Parser(data,start);var tableVersion=p.parseVersion(1);check.argument(tableVersion===1||tableVersion===1.1,"Unsupported GSUB table version.");if(tableVersion===1){return{version:tableVersion,scripts:p.parseScriptList(),features:p.parseFeatureList(),lookups:p.parseLookupList(subtableParsers)}}else{return{version:tableVersion,scripts:p.parseScriptList(),features:p.parseFeatureList(),lookups:p.parseLookupList(subtableParsers),variations:p.parseFeatureVariationsList()}}}var subtableMakers=new Array(9);subtableMakers[1]=function makeLookup1(subtable){if(subtable.substFormat===1){return new table.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new table.Coverage(subtable.coverage)},{name:"deltaGlyphID",type:"USHORT",value:subtable.deltaGlyphId}])}else{return new table.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:2},{name:"coverage",type:"TABLE",value:new table.Coverage(subtable.coverage)}].concat(table.ushortList("substitute",subtable.substitute)))}check.fail("Lookup type 1 substFormat must be 1 or 2.")};subtableMakers[3]=function makeLookup3(subtable){check.assert(subtable.substFormat===1,"Lookup type 3 substFormat must be 1.");return new table.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new table.Coverage(subtable.coverage)}].concat(table.tableList("altSet",subtable.alternateSets,function(alternateSet){return new table.Table("alternateSetTable",table.ushortList("alternate",alternateSet))})))};subtableMakers[4]=function makeLookup4(subtable){check.assert(subtable.substFormat===1,"Lookup type 4 substFormat must be 1.");return new table.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new table.Coverage(subtable.coverage)}].concat(table.tableList("ligSet",subtable.ligatureSets,function(ligatureSet){return new table.Table("ligatureSetTable",table.tableList("ligature",ligatureSet,function(ligature){return new table.Table("ligatureTable",[{name:"ligGlyph",type:"USHORT",value:ligature.ligGlyph}].concat(table.ushortList("component",ligature.components,ligature.components.length+1)))}))})))};function makeGsubTable(gsub){return new table.Table("GSUB",[{name:"version",type:"ULONG",value:65536},{name:"scripts",type:"TABLE",value:new table.ScriptList(gsub.scripts)},{name:"features",type:"TABLE",value:new table.FeatureList(gsub.features)},{name:"lookups",type:"TABLE",value:new table.LookupList(gsub.lookups,subtableMakers)}])}var gsub={parse:parseGsubTable,make:makeGsubTable};function parseMetaTable(data,start){var p=new parse.Parser(data,start);var tableVersion=p.parseULong();check.argument(tableVersion===1,"Unsupported META table version.");p.parseULong();p.parseULong();var numDataMaps=p.parseULong();var tags={};for(var i=0;i<numDataMaps;i++){var tag=p.parseTag();var dataOffset=p.parseULong();var dataLength=p.parseULong();var text=decode.UTF8(data,start+dataOffset,dataLength);tags[tag]=text}return tags}function makeMetaTable(tags){var numTags=Object.keys(tags).length;var stringPool="";var stringPoolOffset=16+numTags*12;var result=new table.Table("meta",[{name:"version",type:"ULONG",value:1},{name:"flags",type:"ULONG",value:0},{name:"offset",type:"ULONG",value:stringPoolOffset},{name:"numTags",type:"ULONG",value:numTags}]);for(var tag in tags){var pos=stringPool.length;stringPool+=tags[tag];result.fields.push({name:"tag "+tag,type:"TAG",value:tag});result.fields.push({name:"offset "+tag,type:"ULONG",value:stringPoolOffset+pos});result.fields.push({name:"length "+tag,type:"ULONG",value:tags[tag].length})}result.fields.push({name:"stringPool",type:"CHARARRAY",value:stringPool});return result}var meta={parse:parseMetaTable,make:makeMetaTable};function log2(v){return Math.log(v)/Math.log(2)|0}function computeCheckSum(bytes){while(bytes.length%4!==0){bytes.push(0)}var sum=0;for(var i=0;i<bytes.length;i+=4){sum+=(bytes[i]<<24)+(bytes[i+1]<<16)+(bytes[i+2]<<8)+bytes[i+3]}sum%=Math.pow(2,32);return sum}function makeTableRecord(tag,checkSum,offset,length){return new table.Record("Table Record",[{name:"tag",type:"TAG",value:tag!==undefined?tag:""},{name:"checkSum",type:"ULONG",value:checkSum!==undefined?checkSum:0},{name:"offset",type:"ULONG",value:offset!==undefined?offset:0},{name:"length",type:"ULONG",value:length!==undefined?length:0}])}function makeSfntTable(tables){var sfnt=new table.Table("sfnt",[{name:"version",type:"TAG",value:"OTTO"},{name:"numTables",type:"USHORT",value:0},{name:"searchRange",type:"USHORT",value:0},{name:"entrySelector",type:"USHORT",value:0},{name:"rangeShift",type:"USHORT",value:0}]);sfnt.tables=tables;sfnt.numTables=tables.length;var highestPowerOf2=Math.pow(2,log2(sfnt.numTables));sfnt.searchRange=16*highestPowerOf2;sfnt.entrySelector=log2(highestPowerOf2);sfnt.rangeShift=sfnt.numTables*16-sfnt.searchRange;var recordFields=[];var tableFields=[];var offset=sfnt.sizeOf()+makeTableRecord().sizeOf()*sfnt.numTables;while(offset%4!==0){offset+=1;tableFields.push({name:"padding",type:"BYTE",value:0})}for(var i=0;i<tables.length;i+=1){var t=tables[i];check.argument(t.tableName.length===4,"Table name"+t.tableName+" is invalid.");var tableLength=t.sizeOf();var tableRecord=makeTableRecord(t.tableName,computeCheckSum(t.encode()),offset,tableLength);recordFields.push({name:tableRecord.tag+" Table Record",type:"RECORD",value:tableRecord});tableFields.push({name:t.tableName+" table",type:"RECORD",value:t});offset+=tableLength;check.argument(!isNaN(offset),"Something went wrong calculating the offset.");while(offset%4!==0){offset+=1;tableFields.push({name:"padding",type:"BYTE",value:0})}}recordFields.sort(function(r1,r2){if(r1.value.tag>r2.value.tag){return 1}else{return-1}});sfnt.fields=sfnt.fields.concat(recordFields);sfnt.fields=sfnt.fields.concat(tableFields);return sfnt}function metricsForChar(font,chars,notFoundMetrics){for(var i=0;i<chars.length;i+=1){var glyphIndex=font.charToGlyphIndex(chars[i]);if(glyphIndex>0){var glyph=font.glyphs.get(glyphIndex);return glyph.getMetrics()}}return notFoundMetrics}function average(vs){var sum=0;for(var i=0;i<vs.length;i+=1){sum+=vs[i]}return sum/vs.length}function fontToSfntTable(font){var xMins=[];var yMins=[];var xMaxs=[];var yMaxs=[];var advanceWidths=[];var leftSideBearings=[];var rightSideBearings=[];var firstCharIndex;var lastCharIndex=0;var ulUnicodeRange1=0;var ulUnicodeRange2=0;var ulUnicodeRange3=0;var ulUnicodeRange4=0;for(var i=0;i<font.glyphs.length;i+=1){var glyph=font.glyphs.get(i);var unicode=glyph.unicode|0;if(isNaN(glyph.advanceWidth)){throw new Error("Glyph "+glyph.name+" ("+i+"): advanceWidth is not a number.")}if(firstCharIndex>unicode||firstCharIndex===undefined){if(unicode>0){firstCharIndex=unicode}}if(lastCharIndex<unicode){lastCharIndex=unicode}var position=os2.getUnicodeRange(unicode);if(position<32){ulUnicodeRange1|=1<<position}else if(position<64){ulUnicodeRange2|=1<<position-32}else if(position<96){ulUnicodeRange3|=1<<position-64}else if(position<123){ulUnicodeRange4|=1<<position-96}else{throw new Error("Unicode ranges bits > 123 are reserved for internal usage")}if(glyph.name===".notdef"){continue}var metrics=glyph.getMetrics();xMins.push(metrics.xMin);yMins.push(metrics.yMin);xMaxs.push(metrics.xMax);yMaxs.push(metrics.yMax);leftSideBearings.push(metrics.leftSideBearing);rightSideBearings.push(metrics.rightSideBearing);advanceWidths.push(glyph.advanceWidth)}var globals={xMin:Math.min.apply(null,xMins),yMin:Math.min.apply(null,yMins),xMax:Math.max.apply(null,xMaxs),yMax:Math.max.apply(null,yMaxs),advanceWidthMax:Math.max.apply(null,advanceWidths),advanceWidthAvg:average(advanceWidths),minLeftSideBearing:Math.min.apply(null,leftSideBearings),maxLeftSideBearing:Math.max.apply(null,leftSideBearings),minRightSideBearing:Math.min.apply(null,rightSideBearings)};globals.ascender=font.ascender;globals.descender=font.descender;var headTable=head.make({flags:3,unitsPerEm:font.unitsPerEm,xMin:globals.xMin,yMin:globals.yMin,xMax:globals.xMax,yMax:globals.yMax,lowestRecPPEM:3,createdTimestamp:font.createdTimestamp});var hheaTable=hhea.make({ascender:globals.ascender,descender:globals.descender,advanceWidthMax:globals.advanceWidthMax,minLeftSideBearing:globals.minLeftSideBearing,minRightSideBearing:globals.minRightSideBearing,xMaxExtent:globals.maxLeftSideBearing+(globals.xMax-globals.xMin),numberOfHMetrics:font.glyphs.length});var maxpTable=maxp.make(font.glyphs.length);var os2Table=os2.make({xAvgCharWidth:Math.round(globals.advanceWidthAvg),usWeightClass:font.tables.os2.usWeightClass,usWidthClass:font.tables.os2.usWidthClass,usFirstCharIndex:firstCharIndex,usLastCharIndex:lastCharIndex,ulUnicodeRange1:ulUnicodeRange1,ulUnicodeRange2:ulUnicodeRange2,ulUnicodeRange3:ulUnicodeRange3,ulUnicodeRange4:ulUnicodeRange4,fsSelection:font.tables.os2.fsSelection,sTypoAscender:globals.ascender,sTypoDescender:globals.descender,sTypoLineGap:0,usWinAscent:globals.yMax,usWinDescent:Math.abs(globals.yMin),ulCodePageRange1:1,sxHeight:metricsForChar(font,"xyvw",{yMax:Math.round(globals.ascender/2)}).yMax,sCapHeight:metricsForChar(font,"HIKLEFJMNTZBDPRAGOQSUVWXY",globals).yMax,usDefaultChar:font.hasChar(" ")?32:0,usBreakChar:font.hasChar(" ")?32:0});var hmtxTable=hmtx.make(font.glyphs);var cmapTable=cmap.make(font.glyphs);var englishFamilyName=font.getEnglishName("fontFamily");var englishStyleName=font.getEnglishName("fontSubfamily");var englishFullName=englishFamilyName+" "+englishStyleName;var postScriptName=font.getEnglishName("postScriptName");if(!postScriptName){postScriptName=englishFamilyName.replace(/\s/g,"")+"-"+englishStyleName}var names={};for(var n in font.names){names[n]=font.names[n]}if(!names.uniqueID){names.uniqueID={en:font.getEnglishName("manufacturer")+":"+englishFullName}}if(!names.postScriptName){names.postScriptName={en:postScriptName}}if(!names.preferredFamily){names.preferredFamily=font.names.fontFamily}if(!names.preferredSubfamily){names.preferredSubfamily=font.names.fontSubfamily}var languageTags=[];var nameTable=_name.make(names,languageTags);var ltagTable=languageTags.length>0?ltag.make(languageTags):undefined;var postTable=post.make();var cffTable=cff.make(font.glyphs,{version:font.getEnglishName("version"),fullName:englishFullName,familyName:englishFamilyName,weightName:englishStyleName,postScriptName:postScriptName,unitsPerEm:font.unitsPerEm,fontBBox:[0,globals.yMin,globals.ascender,globals.advanceWidthMax]});var metaTable=font.metas&&Object.keys(font.metas).length>0?meta.make(font.metas):undefined;var tables=[headTable,hheaTable,maxpTable,os2Table,nameTable,cmapTable,postTable,cffTable,hmtxTable];if(ltagTable){tables.push(ltagTable)}if(font.tables.gsub){tables.push(gsub.make(font.tables.gsub))}if(metaTable){tables.push(metaTable)}var sfntTable=makeSfntTable(tables);var bytes=sfntTable.encode();var checkSum=computeCheckSum(bytes);var tableFields=sfntTable.fields;var checkSumAdjusted=false;for(var i$1=0;i$1<tableFields.length;i$1+=1){if(tableFields[i$1].name==="head table"){tableFields[i$1].value.checkSumAdjustment=2981146554-checkSum;checkSumAdjusted=true;break}}if(!checkSumAdjusted){throw new Error("Could not find head table with checkSum to adjust.")}return sfntTable}var sfnt={make:makeSfntTable,fontToTable:fontToSfntTable,computeCheckSum:computeCheckSum};function searchTag(arr,tag){var imin=0;var imax=arr.length-1;while(imin<=imax){var imid=imin+imax>>>1;var val=arr[imid].tag;if(val===tag){return imid}else if(val<tag){imin=imid+1}else{imax=imid-1}}return-imin-1}function binSearch(arr,value){var imin=0;var imax=arr.length-1;while(imin<=imax){var imid=imin+imax>>>1;var val=arr[imid];if(val===value){return imid}else if(val<value){imin=imid+1}else{imax=imid-1}}return-imin-1}function searchRange(ranges,value){var range;var imin=0;var imax=ranges.length-1;while(imin<=imax){var imid=imin+imax>>>1;range=ranges[imid];var start=range.start;if(start===value){return range}else if(start<value){imin=imid+1}else{imax=imid-1}}if(imin>0){range=ranges[imin-1];if(value>range.end){return 0}return range}}function Layout(font,tableName){this.font=font;this.tableName=tableName}Layout.prototype={searchTag:searchTag,binSearch:binSearch,getTable:function(create){var layout=this.font.tables[this.tableName];if(!layout&&create){layout=this.font.tables[this.tableName]=this.createDefaultTable()}return layout},getScriptNames:function(){var layout=this.getTable();if(!layout){return[]}return layout.scripts.map(function(script){return script.tag})},getDefaultScriptName:function(){var layout=this.getTable();if(!layout){return}var hasLatn=false;for(var i=0;i<layout.scripts.length;i++){var name=layout.scripts[i].tag;if(name==="DFLT"){return name}if(name==="latn"){hasLatn=true}}if(hasLatn){return"latn"}},getScriptTable:function(script,create){var layout=this.getTable(create);if(layout){script=script||"DFLT";var scripts=layout.scripts;var pos=searchTag(layout.scripts,script);if(pos>=0){return scripts[pos].script}else if(create){var scr={tag:script,script:{defaultLangSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]},langSysRecords:[]}};scripts.splice(-1-pos,0,scr);return scr.script}}},getLangSysTable:function(script,language,create){var scriptTable=this.getScriptTable(script,create);if(scriptTable){if(!language||language==="dflt"||language==="DFLT"){return scriptTable.defaultLangSys}var pos=searchTag(scriptTable.langSysRecords,language);if(pos>=0){return scriptTable.langSysRecords[pos].langSys}else if(create){var langSysRecord={tag:language,langSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]}};scriptTable.langSysRecords.splice(-1-pos,0,langSysRecord);return langSysRecord.langSys}}},getFeatureTable:function(script,language,feature,create){var langSysTable=this.getLangSysTable(script,language,create);if(langSysTable){var featureRecord;var featIndexes=langSysTable.featureIndexes;var allFeatures=this.font.tables[this.tableName].features;for(var i=0;i<featIndexes.length;i++){featureRecord=allFeatures[featIndexes[i]];if(featureRecord.tag===feature){return featureRecord.feature}}if(create){var index=allFeatures.length;check.assert(index===0||feature>=allFeatures[index-1].tag,"Features must be added in alphabetical order.");featureRecord={tag:feature,feature:{params:0,lookupListIndexes:[]}};allFeatures.push(featureRecord);featIndexes.push(index);return featureRecord.feature}}},getLookupTables:function(script,language,feature,lookupType,create){var featureTable=this.getFeatureTable(script,language,feature,create);var tables=[];if(featureTable){var lookupTable;var lookupListIndexes=featureTable.lookupListIndexes;var allLookups=this.font.tables[this.tableName].lookups;for(var i=0;i<lookupListIndexes.length;i++){lookupTable=allLookups[lookupListIndexes[i]];if(lookupTable.lookupType===lookupType){tables.push(lookupTable)}}if(tables.length===0&&create){lookupTable={lookupType:lookupType,lookupFlag:0,subtables:[],markFilteringSet:undefined};var index=allLookups.length;allLookups.push(lookupTable);lookupListIndexes.push(index);return[lookupTable]}}return tables},getGlyphClass:function(classDefTable,glyphIndex){switch(classDefTable.format){case 1:if(classDefTable.startGlyph<=glyphIndex&&glyphIndex<classDefTable.startGlyph+classDefTable.classes.length){return classDefTable.classes[glyphIndex-classDefTable.startGlyph]}return 0;case 2:var range=searchRange(classDefTable.ranges,glyphIndex);return range?range.classId:0}},getCoverageIndex:function(coverageTable,glyphIndex){switch(coverageTable.format){case 1:var index=binSearch(coverageTable.glyphs,glyphIndex);return index>=0?index:-1;case 2:var range=searchRange(coverageTable.ranges,glyphIndex);return range?range.index+glyphIndex-range.start:-1}},expandCoverage:function(coverageTable){if(coverageTable.format===1){return coverageTable.glyphs}else{var glyphs=[];var ranges=coverageTable.ranges;for(var i=0;i<ranges.length;i++){var range=ranges[i];var start=range.start;var end=range.end;for(var j=start;j<=end;j++){glyphs.push(j)}}return glyphs}}};function Position(font){Layout.call(this,font,"gpos")}Position.prototype=Layout.prototype;Position.prototype.init=function(){var script=this.getDefaultScriptName();this.defaultKerningTables=this.getKerningTables(script)};Position.prototype.getKerningValue=function(kerningLookups,leftIndex,rightIndex){var this$1=this;for(var i=0;i<kerningLookups.length;i++){var subtables=kerningLookups[i].subtables;for(var j=0;j<subtables.length;j++){var subtable=subtables[j];var covIndex=this$1.getCoverageIndex(subtable.coverage,leftIndex);if(covIndex<0){continue}switch(subtable.posFormat){case 1:var pairSet=subtable.pairSets[covIndex];for(var k=0;k<pairSet.length;k++){var pair=pairSet[k];if(pair.secondGlyph===rightIndex){return pair.value1&&pair.value1.xAdvance||0}}break;case 2:var class1=this$1.getGlyphClass(subtable.classDef1,leftIndex);var class2=this$1.getGlyphClass(subtable.classDef2,rightIndex);var pair$1=subtable.classRecords[class1][class2];return pair$1.value1&&pair$1.value1.xAdvance||0}}}return 0};Position.prototype.getKerningTables=function(script,language){if(this.font.tables.gpos){return this.getLookupTables(script,language,"kern",2)}};function Substitution(font){Layout.call(this,font,"gsub")}function arraysEqual(ar1,ar2){var n=ar1.length;if(n!==ar2.length){return false}for(var i=0;i<n;i++){if(ar1[i]!==ar2[i]){return false}}return true}function getSubstFormat(lookupTable,format,defaultSubtable){var subtables=lookupTable.subtables;for(var i=0;i<subtables.length;i++){var subtable=subtables[i];if(subtable.substFormat===format){return subtable}}if(defaultSubtable){subtables.push(defaultSubtable);return defaultSubtable}return undefined}Substitution.prototype=Layout.prototype;Substitution.prototype.createDefaultTable=function(){return{version:1,scripts:[{tag:"DFLT",script:{defaultLangSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]},langSysRecords:[]}}],features:[],lookups:[]}};Substitution.prototype.getSingle=function(feature,script,language){var this$1=this;var substitutions=[];var lookupTables=this.getLookupTables(script,language,feature,1);for(var idx=0;idx<lookupTables.length;idx++){var subtables=lookupTables[idx].subtables;for(var i=0;i<subtables.length;i++){var subtable=subtables[i];var glyphs=this$1.expandCoverage(subtable.coverage);var j=void 0;if(subtable.substFormat===1){var delta=subtable.deltaGlyphId;for(j=0;j<glyphs.length;j++){var glyph=glyphs[j];substitutions.push({sub:glyph,by:glyph+delta})}}else{var substitute=subtable.substitute;for(j=0;j<glyphs.length;j++){substitutions.push({sub:glyphs[j],by:substitute[j]})}}}}return substitutions};Substitution.prototype.getAlternates=function(feature,script,language){var this$1=this;var alternates=[];var lookupTables=this.getLookupTables(script,language,feature,3);for(var idx=0;idx<lookupTables.length;idx++){var subtables=lookupTables[idx].subtables;for(var i=0;i<subtables.length;i++){var subtable=subtables[i];var glyphs=this$1.expandCoverage(subtable.coverage);var alternateSets=subtable.alternateSets;for(var j=0;j<glyphs.length;j++){alternates.push({sub:glyphs[j],by:alternateSets[j]})}}}return alternates};Substitution.prototype.getLigatures=function(feature,script,language){var this$1=this;var ligatures=[];var lookupTables=this.getLookupTables(script,language,feature,4);for(var idx=0;idx<lookupTables.length;idx++){var subtables=lookupTables[idx].subtables;for(var i=0;i<subtables.length;i++){var subtable=subtables[i];var glyphs=this$1.expandCoverage(subtable.coverage);var ligatureSets=subtable.ligatureSets;for(var j=0;j<glyphs.length;j++){var startGlyph=glyphs[j];var ligSet=ligatureSets[j];for(var k=0;k<ligSet.length;k++){var lig=ligSet[k];ligatures.push({sub:[startGlyph].concat(lig.components),by:lig.ligGlyph})}}}}return ligatures};Substitution.prototype.addSingle=function(feature,substitution,script,language){var lookupTable=this.getLookupTables(script,language,feature,1,true)[0];var subtable=getSubstFormat(lookupTable,2,{substFormat:2,coverage:{format:1,glyphs:[]},substitute:[]});check.assert(subtable.coverage.format===1,"Ligature: unable to modify coverage table format "+subtable.coverage.format);var coverageGlyph=substitution.sub;var pos=this.binSearch(subtable.coverage.glyphs,coverageGlyph);if(pos<0){pos=-1-pos;subtable.coverage.glyphs.splice(pos,0,coverageGlyph);subtable.substitute.splice(pos,0,0)}subtable.substitute[pos]=substitution.by};Substitution.prototype.addAlternate=function(feature,substitution,script,language){var lookupTable=this.getLookupTables(script,language,feature,3,true)[0];var subtable=getSubstFormat(lookupTable,1,{substFormat:1,coverage:{format:1,glyphs:[]},alternateSets:[]});check.assert(subtable.coverage.format===1,"Ligature: unable to modify coverage table format "+subtable.coverage.format);var coverageGlyph=substitution.sub;var pos=this.binSearch(subtable.coverage.glyphs,coverageGlyph);if(pos<0){pos=-1-pos;subtable.coverage.glyphs.splice(pos,0,coverageGlyph);subtable.alternateSets.splice(pos,0,0)}subtable.alternateSets[pos]=substitution.by};Substitution.prototype.addLigature=function(feature,ligature,script,language){var lookupTable=this.getLookupTables(script,language,feature,4,true)[0];var subtable=lookupTable.subtables[0];if(!subtable){subtable={substFormat:1,coverage:{format:1,glyphs:[]},ligatureSets:[]};lookupTable.subtables[0]=subtable}check.assert(subtable.coverage.format===1,"Ligature: unable to modify coverage table format "+subtable.coverage.format);var coverageGlyph=ligature.sub[0];var ligComponents=ligature.sub.slice(1);var ligatureTable={ligGlyph:ligature.by,components:ligComponents};var pos=this.binSearch(subtable.coverage.glyphs,coverageGlyph);if(pos>=0){var ligatureSet=subtable.ligatureSets[pos];for(var i=0;i<ligatureSet.length;i++){if(arraysEqual(ligatureSet[i].components,ligComponents)){return}}ligatureSet.push(ligatureTable)}else{pos=-1-pos;subtable.coverage.glyphs.splice(pos,0,coverageGlyph);subtable.ligatureSets.splice(pos,0,[ligatureTable])}};Substitution.prototype.getFeature=function(feature,script,language){if(/ss\d\d/.test(feature)){return this.getSingle(feature,script,language)}switch(feature){case"aalt":case"salt":return this.getSingle(feature,script,language).concat(this.getAlternates(feature,script,language));case"dlig":case"liga":case"rlig":return this.getLigatures(feature,script,language)}return undefined};Substitution.prototype.add=function(feature,sub,script,language){if(/ss\d\d/.test(feature)){return this.addSingle(feature,sub,script,language)}switch(feature){case"aalt":case"salt":if(typeof sub.by==="number"){return this.addSingle(feature,sub,script,language)}return this.addAlternate(feature,sub,script,language);case"dlig":case"liga":case"rlig":return this.addLigature(feature,sub,script,language)}return undefined};function isBrowser(){return typeof window!=="undefined"}function nodeBufferToArrayBuffer(buffer){var ab=new ArrayBuffer(buffer.length);var view=new Uint8Array(ab);for(var i=0;i<buffer.length;++i){view[i]=buffer[i]}return ab}function arrayBufferToNodeBuffer(ab){var buffer=new Buffer(ab.byteLength);var view=new Uint8Array(ab);for(var i=0;i<buffer.length;++i){buffer[i]=view[i]}return buffer}function checkArgument(expression,message){if(!expression){throw message}}function parseGlyphCoordinate(p,flag,previousValue,shortVectorBitMask,sameBitMask){var v;if((flag&shortVectorBitMask)>0){v=p.parseByte();if((flag&sameBitMask)===0){v=-v}v=previousValue+v}else{if((flag&sameBitMask)>0){v=previousValue}else{v=previousValue+p.parseShort()}}return v}function parseGlyph(glyph,data,start){var p=new parse.Parser(data,start);glyph.numberOfContours=p.parseShort();glyph._xMin=p.parseShort();glyph._yMin=p.parseShort();glyph._xMax=p.parseShort();glyph._yMax=p.parseShort();var flags;var flag;if(glyph.numberOfContours>0){var endPointIndices=glyph.endPointIndices=[];for(var i=0;i<glyph.numberOfContours;i+=1){endPointIndices.push(p.parseUShort())}glyph.instructionLength=p.parseUShort();glyph.instructions=[];for(var i$1=0;i$1<glyph.instructionLength;i$1+=1){glyph.instructions.push(p.parseByte())}var numberOfCoordinates=endPointIndices[endPointIndices.length-1]+1;flags=[];for(var i$2=0;i$2<numberOfCoordinates;i$2+=1){flag=p.parseByte();flags.push(flag);if((flag&8)>0){var repeatCount=p.parseByte();for(var j=0;j<repeatCount;j+=1){flags.push(flag);i$2+=1}}}check.argument(flags.length===numberOfCoordinates,"Bad flags.");if(endPointIndices.length>0){var points=[];var point;if(numberOfCoordinates>0){for(var i$3=0;i$3<numberOfCoordinates;i$3+=1){flag=flags[i$3];point={};point.onCurve=!!(flag&1);point.lastPointOfContour=endPointIndices.indexOf(i$3)>=0;points.push(point)}var px=0;for(var i$4=0;i$4<numberOfCoordinates;i$4+=1){flag=flags[i$4];point=points[i$4];point.x=parseGlyphCoordinate(p,flag,px,2,16);px=point.x}var py=0;for(var i$5=0;i$5<numberOfCoordinates;i$5+=1){flag=flags[i$5];point=points[i$5];point.y=parseGlyphCoordinate(p,flag,py,4,32);py=point.y}}glyph.points=points}else{glyph.points=[]}}else if(glyph.numberOfContours===0){glyph.points=[]}else{glyph.isComposite=true;glyph.points=[];glyph.components=[];var moreComponents=true;while(moreComponents){flags=p.parseUShort();var component={glyphIndex:p.parseUShort(),xScale:1,scale01:0,scale10:0,yScale:1,dx:0,dy:0};if((flags&1)>0){if((flags&2)>0){component.dx=p.parseShort();component.dy=p.parseShort()}else{component.matchedPoints=[p.parseUShort(),p.parseUShort()]}}else{if((flags&2)>0){component.dx=p.parseChar();component.dy=p.parseChar()}else{component.matchedPoints=[p.parseByte(),p.parseByte()]}}if((flags&8)>0){component.xScale=component.yScale=p.parseF2Dot14()}else if((flags&64)>0){component.xScale=p.parseF2Dot14();component.yScale=p.parseF2Dot14()}else if((flags&128)>0){component.xScale=p.parseF2Dot14();component.scale01=p.parseF2Dot14();component.scale10=p.parseF2Dot14();component.yScale=p.parseF2Dot14()}glyph.components.push(component);moreComponents=!!(flags&32)}if(flags&256){glyph.instructionLength=p.parseUShort();glyph.instructions=[];for(var i$6=0;i$6<glyph.instructionLength;i$6+=1){glyph.instructions.push(p.parseByte())}}}}function transformPoints(points,transform){var newPoints=[];for(var i=0;i<points.length;i+=1){var pt=points[i];var newPt={x:transform.xScale*pt.x+transform.scale01*pt.y+transform.dx,y:transform.scale10*pt.x+transform.yScale*pt.y+transform.dy,onCurve:pt.onCurve,lastPointOfContour:pt.lastPointOfContour};newPoints.push(newPt)}return newPoints}function getContours(points){var contours=[];var currentContour=[];for(var i=0;i<points.length;i+=1){var pt=points[i];currentContour.push(pt);if(pt.lastPointOfContour){contours.push(currentContour);currentContour=[]}}check.argument(currentContour.length===0,"There are still points left in the current contour.");return contours}function getPath(points){var p=new Path;if(!points){return p}var contours=getContours(points);for(var contourIndex=0;contourIndex<contours.length;++contourIndex){var contour=contours[contourIndex];var prev=null;var curr=contour[contour.length-1];var next=contour[0];if(curr.onCurve){p.moveTo(curr.x,curr.y)}else{if(next.onCurve){p.moveTo(next.x,next.y)}else{var start={x:(curr.x+next.x)*.5,y:(curr.y+next.y)*.5};p.moveTo(start.x,start.y)}}for(var i=0;i<contour.length;++i){prev=curr;curr=next;next=contour[(i+1)%contour.length];if(curr.onCurve){p.lineTo(curr.x,curr.y)}else{var prev2=prev;var next2=next;if(!prev.onCurve){prev2={x:(curr.x+prev.x)*.5,y:(curr.y+prev.y)*.5}}if(!next.onCurve){next2={x:(curr.x+next.x)*.5,y:(curr.y+next.y)*.5}}p.quadraticCurveTo(curr.x,curr.y,next2.x,next2.y)}}p.closePath()}return p}function buildPath(glyphs,glyph){if(glyph.isComposite){for(var j=0;j<glyph.components.length;j+=1){var component=glyph.components[j];var componentGlyph=glyphs.get(component.glyphIndex);componentGlyph.getPath();if(componentGlyph.points){var transformedPoints=void 0;if(component.matchedPoints===undefined){transformedPoints=transformPoints(componentGlyph.points,component)}else{if(component.matchedPoints[0]>glyph.points.length-1||component.matchedPoints[1]>componentGlyph.points.length-1){throw Error("Matched points out of range in "+glyph.name)}var firstPt=glyph.points[component.matchedPoints[0]];var secondPt=componentGlyph.points[component.matchedPoints[1]];var transform={xScale:component.xScale,scale01:component.scale01,scale10:component.scale10,yScale:component.yScale,dx:0,dy:0};secondPt=transformPoints([secondPt],transform)[0];transform.dx=firstPt.x-secondPt.x;transform.dy=firstPt.y-secondPt.y;transformedPoints=transformPoints(componentGlyph.points,transform)}glyph.points=glyph.points.concat(transformedPoints)}}}return getPath(glyph.points)}function parseGlyfTable(data,start,loca,font){var glyphs=new glyphset.GlyphSet(font);for(var i=0;i<loca.length-1;i+=1){var offset=loca[i];var nextOffset=loca[i+1];if(offset!==nextOffset){glyphs.push(i,glyphset.ttfGlyphLoader(font,i,parseGlyph,data,start+offset,buildPath))}else{glyphs.push(i,glyphset.glyphLoader(font,i))}}return glyphs}var glyf={getPath:getPath,parse:parseGlyfTable};var instructionTable;var exec;var execGlyph;var execComponent;function Hinting(font){this.font=font;this.getCommands=function(hPoints){return glyf.getPath(hPoints).commands};this._fpgmState=this._prepState=undefined;this._errorState=0}function roundOff(v){return v}function roundToGrid(v){return Math.sign(v)*Math.round(Math.abs(v))}function roundToDoubleGrid(v){return Math.sign(v)*Math.round(Math.abs(v*2))/2}function roundToHalfGrid(v){return Math.sign(v)*(Math.round(Math.abs(v)+.5)-.5)}function roundUpToGrid(v){return Math.sign(v)*Math.ceil(Math.abs(v))}function roundDownToGrid(v){return Math.sign(v)*Math.floor(Math.abs(v))}var roundSuper=function(v){var period=this.srPeriod;var phase=this.srPhase;var threshold=this.srThreshold;var sign=1;if(v<0){v=-v;sign=-1}v+=threshold-phase;v=Math.trunc(v/period)*period;v+=phase;if(v<0){return phase*sign}return v*sign};var xUnitVector={x:1,y:0,axis:"x",distance:function(p1,p2,o1,o2){return(o1?p1.xo:p1.x)-(o2?p2.xo:p2.x)},interpolate:function(p,rp1,rp2,pv){var do1;var do2;var doa1;var doa2;var dm1;var dm2;var dt;if(!pv||pv===this){do1=p.xo-rp1.xo;do2=p.xo-rp2.xo;dm1=rp1.x-rp1.xo;dm2=rp2.x-rp2.xo;doa1=Math.abs(do1);doa2=Math.abs(do2);dt=doa1+doa2;if(dt===0){p.x=p.xo+(dm1+dm2)/2;return}p.x=p.xo+(dm1*doa2+dm2*doa1)/dt;return}do1=pv.distance(p,rp1,true,true);do2=pv.distance(p,rp2,true,true);dm1=pv.distance(rp1,rp1,false,true);dm2=pv.distance(rp2,rp2,false,true);doa1=Math.abs(do1);doa2=Math.abs(do2);dt=doa1+doa2;if(dt===0){xUnitVector.setRelative(p,p,(dm1+dm2)/2,pv,true);return}xUnitVector.setRelative(p,p,(dm1*doa2+dm2*doa1)/dt,pv,true)},normalSlope:Number.NEGATIVE_INFINITY,setRelative:function(p,rp,d,pv,org){if(!pv||pv===this){p.x=(org?rp.xo:rp.x)+d;return}var rpx=org?rp.xo:rp.x;var rpy=org?rp.yo:rp.y;var rpdx=rpx+d*pv.x;var rpdy=rpy+d*pv.y;p.x=rpdx+(p.y-rpdy)/pv.normalSlope},slope:0,touch:function(p){p.xTouched=true},touched:function(p){return p.xTouched},untouch:function(p){p.xTouched=false}};var yUnitVector={x:0,y:1,axis:"y",distance:function(p1,p2,o1,o2){return(o1?p1.yo:p1.y)-(o2?p2.yo:p2.y)},interpolate:function(p,rp1,rp2,pv){var do1;var do2;var doa1;var doa2;var dm1;var dm2;var dt;if(!pv||pv===this){do1=p.yo-rp1.yo;do2=p.yo-rp2.yo;dm1=rp1.y-rp1.yo;dm2=rp2.y-rp2.yo;doa1=Math.abs(do1);doa2=Math.abs(do2);dt=doa1+doa2;if(dt===0){p.y=p.yo+(dm1+dm2)/2;return}p.y=p.yo+(dm1*doa2+dm2*doa1)/dt;return}do1=pv.distance(p,rp1,true,true);do2=pv.distance(p,rp2,true,true);dm1=pv.distance(rp1,rp1,false,true);dm2=pv.distance(rp2,rp2,false,true);doa1=Math.abs(do1);doa2=Math.abs(do2);dt=doa1+doa2;if(dt===0){yUnitVector.setRelative(p,p,(dm1+dm2)/2,pv,true);return}yUnitVector.setRelative(p,p,(dm1*doa2+dm2*doa1)/dt,pv,true)},normalSlope:0,setRelative:function(p,rp,d,pv,org){if(!pv||pv===this){p.y=(org?rp.yo:rp.y)+d;return}var rpx=org?rp.xo:rp.x;var rpy=org?rp.yo:rp.y;var rpdx=rpx+d*pv.x;var rpdy=rpy+d*pv.y;p.y=rpdy+pv.normalSlope*(p.x-rpdx)},slope:Number.POSITIVE_INFINITY,touch:function(p){p.yTouched=true},touched:function(p){return p.yTouched},untouch:function(p){p.yTouched=false}};Object.freeze(xUnitVector);Object.freeze(yUnitVector);function UnitVector(x,y){this.x=x;this.y=y;this.axis=undefined;this.slope=y/x;this.normalSlope=-x/y;Object.freeze(this)}UnitVector.prototype.distance=function(p1,p2,o1,o2){return this.x*xUnitVector.distance(p1,p2,o1,o2)+this.y*yUnitVector.distance(p1,p2,o1,o2)};UnitVector.prototype.interpolate=function(p,rp1,rp2,pv){var dm1;var dm2;var do1;var do2;var doa1;var doa2;var dt;do1=pv.distance(p,rp1,true,true);do2=pv.distance(p,rp2,true,true);dm1=pv.distance(rp1,rp1,false,true);dm2=pv.distance(rp2,rp2,false,true);doa1=Math.abs(do1);doa2=Math.abs(do2);dt=doa1+doa2;if(dt===0){this.setRelative(p,p,(dm1+dm2)/2,pv,true);return}this.setRelative(p,p,(dm1*doa2+dm2*doa1)/dt,pv,true)};UnitVector.prototype.setRelative=function(p,rp,d,pv,org){pv=pv||this;var rpx=org?rp.xo:rp.x;var rpy=org?rp.yo:rp.y;var rpdx=rpx+d*pv.x;var rpdy=rpy+d*pv.y;var pvns=pv.normalSlope;var fvs=this.slope;var px=p.x;var py=p.y;p.x=(fvs*px-pvns*rpdx+rpdy-py)/(fvs-pvns);p.y=fvs*(p.x-px)+py};UnitVector.prototype.touch=function(p){p.xTouched=true;p.yTouched=true};function getUnitVector(x,y){var d=Math.sqrt(x*x+y*y);x/=d;y/=d;if(x===1&&y===0){return xUnitVector}else if(x===0&&y===1){return yUnitVector}else{return new UnitVector(x,y)}}function HPoint(x,y,lastPointOfContour,onCurve){this.x=this.xo=Math.round(x*64)/64;this.y=this.yo=Math.round(y*64)/64;this.lastPointOfContour=lastPointOfContour;this.onCurve=onCurve;this.prevPointOnContour=undefined;this.nextPointOnContour=undefined;this.xTouched=false;this.yTouched=false;Object.preventExtensions(this)}HPoint.prototype.nextTouched=function(v){var p=this.nextPointOnContour;while(!v.touched(p)&&p!==this){p=p.nextPointOnContour}return p};HPoint.prototype.prevTouched=function(v){var p=this.prevPointOnContour;while(!v.touched(p)&&p!==this){p=p.prevPointOnContour}return p};var HPZero=Object.freeze(new HPoint(0,0));var defaultState={cvCutIn:17/16,deltaBase:9,deltaShift:.125,loop:1,minDis:1,autoFlip:true};function State(env,prog){this.env=env;this.stack=[];this.prog=prog;switch(env){case"glyf":this.zp0=this.zp1=this.zp2=1;this.rp0=this.rp1=this.rp2=0;case"prep":this.fv=this.pv=this.dpv=xUnitVector;this.round=roundToGrid}}Hinting.prototype.exec=function(glyph,ppem){if(typeof ppem!=="number"){throw new Error("Point size is not a number!")}if(this._errorState>2){return}var font=this.font;var prepState=this._prepState;if(!prepState||prepState.ppem!==ppem){var fpgmState=this._fpgmState;if(!fpgmState){State.prototype=defaultState;fpgmState=this._fpgmState=new State("fpgm",font.tables.fpgm);fpgmState.funcs=[];fpgmState.font=font;if(exports.DEBUG){console.log("---EXEC FPGM---");fpgmState.step=-1}try{exec(fpgmState)}catch(e){console.log("Hinting error in FPGM:"+e);this._errorState=3;return}}State.prototype=fpgmState;prepState=this._prepState=new State("prep",font.tables.prep);prepState.ppem=ppem;var oCvt=font.tables.cvt;if(oCvt){var cvt=prepState.cvt=new Array(oCvt.length);var scale=ppem/font.unitsPerEm;for(var c=0;c<oCvt.length;c++){cvt[c]=oCvt[c]*scale}}else{prepState.cvt=[]}if(exports.DEBUG){console.log("---EXEC PREP---");prepState.step=-1}try{exec(prepState)}catch(e){if(this._errorState<2){console.log("Hinting error in PREP:"+e)}this._errorState=2}}if(this._errorState>1){return}try{return execGlyph(glyph,prepState)}catch(e){if(this._errorState<1){console.log("Hinting error:"+e);console.log("Note: further hinting errors are silenced")}this._errorState=1;return undefined}};execGlyph=function(glyph,prepState){var xScale=prepState.ppem/prepState.font.unitsPerEm;var yScale=xScale;var components=glyph.components;var contours;var gZone;var state;State.prototype=prepState;if(!components){state=new State("glyf",glyph.instructions);if(exports.DEBUG){console.log("---EXEC GLYPH---");state.step=-1}execComponent(glyph,state,xScale,yScale);gZone=state.gZone}else{var font=prepState.font;gZone=[];contours=[];for(var i=0;i<components.length;i++){var c=components[i];var cg=font.glyphs.get(c.glyphIndex);state=new State("glyf",cg.instructions);if(exports.DEBUG){console.log("---EXEC COMP "+i+"---");state.step=-1}execComponent(cg,state,xScale,yScale);var dx=Math.round(c.dx*xScale);var dy=Math.round(c.dy*yScale);var gz=state.gZone;var cc=state.contours;for(var pi=0;pi<gz.length;pi++){var p=gz[pi];p.xTouched=p.yTouched=false;p.xo=p.x=p.x+dx;p.yo=p.y=p.y+dy}var gLen=gZone.length;gZone.push.apply(gZone,gz);for(var j=0;j<cc.length;j++){contours.push(cc[j]+gLen)}}if(glyph.instructions&&!state.inhibitGridFit){state=new State("glyf",glyph.instructions);state.gZone=state.z0=state.z1=state.z2=gZone;state.contours=contours;gZone.push(new HPoint(0,0),new HPoint(Math.round(glyph.advanceWidth*xScale),0));if(exports.DEBUG){console.log("---EXEC COMPOSITE---");state.step=-1}exec(state);gZone.length-=2}}return gZone};execComponent=function(glyph,state,xScale,yScale){var points=glyph.points||[];var pLen=points.length;var gZone=state.gZone=state.z0=state.z1=state.z2=[];var contours=state.contours=[];var cp;for(var i=0;i<pLen;i++){cp=points[i];gZone[i]=new HPoint(cp.x*xScale,cp.y*yScale,cp.lastPointOfContour,cp.onCurve)}var sp;var np;for(var i$1=0;i$1<pLen;i$1++){cp=gZone[i$1];if(!sp){sp=cp;contours.push(i$1)}if(cp.lastPointOfContour){cp.nextPointOnContour=sp;sp.prevPointOnContour=cp;sp=undefined}else{np=gZone[i$1+1];cp.nextPointOnContour=np;np.prevPointOnContour=cp}}if(state.inhibitGridFit){return}if(exports.DEBUG){console.log("PROCESSING GLYPH",state.stack);for(var i$2=0;i$2<pLen;i$2++){console.log(i$2,gZone[i$2].x,gZone[i$2].y)}}gZone.push(new HPoint(0,0),new HPoint(Math.round(glyph.advanceWidth*xScale),0));exec(state);gZone.length-=2;if(exports.DEBUG){console.log("FINISHED GLYPH",state.stack);for(var i$3=0;i$3<pLen;i$3++){console.log(i$3,gZone[i$3].x,gZone[i$3].y)}}};exec=function(state){var prog=state.prog;if(!prog){return}var pLen=prog.length;var ins;for(state.ip=0;state.ip<pLen;state.ip++){if(exports.DEBUG){state.step++}ins=instructionTable[prog[state.ip]];if(!ins){throw new Error("unknown instruction: 0x"+Number(prog[state.ip]).toString(16))}ins(state)}};function initTZone(state){var tZone=state.tZone=new Array(state.gZone.length);for(var i=0;i<tZone.length;i++){tZone[i]=new HPoint(0,0)}}function skip(state,handleElse){var prog=state.prog;var ip=state.ip;var nesting=1;var ins;do{ins=prog[++ip];if(ins===88){nesting++}else if(ins===89){nesting--}else if(ins===64){ip+=prog[ip+1]+1}else if(ins===65){ip+=2*prog[ip+1]+1}else if(ins>=176&&ins<=183){ip+=ins-176+1}else if(ins>=184&&ins<=191){ip+=(ins-184+1)*2}else if(handleElse&&nesting===1&&ins===27){break}}while(nesting>0);state.ip=ip}function SVTCA(v,state){if(exports.DEBUG){console.log(state.step,"SVTCA["+v.axis+"]")}state.fv=state.pv=state.dpv=v}function SPVTCA(v,state){if(exports.DEBUG){console.log(state.step,"SPVTCA["+v.axis+"]")}state.pv=state.dpv=v}function SFVTCA(v,state){if(exports.DEBUG){console.log(state.step,"SFVTCA["+v.axis+"]")}state.fv=v}function SPVTL(a,state){var stack=state.stack;var p2i=stack.pop();var p1i=stack.pop();var p2=state.z2[p2i];var p1=state.z1[p1i];if(exports.DEBUG){console.log("SPVTL["+a+"]",p2i,p1i)}var dx;var dy;if(!a){dx=p1.x-p2.x;dy=p1.y-p2.y}else{dx=p2.y-p1.y;dy=p1.x-p2.x}state.pv=state.dpv=getUnitVector(dx,dy)}function SFVTL(a,state){var stack=state.stack;var p2i=stack.pop();var p1i=stack.pop();var p2=state.z2[p2i];var p1=state.z1[p1i];if(exports.DEBUG){console.log("SFVTL["+a+"]",p2i,p1i)}var dx;var dy;if(!a){dx=p1.x-p2.x;dy=p1.y-p2.y}else{dx=p2.y-p1.y;dy=p1.x-p2.x}state.fv=getUnitVector(dx,dy)}function SPVFS(state){var stack=state.stack;var y=stack.pop();var x=stack.pop();if(exports.DEBUG){console.log(state.step,"SPVFS[]",y,x)}state.pv=state.dpv=getUnitVector(x,y)}function SFVFS(state){var stack=state.stack;var y=stack.pop();var x=stack.pop();if(exports.DEBUG){console.log(state.step,"SPVFS[]",y,x)}state.fv=getUnitVector(x,y)}function GPV(state){var stack=state.stack;var pv=state.pv;if(exports.DEBUG){console.log(state.step,"GPV[]")}stack.push(pv.x*16384);stack.push(pv.y*16384)}function GFV(state){var stack=state.stack;var fv=state.fv;if(exports.DEBUG){console.log(state.step,"GFV[]")}stack.push(fv.x*16384);stack.push(fv.y*16384)}function SFVTPV(state){state.fv=state.pv;if(exports.DEBUG){console.log(state.step,"SFVTPV[]")}}function ISECT(state){var stack=state.stack;var pa0i=stack.pop();var pa1i=stack.pop();var pb0i=stack.pop();var pb1i=stack.pop();var pi=stack.pop();var z0=state.z0;var z1=state.z1;var pa0=z0[pa0i];var pa1=z0[pa1i];var pb0=z1[pb0i];var pb1=z1[pb1i];var p=state.z2[pi];if(exports.DEBUG){console.log("ISECT[], ",pa0i,pa1i,pb0i,pb1i,pi)}var x1=pa0.x;var y1=pa0.y;var x2=pa1.x;var y2=pa1.y;var x3=pb0.x;var y3=pb0.y;var x4=pb1.x;var y4=pb1.y;var div=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);var f1=x1*y2-y1*x2;var f2=x3*y4-y3*x4;p.x=(f1*(x3-x4)-f2*(x1-x2))/div;p.y=(f1*(y3-y4)-f2*(y1-y2))/div}function SRP0(state){state.rp0=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SRP0[]",state.rp0)}}function SRP1(state){state.rp1=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SRP1[]",state.rp1)}}function SRP2(state){state.rp2=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SRP2[]",state.rp2)}}function SZP0(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SZP0[]",n)}state.zp0=n;switch(n){case 0:if(!state.tZone){initTZone(state)}state.z0=state.tZone;break;case 1:state.z0=state.gZone;break;default:throw new Error("Invalid zone pointer")}}function SZP1(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SZP1[]",n)}state.zp1=n;switch(n){case 0:if(!state.tZone){initTZone(state)}state.z1=state.tZone;break;case 1:state.z1=state.gZone;break;default:throw new Error("Invalid zone pointer")}}function SZP2(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SZP2[]",n)}state.zp2=n;switch(n){case 0:if(!state.tZone){initTZone(state)}state.z2=state.tZone;break;case 1:state.z2=state.gZone;break;default:throw new Error("Invalid zone pointer")}}function SZPS(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SZPS[]",n)}state.zp0=state.zp1=state.zp2=n;switch(n){case 0:if(!state.tZone){initTZone(state)}state.z0=state.z1=state.z2=state.tZone;break;case 1:state.z0=state.z1=state.z2=state.gZone;break;default:throw new Error("Invalid zone pointer")}}function SLOOP(state){state.loop=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SLOOP[]",state.loop)}}function RTG(state){if(exports.DEBUG){console.log(state.step,"RTG[]")}state.round=roundToGrid}function RTHG(state){if(exports.DEBUG){console.log(state.step,"RTHG[]")}state.round=roundToHalfGrid}function SMD(state){var d=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SMD[]",d)}state.minDis=d/64}function ELSE(state){if(exports.DEBUG){console.log(state.step,"ELSE[]")}skip(state,false)}function JMPR(state){var o=state.stack.pop();if(exports.DEBUG){console.log(state.step,"JMPR[]",o)}state.ip+=o-1}function SCVTCI(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SCVTCI[]",n)}state.cvCutIn=n/64}function DUP(state){var stack=state.stack;if(exports.DEBUG){console.log(state.step,"DUP[]")}stack.push(stack[stack.length-1])}function POP(state){if(exports.DEBUG){console.log(state.step,"POP[]")}state.stack.pop()}function CLEAR(state){if(exports.DEBUG){console.log(state.step,"CLEAR[]")}state.stack.length=0}function SWAP(state){var stack=state.stack;var a=stack.pop();var b=stack.pop();if(exports.DEBUG){console.log(state.step,"SWAP[]")}stack.push(a);stack.push(b)}function DEPTH(state){var stack=state.stack;if(exports.DEBUG){console.log(state.step,"DEPTH[]")}stack.push(stack.length)}function LOOPCALL(state){var stack=state.stack;var fn=stack.pop();var c=stack.pop();if(exports.DEBUG){console.log(state.step,"LOOPCALL[]",fn,c)}var cip=state.ip;var cprog=state.prog;state.prog=state.funcs[fn];for(var i=0;i<c;i++){exec(state);if(exports.DEBUG){console.log(++state.step,i+1<c?"next loopcall":"done loopcall",i)}}state.ip=cip;state.prog=cprog}function CALL(state){var fn=state.stack.pop();if(exports.DEBUG){console.log(state.step,"CALL[]",fn)}var cip=state.ip;var cprog=state.prog;state.prog=state.funcs[fn];exec(state);state.ip=cip;state.prog=cprog;if(exports.DEBUG){console.log(++state.step,"returning from",fn)}}function CINDEX(state){var stack=state.stack;var k=stack.pop();if(exports.DEBUG){console.log(state.step,"CINDEX[]",k)}stack.push(stack[stack.length-k])}function MINDEX(state){var stack=state.stack;var k=stack.pop();if(exports.DEBUG){console.log(state.step,"MINDEX[]",k)}stack.push(stack.splice(stack.length-k,1)[0])}function FDEF(state){if(state.env!=="fpgm"){throw new Error("FDEF not allowed here")}var stack=state.stack;var prog=state.prog;var ip=state.ip;var fn=stack.pop();var ipBegin=ip;if(exports.DEBUG){console.log(state.step,"FDEF[]",fn)}while(prog[++ip]!==45){}state.ip=ip;state.funcs[fn]=prog.slice(ipBegin+1,ip)}function MDAP(round,state){var pi=state.stack.pop();var p=state.z0[pi];var fv=state.fv;var pv=state.pv;if(exports.DEBUG){console.log(state.step,"MDAP["+round+"]",pi)}var d=pv.distance(p,HPZero);if(round){d=state.round(d)}fv.setRelative(p,HPZero,d,pv);fv.touch(p);state.rp0=state.rp1=pi}function IUP(v,state){var z2=state.z2;var pLen=z2.length-2;var cp;var pp;var np;if(exports.DEBUG){console.log(state.step,"IUP["+v.axis+"]")}for(var i=0;i<pLen;i++){cp=z2[i];if(v.touched(cp)){continue}pp=cp.prevTouched(v);if(pp===cp){continue}np=cp.nextTouched(v);if(pp===np){v.setRelative(cp,cp,v.distance(pp,pp,false,true),v,true)}v.interpolate(cp,pp,np,v)}}function SHP(a,state){var stack=state.stack;var rpi=a?state.rp1:state.rp2;var rp=(a?state.z0:state.z1)[rpi];var fv=state.fv;var pv=state.pv;var loop=state.loop;var z2=state.z2;while(loop--){var pi=stack.pop();var p=z2[pi];var d=pv.distance(rp,rp,false,true);fv.setRelative(p,p,d,pv);fv.touch(p);if(exports.DEBUG){console.log(state.step,(state.loop>1?"loop "+(state.loop-loop)+": ":"")+"SHP["+(a?"rp1":"rp2")+"]",pi)}}state.loop=1}function SHC(a,state){var stack=state.stack;var rpi=a?state.rp1:state.rp2;var rp=(a?state.z0:state.z1)[rpi];var fv=state.fv;var pv=state.pv;var ci=stack.pop();var sp=state.z2[state.contours[ci]];var p=sp;if(exports.DEBUG){console.log(state.step,"SHC["+a+"]",ci)}var d=pv.distance(rp,rp,false,true);do{if(p!==rp){fv.setRelative(p,p,d,pv)}p=p.nextPointOnContour}while(p!==sp)}function SHZ(a,state){var stack=state.stack;var rpi=a?state.rp1:state.rp2;var rp=(a?state.z0:state.z1)[rpi];var fv=state.fv;var pv=state.pv;var e=stack.pop();if(exports.DEBUG){console.log(state.step,"SHZ["+a+"]",e)}var z;switch(e){case 0:z=state.tZone;break;case 1:z=state.gZone;break;default:throw new Error("Invalid zone")}var p;var d=pv.distance(rp,rp,false,true);var pLen=z.length-2;for(var i=0;i<pLen;i++){p=z[i];fv.setRelative(p,p,d,pv)}}function SHPIX(state){var stack=state.stack;var loop=state.loop;var fv=state.fv;var d=stack.pop()/64;var z2=state.z2;while(loop--){var pi=stack.pop();var p=z2[pi];if(exports.DEBUG){console.log(state.step,(state.loop>1?"loop "+(state.loop-loop)+": ":"")+"SHPIX[]",pi,d)}fv.setRelative(p,p,d);fv.touch(p)}state.loop=1}function IP(state){var stack=state.stack;var rp1i=state.rp1;var rp2i=state.rp2;var loop=state.loop;var rp1=state.z0[rp1i];var rp2=state.z1[rp2i];var fv=state.fv;var pv=state.dpv;var z2=state.z2;while(loop--){var pi=stack.pop();var p=z2[pi];if(exports.DEBUG){console.log(state.step,(state.loop>1?"loop "+(state.loop-loop)+": ":"")+"IP[]",pi,rp1i,"<->",rp2i)}fv.interpolate(p,rp1,rp2,pv);fv.touch(p)}state.loop=1}function MSIRP(a,state){var stack=state.stack;var d=stack.pop()/64;var pi=stack.pop();var p=state.z1[pi];var rp0=state.z0[state.rp0];var fv=state.fv;var pv=state.pv;fv.setRelative(p,rp0,d,pv);fv.touch(p);if(exports.DEBUG){console.log(state.step,"MSIRP["+a+"]",d,pi)}state.rp1=state.rp0;state.rp2=pi;if(a){state.rp0=pi}}function ALIGNRP(state){var stack=state.stack;var rp0i=state.rp0;var rp0=state.z0[rp0i];var loop=state.loop;var fv=state.fv;var pv=state.pv;var z1=state.z1;while(loop--){var pi=stack.pop();var p=z1[pi];if(exports.DEBUG){console.log(state.step,(state.loop>1?"loop "+(state.loop-loop)+": ":"")+"ALIGNRP[]",pi)}fv.setRelative(p,rp0,0,pv);fv.touch(p)}state.loop=1}function RTDG(state){if(exports.DEBUG){console.log(state.step,"RTDG[]")}state.round=roundToDoubleGrid}function MIAP(round,state){var stack=state.stack;var n=stack.pop();var pi=stack.pop();var p=state.z0[pi];var fv=state.fv;var pv=state.pv;var cv=state.cvt[n];if(exports.DEBUG){console.log(state.step,"MIAP["+round+"]",n,"(",cv,")",pi)}var d=pv.distance(p,HPZero);if(round){if(Math.abs(d-cv)<state.cvCutIn){d=cv}d=state.round(d)}fv.setRelative(p,HPZero,d,pv);if(state.zp0===0){p.xo=p.x;p.yo=p.y}fv.touch(p);state.rp0=state.rp1=pi}function NPUSHB(state){var prog=state.prog;var ip=state.ip;var stack=state.stack;var n=prog[++ip];if(exports.DEBUG){console.log(state.step,"NPUSHB[]",n)}for(var i=0;i<n;i++){stack.push(prog[++ip])}state.ip=ip}function NPUSHW(state){var ip=state.ip;var prog=state.prog;var stack=state.stack;var n=prog[++ip];if(exports.DEBUG){console.log(state.step,"NPUSHW[]",n)}for(var i=0;i<n;i++){var w=prog[++ip]<<8|prog[++ip];if(w&32768){w=-((w^65535)+1)}stack.push(w)}state.ip=ip}function WS(state){var stack=state.stack;var store=state.store;if(!store){store=state.store=[]}var v=stack.pop();var l=stack.pop();if(exports.DEBUG){console.log(state.step,"WS",v,l)}store[l]=v}function RS(state){var stack=state.stack;var store=state.store;var l=stack.pop();if(exports.DEBUG){console.log(state.step,"RS",l)}var v=store&&store[l]||0;stack.push(v)}function WCVTP(state){var stack=state.stack;var v=stack.pop();var l=stack.pop();if(exports.DEBUG){console.log(state.step,"WCVTP",v,l)}state.cvt[l]=v/64}function RCVT(state){var stack=state.stack;var cvte=stack.pop();if(exports.DEBUG){console.log(state.step,"RCVT",cvte)}stack.push(state.cvt[cvte]*64)}function GC(a,state){var stack=state.stack;var pi=stack.pop();var p=state.z2[pi];if(exports.DEBUG){console.log(state.step,"GC["+a+"]",pi)}stack.push(state.dpv.distance(p,HPZero,a,false)*64)}function MD(a,state){var stack=state.stack;var pi2=stack.pop();var pi1=stack.pop();var p2=state.z1[pi2];var p1=state.z0[pi1];var d=state.dpv.distance(p1,p2,a,a);if(exports.DEBUG){console.log(state.step,"MD["+a+"]",pi2,pi1,"->",d)}state.stack.push(Math.round(d*64))}function MPPEM(state){if(exports.DEBUG){console.log(state.step,"MPPEM[]")}state.stack.push(state.ppem)}function FLIPON(state){if(exports.DEBUG){console.log(state.step,"FLIPON[]")}state.autoFlip=true}function LT(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"LT[]",e2,e1)}stack.push(e1<e2?1:0)}function LTEQ(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"LTEQ[]",e2,e1)}stack.push(e1<=e2?1:0)}function GT(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"GT[]",e2,e1)}stack.push(e1>e2?1:0)}function GTEQ(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"GTEQ[]",e2,e1)}stack.push(e1>=e2?1:0)}function EQ(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"EQ[]",e2,e1)}stack.push(e2===e1?1:0)}function NEQ(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"NEQ[]",e2,e1)}stack.push(e2!==e1?1:0)}function ODD(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"ODD[]",n)}stack.push(Math.trunc(n)%2?1:0)}function EVEN(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"EVEN[]",n)}stack.push(Math.trunc(n)%2?0:1)}function IF(state){var test=state.stack.pop();if(exports.DEBUG){console.log(state.step,"IF[]",test)}if(!test){skip(state,true);if(exports.DEBUG){console.log(state.step,"EIF[]")}}}function EIF(state){if(exports.DEBUG){console.log(state.step,"EIF[]")}}function AND(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"AND[]",e2,e1)}stack.push(e2&&e1?1:0)}function OR(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"OR[]",e2,e1)}stack.push(e2||e1?1:0)}function NOT(state){var stack=state.stack;var e=stack.pop();if(exports.DEBUG){console.log(state.step,"NOT[]",e)}stack.push(e?0:1)}function DELTAP123(b,state){var stack=state.stack;var n=stack.pop();var fv=state.fv;var pv=state.pv;var ppem=state.ppem;var base=state.deltaBase+(b-1)*16;var ds=state.deltaShift;var z0=state.z0;if(exports.DEBUG){console.log(state.step,"DELTAP["+b+"]",n,stack)}for(var i=0;i<n;i++){var pi=stack.pop();var arg=stack.pop();var appem=base+((arg&240)>>4);if(appem!==ppem){continue}var mag=(arg&15)-8;if(mag>=0){mag++}if(exports.DEBUG){console.log(state.step,"DELTAPFIX",pi,"by",mag*ds)}var p=z0[pi];fv.setRelative(p,p,mag*ds,pv)}}function SDB(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"SDB[]",n)}state.deltaBase=n}function SDS(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"SDS[]",n)}state.deltaShift=Math.pow(.5,n)}function ADD(state){var stack=state.stack;var n2=stack.pop();var n1=stack.pop();if(exports.DEBUG){console.log(state.step,"ADD[]",n2,n1)}stack.push(n1+n2)}function SUB(state){var stack=state.stack;var n2=stack.pop();var n1=stack.pop();if(exports.DEBUG){console.log(state.step,"SUB[]",n2,n1)}stack.push(n1-n2)}function DIV(state){var stack=state.stack;var n2=stack.pop();var n1=stack.pop();if(exports.DEBUG){console.log(state.step,"DIV[]",n2,n1)}stack.push(n1*64/n2)}function MUL(state){var stack=state.stack;var n2=stack.pop();var n1=stack.pop();if(exports.DEBUG){console.log(state.step,"MUL[]",n2,n1)}stack.push(n1*n2/64)}function ABS(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"ABS[]",n)}stack.push(Math.abs(n))}function NEG(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"NEG[]",n)}stack.push(-n)}function FLOOR(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"FLOOR[]",n)}stack.push(Math.floor(n/64)*64)}function CEILING(state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"CEILING[]",n)}stack.push(Math.ceil(n/64)*64)}function ROUND(dt,state){var stack=state.stack;var n=stack.pop();if(exports.DEBUG){console.log(state.step,"ROUND[]")}stack.push(state.round(n/64)*64)}function WCVTF(state){var stack=state.stack;var v=stack.pop();var l=stack.pop();if(exports.DEBUG){console.log(state.step,"WCVTF[]",v,l)}state.cvt[l]=v*state.ppem/state.font.unitsPerEm}function DELTAC123(b,state){var stack=state.stack;var n=stack.pop();var ppem=state.ppem;var base=state.deltaBase+(b-1)*16;var ds=state.deltaShift;if(exports.DEBUG){console.log(state.step,"DELTAC["+b+"]",n,stack)}for(var i=0;i<n;i++){var c=stack.pop();var arg=stack.pop();var appem=base+((arg&240)>>4);if(appem!==ppem){continue}var mag=(arg&15)-8;if(mag>=0){mag++}var delta=mag*ds;if(exports.DEBUG){console.log(state.step,"DELTACFIX",c,"by",delta)}state.cvt[c]+=delta}}function SROUND(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SROUND[]",n)}state.round=roundSuper;var period;switch(n&192){case 0:period=.5;break;case 64:period=1;break;case 128:period=2;break;default:throw new Error("invalid SROUND value")}state.srPeriod=period;switch(n&48){case 0:state.srPhase=0;break;case 16:state.srPhase=.25*period;break;case 32:state.srPhase=.5*period;break;case 48:state.srPhase=.75*period;break;default:throw new Error("invalid SROUND value")}n&=15;if(n===0){state.srThreshold=0}else{state.srThreshold=(n/8-.5)*period}}function S45ROUND(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"S45ROUND[]",n)}state.round=roundSuper;var period;switch(n&192){case 0:period=Math.sqrt(2)/2;break;case 64:period=Math.sqrt(2);break;case 128:period=2*Math.sqrt(2);break;default:throw new Error("invalid S45ROUND value")}state.srPeriod=period;switch(n&48){case 0:state.srPhase=0;break;case 16:state.srPhase=.25*period;break;case 32:state.srPhase=.5*period;break;case 48:state.srPhase=.75*period;break;default:throw new Error("invalid S45ROUND value")}n&=15;if(n===0){state.srThreshold=0}else{state.srThreshold=(n/8-.5)*period}}function ROFF(state){if(exports.DEBUG){console.log(state.step,"ROFF[]")}state.round=roundOff}function RUTG(state){if(exports.DEBUG){console.log(state.step,"RUTG[]")}state.round=roundUpToGrid}function RDTG(state){if(exports.DEBUG){console.log(state.step,"RDTG[]")}state.round=roundDownToGrid}function SCANCTRL(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SCANCTRL[]",n)}}function SDPVTL(a,state){var stack=state.stack;var p2i=stack.pop();var p1i=stack.pop();var p2=state.z2[p2i];var p1=state.z1[p1i];if(exports.DEBUG){console.log(state.step,"SDPVTL["+a+"]",p2i,p1i)}var dx;var dy;if(!a){dx=p1.x-p2.x;dy=p1.y-p2.y}else{dx=p2.y-p1.y;dy=p1.x-p2.x}state.dpv=getUnitVector(dx,dy)}function GETINFO(state){var stack=state.stack;var sel=stack.pop();var r=0;if(exports.DEBUG){console.log(state.step,"GETINFO[]",sel)}if(sel&1){r=35}if(sel&32){r|=4096}stack.push(r)}function ROLL(state){var stack=state.stack;var a=stack.pop();var b=stack.pop();var c=stack.pop();if(exports.DEBUG){console.log(state.step,"ROLL[]")}stack.push(b);stack.push(a);stack.push(c)}function MAX(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"MAX[]",e2,e1)}stack.push(Math.max(e1,e2))}function MIN(state){var stack=state.stack;var e2=stack.pop();var e1=stack.pop();if(exports.DEBUG){console.log(state.step,"MIN[]",e2,e1)}stack.push(Math.min(e1,e2))}function SCANTYPE(state){var n=state.stack.pop();if(exports.DEBUG){console.log(state.step,"SCANTYPE[]",n)}}function INSTCTRL(state){var s=state.stack.pop();var v=state.stack.pop();if(exports.DEBUG){console.log(state.step,"INSTCTRL[]",s,v)}switch(s){case 1:state.inhibitGridFit=!!v;return;case 2:state.ignoreCvt=!!v;return;default:throw new Error("invalid INSTCTRL[] selector")}}function PUSHB(n,state){var stack=state.stack;var prog=state.prog;var ip=state.ip;if(exports.DEBUG){console.log(state.step,"PUSHB["+n+"]")}for(var i=0;i<n;i++){stack.push(prog[++ip])}state.ip=ip}function PUSHW(n,state){var ip=state.ip;var prog=state.prog;var stack=state.stack;if(exports.DEBUG){console.log(state.ip,"PUSHW["+n+"]")}for(var i=0;i<n;i++){var w=prog[++ip]<<8|prog[++ip];if(w&32768){w=-((w^65535)+1)}stack.push(w)}state.ip=ip}function MDRP_MIRP(indirect,setRp0,keepD,ro,dt,state){var stack=state.stack;var cvte=indirect&&stack.pop();var pi=stack.pop();var rp0i=state.rp0;var rp=state.z0[rp0i];var p=state.z1[pi];var md=state.minDis;var fv=state.fv;var pv=state.dpv;var od;var d;var sign;var cv;d=od=pv.distance(p,rp,true,true);sign=d>=0?1:-1;d=Math.abs(d);if(indirect){cv=state.cvt[cvte];if(ro&&Math.abs(d-cv)<state.cvCutIn){d=cv}}if(keepD&&d<md){d=md}if(ro){d=state.round(d)}fv.setRelative(p,rp,sign*d,pv);fv.touch(p);if(exports.DEBUG){console.log(state.step,(indirect?"MIRP[":"MDRP[")+(setRp0?"M":"m")+(keepD?">":"_")+(ro?"R":"_")+(dt===0?"Gr":dt===1?"Bl":dt===2?"Wh":"")+"]",indirect?cvte+"("+state.cvt[cvte]+","+cv+")":"",pi,"(d =",od,"->",sign*d,")")}state.rp1=state.rp0;state.rp2=pi;if(setRp0){state.rp0=pi}}instructionTable=[SVTCA.bind(undefined,yUnitVector),SVTCA.bind(undefined,xUnitVector),SPVTCA.bind(undefined,yUnitVector),SPVTCA.bind(undefined,xUnitVector),SFVTCA.bind(undefined,yUnitVector),SFVTCA.bind(undefined,xUnitVector),SPVTL.bind(undefined,0),SPVTL.bind(undefined,1),SFVTL.bind(undefined,0),SFVTL.bind(undefined,1),SPVFS,SFVFS,GPV,GFV,SFVTPV,ISECT,SRP0,SRP1,SRP2,SZP0,SZP1,SZP2,SZPS,SLOOP,RTG,RTHG,SMD,ELSE,JMPR,SCVTCI,undefined,undefined,DUP,POP,CLEAR,SWAP,DEPTH,CINDEX,MINDEX,undefined,undefined,undefined,LOOPCALL,CALL,FDEF,undefined,MDAP.bind(undefined,0),MDAP.bind(undefined,1),IUP.bind(undefined,yUnitVector),IUP.bind(undefined,xUnitVector),SHP.bind(undefined,0),SHP.bind(undefined,1),SHC.bind(undefined,0),SHC.bind(undefined,1),SHZ.bind(undefined,0),SHZ.bind(undefined,1),SHPIX,IP,MSIRP.bind(undefined,0),MSIRP.bind(undefined,1),ALIGNRP,RTDG,MIAP.bind(undefined,0),MIAP.bind(undefined,1),NPUSHB,NPUSHW,WS,RS,WCVTP,RCVT,GC.bind(undefined,0),GC.bind(undefined,1),undefined,MD.bind(undefined,0),MD.bind(undefined,1),MPPEM,undefined,FLIPON,undefined,undefined,LT,LTEQ,GT,GTEQ,EQ,NEQ,ODD,EVEN,IF,EIF,AND,OR,NOT,DELTAP123.bind(undefined,1),SDB,SDS,ADD,SUB,DIV,MUL,ABS,NEG,FLOOR,CEILING,ROUND.bind(undefined,0),ROUND.bind(undefined,1),ROUND.bind(undefined,2),ROUND.bind(undefined,3),undefined,undefined,undefined,undefined,WCVTF,DELTAP123.bind(undefined,2),DELTAP123.bind(undefined,3),DELTAC123.bind(undefined,1),DELTAC123.bind(undefined,2),DELTAC123.bind(undefined,3),SROUND,S45ROUND,undefined,undefined,ROFF,undefined,RUTG,RDTG,POP,POP,undefined,undefined,undefined,undefined,undefined,SCANCTRL,SDPVTL.bind(undefined,0),SDPVTL.bind(undefined,1),GETINFO,undefined,ROLL,MAX,MIN,SCANTYPE,INSTCTRL,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,PUSHB.bind(undefined,1),PUSHB.bind(undefined,2),PUSHB.bind(undefined,3),PUSHB.bind(undefined,4),PUSHB.bind(undefined,5),PUSHB.bind(undefined,6),PUSHB.bind(undefined,7),PUSHB.bind(undefined,8),PUSHW.bind(undefined,1),PUSHW.bind(undefined,2),PUSHW.bind(undefined,3),PUSHW.bind(undefined,4),PUSHW.bind(undefined,5),PUSHW.bind(undefined,6),PUSHW.bind(undefined,7),PUSHW.bind(undefined,8),MDRP_MIRP.bind(undefined,0,0,0,0,0),MDRP_MIRP.bind(undefined,0,0,0,0,1),MDRP_MIRP.bind(undefined,0,0,0,0,2),MDRP_MIRP.bind(undefined,0,0,0,0,3),MDRP_MIRP.bind(undefined,0,0,0,1,0),MDRP_MIRP.bind(undefined,0,0,0,1,1),MDRP_MIRP.bind(undefined,0,0,0,1,2),MDRP_MIRP.bind(undefined,0,0,0,1,3),MDRP_MIRP.bind(undefined,0,0,1,0,0),MDRP_MIRP.bind(undefined,0,0,1,0,1),MDRP_MIRP.bind(undefined,0,0,1,0,2),MDRP_MIRP.bind(undefined,0,0,1,0,3),MDRP_MIRP.bind(undefined,0,0,1,1,0),MDRP_MIRP.bind(undefined,0,0,1,1,1),MDRP_MIRP.bind(undefined,0,0,1,1,2),MDRP_MIRP.bind(undefined,0,0,1,1,3),MDRP_MIRP.bind(undefined,0,1,0,0,0),MDRP_MIRP.bind(undefined,0,1,0,0,1),MDRP_MIRP.bind(undefined,0,1,0,0,2),MDRP_MIRP.bind(undefined,0,1,0,0,3),MDRP_MIRP.bind(undefined,0,1,0,1,0),MDRP_MIRP.bind(undefined,0,1,0,1,1),MDRP_MIRP.bind(undefined,0,1,0,1,2),MDRP_MIRP.bind(undefined,0,1,0,1,3),MDRP_MIRP.bind(undefined,0,1,1,0,0),MDRP_MIRP.bind(undefined,0,1,1,0,1),MDRP_MIRP.bind(undefined,0,1,1,0,2),MDRP_MIRP.bind(undefined,0,1,1,0,3),MDRP_MIRP.bind(undefined,0,1,1,1,0),MDRP_MIRP.bind(undefined,0,1,1,1,1),MDRP_MIRP.bind(undefined,0,1,1,1,2),MDRP_MIRP.bind(undefined,0,1,1,1,3),MDRP_MIRP.bind(undefined,1,0,0,0,0),MDRP_MIRP.bind(undefined,1,0,0,0,1),MDRP_MIRP.bind(undefined,1,0,0,0,2),MDRP_MIRP.bind(undefined,1,0,0,0,3),MDRP_MIRP.bind(undefined,1,0,0,1,0),MDRP_MIRP.bind(undefined,1,0,0,1,1),MDRP_MIRP.bind(undefined,1,0,0,1,2),MDRP_MIRP.bind(undefined,1,0,0,1,3),MDRP_MIRP.bind(undefined,1,0,1,0,0),MDRP_MIRP.bind(undefined,1,0,1,0,1),MDRP_MIRP.bind(undefined,1,0,1,0,2),MDRP_MIRP.bind(undefined,1,0,1,0,3),MDRP_MIRP.bind(undefined,1,0,1,1,0),MDRP_MIRP.bind(undefined,1,0,1,1,1),MDRP_MIRP.bind(undefined,1,0,1,1,2),MDRP_MIRP.bind(undefined,1,0,1,1,3),MDRP_MIRP.bind(undefined,1,1,0,0,0),MDRP_MIRP.bind(undefined,1,1,0,0,1),MDRP_MIRP.bind(undefined,1,1,0,0,2),MDRP_MIRP.bind(undefined,1,1,0,0,3),MDRP_MIRP.bind(undefined,1,1,0,1,0),MDRP_MIRP.bind(undefined,1,1,0,1,1),MDRP_MIRP.bind(undefined,1,1,0,1,2),MDRP_MIRP.bind(undefined,1,1,0,1,3),MDRP_MIRP.bind(undefined,1,1,1,0,0),MDRP_MIRP.bind(undefined,1,1,1,0,1),MDRP_MIRP.bind(undefined,1,1,1,0,2),MDRP_MIRP.bind(undefined,1,1,1,0,3),MDRP_MIRP.bind(undefined,1,1,1,1,0),MDRP_MIRP.bind(undefined,1,1,1,1,1),MDRP_MIRP.bind(undefined,1,1,1,1,2),MDRP_MIRP.bind(undefined,1,1,1,1,3)];var arrayFromString=Array.from||function(s){return s.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]?|[^\uD800-\uDFFF]|./g)||[]};function Font(options){options=options||{};if(!options.empty){checkArgument(options.familyName,"When creating a new Font object, familyName is required.");checkArgument(options.styleName,"When creating a new Font object, styleName is required.");checkArgument(options.unitsPerEm,"When creating a new Font object, unitsPerEm is required.");checkArgument(options.ascender,"When creating a new Font object, ascender is required.");checkArgument(options.descender,"When creating a new Font object, descender is required.");checkArgument(options.descender<0,"Descender should be negative (e.g. -512).");this.names={fontFamily:{en:options.familyName||" "},fontSubfamily:{en:options.styleName||" "},fullName:{en:options.fullName||options.familyName+" "+options.styleName},postScriptName:{en:options.postScriptName||(options.familyName+options.styleName).replace(/\s/g,"")},designer:{en:options.designer||" "},designerURL:{en:options.designerURL||" "},manufacturer:{en:options.manufacturer||" "},manufacturerURL:{en:options.manufacturerURL||" "},license:{en:options.license||" "},licenseURL:{en:options.licenseURL||" "},version:{en:options.version||"Version 0.1"},description:{en:options.description||" "},copyright:{en:options.copyright||" "},trademark:{en:options.trademark||" "}};this.unitsPerEm=options.unitsPerEm||1e3;this.ascender=options.ascender;this.descender=options.descender;this.createdTimestamp=options.createdTimestamp;this.tables={os2:{usWeightClass:options.weightClass||this.usWeightClasses.MEDIUM,usWidthClass:options.widthClass||this.usWidthClasses.MEDIUM,fsSelection:options.fsSelection||this.fsSelectionValues.REGULAR}}}this.supported=true;this.glyphs=new glyphset.GlyphSet(this,options.glyphs||[]);this.encoding=new DefaultEncoding(this);this.position=new Position(this);this.substitution=new Substitution(this);this.tables=this.tables||{};Object.defineProperty(this,"hinting",{get:function(){if(this._hinting){return this._hinting}if(this.outlinesFormat==="truetype"){return this._hinting=new Hinting(this)}}})}Font.prototype.hasChar=function(c){return this.encoding.charToGlyphIndex(c)!==null};Font.prototype.charToGlyphIndex=function(s){return this.encoding.charToGlyphIndex(s)};Font.prototype.charToGlyph=function(c){var glyphIndex=this.charToGlyphIndex(c);var glyph=this.glyphs.get(glyphIndex);if(!glyph){glyph=this.glyphs.get(0)}return glyph};Font.prototype.stringToGlyphs=function(s,options){var this$1=this;options=options||this.defaultRenderOptions;var chars=arrayFromString(s);var indexes=[];for(var i=0;i<chars.length;i+=1){var c=chars[i];indexes.push(this$1.charToGlyphIndex(c))}var length=indexes.length;if(options.features){var script=options.script||this.substitution.getDefaultScriptName();var manyToOne=[];if(options.features.liga){manyToOne=manyToOne.concat(this.substitution.getFeature("liga",script,options.language))}if(options.features.rlig){manyToOne=manyToOne.concat(this.substitution.getFeature("rlig",script,options.language))}for(var i$1=0;i$1<length;i$1+=1){for(var j=0;j<manyToOne.length;j++){var ligature=manyToOne[j];var components=ligature.sub;var compCount=components.length;var k=0;while(k<compCount&&components[k]===indexes[i$1+k]){k++}if(k===compCount){indexes.splice(i$1,compCount,ligature.by);length=length-compCount+1}}}}var glyphs=new Array(length);var notdef=this.glyphs.get(0);for(var i$2=0;i$2<length;i$2+=1){glyphs[i$2]=this$1.glyphs.get(indexes[i$2])||notdef}return glyphs};Font.prototype.nameToGlyphIndex=function(name){return this.glyphNames.nameToGlyphIndex(name)};Font.prototype.nameToGlyph=function(name){var glyphIndex=this.nameToGlyphIndex(name);var glyph=this.glyphs.get(glyphIndex);if(!glyph){glyph=this.glyphs.get(0)}return glyph};Font.prototype.glyphIndexToName=function(gid){if(!this.glyphNames.glyphIndexToName){return""}return this.glyphNames.glyphIndexToName(gid)};Font.prototype.getKerningValue=function(leftGlyph,rightGlyph){leftGlyph=leftGlyph.index||leftGlyph;rightGlyph=rightGlyph.index||rightGlyph;var gposKerning=this.position.defaultKerningTables;if(gposKerning){return this.position.getKerningValue(gposKerning,leftGlyph,rightGlyph)}return this.kerningPairs[leftGlyph+","+rightGlyph]||0};Font.prototype.defaultRenderOptions={kerning:true,features:{liga:true,rlig:true}};Font.prototype.forEachGlyph=function(text,x,y,fontSize,options,callback){var this$1=this;x=x!==undefined?x:0;y=y!==undefined?y:0;fontSize=fontSize!==undefined?fontSize:72;options=options||this.defaultRenderOptions;var fontScale=1/this.unitsPerEm*fontSize;var glyphs=this.stringToGlyphs(text,options);var kerningLookups;if(options.kerning){var script=options.script||this.position.getDefaultScriptName();kerningLookups=this.position.getKerningTables(script,options.language)}for(var i=0;i<glyphs.length;i+=1){var glyph=glyphs[i];callback.call(this$1,glyph,x,y,fontSize,options);if(glyph.advanceWidth){x+=glyph.advanceWidth*fontScale}if(options.kerning&&i<glyphs.length-1){var kerningValue=kerningLookups?this$1.position.getKerningValue(kerningLookups,glyph.index,glyphs[i+1].index):this$1.getKerningValue(glyph,glyphs[i+1]);x+=kerningValue*fontScale}if(options.letterSpacing){x+=options.letterSpacing*fontSize}else if(options.tracking){x+=options.tracking/1e3*fontSize}}return x};Font.prototype.getPath=function(text,x,y,fontSize,options){var fullPath=new Path;this.forEachGlyph(text,x,y,fontSize,options,function(glyph,gX,gY,gFontSize){var glyphPath=glyph.getPath(gX,gY,gFontSize,options,this);fullPath.extend(glyphPath)});return fullPath};Font.prototype.getPaths=function(text,x,y,fontSize,options){var glyphPaths=[];this.forEachGlyph(text,x,y,fontSize,options,function(glyph,gX,gY,gFontSize){var glyphPath=glyph.getPath(gX,gY,gFontSize,options,this);glyphPaths.push(glyphPath)});return glyphPaths};Font.prototype.getAdvanceWidth=function(text,fontSize,options){return this.forEachGlyph(text,0,0,fontSize,options,function(){})};Font.prototype.draw=function(ctx,text,x,y,fontSize,options){this.getPath(text,x,y,fontSize,options).draw(ctx)};Font.prototype.drawPoints=function(ctx,text,x,y,fontSize,options){this.forEachGlyph(text,x,y,fontSize,options,function(glyph,gX,gY,gFontSize){glyph.drawPoints(ctx,gX,gY,gFontSize)})};Font.prototype.drawMetrics=function(ctx,text,x,y,fontSize,options){this.forEachGlyph(text,x,y,fontSize,options,function(glyph,gX,gY,gFontSize){glyph.drawMetrics(ctx,gX,gY,gFontSize)})};Font.prototype.getEnglishName=function(name){var translations=this.names[name];if(translations){return translations.en}};Font.prototype.validate=function(){var _this=this;function assert(predicate,message){}function assertNamePresent(name){var englishName=_this.getEnglishName(name);assert(englishName&&englishName.trim().length>0,"No English "+name+" specified.")}assertNamePresent("fontFamily");assertNamePresent("weightName");assertNamePresent("manufacturer");assertNamePresent("copyright");assertNamePresent("version");assert(this.unitsPerEm>0,"No unitsPerEm specified.")};Font.prototype.toTables=function(){return sfnt.fontToTable(this)};Font.prototype.toBuffer=function(){console.warn("Font.toBuffer is deprecated. Use Font.toArrayBuffer instead.");return this.toArrayBuffer()};Font.prototype.toArrayBuffer=function(){var sfntTable=this.toTables();var bytes=sfntTable.encode();var buffer=new ArrayBuffer(bytes.length);var intArray=new Uint8Array(buffer);for(var i=0;i<bytes.length;i++){intArray[i]=bytes[i]}return buffer};Font.prototype.download=function(fileName){var familyName=this.getEnglishName("fontFamily");var styleName=this.getEnglishName("fontSubfamily");fileName=fileName||familyName.replace(/\s/g,"")+"-"+styleName+".otf";var arrayBuffer=this.toArrayBuffer();if(isBrowser()){window.URL=window.URL||window.webkitURL;if(window.URL){var dataView=new DataView(arrayBuffer);var blob=new Blob([dataView],{type:"font/opentype"});var link=document.createElement("a");link.href=window.URL.createObjectURL(blob);link.download=fileName;var event=document.createEvent("MouseEvents");event.initEvent("click",true,false);link.dispatchEvent(event)}else{console.warn("Font file could not be downloaded. Try using a different browser.")}}else{var fs=require("fs");var buffer=arrayBufferToNodeBuffer(arrayBuffer);fs.writeFileSync(fileName,buffer)}};Font.prototype.fsSelectionValues={ITALIC:1,UNDERSCORE:2,NEGATIVE:4,OUTLINED:8,STRIKEOUT:16,BOLD:32,REGULAR:64,USER_TYPO_METRICS:128,WWS:256,OBLIQUE:512};Font.prototype.usWidthClasses={ULTRA_CONDENSED:1,EXTRA_CONDENSED:2,CONDENSED:3,SEMI_CONDENSED:4,MEDIUM:5,SEMI_EXPANDED:6,EXPANDED:7,EXTRA_EXPANDED:8,ULTRA_EXPANDED:9};Font.prototype.usWeightClasses={THIN:100,EXTRA_LIGHT:200,LIGHT:300,NORMAL:400,MEDIUM:500,SEMI_BOLD:600,BOLD:700,EXTRA_BOLD:800,BLACK:900};function addName(name,names){var nameString=JSON.stringify(name);var nameID=256;for(var nameKey in names){var n=parseInt(nameKey);if(!n||n<256){continue}if(JSON.stringify(names[nameKey])===nameString){return n}if(nameID<=n){nameID=n+1}}names[nameID]=name;return nameID}function makeFvarAxis(n,axis,names){var nameID=addName(axis.name,names);return[{name:"tag_"+n,type:"TAG",value:axis.tag},{name:"minValue_"+n,type:"FIXED",value:axis.minValue<<16},{name:"defaultValue_"+n,type:"FIXED",value:axis.defaultValue<<16},{name:"maxValue_"+n,type:"FIXED",value:axis.maxValue<<16},{name:"flags_"+n,type:"USHORT",value:0},{name:"nameID_"+n,type:"USHORT",value:nameID}]}function parseFvarAxis(data,start,names){var axis={};var p=new parse.Parser(data,start);axis.tag=p.parseTag();axis.minValue=p.parseFixed();axis.defaultValue=p.parseFixed();axis.maxValue=p.parseFixed();p.skip("uShort",1);axis.name=names[p.parseUShort()]||{};return axis}function makeFvarInstance(n,inst,axes,names){var nameID=addName(inst.name,names);var fields=[{name:"nameID_"+n,type:"USHORT",value:nameID},{name:"flags_"+n,type:"USHORT",value:0}];for(var i=0;i<axes.length;++i){var axisTag=axes[i].tag;fields.push({name:"axis_"+n+" "+axisTag,type:"FIXED",value:inst.coordinates[axisTag]<<16})}return fields}function parseFvarInstance(data,start,axes,names){var inst={};var p=new parse.Parser(data,start);inst.name=names[p.parseUShort()]||{};p.skip("uShort",1);inst.coordinates={};for(var i=0;i<axes.length;++i){inst.coordinates[axes[i].tag]=p.parseFixed()}return inst}function makeFvarTable(fvar,names){var result=new table.Table("fvar",[{name:"version",type:"ULONG",value:65536},{name:"offsetToData",type:"USHORT",value:0},{name:"countSizePairs",type:"USHORT",value:2},{name:"axisCount",type:"USHORT",value:fvar.axes.length},{name:"axisSize",type:"USHORT",value:20},{name:"instanceCount",type:"USHORT",value:fvar.instances.length},{name:"instanceSize",type:"USHORT",value:4+fvar.axes.length*4}]);result.offsetToData=result.sizeOf();for(var i=0;i<fvar.axes.length;i++){result.fields=result.fields.concat(makeFvarAxis(i,fvar.axes[i],names))}for(var j=0;j<fvar.instances.length;j++){result.fields=result.fields.concat(makeFvarInstance(j,fvar.instances[j],fvar.axes,names))}return result}function parseFvarTable(data,start,names){var p=new parse.Parser(data,start);var tableVersion=p.parseULong();check.argument(tableVersion===65536,"Unsupported fvar table version.");var offsetToData=p.parseOffset16();p.skip("uShort",1);var axisCount=p.parseUShort();var axisSize=p.parseUShort();var instanceCount=p.parseUShort();var instanceSize=p.parseUShort();var axes=[];for(var i=0;i<axisCount;i++){axes.push(parseFvarAxis(data,start+offsetToData+i*axisSize,names))}var instances=[];var instanceStart=start+offsetToData+axisCount*axisSize;for(var j=0;j<instanceCount;j++){instances.push(parseFvarInstance(data,instanceStart+j*instanceSize,axes,names))}return{axes:axes,instances:instances}}var fvar={make:makeFvarTable,parse:parseFvarTable};var subtableParsers$1=new Array(10);subtableParsers$1[1]=function parseLookup1(){var start=this.offset+this.relativeOffset;var posformat=this.parseUShort();if(posformat===1){return{posFormat:1,coverage:this.parsePointer(Parser.coverage),value:this.parseValueRecord()}}else if(posformat===2){return{posFormat:2,coverage:this.parsePointer(Parser.coverage),values:this.parseValueRecordList()}}check.assert(false,"0x"+start.toString(16)+": GPOS lookup type 1 format must be 1 or 2.")};subtableParsers$1[2]=function parseLookup2(){var start=this.offset+this.relativeOffset;var posFormat=this.parseUShort();check.assert(posFormat===1||posFormat===2,"0x"+start.toString(16)+": GPOS lookup type 2 format must be 1 or 2.");var coverage=this.parsePointer(Parser.coverage);var valueFormat1=this.parseUShort();var valueFormat2=this.parseUShort();if(posFormat===1){return{posFormat:posFormat,coverage:coverage,valueFormat1:valueFormat1,valueFormat2:valueFormat2,pairSets:this.parseList(Parser.pointer(Parser.list(function(){return{secondGlyph:this.parseUShort(),value1:this.parseValueRecord(valueFormat1),value2:this.parseValueRecord(valueFormat2)}})))}}else if(posFormat===2){var classDef1=this.parsePointer(Parser.classDef);var classDef2=this.parsePointer(Parser.classDef);var class1Count=this.parseUShort();var class2Count=this.parseUShort();return{posFormat:posFormat,coverage:coverage,valueFormat1:valueFormat1,valueFormat2:valueFormat2,classDef1:classDef1,classDef2:classDef2,class1Count:class1Count,class2Count:class2Count,classRecords:this.parseList(class1Count,Parser.list(class2Count,function(){return{value1:this.parseValueRecord(valueFormat1),value2:this.parseValueRecord(valueFormat2)}}))}}};subtableParsers$1[3]=function parseLookup3(){return{error:"GPOS Lookup 3 not supported"}};subtableParsers$1[4]=function parseLookup4(){return{error:"GPOS Lookup 4 not supported"}};subtableParsers$1[5]=function parseLookup5(){return{error:"GPOS Lookup 5 not supported"}};subtableParsers$1[6]=function parseLookup6(){return{error:"GPOS Lookup 6 not supported"}};subtableParsers$1[7]=function parseLookup7(){return{error:"GPOS Lookup 7 not supported"}};subtableParsers$1[8]=function parseLookup8(){return{error:"GPOS Lookup 8 not supported"}};subtableParsers$1[9]=function parseLookup9(){return{error:"GPOS Lookup 9 not supported"}};function parseGposTable(data,start){start=start||0;var p=new Parser(data,start);var tableVersion=p.parseVersion(1);check.argument(tableVersion===1||tableVersion===1.1,"Unsupported GPOS table version "+tableVersion);if(tableVersion===1){return{version:tableVersion,scripts:p.parseScriptList(),features:p.parseFeatureList(),lookups:p.parseLookupList(subtableParsers$1)}}else{return{version:tableVersion,scripts:p.parseScriptList(),features:p.parseFeatureList(),lookups:p.parseLookupList(subtableParsers$1),variations:p.parseFeatureVariationsList()}}}var subtableMakers$1=new Array(10);function makeGposTable(gpos){return new table.Table("GPOS",[{name:"version",type:"ULONG",value:65536},{name:"scripts",type:"TABLE",value:new table.ScriptList(gpos.scripts)},{name:"features",type:"TABLE",value:new table.FeatureList(gpos.features)},{name:"lookups",type:"TABLE",value:new table.LookupList(gpos.lookups,subtableMakers$1)}])}var gpos={parse:parseGposTable,make:makeGposTable};function parseWindowsKernTable(p){var pairs={};p.skip("uShort");var subtableVersion=p.parseUShort();check.argument(subtableVersion===0,"Unsupported kern sub-table version.");p.skip("uShort",2);var nPairs=p.parseUShort();p.skip("uShort",3);for(var i=0;i<nPairs;i+=1){var leftIndex=p.parseUShort();var rightIndex=p.parseUShort();var value=p.parseShort();pairs[leftIndex+","+rightIndex]=value}return pairs}function parseMacKernTable(p){var pairs={};p.skip("uShort");var nTables=p.parseULong();if(nTables>1){console.warn("Only the first kern subtable is supported.")}p.skip("uLong");var coverage=p.parseUShort();var subtableVersion=coverage&255;p.skip("uShort");if(subtableVersion===0){var nPairs=p.parseUShort();p.skip("uShort",3);for(var i=0;i<nPairs;i+=1){var leftIndex=p.parseUShort();var rightIndex=p.parseUShort();var value=p.parseShort();pairs[leftIndex+","+rightIndex]=value}}return pairs}function parseKernTable(data,start){var p=new parse.Parser(data,start);var tableVersion=p.parseUShort();if(tableVersion===0){return parseWindowsKernTable(p)}else if(tableVersion===1){return parseMacKernTable(p)}else{throw new Error("Unsupported kern table version ("+tableVersion+").")}}var kern={parse:parseKernTable};function parseLocaTable(data,start,numGlyphs,shortVersion){var p=new parse.Parser(data,start);var parseFn=shortVersion?p.parseUShort:p.parseULong;var glyphOffsets=[];for(var i=0;i<numGlyphs+1;i+=1){var glyphOffset=parseFn.call(p);if(shortVersion){glyphOffset*=2}glyphOffsets.push(glyphOffset)}return glyphOffsets}var loca={parse:parseLocaTable};function loadFromFile(path,callback){var fs=require("fs");fs.readFile(path,function(err,buffer){if(err){return callback(err.message)}callback(null,nodeBufferToArrayBuffer(buffer))})}function loadFromUrl(url,callback){var request=new XMLHttpRequest;request.open("get",url,true);request.responseType="arraybuffer";request.onload=function(){if(request.response){return callback(null,request.response)}else{return callback("Font could not be loaded: "+request.statusText)}};request.onerror=function(){callback("Font could not be loaded")};request.send()}function parseOpenTypeTableEntries(data,numTables){var tableEntries=[];var p=12;for(var i=0;i<numTables;i+=1){var tag=parse.getTag(data,p);var checksum=parse.getULong(data,p+4);var offset=parse.getULong(data,p+8);var length=parse.getULong(data,p+12);tableEntries.push({tag:tag,checksum:checksum,offset:offset,length:length,compression:false});p+=16}return tableEntries}function parseWOFFTableEntries(data,numTables){var tableEntries=[];var p=44;for(var i=0;i<numTables;i+=1){var tag=parse.getTag(data,p);var offset=parse.getULong(data,p+4);var compLength=parse.getULong(data,p+8);var origLength=parse.getULong(data,p+12);var compression=void 0;if(compLength<origLength){compression="WOFF"}else{compression=false}tableEntries.push({tag:tag,offset:offset,compression:compression,compressedLength:compLength,length:origLength});p+=20}return tableEntries}function uncompressTable(data,tableEntry){if(tableEntry.compression==="WOFF"){var inBuffer=new Uint8Array(data.buffer,tableEntry.offset+2,tableEntry.compressedLength-2);var outBuffer=new Uint8Array(tableEntry.length);tinyInflate(inBuffer,outBuffer);if(outBuffer.byteLength!==tableEntry.length){throw new Error("Decompression error: "+tableEntry.tag+" decompressed length doesn't match recorded length")}var view=new DataView(outBuffer.buffer,0);return{data:view,offset:0}}else{return{data:data,offset:tableEntry.offset}}}function parseBuffer(buffer){var indexToLocFormat;var ltagTable;var font=new Font({empty:true});var data=new DataView(buffer,0);var numTables;var tableEntries=[];var signature=parse.getTag(data,0);if(signature===String.fromCharCode(0,1,0,0)||signature==="true"||signature==="typ1"){font.outlinesFormat="truetype";numTables=parse.getUShort(data,4);tableEntries=parseOpenTypeTableEntries(data,numTables)}else if(signature==="OTTO"){font.outlinesFormat="cff";numTables=parse.getUShort(data,4);tableEntries=parseOpenTypeTableEntries(data,numTables)}else if(signature==="wOFF"){var flavor=parse.getTag(data,4);if(flavor===String.fromCharCode(0,1,0,0)){font.outlinesFormat="truetype"}else if(flavor==="OTTO"){font.outlinesFormat="cff"}else{throw new Error("Unsupported OpenType flavor "+signature)}numTables=parse.getUShort(data,12);tableEntries=parseWOFFTableEntries(data,numTables)}else{throw new Error("Unsupported OpenType signature "+signature)}var cffTableEntry;var fvarTableEntry;var glyfTableEntry;var gposTableEntry;var gsubTableEntry;var hmtxTableEntry;var kernTableEntry;var locaTableEntry;var nameTableEntry;var metaTableEntry;var p;for(var i=0;i<numTables;i+=1){var tableEntry=tableEntries[i];var table=void 0;switch(tableEntry.tag){case"cmap":table=uncompressTable(data,tableEntry);font.tables.cmap=cmap.parse(table.data,table.offset);font.encoding=new CmapEncoding(font.tables.cmap);break;case"cvt ":table=uncompressTable(data,tableEntry);p=new parse.Parser(table.data,table.offset);font.tables.cvt=p.parseShortList(tableEntry.length/2);break;case"fvar":fvarTableEntry=tableEntry;break;case"fpgm":table=uncompressTable(data,tableEntry);p=new parse.Parser(table.data,table.offset);font.tables.fpgm=p.parseByteList(tableEntry.length);break;case"head":table=uncompressTable(data,tableEntry);font.tables.head=head.parse(table.data,table.offset);font.unitsPerEm=font.tables.head.unitsPerEm;indexToLocFormat=font.tables.head.indexToLocFormat;break;case"hhea":table=uncompressTable(data,tableEntry);font.tables.hhea=hhea.parse(table.data,table.offset);font.ascender=font.tables.hhea.ascender;font.descender=font.tables.hhea.descender;font.numberOfHMetrics=font.tables.hhea.numberOfHMetrics;break;case"hmtx":hmtxTableEntry=tableEntry;break;case"ltag":table=uncompressTable(data,tableEntry);ltagTable=ltag.parse(table.data,table.offset);break;case"maxp":table=uncompressTable(data,tableEntry);font.tables.maxp=maxp.parse(table.data,table.offset);font.numGlyphs=font.tables.maxp.numGlyphs;break;case"name":nameTableEntry=tableEntry;break;case"OS/2":table=uncompressTable(data,tableEntry);font.tables.os2=os2.parse(table.data,table.offset);break;case"post":table=uncompressTable(data,tableEntry);font.tables.post=post.parse(table.data,table.offset);font.glyphNames=new GlyphNames(font.tables.post);break;case"prep":table=uncompressTable(data,tableEntry);p=new parse.Parser(table.data,table.offset);font.tables.prep=p.parseByteList(tableEntry.length);break;case"glyf":glyfTableEntry=tableEntry;break;case"loca":locaTableEntry=tableEntry;break;case"CFF ":cffTableEntry=tableEntry;break;case"kern":kernTableEntry=tableEntry;break;case"GPOS":gposTableEntry=tableEntry;break;case"GSUB":gsubTableEntry=tableEntry;break;case"meta":metaTableEntry=tableEntry;break}}var nameTable=uncompressTable(data,nameTableEntry);font.tables.name=_name.parse(nameTable.data,nameTable.offset,ltagTable);font.names=font.tables.name;if(glyfTableEntry&&locaTableEntry){var shortVersion=indexToLocFormat===0;var locaTable=uncompressTable(data,locaTableEntry);var locaOffsets=loca.parse(locaTable.data,locaTable.offset,font.numGlyphs,shortVersion);var glyfTable=uncompressTable(data,glyfTableEntry);font.glyphs=glyf.parse(glyfTable.data,glyfTable.offset,locaOffsets,font)}else if(cffTableEntry){var cffTable=uncompressTable(data,cffTableEntry);cff.parse(cffTable.data,cffTable.offset,font)}else{throw new Error("Font doesn't contain TrueType or CFF outlines.")}var hmtxTable=uncompressTable(data,hmtxTableEntry);hmtx.parse(hmtxTable.data,hmtxTable.offset,font.numberOfHMetrics,font.numGlyphs,font.glyphs);addGlyphNames(font);if(kernTableEntry){var kernTable=uncompressTable(data,kernTableEntry);font.kerningPairs=kern.parse(kernTable.data,kernTable.offset)}else{font.kerningPairs={}}if(gposTableEntry){var gposTable=uncompressTable(data,gposTableEntry);font.tables.gpos=gpos.parse(gposTable.data,gposTable.offset);font.position.init()}if(gsubTableEntry){var gsubTable=uncompressTable(data,gsubTableEntry);font.tables.gsub=gsub.parse(gsubTable.data,gsubTable.offset)}if(fvarTableEntry){var fvarTable=uncompressTable(data,fvarTableEntry);font.tables.fvar=fvar.parse(fvarTable.data,fvarTable.offset,font.names)}if(metaTableEntry){var metaTable=uncompressTable(data,metaTableEntry);font.tables.meta=meta.parse(metaTable.data,metaTable.offset);font.metas=font.tables.meta}return font}function load(url,callback){var isNode$$1=typeof window==="undefined";var loadFn=isNode$$1?loadFromFile:loadFromUrl;loadFn(url,function(err,arrayBuffer){if(err){return callback(err)}var font;try{font=parseBuffer(arrayBuffer)}catch(e){return callback(e,null)}return callback(null,font)})}function loadSync(url){var fs=require("fs");var buffer=fs.readFileSync(url);return parseBuffer(nodeBufferToArrayBuffer(buffer))}exports.Font=Font;exports.Glyph=Glyph;exports.Path=Path;exports.BoundingBox=BoundingBox;exports._parse=parse;exports.parse=parseBuffer;exports.load=load;exports.loadSync=loadSync;Object.defineProperty(exports,"__esModule",{value:true})})}).call(this,require("buffer").Buffer)},{buffer:13,fs:12}],6:[function(require,module,exports){"use strict";const SymbolTreeNode=require("./SymbolTreeNode");const TreePosition=require("./TreePosition");const TreeIterator=require("./TreeIterator");function returnTrue(){return true}function reverseArrayIndex(array,reverseIndex){return array[array.length-1-reverseIndex]}class SymbolTree{constructor(description){this.symbol=Symbol(description||"SymbolTree data")}initialize(object){this._node(object);return object}_node(object){if(!object){return null}const node=object[this.symbol];if(node){return node}return object[this.symbol]=new SymbolTreeNode}hasChildren(object){return this._node(object).hasChildren}firstChild(object){return this._node(object).firstChild}lastChild(object){return this._node(object).lastChild}previousSibling(object){return this._node(object).previousSibling}nextSibling(object){return this._node(object).nextSibling}parent(object){return this._node(object).parent}lastInclusiveDescendant(object){let lastChild;let current=object;while(lastChild=this._node(current).lastChild){current=lastChild}return current}preceding(object,options){const treeRoot=options&&options.root;if(object===treeRoot){return null}const previousSibling=this._node(object).previousSibling;if(previousSibling){return this.lastInclusiveDescendant(previousSibling)}return this._node(object).parent}following(object,options){const treeRoot=options&&options.root;const skipChildren=options&&options.skipChildren;const firstChild=!skipChildren&&this._node(object).firstChild;if(firstChild){return firstChild}let current=object;do{if(current===treeRoot){return null}const nextSibling=this._node(current).nextSibling;if(nextSibling){return nextSibling}current=this._node(current).parent}while(current);return null}childrenToArray(parent,options){const array=options&&options.array||[];const filter=options&&options.filter||returnTrue;const thisArg=options&&options.thisArg||undefined;const parentNode=this._node(parent);let object=parentNode.firstChild;let index=0;while(object){const node=this._node(object);node.setCachedIndex(parentNode,index);if(filter.call(thisArg,object)){array.push(object)}object=node.nextSibling;++index}return array}ancestorsToArray(object,options){const array=options&&options.array||[];const filter=options&&options.filter||returnTrue;const thisArg=options&&options.thisArg||undefined;let ancestor=object;while(ancestor){if(filter.call(thisArg,ancestor)){array.push(ancestor)}ancestor=this._node(ancestor).parent}return array}treeToArray(root,options){const array=options&&options.array||[];const filter=options&&options.filter||returnTrue;const thisArg=options&&options.thisArg||undefined;let object=root;while(object){if(filter.call(thisArg,object)){array.push(object)}object=this.following(object,{root:root})}return array}childrenIterator(parent,options){const reverse=options&&options.reverse;const parentNode=this._node(parent);return new TreeIterator(this,parent,reverse?parentNode.lastChild:parentNode.firstChild,reverse?TreeIterator.PREV:TreeIterator.NEXT)}previousSiblingsIterator(object){return new TreeIterator(this,object,this._node(object).previousSibling,TreeIterator.PREV)}nextSiblingsIterator(object){return new TreeIterator(this,object,this._node(object).nextSibling,TreeIterator.NEXT)}ancestorsIterator(object){return new TreeIterator(this,object,object,TreeIterator.PARENT)}treeIterator(root,options){const reverse=options&&options.reverse;return new TreeIterator(this,root,reverse?this.lastInclusiveDescendant(root):root,reverse?TreeIterator.PRECEDING:TreeIterator.FOLLOWING)}index(child){const childNode=this._node(child);const parentNode=this._node(childNode.parent);if(!parentNode){return-1}let currentIndex=childNode.getCachedIndex(parentNode);if(currentIndex>=0){return currentIndex}currentIndex=0;let object=parentNode.firstChild;if(parentNode.childIndexCachedUpTo){const cachedUpToNode=this._node(parentNode.childIndexCachedUpTo);object=cachedUpToNode.nextSibling;currentIndex=cachedUpToNode.getCachedIndex(parentNode)+1}while(object){const node=this._node(object);node.setCachedIndex(parentNode,currentIndex);if(object===child){break}++currentIndex;object=node.nextSibling}parentNode.childIndexCachedUpTo=child;return currentIndex}childrenCount(parent){const parentNode=this._node(parent);if(!parentNode.lastChild){return 0}return this.index(parentNode.lastChild)+1}compareTreePosition(left,right){if(left===right){return 0}const leftAncestors=[];{let leftAncestor=left;while(leftAncestor){if(leftAncestor===right){return TreePosition.CONTAINS|TreePosition.PRECEDING}leftAncestors.push(leftAncestor);leftAncestor=this.parent(leftAncestor)}}const rightAncestors=[];{let rightAncestor=right;while(rightAncestor){if(rightAncestor===left){return TreePosition.CONTAINED_BY|TreePosition.FOLLOWING}rightAncestors.push(rightAncestor);rightAncestor=this.parent(rightAncestor)}}const root=reverseArrayIndex(leftAncestors,0);if(!root||root!==reverseArrayIndex(rightAncestors,0)){return TreePosition.DISCONNECTED}let commonAncestorIndex=0;const ancestorsMinLength=Math.min(leftAncestors.length,rightAncestors.length);for(let i=0;i<ancestorsMinLength;++i){const leftAncestor=reverseArrayIndex(leftAncestors,i);const rightAncestor=reverseArrayIndex(rightAncestors,i);if(leftAncestor!==rightAncestor){break}commonAncestorIndex=i}const leftIndex=this.index(reverseArrayIndex(leftAncestors,commonAncestorIndex+1));const rightIndex=this.index(reverseArrayIndex(rightAncestors,commonAncestorIndex+1));return rightIndex<leftIndex?TreePosition.PRECEDING:TreePosition.FOLLOWING}remove(removeObject){const removeNode=this._node(removeObject);const parentNode=this._node(removeNode.parent);const prevNode=this._node(removeNode.previousSibling);const nextNode=this._node(removeNode.nextSibling);if(parentNode){if(parentNode.firstChild===removeObject){parentNode.firstChild=removeNode.nextSibling}if(parentNode.lastChild===removeObject){parentNode.lastChild=removeNode.previousSibling}}if(prevNode){prevNode.nextSibling=removeNode.nextSibling}if(nextNode){nextNode.previousSibling=removeNode.previousSibling}removeNode.parent=null;removeNode.previousSibling=null;removeNode.nextSibling=null;if(parentNode){parentNode.childrenChanged()}return removeObject}insertBefore(referenceObject,newObject){const referenceNode=this._node(referenceObject);const prevNode=this._node(referenceNode.previousSibling);const newNode=this._node(newObject);const parentNode=this._node(referenceNode.parent);if(newNode.isAttached){throw Error("Given object is already present in this SymbolTree, remove it first")}newNode.parent=referenceNode.parent;newNode.previousSibling=referenceNode.previousSibling;newNode.nextSibling=referenceObject;referenceNode.previousSibling=newObject;if(prevNode){prevNode.nextSibling=newObject}if(parentNode&&parentNode.firstChild===referenceObject){parentNode.firstChild=newObject}if(parentNode){parentNode.childrenChanged()}return newObject}insertAfter(referenceObject,newObject){const referenceNode=this._node(referenceObject);const nextNode=this._node(referenceNode.nextSibling);const newNode=this._node(newObject);const parentNode=this._node(referenceNode.parent);if(newNode.isAttached){throw Error("Given object is already present in this SymbolTree, remove it first")}newNode.parent=referenceNode.parent;newNode.previousSibling=referenceObject;newNode.nextSibling=referenceNode.nextSibling;referenceNode.nextSibling=newObject;if(nextNode){nextNode.previousSibling=newObject}if(parentNode&&parentNode.lastChild===referenceObject){parentNode.lastChild=newObject}if(parentNode){parentNode.childrenChanged()}return newObject}prependChild(referenceObject,newObject){const referenceNode=this._node(referenceObject);const newNode=this._node(newObject);if(newNode.isAttached){throw Error("Given object is already present in this SymbolTree, remove it first")}if(referenceNode.hasChildren){this.insertBefore(referenceNode.firstChild,newObject)}else{newNode.parent=referenceObject;referenceNode.firstChild=newObject;referenceNode.lastChild=newObject;referenceNode.childrenChanged()}return newObject}appendChild(referenceObject,newObject){const referenceNode=this._node(referenceObject);const newNode=this._node(newObject);if(newNode.isAttached){throw Error("Given object is already present in this SymbolTree, remove it first")}if(referenceNode.hasChildren){this.insertAfter(referenceNode.lastChild,newObject)}else{newNode.parent=referenceObject;referenceNode.firstChild=newObject;referenceNode.lastChild=newObject;referenceNode.childrenChanged()}return newObject}}module.exports=SymbolTree;SymbolTree.TreePosition=TreePosition},{"./SymbolTreeNode":7,"./TreeIterator":8,"./TreePosition":9}],7:[function(require,module,exports){"use strict";module.exports=class SymbolTreeNode{constructor(){this.parent=null;this.previousSibling=null;this.nextSibling=null;this.firstChild=null;this.lastChild=null;this.childrenVersion=0;this.childIndexCachedUpTo=null;this.cachedIndex=-1;this.cachedIndexVersion=NaN}get isAttached(){return Boolean(this.parent||this.previousSibling||this.nextSibling)}get hasChildren(){return Boolean(this.firstChild)}childrenChanged(){this.childrenVersion=this.childrenVersion+1&4294967295;this.childIndexCachedUpTo=null}getCachedIndex(parentNode){if(this.cachedIndexVersion!==parentNode.childrenVersion){this.cachedIndexVersion=NaN;return-1}return this.cachedIndex}setCachedIndex(parentNode,index){this.cachedIndexVersion=parentNode.childrenVersion;this.cachedIndex=index}}},{}],8:[function(require,module,exports){"use strict";const TREE=Symbol();const ROOT=Symbol();const NEXT=Symbol();const ITERATE_FUNC=Symbol();class TreeIterator{constructor(tree,root,firstResult,iterateFunction){this[TREE]=tree;this[ROOT]=root;this[NEXT]=firstResult;this[ITERATE_FUNC]=iterateFunction}next(){const tree=this[TREE];const iterateFunc=this[ITERATE_FUNC];const root=this[ROOT];if(!this[NEXT]){return{done:true,value:root}}const value=this[NEXT];if(iterateFunc===1){this[NEXT]=tree._node(value).previousSibling}else if(iterateFunc===2){this[NEXT]=tree._node(value).nextSibling}else if(iterateFunc===3){this[NEXT]=tree._node(value).parent}else if(iterateFunc===4){this[NEXT]=tree.preceding(value,{root:root})}else{this[NEXT]=tree.following(value,{root:root})}return{done:false,value:value}}}Object.defineProperty(TreeIterator.prototype,Symbol.iterator,{value:function(){return this},writable:false});TreeIterator.PREV=1;TreeIterator.NEXT=2;TreeIterator.PARENT=3;TreeIterator.PRECEDING=4;TreeIterator.FOLLOWING=5;Object.freeze(TreeIterator);Object.freeze(TreeIterator.prototype);module.exports=TreeIterator},{}],9:[function(require,module,exports){"use strict";module.exports=Object.freeze({DISCONNECTED:1,PRECEDING:2,FOLLOWING:4,CONTAINS:8,CONTAINED_BY:16})},{}],10:[function(require,module,exports){const ot=require("opentype.js");const Tree=require("symbol-tree");const{hasPointInside:hasPointInside}=require("@jscad/csg/src/core/utils/cagValidation");const pointInCAG=hasPointInside;function myCurl(url){console.log("curl: "+url);console.log("self");console.log(self);console.log("self.location");console.log(self.location);url=self.location?new URL(url,self.location.origin).toString():url;return new Promise((resolve,reject)=>{var xhttp=new XMLHttpRequest;xhttp.onreadystatechange=function(){if(this.readyState==4&&this.status==200){resolve(xhttp.response)}else if(this.readyState==4){throw new Error(`Error getting ${url} (Http Error: ${this.status}`)}};xhttp.open("GET",url,true);xhttp.responseType="arraybuffer";xhttp.send()})}const load=fontFileName=>{return myCurl(fontFileName).then(fontData=>{return new Promise((resolve,reject)=>{const font=ot.parse(fontData);resolve(font)})})};const parse=fontData=>{return ot.parse(fontData)};const cagFromString=(font,str,size,options)=>{console.log("typeof str:");console.log(typeof str);if(typeof str==="undefined"||str.length<1){throw new Error("Font3D.cagFromString needs string as 2nd parameter")}const fp=font.getPath(str,0,0,size);let csgPath=[];let np;for(let i=0;i<fp.commands.length;i+=1){const cmd=fp.commands[i];console.log("cmd: "+cmd);switch(cmd.type){case"M":np=new CSG.Path2D;np=np.appendPoint([cmd.x,-cmd.y]);break;case"Z":np=np.close();csgPath.push(np);break;case"L":np=np.appendPoint([cmd.x,-cmd.y]);break;case"Q":np=np.appendBezier([[cmd.x1,-cmd.y1],[cmd.x,-cmd.y]]);break}}return _makeCAGS(csgPath)};const rawCagsFromGlyph=(font,glyphIndex,size,options)=>{console.log("cagFromGlyph");console.log(`glyphIndex: ${glyphIndex}`);const fp=font.glyphs.get(glyphIndex).getPath(0,0,size,options);let csgPath=[];let np;let gotEnd=true;for(let i=0;i<fp.commands.length;i+=1){const cmd=fp.commands[i];switch(cmd.type){case"M":if(!gotEnd){console.log("########### unclosed path ############")}gotEnd=false;np=new CSG.Path2D;np=np.appendPoint([cmd.x,-cmd.y]);break;case"Z":gotEnd=true;np=np.close();csgPath.push(np);break;case"L":np=np.appendPoint([cmd.x,-cmd.y]);break;case"C":np=np.appendBezier([[cmd.x1,-cmd.y1],[cmd.x2,-cmd.y2],[cmd.x,-cmd.y]],{resolution:30});break;case"Q":np=np.appendBezier([[cmd.x1,-cmd.y1],[cmd.x,-cmd.y]],{resolution:30});break}}let ii=0;return csgPath.map(p=>{try{let itc=p.innerToCAG();ii++;return itc}catch(e){console.log("skipping path... it's intersecting");console.log(e);let res=[]}})};const makeCagTree=cags=>{const fitInTree=(branch,cag)=>{if(!cag){return branch}let p=cag.sides[0].vertex0.pos;for(el of branch){if(pointInCAG(el.cag,p)){fitInTree(el.children,cag);return branch}}branch.push({cag:cag,children:[]});return branch};let tree=[];for(cag of cags){tree=fitInTree(tree,cag)}return tree};const solidsFromCagTree=cagTree=>{const processChildren=(parentCag,depth)=>{let branch=parentCag.children;let res=[];for(cag of branch){if(cag.children.length>0){res.push(cag.cag.subtract(processChildren(cag,depth+1)))}else{res.push(cag.cag)}}if(res.length>0){return res[0].union(res)}else{return undefined}};let root={children:cagTree};let res=processChildren(root,0);return res};const cagFromGlyph=(font,glyphIndex,size,options)=>{const cags=rawCagsFromGlyph(font,glyphIndex,size,options);let tree=makeCagTree(cags);let solids=solidsFromCagTree(tree);return solids};const _makeCAGS=(path_array,options)=>{let fontCAGS=[];let volume=path_array[0].innerToCAG();for(let i=1;i<path_array.length;i++){if(pointInCAG(volume,path_array[i].points[0])){let nvolume=path_array[i].innerToCAG();volume=volume.subtract(nvolume)}else{fontCAGS.push(volume);volume=path_array[i].innerToCAG()}}fontCAGS.push(volume);return fontCAGS};const _makeCAGS2=(path_array,options)=>{let fontCAGS=[];let volume=path_array[0].innerToCAG();for(let i=1;i<path_array.length;i++){if(pointInCAG(volume,path_array[i].points[0])){let nvolume=path_array[i].innerToCAG();volume=volume.subtract(nvolume)}else{fontCAGS.push(volume);volume=path_array[i].innerToCAG()}}fontCAGS.push(volume);return fontCAGS};const Font3D={load:load,parse:parse,cagFromString:cagFromString,rawCagsFromGlyph:rawCagsFromGlyph,cagFromGlyph:cagFromGlyph};module.exports=Font3D},{"@jscad/csg/src/core/utils/cagValidation":4,"opentype.js":5,"symbol-tree":6}],11:[function(require,module,exports){"use strict";exports.byteLength=byteLength;exports.toByteArray=toByteArray;exports.fromByteArray=fromByteArray;var lookup=[];var revLookup=[];var Arr=typeof Uint8Array!=="undefined"?Uint8Array:Array;var code="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var i=0,len=code.length;i<len;++i){lookup[i]=code[i];revLookup[code.charCodeAt(i)]=i}revLookup["-".charCodeAt(0)]=62;revLookup["_".charCodeAt(0)]=63;function getLens(b64){var len=b64.length;if(len%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}var validLen=b64.indexOf("=");if(validLen===-1)validLen=len;var placeHoldersLen=validLen===len?0:4-validLen%4;return[validLen,placeHoldersLen]}function byteLength(b64){var lens=getLens(b64);var validLen=lens[0];var placeHoldersLen=lens[1];return(validLen+placeHoldersLen)*3/4-placeHoldersLen}function _byteLength(b64,validLen,placeHoldersLen){return(validLen+placeHoldersLen)*3/4-placeHoldersLen}function toByteArray(b64){var tmp;var lens=getLens(b64);var validLen=lens[0];var placeHoldersLen=lens[1];var arr=new Arr(_byteLength(b64,validLen,placeHoldersLen));var curByte=0;var len=placeHoldersLen>0?validLen-4:validLen;for(var i=0;i<len;i+=4){tmp=revLookup[b64.charCodeAt(i)]<<18|revLookup[b64.charCodeAt(i+1)]<<12|revLookup[b64.charCodeAt(i+2)]<<6|revLookup[b64.charCodeAt(i+3)];arr[curByte++]=tmp>>16&255;arr[curByte++]=tmp>>8&255;arr[curByte++]=tmp&255}if(placeHoldersLen===2){tmp=revLookup[b64.charCodeAt(i)]<<2|revLookup[b64.charCodeAt(i+1)]>>4;arr[curByte++]=tmp&255}if(placeHoldersLen===1){tmp=revLookup[b64.charCodeAt(i)]<<10|revLookup[b64.charCodeAt(i+1)]<<4|revLookup[b64.charCodeAt(i+2)]>>2;arr[curByte++]=tmp>>8&255;arr[curByte++]=tmp&255}return arr}function tripletToBase64(num){return lookup[num>>18&63]+lookup[num>>12&63]+lookup[num>>6&63]+lookup[num&63]}function encodeChunk(uint8,start,end){var tmp;var output=[];for(var i=start;i<end;i+=3){tmp=(uint8[i]<<16&16711680)+(uint8[i+1]<<8&65280)+(uint8[i+2]&255);output.push(tripletToBase64(tmp))}return output.join("")}function fromByteArray(uint8){var tmp;var len=uint8.length;var extraBytes=len%3;var parts=[];var maxChunkLength=16383;for(var i=0,len2=len-extraBytes;i<len2;i+=maxChunkLength){parts.push(encodeChunk(uint8,i,i+maxChunkLength>len2?len2:i+maxChunkLength))}if(extraBytes===1){tmp=uint8[len-1];parts.push(lookup[tmp>>2]+lookup[tmp<<4&63]+"==")}else if(extraBytes===2){tmp=(uint8[len-2]<<8)+uint8[len-1];parts.push(lookup[tmp>>10]+lookup[tmp>>4&63]+lookup[tmp<<2&63]+"=")}return parts.join("")}},{}],12:[function(require,module,exports){},{}],13:[function(require,module,exports){"use strict";var base64=require("base64-js");var ieee754=require("ieee754");exports.Buffer=Buffer;exports.SlowBuffer=SlowBuffer;exports.INSPECT_MAX_BYTES=50;var K_MAX_LENGTH=2147483647;exports.kMaxLength=K_MAX_LENGTH;Buffer.TYPED_ARRAY_SUPPORT=typedArraySupport();if(!Buffer.TYPED_ARRAY_SUPPORT&&typeof console!=="undefined"&&typeof console.error==="function"){console.error("This browser lacks typed array (Uint8Array) support which is required by "+"`buffer` v5.x. Use `buffer` v4.x if you require old browser support.")}function typedArraySupport(){try{var arr=new Uint8Array(1);arr.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}};return arr.foo()===42}catch(e){return false}}Object.defineProperty(Buffer.prototype,"parent",{enumerable:true,get:function(){if(!Buffer.isBuffer(this))return undefined;return this.buffer}});Object.defineProperty(Buffer.prototype,"offset",{enumerable:true,get:function(){if(!Buffer.isBuffer(this))return undefined;return this.byteOffset}});function createBuffer(length){if(length>K_MAX_LENGTH){throw new RangeError('The value "'+length+'" is invalid for option "size"')}var buf=new Uint8Array(length);buf.__proto__=Buffer.prototype;return buf}function Buffer(arg,encodingOrOffset,length){if(typeof arg==="number"){if(typeof encodingOrOffset==="string"){throw new TypeError('The "string" argument must be of type string. Received type number')}return allocUnsafe(arg)}return from(arg,encodingOrOffset,length)}if(typeof Symbol!=="undefined"&&Symbol.species!=null&&Buffer[Symbol.species]===Buffer){Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:true,enumerable:false,writable:false})}Buffer.poolSize=8192;function from(value,encodingOrOffset,length){if(typeof value==="string"){return fromString(value,encodingOrOffset)}if(ArrayBuffer.isView(value)){return fromArrayLike(value)}if(value==null){throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, "+"or Array-like Object. Received type "+typeof value)}if(isInstance(value,ArrayBuffer)||value&&isInstance(value.buffer,ArrayBuffer)){return fromArrayBuffer(value,encodingOrOffset,length)}if(typeof value==="number"){throw new TypeError('The "value" argument must not be of type number. Received type number')}var valueOf=value.valueOf&&value.valueOf();if(valueOf!=null&&valueOf!==value){return Buffer.from(valueOf,encodingOrOffset,length)}var b=fromObject(value);if(b)return b;if(typeof Symbol!=="undefined"&&Symbol.toPrimitive!=null&&typeof value[Symbol.toPrimitive]==="function"){return Buffer.from(value[Symbol.toPrimitive]("string"),encodingOrOffset,length)}throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, "+"or Array-like Object. Received type "+typeof value)}Buffer.from=function(value,encodingOrOffset,length){return from(value,encodingOrOffset,length)};Buffer.prototype.__proto__=Uint8Array.prototype;Buffer.__proto__=Uint8Array;function assertSize(size){if(typeof size!=="number"){throw new TypeError('"size" argument must be of type number')}else if(size<0){throw new RangeError('The value "'+size+'" is invalid for option "size"')}}function alloc(size,fill,encoding){assertSize(size);if(size<=0){return createBuffer(size)}if(fill!==undefined){return typeof encoding==="string"?createBuffer(size).fill(fill,encoding):createBuffer(size).fill(fill)}return createBuffer(size)}Buffer.alloc=function(size,fill,encoding){return alloc(size,fill,encoding)};function allocUnsafe(size){assertSize(size);return createBuffer(size<0?0:checked(size)|0)}Buffer.allocUnsafe=function(size){return allocUnsafe(size)};Buffer.allocUnsafeSlow=function(size){return allocUnsafe(size)};function fromString(string,encoding){if(typeof encoding!=="string"||encoding===""){encoding="utf8"}if(!Buffer.isEncoding(encoding)){throw new TypeError("Unknown encoding: "+encoding)}var length=byteLength(string,encoding)|0;var buf=createBuffer(length);var actual=buf.write(string,encoding);if(actual!==length){buf=buf.slice(0,actual)}return buf}function fromArrayLike(array){var length=array.length<0?0:checked(array.length)|0;var buf=createBuffer(length);for(var i=0;i<length;i+=1){buf[i]=array[i]&255}return buf}function fromArrayBuffer(array,byteOffset,length){if(byteOffset<0||array.byteLength<byteOffset){throw new RangeError('"offset" is outside of buffer bounds')}if(array.byteLength<byteOffset+(length||0)){throw new RangeError('"length" is outside of buffer bounds')}var buf;if(byteOffset===undefined&&length===undefined){buf=new Uint8Array(array)}else if(length===undefined){buf=new Uint8Array(array,byteOffset)}else{buf=new Uint8Array(array,byteOffset,length)}buf.__proto__=Buffer.prototype;return buf}function fromObject(obj){if(Buffer.isBuffer(obj)){var len=checked(obj.length)|0;var buf=createBuffer(len);if(buf.length===0){return buf}obj.copy(buf,0,0,len);return buf}if(obj.length!==undefined){if(typeof obj.length!=="number"||numberIsNaN(obj.length)){return createBuffer(0)}return fromArrayLike(obj)}if(obj.type==="Buffer"&&Array.isArray(obj.data)){return fromArrayLike(obj.data)}}function checked(length){if(length>=K_MAX_LENGTH){throw new RangeError("Attempt to allocate Buffer larger than maximum "+"size: 0x"+K_MAX_LENGTH.toString(16)+" bytes")}return length|0}function SlowBuffer(length){if(+length!=length){length=0}return Buffer.alloc(+length)}Buffer.isBuffer=function isBuffer(b){return b!=null&&b._isBuffer===true&&b!==Buffer.prototype};Buffer.compare=function compare(a,b){if(isInstance(a,Uint8Array))a=Buffer.from(a,a.offset,a.byteLength);if(isInstance(b,Uint8Array))b=Buffer.from(b,b.offset,b.byteLength);if(!Buffer.isBuffer(a)||!Buffer.isBuffer(b)){throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array')}if(a===b)return 0;var x=a.length;var y=b.length;for(var i=0,len=Math.min(x,y);i<len;++i){if(a[i]!==b[i]){x=a[i];y=b[i];break}}if(x<y)return-1;if(y<x)return 1;return 0};Buffer.isEncoding=function isEncoding(encoding){switch(String(encoding).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return true;default:return false}};Buffer.concat=function concat(list,length){if(!Array.isArray(list)){throw new TypeError('"list" argument must be an Array of Buffers')}if(list.length===0){return Buffer.alloc(0)}var i;if(length===undefined){length=0;for(i=0;i<list.length;++i){length+=list[i].length}}var buffer=Buffer.allocUnsafe(length);var pos=0;for(i=0;i<list.length;++i){var buf=list[i];if(isInstance(buf,Uint8Array)){buf=Buffer.from(buf)}if(!Buffer.isBuffer(buf)){throw new TypeError('"list" argument must be an Array of Buffers')}buf.copy(buffer,pos);pos+=buf.length}return buffer};function byteLength(string,encoding){if(Buffer.isBuffer(string)){return string.length}if(ArrayBuffer.isView(string)||isInstance(string,ArrayBuffer)){return string.byteLength}if(typeof string!=="string"){throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. '+"Received type "+typeof string)}var len=string.length;var mustMatch=arguments.length>2&&arguments[2]===true;if(!mustMatch&&len===0)return 0;var loweredCase=false;for(;;){switch(encoding){case"ascii":case"latin1":case"binary":return len;case"utf8":case"utf-8":return utf8ToBytes(string).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return len*2;case"hex":return len>>>1;case"base64":return base64ToBytes(string).length;default:if(loweredCase){return mustMatch?-1:utf8ToBytes(string).length}encoding=(""+encoding).toLowerCase();loweredCase=true}}}Buffer.byteLength=byteLength;function slowToString(encoding,start,end){var loweredCase=false;if(start===undefined||start<0){start=0}if(start>this.length){return""}if(end===undefined||end>this.length){end=this.length}if(end<=0){return""}end>>>=0;start>>>=0;if(end<=start){return""}if(!encoding)encoding="utf8";while(true){switch(encoding){case"hex":return hexSlice(this,start,end);case"utf8":case"utf-8":return utf8Slice(this,start,end);case"ascii":return asciiSlice(this,start,end);case"latin1":case"binary":return latin1Slice(this,start,end);case"base64":return base64Slice(this,start,end);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return utf16leSlice(this,start,end);default:if(loweredCase)throw new TypeError("Unknown encoding: "+encoding);encoding=(encoding+"").toLowerCase();loweredCase=true}}}Buffer.prototype._isBuffer=true;function swap(b,n,m){var i=b[n];b[n]=b[m];b[m]=i}Buffer.prototype.swap16=function swap16(){var len=this.length;if(len%2!==0){throw new RangeError("Buffer size must be a multiple of 16-bits")}for(var i=0;i<len;i+=2){swap(this,i,i+1)}return this};Buffer.prototype.swap32=function swap32(){var len=this.length;if(len%4!==0){throw new RangeError("Buffer size must be a multiple of 32-bits")}for(var i=0;i<len;i+=4){swap(this,i,i+3);swap(this,i+1,i+2)}return this};Buffer.prototype.swap64=function swap64(){var len=this.length;if(len%8!==0){throw new RangeError("Buffer size must be a multiple of 64-bits")}for(var i=0;i<len;i+=8){swap(this,i,i+7);swap(this,i+1,i+6);swap(this,i+2,i+5);swap(this,i+3,i+4)}return this};Buffer.prototype.toString=function toString(){var length=this.length;if(length===0)return"";if(arguments.length===0)return utf8Slice(this,0,length);return slowToString.apply(this,arguments)};Buffer.prototype.toLocaleString=Buffer.prototype.toString;Buffer.prototype.equals=function equals(b){if(!Buffer.isBuffer(b))throw new TypeError("Argument must be a Buffer");if(this===b)return true;return Buffer.compare(this,b)===0};Buffer.prototype.inspect=function inspect(){var str="";var max=exports.INSPECT_MAX_BYTES;str=this.toString("hex",0,max).replace(/(.{2})/g,"$1 ").trim();if(this.length>max)str+=" ... ";return"<Buffer "+str+">"};Buffer.prototype.compare=function compare(target,start,end,thisStart,thisEnd){if(isInstance(target,Uint8Array)){target=Buffer.from(target,target.offset,target.byteLength)}if(!Buffer.isBuffer(target)){throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. '+"Received type "+typeof target)}if(start===undefined){start=0}if(end===undefined){end=target?target.length:0}if(thisStart===undefined){thisStart=0}if(thisEnd===undefined){thisEnd=this.length}if(start<0||end>target.length||thisStart<0||thisEnd>this.length){throw new RangeError("out of range index")}if(thisStart>=thisEnd&&start>=end){return 0}if(thisStart>=thisEnd){return-1}if(start>=end){return 1}start>>>=0;end>>>=0;thisStart>>>=0;thisEnd>>>=0;if(this===target)return 0;var x=thisEnd-thisStart;var y=end-start;var len=Math.min(x,y);var thisCopy=this.slice(thisStart,thisEnd);var targetCopy=target.slice(start,end);for(var i=0;i<len;++i){if(thisCopy[i]!==targetCopy[i]){x=thisCopy[i];y=targetCopy[i];break}}if(x<y)return-1;if(y<x)return 1;return 0};function bidirectionalIndexOf(buffer,val,byteOffset,encoding,dir){if(buffer.length===0)return-1;if(typeof byteOffset==="string"){encoding=byteOffset;byteOffset=0}else if(byteOffset>2147483647){byteOffset=2147483647}else if(byteOffset<-2147483648){byteOffset=-2147483648}byteOffset=+byteOffset;if(numberIsNaN(byteOffset)){byteOffset=dir?0:buffer.length-1}if(byteOffset<0)byteOffset=buffer.length+byteOffset;if(byteOffset>=buffer.length){if(dir)return-1;else byteOffset=buffer.length-1}else if(byteOffset<0){if(dir)byteOffset=0;else return-1}if(typeof val==="string"){val=Buffer.from(val,encoding)}if(Buffer.isBuffer(val)){if(val.length===0){return-1}return arrayIndexOf(buffer,val,byteOffset,encoding,dir)}else if(typeof val==="number"){val=val&255;if(typeof Uint8Array.prototype.indexOf==="function"){if(dir){return Uint8Array.prototype.indexOf.call(buffer,val,byteOffset)}else{return Uint8Array.prototype.lastIndexOf.call(buffer,val,byteOffset)}}return arrayIndexOf(buffer,[val],byteOffset,encoding,dir)}throw new TypeError("val must be string, number or Buffer")}function arrayIndexOf(arr,val,byteOffset,encoding,dir){var indexSize=1;var arrLength=arr.length;var valLength=val.length;if(encoding!==undefined){encoding=String(encoding).toLowerCase();if(encoding==="ucs2"||encoding==="ucs-2"||encoding==="utf16le"||encoding==="utf-16le"){if(arr.length<2||val.length<2){return-1}indexSize=2;arrLength/=2;valLength/=2;byteOffset/=2}}function read(buf,i){if(indexSize===1){return buf[i]}else{return buf.readUInt16BE(i*indexSize)}}var i;if(dir){var foundIndex=-1;for(i=byteOffset;i<arrLength;i++){if(read(arr,i)===read(val,foundIndex===-1?0:i-foundIndex)){if(foundIndex===-1)foundIndex=i;if(i-foundIndex+1===valLength)return foundIndex*indexSize}else{if(foundIndex!==-1)i-=i-foundIndex;foundIndex=-1}}}else{if(byteOffset+valLength>arrLength)byteOffset=arrLength-valLength;for(i=byteOffset;i>=0;i--){var found=true;for(var j=0;j<valLength;j++){if(read(arr,i+j)!==read(val,j)){found=false;break}}if(found)return i}}return-1}Buffer.prototype.includes=function includes(val,byteOffset,encoding){return this.indexOf(val,byteOffset,encoding)!==-1};Buffer.prototype.indexOf=function indexOf(val,byteOffset,encoding){return bidirectionalIndexOf(this,val,byteOffset,encoding,true)};Buffer.prototype.lastIndexOf=function lastIndexOf(val,byteOffset,encoding){return bidirectionalIndexOf(this,val,byteOffset,encoding,false)};function hexWrite(buf,string,offset,length){offset=Number(offset)||0;var remaining=buf.length-offset;if(!length){length=remaining}else{length=Number(length);if(length>remaining){length=remaining}}var strLen=string.length;if(length>strLen/2){length=strLen/2}for(var i=0;i<length;++i){var parsed=parseInt(string.substr(i*2,2),16);if(numberIsNaN(parsed))return i;buf[offset+i]=parsed}return i}function utf8Write(buf,string,offset,length){return blitBuffer(utf8ToBytes(string,buf.length-offset),buf,offset,length)}function asciiWrite(buf,string,offset,length){return blitBuffer(asciiToBytes(string),buf,offset,length)}function latin1Write(buf,string,offset,length){return asciiWrite(buf,string,offset,length)}function base64Write(buf,string,offset,length){return blitBuffer(base64ToBytes(string),buf,offset,length)}function ucs2Write(buf,string,offset,length){return blitBuffer(utf16leToBytes(string,buf.length-offset),buf,offset,length)}Buffer.prototype.write=function write(string,offset,length,encoding){if(offset===undefined){encoding="utf8";length=this.length;offset=0}else if(length===undefined&&typeof offset==="string"){encoding=offset;length=this.length;offset=0}else if(isFinite(offset)){offset=offset>>>0;if(isFinite(length)){length=length>>>0;if(encoding===undefined)encoding="utf8"}else{encoding=length;length=undefined}}else{throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported")}var remaining=this.length-offset;if(length===undefined||length>remaining)length=remaining;if(string.length>0&&(length<0||offset<0)||offset>this.length){throw new RangeError("Attempt to write outside buffer bounds")}if(!encoding)encoding="utf8";var loweredCase=false;for(;;){switch(encoding){case"hex":return hexWrite(this,string,offset,length);case"utf8":case"utf-8":return utf8Write(this,string,offset,length);case"ascii":return asciiWrite(this,string,offset,length);case"latin1":case"binary":return latin1Write(this,string,offset,length);case"base64":return base64Write(this,string,offset,length);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ucs2Write(this,string,offset,length);default:if(loweredCase)throw new TypeError("Unknown encoding: "+encoding);encoding=(""+encoding).toLowerCase();loweredCase=true}}};Buffer.prototype.toJSON=function toJSON(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function base64Slice(buf,start,end){if(start===0&&end===buf.length){return base64.fromByteArray(buf)}else{return base64.fromByteArray(buf.slice(start,end))}}function utf8Slice(buf,start,end){end=Math.min(buf.length,end);var res=[];var i=start;while(i<end){var firstByte=buf[i];var codePoint=null;var bytesPerSequence=firstByte>239?4:firstByte>223?3:firstByte>191?2:1;if(i+bytesPerSequence<=end){var secondByte,thirdByte,fourthByte,tempCodePoint;switch(bytesPerSequence){case 1:if(firstByte<128){codePoint=firstByte}break;case 2:secondByte=buf[i+1];if((secondByte&192)===128){tempCodePoint=(firstByte&31)<<6|secondByte&63;if(tempCodePoint>127){codePoint=tempCodePoint}}break;case 3:secondByte=buf[i+1];thirdByte=buf[i+2];if((secondByte&192)===128&&(thirdByte&192)===128){tempCodePoint=(firstByte&15)<<12|(secondByte&63)<<6|thirdByte&63;if(tempCodePoint>2047&&(tempCodePoint<55296||tempCodePoint>57343)){codePoint=tempCodePoint}}break;case 4:secondByte=buf[i+1];thirdByte=buf[i+2];fourthByte=buf[i+3];if((secondByte&192)===128&&(thirdByte&192)===128&&(fourthByte&192)===128){tempCodePoint=(firstByte&15)<<18|(secondByte&63)<<12|(thirdByte&63)<<6|fourthByte&63;if(tempCodePoint>65535&&tempCodePoint<1114112){codePoint=tempCodePoint}}}}if(codePoint===null){codePoint=65533;bytesPerSequence=1}else if(codePoint>65535){codePoint-=65536;res.push(codePoint>>>10&1023|55296);codePoint=56320|codePoint&1023}res.push(codePoint);i+=bytesPerSequence}return decodeCodePointsArray(res)}var MAX_ARGUMENTS_LENGTH=4096;function decodeCodePointsArray(codePoints){var len=codePoints.length;if(len<=MAX_ARGUMENTS_LENGTH){return String.fromCharCode.apply(String,codePoints)}var res="";var i=0;while(i<len){res+=String.fromCharCode.apply(String,codePoints.slice(i,i+=MAX_ARGUMENTS_LENGTH))}return res}function asciiSlice(buf,start,end){var ret="";end=Math.min(buf.length,end);for(var i=start;i<end;++i){ret+=String.fromCharCode(buf[i]&127)}return ret}function latin1Slice(buf,start,end){var ret="";end=Math.min(buf.length,end);for(var i=start;i<end;++i){ret+=String.fromCharCode(buf[i])}return ret}function hexSlice(buf,start,end){var len=buf.length;if(!start||start<0)start=0;if(!end||end<0||end>len)end=len;var out="";for(var i=start;i<end;++i){out+=toHex(buf[i])}return out}function utf16leSlice(buf,start,end){var bytes=buf.slice(start,end);var res="";for(var i=0;i<bytes.length;i+=2){res+=String.fromCharCode(bytes[i]+bytes[i+1]*256)}return res}Buffer.prototype.slice=function slice(start,end){var len=this.length;start=~~start;end=end===undefined?len:~~end;if(start<0){start+=len;if(start<0)start=0}else if(start>len){start=len}if(end<0){end+=len;if(end<0)end=0}else if(end>len){end=len}if(end<start)end=start;var newBuf=this.subarray(start,end);newBuf.__proto__=Buffer.prototype;return newBuf};function checkOffset(offset,ext,length){if(offset%1!==0||offset<0)throw new RangeError("offset is not uint");if(offset+ext>length)throw new RangeError("Trying to access beyond buffer length")}Buffer.prototype.readUIntLE=function readUIntLE(offset,byteLength,noAssert){offset=offset>>>0;byteLength=byteLength>>>0;if(!noAssert)checkOffset(offset,byteLength,this.length);var val=this[offset];var mul=1;var i=0;while(++i<byteLength&&(mul*=256)){val+=this[offset+i]*mul}return val};Buffer.prototype.readUIntBE=function readUIntBE(offset,byteLength,noAssert){offset=offset>>>0;byteLength=byteLength>>>0;if(!noAssert){checkOffset(offset,byteLength,this.length)}var val=this[offset+--byteLength];var mul=1;while(byteLength>0&&(mul*=256)){val+=this[offset+--byteLength]*mul}return val};Buffer.prototype.readUInt8=function readUInt8(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,1,this.length);return this[offset]};Buffer.prototype.readUInt16LE=function readUInt16LE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,2,this.length);return this[offset]|this[offset+1]<<8};Buffer.prototype.readUInt16BE=function readUInt16BE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,2,this.length);return this[offset]<<8|this[offset+1]};Buffer.prototype.readUInt32LE=function readUInt32LE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,4,this.length);return(this[offset]|this[offset+1]<<8|this[offset+2]<<16)+this[offset+3]*16777216};Buffer.prototype.readUInt32BE=function readUInt32BE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,4,this.length);return this[offset]*16777216+(this[offset+1]<<16|this[offset+2]<<8|this[offset+3])};Buffer.prototype.readIntLE=function readIntLE(offset,byteLength,noAssert){offset=offset>>>0;byteLength=byteLength>>>0;if(!noAssert)checkOffset(offset,byteLength,this.length);var val=this[offset];var mul=1;var i=0;while(++i<byteLength&&(mul*=256)){val+=this[offset+i]*mul}mul*=128;if(val>=mul)val-=Math.pow(2,8*byteLength);return val};Buffer.prototype.readIntBE=function readIntBE(offset,byteLength,noAssert){offset=offset>>>0;byteLength=byteLength>>>0;if(!noAssert)checkOffset(offset,byteLength,this.length);var i=byteLength;var mul=1;var val=this[offset+--i];while(i>0&&(mul*=256)){val+=this[offset+--i]*mul}mul*=128;if(val>=mul)val-=Math.pow(2,8*byteLength);return val};Buffer.prototype.readInt8=function readInt8(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,1,this.length);if(!(this[offset]&128))return this[offset];return(255-this[offset]+1)*-1};Buffer.prototype.readInt16LE=function readInt16LE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,2,this.length);var val=this[offset]|this[offset+1]<<8;return val&32768?val|4294901760:val};Buffer.prototype.readInt16BE=function readInt16BE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,2,this.length);var val=this[offset+1]|this[offset]<<8;return val&32768?val|4294901760:val};Buffer.prototype.readInt32LE=function readInt32LE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,4,this.length);return this[offset]|this[offset+1]<<8|this[offset+2]<<16|this[offset+3]<<24};Buffer.prototype.readInt32BE=function readInt32BE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,4,this.length);return this[offset]<<24|this[offset+1]<<16|this[offset+2]<<8|this[offset+3]};Buffer.prototype.readFloatLE=function readFloatLE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,4,this.length);return ieee754.read(this,offset,true,23,4)};Buffer.prototype.readFloatBE=function readFloatBE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,4,this.length);return ieee754.read(this,offset,false,23,4)};Buffer.prototype.readDoubleLE=function readDoubleLE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,8,this.length);return ieee754.read(this,offset,true,52,8)};Buffer.prototype.readDoubleBE=function readDoubleBE(offset,noAssert){offset=offset>>>0;if(!noAssert)checkOffset(offset,8,this.length);return ieee754.read(this,offset,false,52,8)};function checkInt(buf,value,offset,ext,max,min){if(!Buffer.isBuffer(buf))throw new TypeError('"buffer" argument must be a Buffer instance');if(value>max||value<min)throw new RangeError('"value" argument is out of bounds');if(offset+ext>buf.length)throw new RangeError("Index out of range")}Buffer.prototype.writeUIntLE=function writeUIntLE(value,offset,byteLength,noAssert){value=+value;offset=offset>>>0;byteLength=byteLength>>>0;if(!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1;checkInt(this,value,offset,byteLength,maxBytes,0)}var mul=1;var i=0;this[offset]=value&255;while(++i<byteLength&&(mul*=256)){this[offset+i]=value/mul&255}return offset+byteLength};Buffer.prototype.writeUIntBE=function writeUIntBE(value,offset,byteLength,noAssert){value=+value;offset=offset>>>0;byteLength=byteLength>>>0;if(!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1;checkInt(this,value,offset,byteLength,maxBytes,0)}var i=byteLength-1;var mul=1;this[offset+i]=value&255;while(--i>=0&&(mul*=256)){this[offset+i]=value/mul&255}return offset+byteLength};Buffer.prototype.writeUInt8=function writeUInt8(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,1,255,0);this[offset]=value&255;return offset+1};Buffer.prototype.writeUInt16LE=function writeUInt16LE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,2,65535,0);this[offset]=value&255;this[offset+1]=value>>>8;return offset+2};Buffer.prototype.writeUInt16BE=function writeUInt16BE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,2,65535,0);this[offset]=value>>>8;this[offset+1]=value&255;return offset+2};Buffer.prototype.writeUInt32LE=function writeUInt32LE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,4,4294967295,0);this[offset+3]=value>>>24;this[offset+2]=value>>>16;this[offset+1]=value>>>8;this[offset]=value&255;return offset+4};Buffer.prototype.writeUInt32BE=function writeUInt32BE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,4,4294967295,0);this[offset]=value>>>24;this[offset+1]=value>>>16;this[offset+2]=value>>>8;this[offset+3]=value&255;return offset+4};Buffer.prototype.writeIntLE=function writeIntLE(value,offset,byteLength,noAssert){value=+value;offset=offset>>>0;if(!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=0;var mul=1;var sub=0;this[offset]=value&255;while(++i<byteLength&&(mul*=256)){if(value<0&&sub===0&&this[offset+i-1]!==0){sub=1}this[offset+i]=(value/mul>>0)-sub&255}return offset+byteLength};Buffer.prototype.writeIntBE=function writeIntBE(value,offset,byteLength,noAssert){value=+value;offset=offset>>>0;if(!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=byteLength-1;var mul=1;var sub=0;this[offset+i]=value&255;while(--i>=0&&(mul*=256)){if(value<0&&sub===0&&this[offset+i+1]!==0){sub=1}this[offset+i]=(value/mul>>0)-sub&255}return offset+byteLength};Buffer.prototype.writeInt8=function writeInt8(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,1,127,-128);if(value<0)value=255+value+1;this[offset]=value&255;return offset+1};Buffer.prototype.writeInt16LE=function writeInt16LE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,2,32767,-32768);this[offset]=value&255;this[offset+1]=value>>>8;return offset+2};Buffer.prototype.writeInt16BE=function writeInt16BE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,2,32767,-32768);this[offset]=value>>>8;this[offset+1]=value&255;return offset+2};Buffer.prototype.writeInt32LE=function writeInt32LE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,4,2147483647,-2147483648);this[offset]=value&255;this[offset+1]=value>>>8;this[offset+2]=value>>>16;this[offset+3]=value>>>24;return offset+4};Buffer.prototype.writeInt32BE=function writeInt32BE(value,offset,noAssert){value=+value;offset=offset>>>0;if(!noAssert)checkInt(this,value,offset,4,2147483647,-2147483648);if(value<0)value=4294967295+value+1;this[offset]=value>>>24;this[offset+1]=value>>>16;this[offset+2]=value>>>8;this[offset+3]=value&255;return offset+4};function checkIEEE754(buf,value,offset,ext,max,min){if(offset+ext>buf.length)throw new RangeError("Index out of range");if(offset<0)throw new RangeError("Index out of range")}function writeFloat(buf,value,offset,littleEndian,noAssert){value=+value;offset=offset>>>0;if(!noAssert){checkIEEE754(buf,value,offset,4,3.4028234663852886e38,-3.4028234663852886e38)}ieee754.write(buf,value,offset,littleEndian,23,4);return offset+4}Buffer.prototype.writeFloatLE=function writeFloatLE(value,offset,noAssert){return writeFloat(this,value,offset,true,noAssert)};Buffer.prototype.writeFloatBE=function writeFloatBE(value,offset,noAssert){return writeFloat(this,value,offset,false,noAssert)};function writeDouble(buf,value,offset,littleEndian,noAssert){value=+value;offset=offset>>>0;if(!noAssert){checkIEEE754(buf,value,offset,8,1.7976931348623157e308,-1.7976931348623157e308)}ieee754.write(buf,value,offset,littleEndian,52,8);return offset+8}Buffer.prototype.writeDoubleLE=function writeDoubleLE(value,offset,noAssert){return writeDouble(this,value,offset,true,noAssert)};Buffer.prototype.writeDoubleBE=function writeDoubleBE(value,offset,noAssert){return writeDouble(this,value,offset,false,noAssert)};Buffer.prototype.copy=function copy(target,targetStart,start,end){if(!Buffer.isBuffer(target))throw new TypeError("argument should be a Buffer");if(!start)start=0;if(!end&&end!==0)end=this.length;if(targetStart>=target.length)targetStart=target.length;if(!targetStart)targetStart=0;if(end>0&&end<start)end=start;if(end===start)return 0;if(target.length===0||this.length===0)return 0;if(targetStart<0){throw new RangeError("targetStart out of bounds")}if(start<0||start>=this.length)throw new RangeError("Index out of range");if(end<0)throw new RangeError("sourceEnd out of bounds");if(end>this.length)end=this.length;if(target.length-targetStart<end-start){end=target.length-targetStart+start}var len=end-start;if(this===target&&typeof Uint8Array.prototype.copyWithin==="function"){this.copyWithin(targetStart,start,end)}else if(this===target&&start<targetStart&&targetStart<end){for(var i=len-1;i>=0;--i){target[i+targetStart]=this[i+start]}}else{Uint8Array.prototype.set.call(target,this.subarray(start,end),targetStart)}return len};Buffer.prototype.fill=function fill(val,start,end,encoding){if(typeof val==="string"){if(typeof start==="string"){encoding=start;start=0;end=this.length}else if(typeof end==="string"){encoding=end;end=this.length}if(encoding!==undefined&&typeof encoding!=="string"){throw new TypeError("encoding must be a string")}if(typeof encoding==="string"&&!Buffer.isEncoding(encoding)){throw new TypeError("Unknown encoding: "+encoding)}if(val.length===1){var code=val.charCodeAt(0);if(encoding==="utf8"&&code<128||encoding==="latin1"){val=code}}}else if(typeof val==="number"){val=val&255}if(start<0||this.length<start||this.length<end){throw new RangeError("Out of range index")}if(end<=start){return this}start=start>>>0;end=end===undefined?this.length:end>>>0;if(!val)val=0;var i;if(typeof val==="number"){for(i=start;i<end;++i){this[i]=val}}else{var bytes=Buffer.isBuffer(val)?val:Buffer.from(val,encoding);var len=bytes.length;if(len===0){throw new TypeError('The value "'+val+'" is invalid for argument "value"')}for(i=0;i<end-start;++i){this[i+start]=bytes[i%len]}}return this};var INVALID_BASE64_RE=/[^+/0-9A-Za-z-_]/g;function base64clean(str){str=str.split("=")[0];str=str.trim().replace(INVALID_BASE64_RE,"");if(str.length<2)return"";while(str.length%4!==0){str=str+"="}return str}function toHex(n){if(n<16)return"0"+n.toString(16);return n.toString(16)}function utf8ToBytes(string,units){units=units||Infinity;var codePoint;var length=string.length;var leadSurrogate=null;var bytes=[];for(var i=0;i<length;++i){codePoint=string.charCodeAt(i);if(codePoint>55295&&codePoint<57344){if(!leadSurrogate){if(codePoint>56319){if((units-=3)>-1)bytes.push(239,191,189);continue}else if(i+1===length){if((units-=3)>-1)bytes.push(239,191,189);continue}leadSurrogate=codePoint;continue}if(codePoint<56320){if((units-=3)>-1)bytes.push(239,191,189);leadSurrogate=codePoint;continue}codePoint=(leadSurrogate-55296<<10|codePoint-56320)+65536}else if(leadSurrogate){if((units-=3)>-1)bytes.push(239,191,189)}leadSurrogate=null;if(codePoint<128){if((units-=1)<0)break;bytes.push(codePoint)}else if(codePoint<2048){if((units-=2)<0)break;bytes.push(codePoint>>6|192,codePoint&63|128)}else if(codePoint<65536){if((units-=3)<0)break;bytes.push(codePoint>>12|224,codePoint>>6&63|128,codePoint&63|128)}else if(codePoint<1114112){if((units-=4)<0)break;bytes.push(codePoint>>18|240,codePoint>>12&63|128,codePoint>>6&63|128,codePoint&63|128)}else{throw new Error("Invalid code point")}}return bytes}function asciiToBytes(str){var byteArray=[];for(var i=0;i<str.length;++i){byteArray.push(str.charCodeAt(i)&255)}return byteArray}function utf16leToBytes(str,units){var c,hi,lo;var byteArray=[];for(var i=0;i<str.length;++i){if((units-=2)<0)break;c=str.charCodeAt(i);hi=c>>8;lo=c%256;byteArray.push(lo);byteArray.push(hi)}return byteArray}function base64ToBytes(str){return base64.toByteArray(base64clean(str))}function blitBuffer(src,dst,offset,length){for(var i=0;i<length;++i){if(i+offset>=dst.length||i>=src.length)break;dst[i+offset]=src[i]}return i}function isInstance(obj,type){return obj instanceof type||obj!=null&&obj.constructor!=null&&obj.constructor.name!=null&&obj.constructor.name===type.name}function numberIsNaN(obj){return obj!==obj}},{"base64-js":11,ieee754:14}],14:[function(require,module,exports){exports.read=function(buffer,offset,isLE,mLen,nBytes){var e,m;var eLen=nBytes*8-mLen-1;var eMax=(1<<eLen)-1;var eBias=eMax>>1;var nBits=-7;var i=isLE?nBytes-1:0;var d=isLE?-1:1;var s=buffer[offset+i];i+=d;e=s&(1<<-nBits)-1;s>>=-nBits;nBits+=eLen;for(;nBits>0;e=e*256+buffer[offset+i],i+=d,nBits-=8){}m=e&(1<<-nBits)-1;e>>=-nBits;nBits+=mLen;for(;nBits>0;m=m*256+buffer[offset+i],i+=d,nBits-=8){}if(e===0){e=1-eBias}else if(e===eMax){return m?NaN:(s?-1:1)*Infinity}else{m=m+Math.pow(2,mLen);e=e-eBias}return(s?-1:1)*m*Math.pow(2,e-mLen)};exports.write=function(buffer,value,offset,isLE,mLen,nBytes){var e,m,c;var eLen=nBytes*8-mLen-1;var eMax=(1<<eLen)-1;var eBias=eMax>>1;var rt=mLen===23?Math.pow(2,-24)-Math.pow(2,-77):0;var i=isLE?0:nBytes-1;var d=isLE?1:-1;var s=value<0||value===0&&1/value<0?1:0;value=Math.abs(value);if(isNaN(value)||value===Infinity){m=isNaN(value)?1:0;e=eMax}else{e=Math.floor(Math.log(value)/Math.LN2);if(value*(c=Math.pow(2,-e))<1){e--;c*=2}if(e+eBias>=1){value+=rt/c}else{value+=rt*Math.pow(2,1-eBias)}if(value*c>=2){e++;c/=2}if(e+eBias>=eMax){m=0;e=eMax}else if(e+eBias>=1){m=(value*c-1)*Math.pow(2,mLen);e=e+eBias}else{m=value*Math.pow(2,eBias-1)*Math.pow(2,mLen);e=0}}for(;mLen>=8;buffer[offset+i]=m&255,i+=d,m/=256,mLen-=8){}e=e<<mLen|m;eLen+=mLen;for(;eLen>0;buffer[offset+i]=e&255,i+=d,e/=256,eLen-=8){}buffer[offset+i-d]|=s*128}},{}]},{},[10])(10)});

//created with: https://github.com/ojsc/font2jscad
/////////////////////////////////////////////////////////////////////////////////// rnibmoon_ttf.jscad ///////////////////////////////////////////////////////////////////////////////////////
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rnibmoon_ttf_data = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
(function (Buffer){(function (){

var font = Buffer("AAEAAAANADAAAwCgT1MvMmHMeL4AAADcAAAATmNtYXAfC5XSAAABKgAABZxjdnQgHgu5AwAABsYAAADIZnBnbQGW7jAAAAeOAAACQWdseWYAAAAAAAAJzwAANuBoZWFkZahA2wAAQK8AAAA2aGhlYQKJBf0AAEDlAAAAJGhtdHgsEch2AABBCQAABmhsb2Nh7OejjAAAR3EAAAM2bWF4cAE8A+IAAEqnAAAAIG5hbWUUd7jzAABKxwAAAa9wb3N0vlvcKQAATHYAAAoHcHJlcNJSLf4AAFZ9AAAAWQAAAHMBkAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBbHRzAEAAIPHAAv7/zwAAA0AAmgAAAAIAAQAAAAAAFAADAAEAAAEaAAABBgAAAAAAAAABAgADAAQFBgcAAAAAAAAAAAAAAAgJCgsMAAANDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqawAAAABsbW5vcHFyc3R1AAAAAHZ3eHl6e3x9fn+AgQAAgoOEhYaHiACJiouMjQCOj5CRkgAAk5SVlpcAmJkAmgCbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbIAs7S1trcAuLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0ADR0tPU1QDW1wAEBIIAAABQAEAABQAQAH4ApQCrALEAuAC7AL0A1gDcAPYA/AD/ATEBQgFTAWEBeAGSAscCyQLdA7wgECAUIBkgHiAiICYgMCA6IEQhIiGSIhIiGSMCJaDwAvHA//8AAAAgAKAApwCtALQAugC9AL8A2ADeAPgA/gExAUEBUgFgAXgBkgLGAskC2AO8IBAgEyAYIBwgICAmIDAgOSBEISIhkiISIhkjAiWg8AHxCP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAUAEMARYBHgEmAS4BMAEwAV4BZgGWAZ4BoAGgAaIBpAGmAaYBpgGoAagBsgGyAbIBtAG2AboBvgG+Ab4BwAHAAcABwAHAAcABwAHAAcIAAAANAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4APwBAAEEAQgBDAEQARQBGAEcASABJAEoASwBMAE0ATgBPAFAAUQBSAFMAVABVAFYAVwBYAFkAWgBbAFwAXQBeAF8AYABhAGIAYwBkAGUAZgBnAGgAaQBqAGsAgwCEAIUAhgCHAIgAiQCKAIsAjACNAI4AjwCQAJEAkgCTAJQAlQCWAJcAmACZAJoAmwCcAJ0AngCfAKAAoQCiAKMApAClAKYApwCoAKkAqgCrAKwArQCuAK8AsACxALIAswC0ALUAtgC3ALgAuQC6ALsAvAC9AL4AvwDAAMEAwgDDAMQAxQDGAMcAyADJAMoAywDMAM0AzgDPANAA0QDSANMA1ADVANYA1wAHAAsADAB1AIEAcwB/AIIAbABxAAYA2gABAAIAAwAFAH0ABADbANgAewB8AHYAdwB4AHkAbQBvAHAAegBuAHIAdACAAAgAfgDdANkA3ADeAN8ACQAKAOAA4QDiAOMA5ADlAOYA5wDoAOkA6gDrAOwA7QDuAO8A8ADxAPIA8wD0APUA9gD3APgA+QD6APsA/AD9AP4A/wEAAQEBAgEDAQQBBQEGAQcBCAEJAQoBCwEMAQ0BDgEPARABEQESARMBFAEVARYBFwEYARkBGgEbARwBHQEeAR8BIAEhASIBIwEkASUBJgEnASgBKQEqASsBLAEtAS4BLwEwATEBMgEzATQBNQE2ATcBOAE5AToBOwE8AT0BPgE/AUABQQFCAUMBRAFFAUYBRwFIAUkBSgFLAUwBTQFOAU8BUAFRAVIBUwFUAVUBVgFXAVgBWQFaAVsBXAFdAV4BXwFgAWEBYgFjAWQBZQFmAWcBaAFpAWoBawFsAW0BbgFvAXABcQFyAXMBdAF1AXYBdwF4AXkBegF7AXwBfQF+AX8BgAGBAYIBgwGEAYUBhgGHAYgBiQGKAYsBjAGNAY4BjwGQAZEBkgGTAZQBlQGWAZcBmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/9gAKADEAAAGXAAgCbQAAAvsAAwAAAAAAAAAA/80ABQAAAAAAAAAAAAAAAAAA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AAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAADMf/3AfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAAAAAAEEAAAAfQAAAH0AAAEEAAABBAAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQAAAH0AAAB9AAAAfQA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OAhnbHlwaDIzOQhnbHlwaDI0MAhnbHlwaDI0MQhnbHlwaDI0MghnbHlwaDI0MwhnbHlwaDI0NAhnbHlwaDI0NQhnbHlwaDI0NghnbHlwaDI0NwhnbHlwaDI0OAhnbHlwaDI0OQhnbHlwaDI1MAhnbHlwaDI1MQhnbHlwaDI1MghnbHlwaDI1MwhnbHlwaDI1NAhnbHlwaDI1NQhnbHlwaDI1NghnbHlwaDI1NwhnbHlwaDI1OAhnbHlwaDI1OQhnbHlwaDI2MAhnbHlwaDI2MQhnbHlwaDI2MghnbHlwaDI2MwhnbHlwaDI2NAhnbHlwaDI2NQhnbHlwaDI2NghnbHlwaDI2NwhnbHlwaDI2OAhnbHlwaDI2OQhnbHlwaDI3MAhnbHlwaDI3MQhnbHlwaDI3MghnbHlwaDI3MwhnbHlwaDI3NAhnbHlwaDI3NQhnbHlwaDI3NghnbHlwaDI3NwhnbHlwaDI3OAhnbHlwaDI3OQhnbHlwaDI4MAhnbHlwaDI4MQhnbHlwaDI4MghnbHlwaDI4MwhnbHlwaDI4NAhnbHlwaDI4NQhnbHlwaDI4NghnbHlwaDI4NwhnbHlwaDI4OAhnbHlwaDI4OQhnbHlwaDI5MAhnbHlwaDI5MQhnbHlwaDI5MghnbHlwaDI5MwhnbHlwaDI5NAhnbHlwaDI5NQhnbHlwaDI5NghnbHlwaDI5NwhnbHlwaDI5OAhnbHlwaDI5OQhnbHlwaDMwMAhnbHlwaDMwMQhnbHlwaDMwMghnbHlwaDMwMwhnbHlwaDMwNAhnbHlwaDMwNQhnbHlwaDMwNghnbHlwaDMwNwhnbHlwaDMwOAhnbHlwaDMwOQhnbHlwaDMxMAhnbHlwaDMxMQhnbHlwaDMxMghnbHlwaDMxMwhnbHlwaDMxNAhnbHlwaDMxNQhnbHlwaDMxNghnbHlwaDMxNwhnbHlwaDMxOAhnbHlwaDMxOQhnbHlwaDMyMAhnbHlwaDMyMQhnbHlwaDMyMghnbHlwaDMyMwhnbHlwaDMyNAhnbHlwaDMyNQhnbHlwaDMyNghnbHlwaDMyNwhnbHlwaDMyOAhnbHlwaDMyOQhnbHlwaDMzMAhnbHlwaDMzMQhnbHlwaDMzMghnbHlwaDMzMwhnbHlwaDMzNAhnbHlwaDMzNQhnbHlwaDMzNghnbHlwaDMzNwhnbHlwaDMzOAhnbHlwaDMzOQhnbHlwaDM0MAhnbHlwaDM0MQhnbHlwaDM0MghnbHlwaDM0MwhnbHlwaDM0NAhnbHlwaDM0NQhnbHlwaDM0NghnbHlwaDM0NwhnbHlwaDM0OAhnbHlwaDM0OQhnbHlwaDM1MAhnbHlwaDM1MQhnbHlwaDM1MghnbHlwaDM1MwhnbHlwaDM1NAhnbHlwaDM1NQhnbHlwaDM1NghnbHlwaDM1NwhnbHlwaDM1OAhnbHlwaDM1OQhnbHlwaDM2MAhnbHlwaDM2MQhnbHlwaDM2MghnbHlwaDM2MwhnbHlwaDM2NAhnbHlwaDM2NQhnbHlwaDM2NghnbHlwaDM2NwhnbHlwaDM2OAhnbHlwaDM2OQhnbHlwaDM3MAhnbHlwaDM3MQhnbHlwaDM3MghnbHlwaDM3MwhnbHlwaDM3NAhnbHlwaDM3NQhnbHlwaDM3NghnbHlwaDM3NwhnbHlwaDM3OAhnbHlwaDM3OQhnbHlwaDM4MAhnbHlwaDM4MQhnbHlwaDM4MghnbHlwaDM4MwhnbHlwaDM4NAhnbHlwaDM4NQhnbHlwaDM4NghnbHlwaDM4NwhnbHlwaDM4OAhnbHlwaDM4OQhnbHlwaDM5MAhnbHlwaDM5MQhnbHlwaDM5MghnbHlwaDM5MwhnbHlwaDM5NAhnbHlwaDM5NQhnbHlwaDM5NghnbHlwaDM5NwhnbHlwaDM5OLgB/4WwAI0AuAJ6SyBgIGAgYCBgU7AII0KwDLAFK7AOsAUrsBCwBSuwErAFK7AUsAUrsBawBSuwCrAOK7AYsA4rsBqwDiuwHLAOK7AesA4rsCCwDiuwARYY","base64");
module.exports = font;

}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":2}]},{},[4])(4)
});

/////////////////////////////////////////////////////////////////////////////////// rnibmoon_ttf.jscad ///////////////////////////////////////////////////////////////////////////////////////
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dotty_moon_ttf_data = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  'use strict'
  
  exports.byteLength = byteLength
  exports.toByteArray = toByteArray
  exports.fromByteArray = fromByteArray
  
  var lookup = []
  var revLookup = []
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
  
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }
  
  // Support decoding URL-safe base64 strings, as Node.js does.
  // See: https://en.wikipedia.org/wiki/Base64#URL_applications
  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
  
  function getLens (b64) {
    var len = b64.length
  
    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }
  
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=')
    if (validLen === -1) validLen = len
  
    var placeHoldersLen = validLen === len
      ? 0
      : 4 - (validLen % 4)
  
    return [validLen, placeHoldersLen]
  }
  
  // base64 is 4/3 + up to two characters of the original data
  function byteLength (b64) {
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }
  
  function _byteLength (b64, validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }
  
  function toByteArray (b64) {
    var tmp
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
  
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
  
    var curByte = 0
  
    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0
      ? validLen - 4
      : validLen
  
    var i
    for (i = 0; i < len; i += 4) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 18) |
        (revLookup[b64.charCodeAt(i + 1)] << 12) |
        (revLookup[b64.charCodeAt(i + 2)] << 6) |
        revLookup[b64.charCodeAt(i + 3)]
      arr[curByte++] = (tmp >> 16) & 0xFF
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }
  
    if (placeHoldersLen === 2) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 2) |
        (revLookup[b64.charCodeAt(i + 1)] >> 4)
      arr[curByte++] = tmp & 0xFF
    }
  
    if (placeHoldersLen === 1) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 10) |
        (revLookup[b64.charCodeAt(i + 1)] << 4) |
        (revLookup[b64.charCodeAt(i + 2)] >> 2)
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }
  
    return arr
  }
  
  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] +
      lookup[num >> 12 & 0x3F] +
      lookup[num >> 6 & 0x3F] +
      lookup[num & 0x3F]
  }
  
  function encodeChunk (uint8, start, end) {
    var tmp
    var output = []
    for (var i = start; i < end; i += 3) {
      tmp =
        ((uint8[i] << 16) & 0xFF0000) +
        ((uint8[i + 1] << 8) & 0xFF00) +
        (uint8[i + 2] & 0xFF)
      output.push(tripletToBase64(tmp))
    }
    return output.join('')
  }
  
  function fromByteArray (uint8) {
    var tmp
    var len = uint8.length
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    var parts = []
    var maxChunkLength = 16383 // must be multiple of 3
  
    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
    }
  
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1]
      parts.push(
        lookup[tmp >> 2] +
        lookup[(tmp << 4) & 0x3F] +
        '=='
      )
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1]
      parts.push(
        lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3F] +
        lookup[(tmp << 2) & 0x3F] +
        '='
      )
    }
  
    return parts.join('')
  }
  
  },{}],2:[function(require,module,exports){
  (function (Buffer){(function (){
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  /* eslint-disable no-proto */
  
  'use strict'
  
  var base64 = require('base64-js')
  var ieee754 = require('ieee754')
  
  exports.Buffer = Buffer
  exports.SlowBuffer = SlowBuffer
  exports.INSPECT_MAX_BYTES = 50
  
  var K_MAX_LENGTH = 0x7fffffff
  exports.kMaxLength = K_MAX_LENGTH
  
  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Print warning and recommend using `buffer` v4.x which has an Object
   *               implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * We report that the browser does not support typed arrays if the are not subclassable
   * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
   * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
   * for __proto__ and has a buggy typed array implementation.
   */
  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()
  
  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
      typeof console.error === 'function') {
    console.error(
      'This browser lacks typed array (Uint8Array) support which is required by ' +
      '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
    )
  }
  
  function typedArraySupport () {
    // Can typed array instances can be augmented?
    try {
      var arr = new Uint8Array(1)
      arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
      return arr.foo() === 42
    } catch (e) {
      return false
    }
  }
  
  Object.defineProperty(Buffer.prototype, 'parent', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined
      return this.buffer
    }
  })
  
  Object.defineProperty(Buffer.prototype, 'offset', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined
      return this.byteOffset
    }
  })
  
  function createBuffer (length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"')
    }
    // Return an augmented `Uint8Array` instance
    var buf = new Uint8Array(length)
    buf.__proto__ = Buffer.prototype
    return buf
  }
  
  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */
  
  function Buffer (arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        )
      }
      return allocUnsafe(arg)
    }
    return from(arg, encodingOrOffset, length)
  }
  
  // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
  if (typeof Symbol !== 'undefined' && Symbol.species != null &&
      Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    })
  }
  
  Buffer.poolSize = 8192 // not used by this implementation
  
  function from (value, encodingOrOffset, length) {
    if (typeof value === 'string') {
      return fromString(value, encodingOrOffset)
    }
  
    if (ArrayBuffer.isView(value)) {
      return fromArrayLike(value)
    }
  
    if (value == null) {
      throw TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
        'or Array-like Object. Received type ' + (typeof value)
      )
    }
  
    if (isInstance(value, ArrayBuffer) ||
        (value && isInstance(value.buffer, ArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length)
    }
  
    if (typeof value === 'number') {
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      )
    }
  
    var valueOf = value.valueOf && value.valueOf()
    if (valueOf != null && valueOf !== value) {
      return Buffer.from(valueOf, encodingOrOffset, length)
    }
  
    var b = fromObject(value)
    if (b) return b
  
    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
        typeof value[Symbol.toPrimitive] === 'function') {
      return Buffer.from(
        value[Symbol.toPrimitive]('string'), encodingOrOffset, length
      )
    }
  
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }
  
  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length)
  }
  
  // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
  // https://github.com/feross/buffer/pull/148
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  
  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be of type number')
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"')
    }
  }
  
  function alloc (size, fill, encoding) {
    assertSize(size)
    if (size <= 0) {
      return createBuffer(size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(size).fill(fill, encoding)
        : createBuffer(size).fill(fill)
    }
    return createBuffer(size)
  }
  
  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(size, fill, encoding)
  }
  
  function allocUnsafe (size) {
    assertSize(size)
    return createBuffer(size < 0 ? 0 : checked(size) | 0)
  }
  
  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size)
  }
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(size)
  }
  
  function fromString (string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8'
    }
  
    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  
    var length = byteLength(string, encoding) | 0
    var buf = createBuffer(length)
  
    var actual = buf.write(string, encoding)
  
    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      buf = buf.slice(0, actual)
    }
  
    return buf
  }
  
  function fromArrayLike (array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0
    var buf = createBuffer(length)
    for (var i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255
    }
    return buf
  }
  
  function fromArrayBuffer (array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds')
    }
  
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds')
    }
  
    var buf
    if (byteOffset === undefined && length === undefined) {
      buf = new Uint8Array(array)
    } else if (length === undefined) {
      buf = new Uint8Array(array, byteOffset)
    } else {
      buf = new Uint8Array(array, byteOffset, length)
    }
  
    // Return an augmented `Uint8Array` instance
    buf.__proto__ = Buffer.prototype
    return buf
  }
  
  function fromObject (obj) {
    if (Buffer.isBuffer(obj)) {
      var len = checked(obj.length) | 0
      var buf = createBuffer(len)
  
      if (buf.length === 0) {
        return buf
      }
  
      obj.copy(buf, 0, 0, len)
      return buf
    }
  
    if (obj.length !== undefined) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }
  
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }
  
  function checked (length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
    }
    return length | 0
  }
  
  function SlowBuffer (length) {
    if (+length != length) { // eslint-disable-line eqeqeq
      length = 0
    }
    return Buffer.alloc(+length)
  }
  
  Buffer.isBuffer = function isBuffer (b) {
    return b != null && b._isBuffer === true &&
      b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
  }
  
  Buffer.compare = function compare (a, b) {
    if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
    if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      )
    }
  
    if (a === b) return 0
  
    var x = a.length
    var y = b.length
  
    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i]
        y = b[i]
        break
      }
    }
  
    if (x < y) return -1
    if (y < x) return 1
    return 0
  }
  
  Buffer.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  }
  
  Buffer.concat = function concat (list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
  
    if (list.length === 0) {
      return Buffer.alloc(0)
    }
  
    var i
    if (length === undefined) {
      length = 0
      for (i = 0; i < list.length; ++i) {
        length += list[i].length
      }
    }
  
    var buffer = Buffer.allocUnsafe(length)
    var pos = 0
    for (i = 0; i < list.length; ++i) {
      var buf = list[i]
      if (isInstance(buf, Uint8Array)) {
        buf = Buffer.from(buf)
      }
      if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos)
      pos += buf.length
    }
    return buffer
  }
  
  function byteLength (string, encoding) {
    if (Buffer.isBuffer(string)) {
      return string.length
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
        'Received type ' + typeof string
      )
    }
  
    var len = string.length
    var mustMatch = (arguments.length > 2 && arguments[2] === true)
    if (!mustMatch && len === 0) return 0
  
    // Use a for loop to avoid recursion
    var loweredCase = false
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
          }
          encoding = ('' + encoding).toLowerCase()
          loweredCase = true
      }
    }
  }
  Buffer.byteLength = byteLength
  
  function slowToString (encoding, start, end) {
    var loweredCase = false
  
    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.
  
    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }
  
    if (end === undefined || end > this.length) {
      end = this.length
    }
  
    if (end <= 0) {
      return ''
    }
  
    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0
    start >>>= 0
  
    if (end <= start) {
      return ''
    }
  
    if (!encoding) encoding = 'utf8'
  
    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)
  
        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)
  
        case 'ascii':
          return asciiSlice(this, start, end)
  
        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)
  
        case 'base64':
          return base64Slice(this, start, end)
  
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)
  
        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase()
          loweredCase = true
      }
    }
  }
  
  // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
  // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
  // reliably in a browserify context because there could be multiple different
  // copies of the 'buffer' package in use. This method works even for Buffer
  // instances that were created from another copy of the `buffer` package.
  // See: https://github.com/feross/buffer/issues/154
  Buffer.prototype._isBuffer = true
  
  function swap (b, n, m) {
    var i = b[n]
    b[n] = b[m]
    b[m] = i
  }
  
  Buffer.prototype.swap16 = function swap16 () {
    var len = this.length
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1)
    }
    return this
  }
  
  Buffer.prototype.swap32 = function swap32 () {
    var len = this.length
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3)
      swap(this, i + 1, i + 2)
    }
    return this
  }
  
  Buffer.prototype.swap64 = function swap64 () {
    var len = this.length
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7)
      swap(this, i + 1, i + 6)
      swap(this, i + 2, i + 5)
      swap(this, i + 3, i + 4)
    }
    return this
  }
  
  Buffer.prototype.toString = function toString () {
    var length = this.length
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  }
  
  Buffer.prototype.toLocaleString = Buffer.prototype.toString
  
  Buffer.prototype.equals = function equals (b) {
    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer.compare(this, b) === 0
  }
  
  Buffer.prototype.inspect = function inspect () {
    var str = ''
    var max = exports.INSPECT_MAX_BYTES
    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
    if (this.length > max) str += ' ... '
    return '<Buffer ' + str + '>'
  }
  
  Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer.from(target, target.offset, target.byteLength)
    }
    if (!Buffer.isBuffer(target)) {
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. ' +
        'Received type ' + (typeof target)
      )
    }
  
    if (start === undefined) {
      start = 0
    }
    if (end === undefined) {
      end = target ? target.length : 0
    }
    if (thisStart === undefined) {
      thisStart = 0
    }
    if (thisEnd === undefined) {
      thisEnd = this.length
    }
  
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }
  
    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }
  
    start >>>= 0
    end >>>= 0
    thisStart >>>= 0
    thisEnd >>>= 0
  
    if (this === target) return 0
  
    var x = thisEnd - thisStart
    var y = end - start
    var len = Math.min(x, y)
  
    var thisCopy = this.slice(thisStart, thisEnd)
    var targetCopy = target.slice(start, end)
  
    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i]
        y = targetCopy[i]
        break
      }
    }
  
    if (x < y) return -1
    if (y < x) return 1
    return 0
  }
  
  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1
  
    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset
      byteOffset = 0
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000
    }
    byteOffset = +byteOffset // Coerce to Number.
    if (numberIsNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1)
    }
  
    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0
      else return -1
    }
  
    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding)
    }
  
    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (Buffer.isBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF // Search for a byte value [0-255]
      if (typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
    }
  
    throw new TypeError('val must be string, number or Buffer')
  }
  
  function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1
    var arrLength = arr.length
    var valLength = val.length
  
    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase()
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2
        arrLength /= 2
        valLength /= 2
        byteOffset /= 2
      }
    }
  
    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }
  
    var i
    if (dir) {
      var foundIndex = -1
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex
          foundIndex = -1
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
      for (i = byteOffset; i >= 0; i--) {
        var found = true
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false
            break
          }
        }
        if (found) return i
      }
    }
  
    return -1
  }
  
  Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  }
  
  Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  }
  
  Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  }
  
  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0
    var remaining = buf.length - offset
    if (!length) {
      length = remaining
    } else {
      length = Number(length)
      if (length > remaining) {
        length = remaining
      }
    }
  
    var strLen = string.length
  
    if (length > strLen / 2) {
      length = strLen / 2
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16)
      if (numberIsNaN(parsed)) return i
      buf[offset + i] = parsed
    }
    return i
  }
  
  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }
  
  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }
  
  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }
  
  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }
  
  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }
  
  Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8'
      length = this.length
      offset = 0
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset
      length = this.length
      offset = 0
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset >>> 0
      if (isFinite(length)) {
        length = length >>> 0
        if (encoding === undefined) encoding = 'utf8'
      } else {
        encoding = length
        length = undefined
      }
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }
  
    var remaining = this.length - offset
    if (length === undefined || length > remaining) length = remaining
  
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }
  
    if (!encoding) encoding = 'utf8'
  
    var loweredCase = false
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)
  
        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)
  
        case 'ascii':
          return asciiWrite(this, string, offset, length)
  
        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)
  
        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)
  
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)
  
        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase()
          loweredCase = true
      }
    }
  }
  
  Buffer.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  }
  
  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf)
    } else {
      return base64.fromByteArray(buf.slice(start, end))
    }
  }
  
  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end)
    var res = []
  
    var i = start
    while (i < end) {
      var firstByte = buf[i]
      var codePoint = null
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1
  
      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint
  
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte
            }
            break
          case 2:
            secondByte = buf[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint
              }
            }
            break
          case 3:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint
              }
            }
            break
          case 4:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            fourthByte = buf[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint
              }
            }
        }
      }
  
      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD
        bytesPerSequence = 1
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000
        res.push(codePoint >>> 10 & 0x3FF | 0xD800)
        codePoint = 0xDC00 | codePoint & 0x3FF
      }
  
      res.push(codePoint)
      i += bytesPerSequence
    }
  
    return decodeCodePointsArray(res)
  }
  
  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000
  
  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }
  
    // Decode in chunks to avoid "call stack size exceeded".
    var res = ''
    var i = 0
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      )
    }
    return res
  }
  
  function asciiSlice (buf, start, end) {
    var ret = ''
    end = Math.min(buf.length, end)
  
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F)
    }
    return ret
  }
  
  function latin1Slice (buf, start, end) {
    var ret = ''
    end = Math.min(buf.length, end)
  
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i])
    }
    return ret
  }
  
  function hexSlice (buf, start, end) {
    var len = buf.length
  
    if (!start || start < 0) start = 0
    if (!end || end < 0 || end > len) end = len
  
    var out = ''
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i])
    }
    return out
  }
  
  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end)
    var res = ''
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
    }
    return res
  }
  
  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length
    start = ~~start
    end = end === undefined ? len : ~~end
  
    if (start < 0) {
      start += len
      if (start < 0) start = 0
    } else if (start > len) {
      start = len
    }
  
    if (end < 0) {
      end += len
      if (end < 0) end = 0
    } else if (end > len) {
      end = len
    }
  
    if (end < start) end = start
  
    var newBuf = this.subarray(start, end)
    // Return an augmented `Uint8Array` instance
    newBuf.__proto__ = Buffer.prototype
    return newBuf
  }
  
  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }
  
  Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) checkOffset(offset, byteLength, this.length)
  
    var val = this[offset]
    var mul = 1
    var i = 0
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul
    }
  
    return val
  }
  
  Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length)
    }
  
    var val = this[offset + --byteLength]
    var mul = 1
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul
    }
  
    return val
  }
  
  Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 1, this.length)
    return this[offset]
  }
  
  Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    return this[offset] | (this[offset + 1] << 8)
  }
  
  Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    return (this[offset] << 8) | this[offset + 1]
  }
  
  Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  }
  
  Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  }
  
  Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) checkOffset(offset, byteLength, this.length)
  
    var val = this[offset]
    var mul = 1
    var i = 0
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul
    }
    mul *= 0x80
  
    if (val >= mul) val -= Math.pow(2, 8 * byteLength)
  
    return val
  }
  
  Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) checkOffset(offset, byteLength, this.length)
  
    var i = byteLength
    var mul = 1
    var val = this[offset + --i]
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul
    }
    mul *= 0x80
  
    if (val >= mul) val -= Math.pow(2, 8 * byteLength)
  
    return val
  }
  
  Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 1, this.length)
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  }
  
  Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    var val = this[offset] | (this[offset + 1] << 8)
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  }
  
  Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    var val = this[offset + 1] | (this[offset] << 8)
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  }
  
  Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  }
  
  Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  }
  
  Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
    return ieee754.read(this, offset, true, 23, 4)
  }
  
  Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
    return ieee754.read(this, offset, false, 23, 4)
  }
  
  Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 8, this.length)
    return ieee754.read(this, offset, true, 52, 8)
  }
  
  Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 8, this.length)
    return ieee754.read(this, offset, false, 52, 8)
  }
  
  function checkInt (buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }
  
  Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1
      checkInt(this, value, offset, byteLength, maxBytes, 0)
    }
  
    var mul = 1
    var i = 0
    this[offset] = value & 0xFF
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1
      checkInt(this, value, offset, byteLength, maxBytes, 0)
    }
  
    var i = byteLength - 1
    var mul = 1
    this[offset + i] = value & 0xFF
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
    this[offset] = (value & 0xff)
    return offset + 1
  }
  
  Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    return offset + 2
  }
  
  Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
    return offset + 2
  }
  
  Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
    return offset + 4
  }
  
  Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
    return offset + 4
  }
  
  Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      var limit = Math.pow(2, (8 * byteLength) - 1)
  
      checkInt(this, value, offset, byteLength, limit - 1, -limit)
    }
  
    var i = 0
    var mul = 1
    var sub = 0
    this[offset] = value & 0xFF
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      var limit = Math.pow(2, (8 * byteLength) - 1)
  
      checkInt(this, value, offset, byteLength, limit - 1, -limit)
    }
  
    var i = byteLength - 1
    var mul = 1
    var sub = 0
    this[offset + i] = value & 0xFF
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
    if (value < 0) value = 0xff + value + 1
    this[offset] = (value & 0xff)
    return offset + 1
  }
  
  Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    return offset + 2
  }
  
  Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
    return offset + 2
  }
  
  Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
    return offset + 4
  }
  
  Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
    if (value < 0) value = 0xffffffff + value + 1
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
    return offset + 4
  }
  
  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }
  
  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4)
    return offset + 4
  }
  
  Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  }
  
  Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  }
  
  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8)
    return offset + 8
  }
  
  Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  }
  
  Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  }
  
  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
    if (!start) start = 0
    if (!end && end !== 0) end = this.length
    if (targetStart >= target.length) targetStart = target.length
    if (!targetStart) targetStart = 0
    if (end > 0 && end < start) end = start
  
    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0
  
    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')
  
    // Are we oob?
    if (end > this.length) end = this.length
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start
    }
  
    var len = end - start
  
    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
      // Use built-in when available, missing from IE11
      this.copyWithin(targetStart, start, end)
    } else if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (var i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start]
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, end),
        targetStart
      )
    }
  
    return len
  }
  
  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start
        start = 0
        end = this.length
      } else if (typeof end === 'string') {
        encoding = end
        end = this.length
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0)
        if ((encoding === 'utf8' && code < 128) ||
            encoding === 'latin1') {
          // Fast path: If `val` fits into a single byte, use that numeric value.
          val = code
        }
      }
    } else if (typeof val === 'number') {
      val = val & 255
    }
  
    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }
  
    if (end <= start) {
      return this
    }
  
    start = start >>> 0
    end = end === undefined ? this.length : end >>> 0
  
    if (!val) val = 0
  
    var i
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val
      }
    } else {
      var bytes = Buffer.isBuffer(val)
        ? val
        : Buffer.from(val, encoding)
      var len = bytes.length
      if (len === 0) {
        throw new TypeError('The value "' + val +
          '" is invalid for argument "value"')
      }
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len]
      }
    }
  
    return this
  }
  
  // HELPER FUNCTIONS
  // ================
  
  var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
  
  function base64clean (str) {
    // Node takes equal signs as end of the Base64 encoding
    str = str.split('=')[0]
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace(INVALID_BASE64_RE, '')
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '='
    }
    return str
  }
  
  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }
  
  function utf8ToBytes (string, units) {
    units = units || Infinity
    var codePoint
    var length = string.length
    var leadSurrogate = null
    var bytes = []
  
    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i)
  
      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            continue
          }
  
          // valid lead
          leadSurrogate = codePoint
  
          continue
        }
  
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }
  
        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      }
  
      leadSurrogate = null
  
      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint)
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else {
        throw new Error('Invalid code point')
      }
    }
  
    return bytes
  }
  
  function asciiToBytes (str) {
    var byteArray = []
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF)
    }
    return byteArray
  }
  
  function utf16leToBytes (str, units) {
    var c, hi, lo
    var byteArray = []
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break
  
      c = str.charCodeAt(i)
      hi = c >> 8
      lo = c % 256
      byteArray.push(lo)
      byteArray.push(hi)
    }
  
    return byteArray
  }
  
  function base64ToBytes (str) {
    return base64.toByteArray(base64clean(str))
  }
  
  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i]
    }
    return i
  }
  
  // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
  // the `instanceof` check but they should be treated as of that type.
  // See: https://github.com/feross/buffer/issues/166
  function isInstance (obj, type) {
    return obj instanceof type ||
      (obj != null && obj.constructor != null && obj.constructor.name != null &&
        obj.constructor.name === type.name)
  }
  function numberIsNaN (obj) {
    // For IE11 support
    return obj !== obj // eslint-disable-line no-self-compare
  }
  
  }).call(this)}).call(this,require("buffer").Buffer)
  },{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
  exports.read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m
    var eLen = (nBytes * 8) - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var nBits = -7
    var i = isLE ? (nBytes - 1) : 0
    var d = isLE ? -1 : 1
    var s = buffer[offset + i]
  
    i += d
  
    e = s & ((1 << (-nBits)) - 1)
    s >>= (-nBits)
    nBits += eLen
    for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}
  
    m = e & ((1 << (-nBits)) - 1)
    e >>= (-nBits)
    nBits += mLen
    for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}
  
    if (e === 0) {
      e = 1 - eBias
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen)
      e = e - eBias
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }
  
  exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c
    var eLen = (nBytes * 8) - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
    var i = isLE ? 0 : (nBytes - 1)
    var d = isLE ? 1 : -1
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
  
    value = Math.abs(value)
  
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0
      e = eMax
    } else {
      e = Math.floor(Math.log(value) / Math.LN2)
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--
        c *= 2
      }
      if (e + eBias >= 1) {
        value += rt / c
      } else {
        value += rt * Math.pow(2, 1 - eBias)
      }
      if (value * c >= 2) {
        e++
        c /= 2
      }
  
      if (e + eBias >= eMax) {
        m = 0
        e = eMax
      } else if (e + eBias >= 1) {
        m = ((value * c) - 1) * Math.pow(2, mLen)
        e = e + eBias
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
        e = 0
      }
    }
  
    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
  
    e = (e << mLen) | m
    eLen += mLen
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
  
    buffer[offset + i - d] |= s * 128
  }
  
  },{}],4:[function(require,module,exports){
  (function (Buffer){(function (){
  
  var font = Buffer("AAEAAAAKAIAAAwAgT1MvMmJj9eQAAACsAAAAYGNtYXAEW0aoAAABDAAAAhRnbHlmHwADjAAAAyAAAMuCaGVhZP+ImGYAAM6kAAAANmhoZWEE7AL5AADO3AAAACRobXR4DQ0HAAAAzwAAAACsbG9jYQAdoTgAAM+sAAABTG1heHAAXwDPAADQ+AAAACBuYW1lqBea6wAA0RgAAAZecG9zdABpADMAANd4AAAAIAACAygBkAAFAAQCAAIAAAAAAAIAAgAAAAIAADMAzAAAAAAEAAAAAAAAAIAAAAMAAAAAAAAAAAAAAABGU1RSAEAAICAdAoD/AAAAAmoBAAAAAAEAAAAAAmoB6gAAACAAAAAAAAIAAAADAAAAFAADAAEAAAEUAAQBAAAAABQAEAADAAQAIwApAC4AOwA/AFoAegCmIB3//wAAACAAJwArADAAPwBBAGEApiAc////4//g/9//3v/b/9r/1P+p4DQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAQAAAAAUABAAAwAEACMAKQAuADsAPwBaAHoApiAd//8AAAAgACcAKwAwAD8AQQBhAKYgHP///+P/4P/f/97/2//a/9T/qeA0AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAACagJqABAAIQAyAEMAVAAAISInJjU0NzYzMhcWFRQHBiMBIicmNTQ3NjMyFxYVFAcGIyEiJyY1NDc2MzIXFhUUBwYjISInJjU0NzYzMhcWFRQHBiMBIicmNTQ3NjMyFxYVFAcGIwE1FhAPDxAWFg8QEA8W/wAWEA8PEBYWDxAQDxYBABYQDw8QFhYPEBAPFgEAFhAPDxAWFg8QEA8W/wAWEA8PEBYWDxAQDxYPEBYWDxAQDxYWEA8BAA8QFhYPEBAPFhYQDw8QFhYPEBAPFhYQDw8QFhYPEBAPFhYQDwEADxAWFg8QEA8WFhAPDwAEAQAAAAFqAmoAEAAhADIAQwAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAEAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAADAAAAAAJqAmoAEAAhADIAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/wD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAgAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAGAAAAAAJqAWoAEAAhADIAQwBUAGUAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQE1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAABAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAEBAAIAAWoCagAQAAABAAEAAQABAAEAAQABAAEAAQE1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAADAAAAAAJqAmoAEAAhADIAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/wD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAgAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAADAAAAAAJqAmoAEAAhADIAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQE1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAACAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAFAAAAAAJqAmoAEAAhADIAQwBUAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABATX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAQAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAQAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAQEAAAABagBqABAAAAEAAQABAAEAAQABAAEAAQABATX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAMAgAEAAeoBagAQACEAMgAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABALX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAIAgAAAAeoAagAQACEAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAACAAAAAACagJqABAAIQAyAEMAVABlAHYAhwAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gEA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v+A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAgAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAsAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAsAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAkAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAIAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAIAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAjX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAKAAAAAAHqAeoAEAAhADIAQwBUAGUAdgCHAJgAqQAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAUBAAAAAWoCagAQACEAMgBDAFQAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAACAQAAAAFqAeoAEAAhAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABATX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAYAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAEBAAAAAWoAagAQAAABAAEAAQABAAEAAQABAAEAAQE1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAHAAAAAAJqAWoAEAAhADIAQwBUAGUAdgAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAJAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/4D/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACAAAAAACagJqABAAIQAyAEMAVABlAHYAhwAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAACwAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAKkAugAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAACwAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAKkAugAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAgAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAgAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAECNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAoAAAAAAeoB6gAQACEAMgBDAFQAZQB2AIcAmACpAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/wD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/wD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAABQEAAAABagJqABAAIQAyAEMAVAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQE1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAgAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAkAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAjX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAJAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAECNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAsAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gGA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gEA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAwAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAywAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABALX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAcAAAAAAmoBagAQACEAMgBDAFQAZQB2AAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAcAAAAAAmoBagAQACEAMgBDAFQAZQB2AAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v+A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAUAAAAAAmoCagAQACEAMgBDAFQAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAECNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/4D/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v+A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/4D/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAFAAAAAAJqAmoAEAAhADIAQwBUAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAABQAAAQACagFqABAAIQAyAEMAVAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAkAAAAAAmoB6gAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABALX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAJAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQE1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACQAAAAACagHqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAkAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAJAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACwAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAKkAugAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gEA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v+A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAgAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAsAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAsAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAkAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAIAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAIAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAjX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAKAAAAAAHqAeoAEAAhADIAQwBUAGUAdgCHAJgAqQAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAUBAAAAAWoCagAQACEAMgBDAFQAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAIAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABALX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAJAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQI1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAkAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAjX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAALAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAqQC6AAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oBAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAYD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAMAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAqQC6AMsAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAHAAAAAAJqAWoAEAAhADIAQwBUAGUAdgAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAHAAAAAAJqAWoAEAAhADIAQwBUAGUAdgAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAFAAAAAAJqAmoAEAAhADIAQwBUAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAjX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v+A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/gP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/4D/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v+A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAABQAAAAACagJqABAAIQAyAEMAVAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAUAAAEAAmoBagAQACEAMgBDAFQAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gEAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAJAAAAAAJqAeoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQC1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/4D/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gEA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAQD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v6A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/gD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAkAAAAAAmoB6gAQACEAMgBDAFQAZQB2AIcAmAAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABADX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r+AP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v4A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oCAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAJAAAAAAJqAmoAEAAhADIAQwBUAGUAdgCHAJgAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQA1/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAACQAAAAACagJqABAAIQAyAEMAVABlAHYAhwCYAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAsAAAAAAmoCagAQACEAMgBDAFQAZQB2AIcAmACpALoAAAEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEAtf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/oD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gCA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAgP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAID/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAIAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAYAgP8AAOoCagAQACEAMgBDAFQAZQAAAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABALX/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAAD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gAA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAP/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/wAAAAAQABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//AAAACAAAAAEAAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/wAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAQAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAACAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAgAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAwAAAAACagJqABAAIQAyAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEANf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/qAgD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v8A/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAIAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAwAAAAACagJqABAAIQAyAAABAAEAAQABAAEAAQABAAEAAQEAAQABAAEAAQABAAEAAQABAQABAAEAAQABAAEAAQABAAEBNf/q//D/8QAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/wD/6v/w//EAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6gIA/+r/8P/xAAAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+oAAAAAAA8AEAAWABYADwAQAAAAAP/w//H/6v/q//D/8QAAAgAAAAAPABAAFgAWAA8AEAAAAAD/8P/x/+r/6v/w//EAAAAAAAAADwAQABYAFgAPABAAAAAA//D/8f/q/+r/8P/xAAAAAAAAAAABAAAAAQAAJRXcgV8PPPUAAAQAAAAAAM8FKv8AAAAAzwUq/wAA/wACagJqAAAACAACAAEAAAAAAAEAAAJq/wAAAAMvAAAAxQKAAAEAAAAAAAAAAAAAAAAAAAAEAy8AAAMvAAABAAAAAy8AAAEAAAAAAAEAAAAAAAAAAQAAgACAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAADyAAAA8gAAAPIAAADyAAACWgAAA24AAAWGAAAF6gAABv4AAAgSAAAJ0gAACjYAAAtKAAAMBgAADsoAABHmAAAUqgAAGHYAABxCAAAfXgAAIiIAACTmAAAoWgAAKhoAACrWAAArOgAALaoAADDGAAAzigAAN1YAADsiAAA+PgAAQQIAAEPGAABHOgAASPoAAEu+AABO2gAAUfYAAFUSAABY3gAAXP4AAF9uAABh3gAAY54AAGVeAABnHgAAajoAAG1WAABwcgAAc44AAHaqAAB6dgAAfZIAAIBWAACEIgAAh+4AAIsKAACNzgAAkJIAAJQGAACVxgAAmIoAAJumAACewgAAod4AAKWqAACpygAArDoAAK6qAACwagAAsioAALPqAAC3BgAAuiIAAL0+AADAWgAAw3YAAMdCAADJWgAAym4AAMuCAAEAAABSAMwADAAAAAAAAgAAAAAAAAAAAAAAAAAAAAEAAAAhAZIAAQAAAAAAAAAeAAAAAQAAAAAAAQAKAB4AAQAAAAAAAgAHACgAAQAAAAAAAwAVAC8AAQAAAAAABAASAEQAAQAAAAAABQALAFYAAQAAAAAABgAKAGEAAQAAAAAABwA8AGsAAQAAAAAACAAVAKcAAQAAAAAACQAPALwAAQAAAAAACgArAMsAAQAAAAAACwAXAPYAAQAAAAAADAAwAQ0AAQAAAAAADQAoAT0AAQAAAAAADgAuAWUAAQAAAAAAEwApAZMAAQAAAAABAAAIAbwAAwABBAkAAABaAcQAAwABBAkAAQAUAh4AAwABBAkAAgAOAjIAAwABBAkAAwAUAkAAAwABBAkABAAUAlQAAwABBAkABQAWAmgAAwABBAkABgAUAn4AAwABBAkACAAqApIAAwABBAkACQAeArwAAwABBAkACgBWAtoAAwABBAkACwAuAzAAAwABBAkADABgA14AAwABBAkADQBQA74AAwABBAkADgBcBA4AAwABBAkAEwBSBGoAAwABBAkBAAAQBLxDb3B5cmlnaHQgQWxleGFuZGVyIEZha2+XIDIwMTREb3R0eS1Nb29uUmVndWxhckZvbnRTdHJ1Y3QgRG90dHktTW9vbkRvdHR5LU1vb24gUmVndWxhclZlcnNpb24gMS4wRG90dHktTW9vbkZvbnRTdHJ1Y3QgaXMgYSB0cmFkZW1hcmsgb2YgRlNJIEZvbnRTaG9wIEludGVybmF0aW9uYWwgR21iSGh0dHA6Ly9mb250c3RydWN0LmNvbUFsZXhhbmRlciBGYWtvl+KAnERvdHR5LU1vb27igJ0gd2FzIGJ1aWx0IHdpdGggRm9udFN0cnVjdApodHRwOi8vd3d3LmZvbnRzaG9wLmNvbWh0dHA6Ly9mb250c3RydWN0LmNvbS9mb250c3RydWN0aW9ucy9zaG93LzkzNjMzNUNyZWF0aXZlIENvbW1vbnMgQXR0cmlidXRpb24gU2hhcmUgQWxpa2VodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS1zYS8zLjAvRml2ZSBiaWcgcXVhY2tpbmcgemVwaHlycyBqb2x0IG15IHdheCBiZWRDd29PZGxwaABDAG8AcAB5AHIAaQBnAGgAdAAgAEEAbABlAHgAYQBuAGQAZQByACAARgBhAGsAbwDzACAAMgAwADEANAAgAC0AIAB3AHcAdwAuAGYAYQBrAG8AbwAuAGQAZQBEAG8AdAB0AHkALQBNAG8AbwBuAFIAZQBnAHUAbABhAHIARABvAHQAdAB5AC0ATQBvAG8AbgBEAG8AdAB0AHkALQBNAG8AbwBuAFYAZQByAHMAaQBvAG4AIAAxAC4AMABEAG8AdAB0AHkALQBNAG8AbwBuAGgAdAB0AHAAOgAvAC8AZgBvAG4AdABzAHQAcgB1AGMAdAAuAGMAbwBtAEEAbABlAHgAYQBuAGQAZQByACAARgBhAGsAbwDzIBoAxAD6AEQAbwB0AHQAeQAtAE0AbwBvAG4gGgDEAPkAIAB3AGEAcwAgAGIAdQBpAGwAdAAgAHcAaQB0AGgAIABGAG8AbgB0AFMAdAByAHUAYwB0AAoAaAB0AHQAcAA6AC8ALwB3AHcAdwAuAGYAbwBuAHQAcwBoAG8AcAAuAGMAbwBtAGgAdAB0AHAAOgAvAC8AZgBvAG4AdABzAHQAcgB1AGMAdAAuAGMAbwBtAC8AZgBvAG4AdABzAHQAcgB1AGMAdABpAG8AbgBzAC8AcwBoAG8AdwAvADkAMwA2ADMAMwA1AEMAcgBlAGEAdABpAHYAZQAgAEMAbwBtAG0AbwBuAHMAIABBAHQAdAByAGkAYgB1AHQAaQBvAG4AIABTAGgAYQByAGUAIABBAGwAaQBrAGUAaAB0AHQAcAA6AC8ALwBjAHIAZQBhAHQAaQB2AGUAYwBvAG0AbQBvAG4AcwAuAG8AcgBnAC8AbABpAGMAZQBuAHMAZQBzAC8AYgB5AC0AcwBhAC8AMwAuADAALwBGAGkAdgBlACAAYgBpAGcAIABxAHUAYQBjAGsAaQBuAGcAIAB6AGUAcABoAHkAcgBzACAAagBvAGwAdAAgAG0AeQAgAHcAYQB4ACAAYgBlAGQAQwB3AG8ATwBkAGwAcABoAAAAAwAAAAAAAABmADMAAAAAAAAAAAAAAAAAAAAAAAAAAA==","base64");
  module.exports = font;
  
  }).call(this)}).call(this,require("buffer").Buffer)
  },{"buffer":2}]},{},[4])(4)
  });

  /////////////////////////////////////////////////////////////////////////////////// DottyMoon_ttf.jscad ///////////////////////////////////////////////////////////////////////////////////////
  
//thickness of the back plate in mm
const plate_thickness = 2;

// Here we define the user editable parameters:
function getParameterDefinitions() {
  return [
    { name: 'supportPlate', caption: 'Nutze eine Support Platte für leichteres Drucken:', type: 'bool', default: true },
    { name: 'backPlate', caption: 'Drucke Braille auf einer 2mm Platte:', type: 'bool', default: true },
    { name: 'dottyMoon', caption: 'Häckchen an für: Dotty-Moon. Häckchen aus für:  Rnib-Moon:', type: 'bool', default: true },
    { name: 'textSize', caption: 'Textgröße:', type: 'int', default: 20 },
    { name: 'textHeight', caption: 'Texthöhe:', type: 'int', default: 4 }, //4 = plate_thickness + 2
    { name: 'text', caption: 'Moon Text:', type: 'longtext', default: "Willkommen bei der \nWissensdrehscheibe für\nbarrierefreie Technologie" },
  ];
}

// Main entry point; here we construct our solid: 
function main(params)
{
  var fMoon = Font3D.parse(dotty_moon_ttf_data.buffer);     

  //switch between rnibMoon and DottyMoon font
  if(params.dottyMoon == false)
  {
    fMoon =  Font3D.parse(rnibmoon_ttf_data.buffer);
  }
  
  //input text and text size of user
  let userText = params.text; 
  let userTextSize = params.textSize; 
  

	//split the input strings into each line
	var textarr = userText.split("\n");
	//array of CSG objects for each line
	var linearr = [];
	
	//alle Zeilen userText werden in einer Schleife abgearbeitet 
	for(line = 0; line < textarr.length; line++)
	{ 
    //for a blank line we skip to the next code section
    if(textarr[line].length == 0){
      continue
    }

    //input wird in entsprechende Font umgewandelt und dann in ein String zusammengefasst
    //input is changed into a specific font. after that the characters are summed up in a string.
		let cagMoon = Font3D.cagFromString(fMoon, textarr[line], userTextSize); 
    let csgMoon = cagMoon[0].union(cagMoon);                
     
    //userinput determines Z-axe of the strings, for 3D
    csgMoon = csgMoon.extrude({offset: [0, 0, params.textHeight]});
		
    //save CGS object to array
		linearr.push(csgMoon.translate([0, 1.5 * userTextSize *  (textarr.length - line-1), 0])); //einzelnen lines in einem array befullen.
	}

	//array wird in ein großes Objekt umgewandelt
	var fullstr = new CSG();
	fullstr = fullstr.union(linearr);
  let csgMoon = fullstr; 

    // Get the bounding box of the CSG object. src: chatgpt
    let bounds = csgMoon.getBounds();

    if (typeof bounds !== 'undefined' && bounds !== null) {
      // bounds object is not empty or null, so we can access its properties
      const max = bounds.max;
    } else {
      // bounds object is empty or null, so we can't access its properties
      console.error('bounds object is empty or null');
    }
    
    // Calculate the width and height from the bounding box
    let width = bounds[1].y;
    let height = bounds[1].x;
 

  //backplate size and color is beeing created
	let backplate = new CSG.cube({
		center: [height/2,width/2,-plate_thickness/2],
		radius: [height/2,width/2,plate_thickness/2],
    // center: [0,0,0],
    // radius: [100,100,2],
	});
	backplate = backplate.setColor([0.4,0.4,0,0.8]);
  
  var finalobject = csgMoon;
	
	//if a backplate is used, we union both together
	//if not, we need to half the braille dots (round spheres)
	if(params.backPlate == true)
	{
		finalobject = csgMoon.union(backplate);
		//only if a backplate is used, we should render a support plate
		if(params.supportPlate == true)
		{
			var support = new CSG.cube({
				center: [5,width-1,-10],
				radius: [2.5,1,10],
			});
			support = support.setColor([0.4,0.4,0,0.8]);
			finalobject = finalobject.union(support);
			
			support = new CSG.cube({
				center: [height-5,width-1,-10],
				radius: [2.5,1,10],
			});
     
			support = support.setColor([0.4,0.4,0,0.8]);
			finalobject = finalobject.union(support);			
		}
	}
	 

  return finalobject;
}
