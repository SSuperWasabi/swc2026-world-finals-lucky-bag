// 월드 결선 축하 화면 A·B(1.8초). APAC congrats-v25-A/B.jsx와 같은 구성·움직임에 배경판과 입체 글자 색만 월드 결선으로 바꿨다.
// 배경판: 월드 결선 전환 18~53번 프레임의 흰 로고를 띠 색 0.694배(APAC 실측 비율) 그림자로 바꾼 것. 입체 옆면 #dfd2ff→#5d09a0, 그림자 #1d0042, 바탕 #3a0085.
// JOB = { seq, out, grades:[{id,tag,tagSize}], dur }
// A/B 축하 화면 v3(1.8초): 배경은 원본 36프레임을 픽셀 모션 보간으로 1.5배 늘리고, 글자는 등장 후 천천히 커진다. 이전: TRANS_ASIA covered frames, dark centre over the swirl logo, Unbounded Black with a stacked 3D extrusion.
(function(){
 var log=[];function status(s){var f=new File(JOB.out+'/status.json');f.encoding='UTF-8';f.open('w');f.write('{"state":"'+s+'","log":["'+log.join('","')+'"]}');f.close();}
 function savePng(comp,t,file){var f=new File(file);if(f.exists)f.remove();comp.saveFrameToPng(t,f);for(var i=0;i<2400;i++){$.sleep(100);f=new File(file);if(f.exists&&f.length>0){$.sleep(500);return;}}}
 function key(prop,pairs){for(var i=0;i<pairs.length;i++)prop.setValueAtTime(pairs[i][0],pairs[i][1]);}
 function ease(prop){var e=new KeyframeEase(0,60);for(var k=1;k<=prop.numKeys;k++){try{prop.setTemporalEaseAtKey(k,[e,e,e],[e,e,e]);}catch(x){try{prop.setTemporalEaseAtKey(k,[e],[e]);}catch(y){}}}}
 function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
 app.beginSuppressDialogs();
 try{
  status('running');
  if(app.project&&(app.project.file||app.project.numItems>0))throw new Error('AE has a project open');
  app.newProject();
  var io=new ImportOptions(new File(JOB.seq));io.sequence=true;var foot=app.project.importFile(io);foot.mainSource.conformFrameRate=30;
  var rq=app.project.renderQueue;
  for(var g=0;g<JOB.grades.length;g++){var G=JOB.grades[g];
   var c=app.project.items.addComp('CONGRATS_'+G.id,2048,2732,1,JOB.dur,30);c.bgColor=[0.227,0,0.522];
   var bg=c.layers.add(foot);bg.startTime=0;bg.stretch=150;c.frameBlending=true;bg.frameBlendingType=FrameBlendingType.PIXEL_MOTION;bg.quality=LayerQuality.BEST;try{bg.samplingQuality=LayerSamplingQuality.BICUBIC;}catch(e){} // 배경판: 월드 결선 전환 18번부터, 흰 로고는 그림자로
   var sc=bg.property('ADBE Transform Group').property('ADBE Scale'),s=2732/1080*100;key(sc,[[0,[s,s]],[JOB.dur,[s*1.04,s*1.04]]]);
   bg.property('ADBE Transform Group').property('ADBE Position').setValue([1024,1366]);
   function text(str,size,y,t0,name,hscale){
    function make(nm,col){var l=c.layers.addText(str);l.name=nm;var td=l.property('ADBE Text Properties').property('ADBE Text Document'),d=td.value;
     d.font='Unbounded-Black';d.fontSize=size;d.fillColor=col;d.applyStroke=false;d.justification=ParagraphJustification.CENTER_JUSTIFY;d.tracking=-10;td.setValue(d);
     var r=l.sourceRectAtTime(0,false);l.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([r.left+r.width/2,r.top+r.height/2]);return l;}
    var face=make(name,[1,1,1]);face.property('ADBE Transform Group').property('ADBE Position').setValue([1024,y]);
    // 얼굴 뒤에 쌓는 입체: 앞은 연보라, 뒤로 갈수록 보라, 주로 아래로.
    var N=16,kk=size/380,back=null;
    for(var i=1;i<=N;i++){var col=lerp([0.875,0.824,1],[0.365,0.035,0.627],i/N);var l=make(name+' EXT '+i,col);
     l.property('ADBE Transform Group').property('ADBE Position').setValue([1024+1.0*i*kk,y+2.8*i*kk]);l.moveAfter(back||face);back=l;l.parent=face;
     l.property('ADBE Transform Group').property('ADBE Opacity').expression='thisComp.layer("'+name+'").transform.opacity';}
    var ds=back.property('ADBE Effect Parade').addProperty('ADBE Drop Shadow');ds.property('ADBE Drop Shadow-0001').setValue([0.114,0,0.259]);ds.property('ADBE Drop Shadow-0002').setValue(90);ds.property('ADBE Drop Shadow-0003').setValue(160);ds.property('ADBE Drop Shadow-0004').setValue(8*kk);ds.property('ADBE Drop Shadow-0005').setValue(16*kk);
    var ls=face.property('ADBE Transform Group').property('ADBE Scale');var hx=(hscale||100)/100;key(ls,[[t0,[0,0]],[t0+0.16,[118*hx,118]],[t0+0.26,[96*hx,96]],[t0+0.34,[100*hx,100]],[JOB.dur,[105*hx,105]]]);ease(ls);
    var op=face.property('ADBE Transform Group').property('ADBE Opacity');key(op,[[t0,0],[t0+0.06,100]]);}
   text(G.tag,G.tagSize,1705,0.30,'TAGLINE');text('PRIZE',270,1402,0.16,'PRIZE');text(G.id,380,1095,0.04,'GRADE',118);
   savePng(c,1.2,JOB.out+'/congrats-'+G.id+'-still.png');
   var it=rq.items.add(c);it.timeSpanStart=0;it.timeSpanDuration=JOB.dur;var om=it.outputModule(1),tpl=null,n=om.templates;
   for(var t=0;t<n.length;t++)if(/H\.264/.test(n[t])&&/40Mbps/.test(n[t])){tpl=n[t];break;}
   om.applyTemplate(tpl);om.file=new File(JOB.out+'/congrats-'+G.id+'-2048.mp4');log.push(G.id+' queued');
  }
  rq.render();log.push('rendered');
  app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);status('ok');
 }catch(e){log.push('ERROR '+String(e.message).replace(/"/g,"'")+' line '+e.line);try{app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);}catch(e2){}status('error');}
 app.endSuppressDialogs(false);
})();
