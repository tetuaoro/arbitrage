"use strict";var e=this&&this.__awaiter||function(e,t,r,n){return new(r||(r=Promise))((function(s,o){function a(e){try{i(n.next(e))}catch(e){o(e)}}function l(e){try{i(n.throw(e))}catch(e){o(e)}}function i(e){var t;e.done?s(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(a,l)}i((n=n.apply(e,t||[])).next())}))},t=this&&this.__generator||function(e,t){var r,n,s,o,a={label:0,sent:function(){if(1&s[0])throw s[1];return s[1]},trys:[],ops:[]};return o={next:l(0),throw:l(1),return:l(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function l(o){return function(l){return function(o){if(r)throw new TypeError("Generator is already executing.");for(;a;)try{if(r=1,n&&(s=2&o[0]?n.return:o[0]?n.throw||((s=n.return)&&s.call(n),0):n.next)&&!(s=s.call(n,o[1])).done)return s;switch(n=0,s&&(o=[2&o[0],s.value]),o[0]){case 0:case 1:s=o;break;case 4:return a.label++,{value:o[1],done:!1};case 5:a.label++,n=o[1],o=[0];continue;case 7:o=a.ops.pop(),a.trys.pop();continue;default:if(!(s=a.trys,(s=s.length>0&&s[s.length-1])||6!==o[0]&&2!==o[0])){a=0;continue}if(3===o[0]&&(!s||o[1]>s[0]&&o[1]<s[3])){a.label=o[1];break}if(6===o[0]&&a.label<s[1]){a.label=s[1],s=o;break}if(s&&a.label<s[2]){a.label=s[2],a.ops.push(o);break}s[2]&&a.ops.pop(),a.trys.pop();continue}o=t.call(e,a)}catch(e){o=[6,e],n=0}finally{r=s=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,l])}}},r=this&&this.__asyncValues||function(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t,r=e[Symbol.asyncIterator];return r?r.call(e):(e="function"==typeof __values?__values(e):e[Symbol.iterator](),t={},n("next"),n("throw"),n("return"),t[Symbol.asyncIterator]=function(){return this},t);function n(r){t[r]=e[r]&&function(t){return new Promise((function(n,s){(function(e,t,r,n){Promise.resolve(n).then((function(t){e({value:t,done:r})}),t)})(n,s,(t=e[r](t)).done,t.value)}))}}},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};exports.__esModule=!0;var s=require("ethers"),o=n(require("dayjs")),a=n(require("dayjs/plugin/utc")),l=n(require("dayjs/plugin/timezone")),i=n(require("dayjs/locale/fr")),u=n(require("./flashswap")),c=require("./utils"),f=require("ethers/lib/utils");o.default.extend(a.default),o.default.extend(l.default),o.default.locale(i.default),o.default.tz.setDefault("Pacific/Tahiti");var d=0,h=0,p=0,m=0,b=0,v=!0,g=function(n,o,a,l){return e(void 0,void 0,void 0,(function(){var e,o,a,i,u,f,g,w,I,S,_,C,x,U,R,E,M,N,B,D,P,Y,q,A,O,L,G,j,W,z,F,H,K,V,J,Q,X,Z,$,ee,te,re,ne,se,oe,ae,le,ie,ue,ce,fe;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,14,,15]),p++,v||l.blockNumber<=d?[2]:(d=l.blockNumber,e=n.pair,o=n.pairs,a=n.token0,i=n.token1,[4,e.getReserves()]);case 1:if(u=t.sent(),f=u[0],g=u[1],w=u[2],Date.now()/1e3-w>5)return[2];for(I=f.div(100),S=f.div(50),_=f.div(20),C=f.div(10),x=f.div(5),U=f.div(2),R=[1,2,5,10,20,50],M=[],N=0,B=E=[I,S,_,C,x,U];N<B.length;N++)D=B[N],M.push(g.mul(1e3).mul(D).div(f.mul(997)).add(1));for(P=[],Y=0,q=o;Y<q.length;Y++)A=q[Y],P.push(A.getReserves());O=[],t.label=2;case 2:t.trys.push([2,7,8,13]),L=r(P),t.label=3;case 3:return[4,L.next()];case 4:if((G=t.sent()).done)return[3,6];j=G.value,O.push({r0:j[0],r1:j[1]}),t.label=5;case 5:return[3,3];case 6:return[3,13];case 7:return W=t.sent(),ce={error:W},[3,13];case 8:return t.trys.push([8,,11,12]),G&&!G.done&&(fe=L.return)?[4,fe.call(L)]:[3,10];case 9:t.sent(),t.label=10;case 10:return[3,12];case 11:if(ce)throw ce.error;return[7];case 12:return[7];case 13:for(z=[],F=0,H=s.BigNumber.from("0"),V=0,J=O;V<J.length;V++){for(Q=J[V],X=-1,Z=0,$=M;Z<$.length;Z++)ee=$[Z],X++,Q.r1.lt(ee)||(te=E[X],re=te.mul(997),ne=re.mul(Q.r1),se=Q.r0.mul(1e3).add(re),oe=ne.div(se),(ae=oe.gt(ee))?((le=oe.sub(ee)).gt(H)&&(H=le,K={amountIn:te,pair1:o[F],diff:H}),h++,z.push(((ue={"#":R[X]+"%"})[a.symbol+"_BORROW"]=s.utils.formatUnits(te,a.decimals),ue.BLOCKNUMBER=d,ue.Sell=c.getNameExchange(o[F].address),ue[i.symbol]=s.utils.formatUnits(oe,i.decimals),ue[i.symbol+"_PAYBACK"]=s.utils.formatUnits(ee,i.decimals),ue["Call?"]=ae,ue))):m++);z.push({}),F++}return void 0!==K&&(v=!0,console.log("flashswap "+s.utils.formatUnits(K.diff,i.decimals)+" "+i.symbol),console.table(z),T.push(setImmediate((function(){y(K.amountIn,e,K.pair1)})))),b++,[3,15];case 14:return ie=t.sent(),k(ie,"### onSync ###"),[3,15];case 15:return[2]}}))}))},y=function(r,n,o){return e(void 0,void 0,void 0,(function(){var e,a,l,i,u;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,3,,4]),e=c.getRouterContractFromPairAddress(o.address),a=s.utils.defaultAbiCoder.encode(["FlashData(uint256 amountBorrow, address pairBorrow, address routerSell)"],[{amountBorrow:r,pairBorrow:n.address,routerSell:e.address}]),l=Math.floor(Date.now()/1e3)+30,[4,c.raoContract.connect(c.signer).callStatic.flashswap(a,l,{gasLimit:s.utils.parseUnits("2","mwei"),gasPrice:s.utils.parseUnits("380","gwei")})];case 1:return[4,t.sent().wait(2)];case 2:return i=t.sent(),v=!1,console.log(i),process.kill(process.pid,"SIGINT"),[3,4];case 3:return u=t.sent(),console.log(u),process.kill(process.pid,"SIGINT"),[3,4];case 4:return[2]}}))}))},w=process.pid,I=o.default(),S=function(){var e,t=o.default();console.table({PID:w,"Started at":I.format("D/M/YYYY H:m:s"),"Live date":t.format("D/M/YYYY H:m:s"),Running:(e=t.diff(I,"seconds"),Math.floor(e/Math.pow(60,2))+":"+Math.floor(e/60)%60+":"+e%60),COUNTER:b,COUNTER_CALL:p,COUNTER_SUCCESS:h,COUNTER_FAIL:m})},_=[],C=[],T=[],k=function(e,t){v=!0;for(var r=_.length,n=0;n<r;n++)_.shift();r=C.length;for(n=0;n<r;n++)clearInterval(C[0]),C.shift();r=T.length;for(n=0;n<r;n++)clearImmediate(T[0]),T.shift();console.error(t||"###"),console.error(e),console.error(t||"###"),e&&e.code&&e.code==f.Logger.errors.TIMEOUT?(c.switchInfuraProvider(),console.log("Restart main"),x()):process.exit()},x=function(){return e(void 0,void 0,void 0,(function(){var r;return t(this,(function(n){switch(n.label){case 0:console.log("Arbitrage start"),n.label=1;case 1:return n.trys.push([1,3,,4]),[4,e(void 0,void 0,void 0,(function(){var e,r,n,s,o,a,l,i,f,d,h,p,m,b,y,w,I,T,x;return t(this,(function(t){switch(t.label){case 0:t.trys.push([0,14,,15]),e=c.getToken("WMATIC"),r=c.getToken("WBTC"),n=c.getToken("WETH"),s=c.getToken("USDC"),o=[e,r,n,s],console.log("Create instances for "+o.length+" tokens"),a=0,l=0,i=o,t.label=1;case 1:if(!(l<i.length))return[3,9];f=i[l],d=-1,h=0,p=o,t.label=2;case 2:if(!(h<p.length))return[3,7];if(m=p[h],d++,a>=d)return[3,6];I=new u.default(f,m),t.label=3;case 3:return t.trys.push([3,5,,6]),console.log("\tflashswap["+d+"] "+f.symbol+"/"+m.symbol),[4,I.initialize()];case 4:return t.sent(),_.push(I),[3,6];case 5:throw b=t.sent(),console.log("error instanciated "+f.symbol+"/"+m.symbol),b;case 6:return h++,[3,2];case 7:a++,t.label=8;case 8:return l++,[3,1];case 9:console.log("Created "+_.length+" instances\nCreate listeners"),a=0,y=0,w=_,t.label=10;case 10:return y<w.length?(I=w[y],T=a,[4,I.onSync(g)]):[3,13];case 11:a=T+t.sent(),t.label=12;case 12:return y++,[3,10];case 13:return console.log("Created "+a+" listeners"),v=!1,C.push(setInterval(S,45e3)),[3,15];case 14:return x=t.sent(),k(x,"### app ###"),[3,15];case 15:return[2]}}))}))];case 2:return n.sent(),[3,4];case 3:return r=n.sent(),k(r),[3,4];case 4:return[2]}}))}))},U=!1,R=function(){U||(U=!0,console.log("\nexit///"),S(),process.exit())};process.on("exit",R),process.on("SIGINT",R),process.on("SIGTERM",R),x();