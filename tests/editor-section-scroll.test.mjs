import test from 'node:test';import assert from 'node:assert/strict';import {scrollEditorSection} from '../backend/public/editor-section-scroll.js';
test('section links scroll the actual admin ancestor rather than an unscrollable window',()=>{
 let requested;const body={};globalThis.document={body,documentElement:{scrollTop:0}};globalThis.window={scrollY:0,scrollTo(){throw Error('Wrong scroll container')}};globalThis.getComputedStyle=node=>({overflowY:node.overflow||'visible'});
 const admin={parentElement:body,overflow:'auto',scrollHeight:3000,clientHeight:700,scrollTop:200,getBoundingClientRect:()=>({top:60}),scrollTo:value=>requested=value};
 const canvas={parentElement:admin,overflow:'auto',scrollHeight:1500,clientHeight:1500};const card={parentElement:canvas,getBoundingClientRect:()=>({top:900})};assert.equal(scrollEditorSection(card,120),admin);assert.equal(requested.top,920);
 delete globalThis.document;delete globalThis.window;delete globalThis.getComputedStyle;
});
