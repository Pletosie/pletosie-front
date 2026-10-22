const {test}=require('node:test');const assert=require('node:assert/strict');const {shouldShowPushPrompt}=require('../src/lib/push-prompt.ts');
const base={authReady:true,checked:true,permission:'default',supported:true,loggedIn:true,configured:true,enabled:false,dismissed:false};
test('does not flash while authentication or subscription is loading',()=>{assert.equal(shouldShowPushPrompt({...base,authReady:false}),false);assert.equal(shouldShowPushPrompt({...base,checked:false}),false);});
test('never prompts a browser that already granted notifications, even before backend synchronization',()=>{assert.equal(shouldShowPushPrompt({...base,permission:'granted',enabled:false}),false);});
test('does not prompt after browser denial or dismissal',()=>{assert.equal(shouldShowPushPrompt({...base,permission:'denied'}),false);assert.equal(shouldShowPushPrompt({...base,dismissed:true}),false);});
test('can prompt an eligible visitor after initialization',()=>{assert.equal(shouldShowPushPrompt(base),true);assert.equal(shouldShowPushPrompt({...base,enabled:true}),false);});
