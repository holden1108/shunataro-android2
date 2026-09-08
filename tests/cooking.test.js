import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createDog, animateDog } from '../src/character.js';
import { Behavior } from '../src/behavior.js';

for(const action of ['window','coffee'])test(`${action} reaches its furniture and finishes with valid character transforms`,()=>{
 const scene=new THREE.Scene(),dog=createDog(scene);
 const behavior=new Behavior([{id:action,target:[2,-2],facing:Math.PI}]);
 behavior.choose(action,dog.root.position);let acted=false;
 for(let frame=0;frame<1800;frame++){
  behavior.update(1/60,dog.root.position);animateDog(dog,frame/60,1/60,behavior);scene.updateMatrixWorld(true);
  scene.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
  if(behavior.phase==='acting'){acted=true;if(action==='coffee')assert.ok(dog.props.coffee.visible);}
 }
 assert.ok(acted);assert.equal(behavior.phase,'idle');
});

test('kitchen arrival and the complete cooking animation keep valid transforms',()=>{
 const scene=new THREE.Scene(),dog=createDog(scene);
 const behavior=new Behavior([{id:'cook',target:[-1.82,-.7],facing:-Math.PI/2}]);
 behavior.choose('cook',dog.root.position);
 let sawCooking=false,sawTasting=false;
 for(let frame=0;frame<1800;frame++){
  const time=frame/60;
  behavior.update(1/60,dog.root.position);
  animateDog(dog,time,1/60,behavior);
  scene.updateMatrixWorld(true);
  scene.traverse(object=>assert.ok(object.matrixWorld.elements.every(Number.isFinite),object.name||object.type));
  if(behavior.phase==='acting'){
   sawCooking=true;assert.equal(dog.props.cook.visible,true);
   if(time%7>5){sawTasting=true;assert.equal(dog.arms[1].rotation.x,-1.5);}
  }
 }
 assert.ok(sawCooking);assert.ok(sawTasting);assert.equal(behavior.phase,'idle');
});
